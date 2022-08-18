import constants from '../constants'
import moment from 'moment'
import {get, isNull, isUndefined} from 'lodash'
import {doValidations} from '../validation/validator'
import getContentLanguages from './language'
import {mapAPIDataToUIFormat} from './formDataMapping'
import {getOrganizationMembershipIds} from './user'

const {PUBLICATION_STATUS, EVENT_STATUS, USER_TYPE, SUPER_EVENT_TYPE_UMBRELLA, SUPER_EVENT_TYPE_RECURRING} = constants

export const userMayEdit = (user, event) => {
    const eventOwner = get(event, 'is_owner')
    const adminOrganizations = get(user, 'adminOrganizations')
    const userOrganization = get(user, 'organization')
    const publicMembership = get(user, 'publicMemberships')
    const eventOrganization = get(event, 'publisher')
    const eventOrganizationAncestors = get(event, 'publisherAncestors')
    const organizationMemberships = get(user, 'organizationMemberships')
    const publicationStatus = get(event, 'publication_status')
    const userHasOrganizations = !isNull(getOrganizationMembershipIds(user))

    let userMayEdit = false

    // users that don't belong to any organization are not allowed to edit
    if (!userHasOrganizations) {
        return false
    }
    // If present, also check event organization ancestors for admin orgs.
    // Check admin_organizations and organization_membership, but fall back to user.organization if needed
    if (eventOrganization && eventOrganizationAncestors && adminOrganizations) {
        userMayEdit =
            adminOrganizations.includes(eventOrganization) ||
            adminOrganizations.some(id => (eventOrganizationAncestors.map(org => org.id).includes(id)))
    } else if (eventOrganization && adminOrganizations) {
        userMayEdit = adminOrganizations.includes(eventOrganization)
    } else {
        userMayEdit = eventOrganization === userOrganization
    }

    // exceptions to the above:
    if (eventOrganization && organizationMemberships && !userMayEdit) {
    // non-admins may still edit drafts if they are organization members
        userMayEdit = organizationMemberships.includes(eventOrganization)
            && publicationStatus === PUBLICATION_STATUS.DRAFT
    }
    if ((userOrganization || adminOrganizations) && !eventOrganization) {
    // if event has no organization, we are creating a new event. it is allowed for users with organizations,
    // disallowed for everybody else. event organization is set by the API when POSTing.
        userMayEdit = true
    }
    if (publicMembership && !userMayEdit && eventOwner) {
        //User has public membership and is owner of the event
        //may publish and edit their own events
        userMayEdit = eventOwner
    }
    return userMayEdit
}

export const userCanDoAction = (user, event, action, editor, superEvent) => {
    const isUmbrellaEvent = get(event, 'super_event_type') === SUPER_EVENT_TYPE_UMBRELLA
    const isDraft = get(event, 'publication_status') === PUBLICATION_STATUS.DRAFT
    const isPublic = get(event, 'publication_status') === PUBLICATION_STATUS.PUBLIC
    const isSeries = get(event, 'super_event_type') === SUPER_EVENT_TYPE_RECURRING
    const isPostponed = get(event, 'event_status') === EVENT_STATUS.POSTPONED;
    const isRegularUser = get(user, 'userType') === USER_TYPE.REGULAR
    const isSubEvent = !isUndefined(get(event, ['super_event', '@id']))
    const superIsUmbrella = get(superEvent, 'super_event_type') === SUPER_EVENT_TYPE_UMBRELLA
    const disableSubEventDeletion = superEvent !== null && Object.keys(superEvent).length > 0 && get(superEvent, 'sub_events', []).length <= 2
    const subEventLimitReached = get(event, 'sub_events', []).length >= 65
    const eventOwner = get(event, 'is_owner')
    const isPublicUser = get(user, 'userType') === USER_TYPE.PUBLIC
    const {keywordSets} = editor
    // format event, so that we can validate it
    const formattedEvent = mapAPIDataToUIFormat(event)
    // validate
    const validations = doValidations(formattedEvent, getContentLanguages(formattedEvent), PUBLICATION_STATUS.PUBLIC, keywordSets)
    // check if there are errors
    const hasValidationErrors = Object.keys(validations).length > 0

    if (action === 'publish') {
        if (!event.id || (isDraft && isSubEvent && !superIsUmbrella)) {
            return false
        }
        return !hasValidationErrors
    }
    if (action === 'update') {
        return !(isDraft && isSubEvent && !isRegularUser)
    }
    if (action === 'postpone') {
        return !(isSeries || isPostponed || isDraft || isSubEvent)
    }
    if (action === 'delete') {
        return !((!superIsUmbrella && disableSubEventDeletion) || (isRegularUser && (isUmbrellaEvent || isPublic)))
    }
    if (action === 'cancel') {
        return !(isDraft || (isRegularUser && isPublic) || (!superIsUmbrella && disableSubEventDeletion))
    }
    if (action === 'edit' || action === 'update') {
        return !(isRegularUser && (isUmbrellaEvent || isPublic))
    }
    if (action === 'add') {
        return !(isRegularUser && eventOwner && isPublic || (subEventLimitReached && isSeries))
    }
    return true
}

