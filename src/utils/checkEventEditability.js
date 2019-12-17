import constants from '../constants'
import moment from 'moment'
import {get} from 'lodash'
import {doValidations} from '../validation/validator'
import getContentLanguages from './language'
import {mapAPIDataToUIFormat} from './formDataMapping'

const {PUBLICATION_STATUS, EVENT_STATUS, USER_TYPE, SUPER_EVENT_TYPE_UMBRELLA} = constants

export const userMayEdit = (user, event) => {
    const adminOrganizations = get(user, 'adminOrganizations')
    const userOrganization = get(user, 'organization')
    const eventOrganization = get(event, 'organization')
    const organizationMemberships = get(user, 'organizationMemberships')
    const publicationStatus = get(event, 'publication_status')

    let userMayEdit = false

    // For simplicity, support both old and new user api.
    // Check admin_organizations and organization_membership, but fall back to user.organization if needed
    if (adminOrganizations) {
    // TODO: in the future, we will need information (currently not present) on whether event.organization is
    // a sub-organization of the user admin_organization. This should be done in the API by e.g.
    // including all super-organizations of a sub-organization in the sub-organization API JSON,
    // and fetching that json for the event organization.
        userMayEdit = adminOrganizations.includes(eventOrganization)
    } else {
        userMayEdit = eventOrganization === userOrganization
    }

    // exceptions to the above:
    if (organizationMemberships && !userMayEdit) {
    // non-admins may still edit drafts if they are organization members
        userMayEdit = organizationMemberships.includes(eventOrganization)
            && publicationStatus === PUBLICATION_STATUS.DRAFT
    }
    if ((userOrganization || adminOrganizations) && !eventOrganization) {
    // if event has no organization, we are creating a new event. it is allowed for users with organizations,
    // disallowed for everybody else. event organization is set by the API when POSTing.
        userMayEdit = true
    }

    return userMayEdit
}

export const userCanDoAction = (user, event, action, editor) => {
    const isUmbrellaEvent = get(event, 'super_event_type') === SUPER_EVENT_TYPE_UMBRELLA
    const isDraft = get(event, 'publication_status') === PUBLICATION_STATUS.DRAFT
    const isPublic = get(event, 'publication_status') === PUBLICATION_STATUS.PUBLIC
    const isRegularUser = get(user, 'userType') === USER_TYPE.REGULAR
    const {keywordSets} = editor

    if (action === 'publish') {
        if (!event.id) {
            return false
        }
        // get event sub events and map them to UI format, so that we can validate them
        const subEvents = Object.keys(event.sub_events)
            .map(key => mapAPIDataToUIFormat(event.sub_events[key]))
        // combine event with sub events
        const formattedeventAndSubEvents = [mapAPIDataToUIFormat(event), ...subEvents]
        // run validation against all events to see if any of them fail
        const hasValidationErrors = formattedeventAndSubEvents
            .some(_event => Object.keys(doValidations(_event, getContentLanguages(_event), PUBLICATION_STATUS.PUBLIC, keywordSets)).length > 0)

        return !hasValidationErrors
    }
    if (action === 'cancel') {
        return !(isDraft || (isRegularUser && isPublic))
    }
    if (action === 'edit' || action === 'update' || action === 'delete') {
        return !(isRegularUser && (isUmbrellaEvent || isPublic))
    }

    return true
}

export const checkEventEditability = (user, event, action, editor) => {
    const userMayEdit = module.exports.userMayEdit(user, event)
    const userCanDoAction = module.exports.userCanDoAction(user, event, action, editor)
    const isDraft = get(event, 'publication_status') === PUBLICATION_STATUS.DRAFT
    const endTime = get(event, 'end_time', '')
    const eventIsInThePast = moment(endTime, moment.defaultFormatUtc).isBefore(moment());
    const eventIsCancelled = get(event, 'event_status') === EVENT_STATUS.CANCELLED

    const getExplanationId = () => {
        if (isDraft && action === 'cancel') {
            return 'draft-cancel'
        }
        if (!userCanDoAction && action === 'publish') {
            return 'event-validation-errors'
        }
        if (eventIsInThePast) {
            return 'event-in-the-past'
        }
        if (eventIsCancelled) {
            return 'event-canceled'
        }
        if (!userMayEdit || !userCanDoAction) {
            return 'user-no-rights'
        }
    }

    const explanationId = getExplanationId()
    const editable = !eventIsInThePast
        && !eventIsCancelled
        && userMayEdit
        && userCanDoAction

    return {editable, explanationId}
}