export const eventIsEditable = (event) => {
    const eventIsCancelled = get(event, 'event_status') === EVENT_STATUS.CANCELLED
    const eventIsDeleted = get(event, 'deleted')
    const isDraft = get(event, 'publication_status') === PUBLICATION_STATUS.DRAFT
    const isSerial = get(event, 'super_event_type') === SUPER_EVENT_TYPE_RECURRING
    const startTime = get(event, 'start_time', '')
    const endTime = get(event, 'end_time', null)
    const eventIsInThePast =
        (endTime && moment(endTime, moment.defaultFormatUtc).isBefore(moment()))
        || (!endTime && moment(startTime, moment.defaultFormatUtc).isBefore(moment().startOf('day')))
    if (eventIsCancelled) {
        return {editable: false, explanationId: 'event-canceled'};
    }
    if (eventIsDeleted) {
        return {editable: false, explanationId: 'event-deleted'};
    }
    if (eventIsInThePast && !isDraft) {
        return {editable: false, explanationId: 'event-in-the-past'};
    }
    return {editable: true, explanationId: ''}
}

export const checkEventEditability = (user, event, action, editor, superEvent) => {
    const eventIsEditable = module.exports.eventIsEditable(event)
    if (!eventIsEditable['editable']) {
        return eventIsEditable
    }

    const userMayEdit = module.exports.userMayEdit(user, event)
    const userCanDoAction = module.exports.userCanDoAction(user, event, action, editor, superEvent)
    const isDraft = get(event, 'publication_status') === PUBLICATION_STATUS.DRAFT
    const isPostponed = get(event, 'event_status') === EVENT_STATUS.POSTPONED;
    const isSubEvent = !isUndefined(get(event, ['super_event', '@id']))
    const isUmbrella = get(superEvent, 'super_event_type') === SUPER_EVENT_TYPE_UMBRELLA
    const isSeries = get(event, 'super_event_type') === SUPER_EVENT_TYPE_RECURRING
    const disableSubEventDeletion = superEvent !== null  && Object.keys(superEvent).length > 0 && get(superEvent, 'sub_events', []).length <= 2
    const subEventLimitReached = get(event, 'sub_events', []).length >= 65

    const getExplanationId = () => {
        if (action === 'postpone') {
            if (isDraft) {
                return 'draft-invalid-postpone'
            }
            if (isPostponed) {
                return 'event-invalid-postpone'
            }
            if (isSeries) {
                return 'series-invalid-postpone'
            }
            if (isSubEvent) {
                return 'subevent-invalid-postpone'
            }
        }
        if (isDraft && action === 'cancel') {
            return 'draft-cancel'
        }
        if (!userCanDoAction && (action === 'publish' || action === 'update') && isSubEvent) {
            return 'draft-publish-subevent'
        }
        if (!userCanDoAction && action === 'publish') {
            return 'event-validation-errors'
        }
        if (userMayEdit && action === 'update') {
            return 'event-validation-errors'
        }
        if (userMayEdit && subEventLimitReached && isSeries && action === 'add') {
            return 'validation-isMoreThanSixtyFive'
        }
        if (userMayEdit && disableSubEventDeletion && !isUmbrella && (action === 'delete' || action === 'cancel')) {
            return 'not-enough-sub-events'
        }
        if (!userMayEdit || !userCanDoAction) {
            return 'user-no-rights-edit'
        }
    }

    const explanationId = getExplanationId()
    const editable = userMayEdit && userCanDoAction

    return {editable, explanationId}
}
