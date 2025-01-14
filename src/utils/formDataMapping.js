import {find, map, forOwn, isEmpty, values, set} from 'lodash'
import constants from 'src/constants.js'
import moment from 'moment-timezone'
import {getStringWithLocale} from './locale'
import {eventIsEditable} from './checkEventEditability'

export {
    mapUIDataToAPIFormat,
    mapAPIDataToUIFormat,
}

const {EVENT_STATUS, PUBLICATION_STATUS, SUB_EVENT_TYPE_RECURRING, SUB_EVENT_TYPE_UMBRELLA} = constants

function _nullifyEmptyStrings(multiLangObject) {
    forOwn(multiLangObject, function(value, language) {

        // do not send empty strings to the backend, as this will set the null language field to non-null
        if (value === '') {
            multiLangObject[language] = null
        }
    })
    return multiLangObject
}

// TODO: Refactoring form components to output and accept the correct format (like <MultiLanguageField> to output {fi: name, se: namn})

function mapUIDataToAPIFormat(values) {
    if(!values) {
        return {}
    }

    let obj = {}

    if(values.id) {
        obj.id = values.id
    }

    // General data
    obj.name = _nullifyEmptyStrings(values.name)
    obj.type_id = values.type_id
    obj.short_description = _nullifyEmptyStrings(values.short_description)
    obj.description = _nullifyEmptyStrings(values.description)
    obj.info_url = _nullifyEmptyStrings(values.info_url)
    obj.provider = _nullifyEmptyStrings(values.provider)
    obj.event_status = values.event_status || EVENT_STATUS.SCHEDULED
    obj.publication_status = values.publication_status || PUBLICATION_STATUS.DRAFT
    obj.super_event_type = values.super_event_type
    obj.super_event = values.super_event
    obj.publisher = values.organization
    obj.videos = values.videos
    obj.is_virtualevent = values.is_virtualevent
    obj.virtualevent_url = values.virtualevent_url
    //Sub event type
    obj.sub_event_type = values.sub_event_type

    // Location data
    if (values.location) {
        obj.location = embedValuesToIDs(values.location['@id'])
    } else if (!values.location) {
        obj.location = null
    }
    if (values.location_extra_info) {
        obj.location_extra_info = _nullifyEmptyStrings(values.location_extra_info)
    }
    // Virtual data
    if (!values.is_virtualevent) {
        obj.is_virtualevent = false
    }
    // Image data
    obj.images = []
    if(values.image && !isEmpty(values.image)) {
        obj.images[0] = values.image
    }

    // Video data
    obj.videos = []
    if (values.videos && !isEmpty(values.videos)) {
        obj.videos = values.videos
    }

    // Price data
    // Redundant/unnecessary offers e.g. offers that are free, aren't added to the final object.
    if(values.offers && values.offers.length && !values.offers[0].is_free) {
        obj.offers = values.offers
    }

    // The backend requires the offers key to have some kind of value.
    if (!obj.offers) {
        // Draft events must at least contain an empty array.
        obj.offers = [];
        if (obj.publication_status === PUBLICATION_STATUS.PUBLIC) {
            // Published events must contain the following offer even if the event is free.
            obj.offers.push({is_free: true});
        }
    }

    // Keywords, audience, languages
    if(values.keywords && values.keywords.length !== undefined) {
        obj.keywords = map(values.keywords, (item) => (embedValuesToIDs(item.value)))
    }

    if(values.audience && values.audience.length !== undefined) {
        obj.audience = map(values.audience, embedValuesToIDs)
    }

    if(values.in_language) {
        obj.in_language = map(values.in_language, embedValuesToIDs)
    }

    // External links
    obj.external_links = []

    let externalLinkFields = ['extlink_facebook', 'extlink_twitter', 'extlink_instagram']
    externalLinkFields.forEach((field) => {
        if(values[field]) {
            obj.external_links.push({
                name: field,
                link: values[field],
                language: 'fi', // TODO: Which languages here?
            })
        }
    })

    if(values.start_time) {
        obj.start_time = values.start_time
    }

    if(values.end_time) {
        obj.end_time = values.end_time
    }

    if (values.audience_min_age) {
        obj.audience_min_age = parseInt(values.audience_min_age, 10)
    }
    if (values.audience_max_age) {
        obj.audience_max_age = parseInt(values.audience_max_age, 10)
    }

    if (values.enrolment_start_time) {
        obj.enrolment_start_time = values.enrolment_start_time
    }
    if (values.enrolment_end_time) {
        obj.enrolment_end_time = values.enrolment_end_time
    }
    if (values.minimum_attendee_capacity) {
        obj.minimum_attendee_capacity = parseInt(values.minimum_attendee_capacity, 10)
    }
    if (values.maximum_attendee_capacity) {
        obj.maximum_attendee_capacity = parseInt(values.maximum_attendee_capacity, 10)
    }
    if (values.enrolment_url) {
        obj.enrolment_url = values.enrolment_url
    }
    // date published
    if (!values.publication_status) {
        obj.date_published = moment().utc().format()
    }

    return obj
}

function mapAPIDataToUIFormat(values) {
    if(!values) {
        return {}
    }

    let obj = {}

    // General data
    obj.id = values.id
    obj.type_id = values.type_id
    obj.name = values.name
    obj.short_description = values.short_description
    obj.description = values.description
    obj.info_url = values.info_url
    obj.provider = values.provider
    obj.super_event_type = values.super_event_type
    obj.videos = values.videos

    // Statuses
    obj.event_status = values.event_status
    obj.publication_status = values.publication_status
    obj.organization = values.publisher

    // Location data
    obj.location = values.location
    obj.location_extra_info = values.location_extra_info
    // Virtual data
    obj.is_virtualevent = values.is_virtualevent
    obj.virtualevent_url = values.virtualevent_url

    // Price data
    if (values.offers && values.offers.length && !values.offers[0].is_free) {
        obj.offers = values.offers
    }

    //Sub event type
    obj.sub_event_type = values.sub_event_type
    // Subevents: from array to object
    obj.sub_events = {...values.sub_events}

    // Keywords, audience, languages
    obj.keywords = map(values.keywords, (item) => ({value: item['@id'], label: (getStringWithLocale(item, 'name') || item['id']), name: item.name}))

    if(values.audience) {
        obj.audience = map(values.audience, item => item['@id'])
    }

    if(values.in_language) {
        obj.in_language = map(values.in_language, lang => lang['@id'])
    }

    // External links
    if(values.external_links) {
        let externalLinkFields = ['extlink_facebook', 'extlink_twitter', 'extlink_instagram']
        externalLinkFields.forEach(item => {
            let extlink = find(values.external_links, {name: item})
            if(extlink) {
                obj[item] = extlink.link
            }
        })
    }

    if(values.start_time) {
        obj.start_time = values.start_time
    }

    if(values.end_time) {
        obj.end_time = values.end_time
    }

    if(values.images) {
        obj.image = values.images[0]
    }

    if (values.audience_min_age) {
        obj.audience_min_age = values.audience_min_age
    }
    if (values.audience_max_age) {
        obj.audience_max_age = values.audience_max_age
    }
    if (values.enrolment_start_time) {
        obj.enrolment_start_time = values.enrolment_start_time
    }
    if (values.enrolment_end_time) {
        obj.enrolment_end_time = values.enrolment_end_time
    }
    if (values.minimum_attendee_capacity) {
        obj.minimum_attendee_capacity = parseInt(values.minimum_attendee_capacity, 10)
    }
    if (values.maximum_attendee_capacity) {
        obj.maximum_attendee_capacity = parseInt(values.maximum_attendee_capacity, 10)
    }
    if (values.enrolment_url) {
        obj.enrolment_url = values.enrolment_url
    }

    return obj
}

/**
 *  Used for returning object with id: values
 * @param {string} values
 * @returns {{'@id': string}}
 */
export const embedValuesToIDs = (values = '') => ({'@id': values})


/*
    take an array of sub events, return start and end time for the
    corresponding super event with:
    - earliest date of sub events as start_time
    - latest date of sub events as end_time
*/
export const calculateSuperEventTime = (subEvents) => {
    let startTimes = []
    let endTimes = []
    values(subEvents).filter(event => {
        if (event.start_time) {
            startTimes.push(moment(event.start_time))
        }
        if (event.end_time) {
            endTimes.push(moment(event.end_time))
        }
    })
    // in case there is no end_time in sub events should return the
    // midnight of the day after the latest start time as super event endtime
    const superEventStartTime = startTimes.length <= 0 ? undefined : moment.min(startTimes);
    let superEventEndTime = endTimes.length <= 0
        ? startTimes.length <= 0
            ? undefined
            : moment.max(startTimes).endOf('day')
        : moment.max(endTimes)
    return {
        start_time: superEventStartTime
            ? moment.tz(superEventStartTime, 'Europe/Helsinki').utc().toISOString()
            : undefined,
        end_time: superEventEndTime
            ? moment.tz(superEventEndTime, 'Europe/Helsinki').utc().toISOString()
            : undefined,
    }
}

// combine all dates in the editor form to get a collection of sub events under super
export const combineSubEventsFromEditor = (formValues, updateExisting = false) => {
    let subEvents
    if (updateExisting) {
        subEvents = formValues.sub_events
    } else {
        subEvents = {
            ...formValues.sub_events,
        }
    }
    return Object.assign({}, formValues, {
        sub_events: subEvents,
        id: undefined,
    })
}

/**
 * @param {object} formValues Form data
 * @param {boolean} updateExisting Whether we're updating an existing event
 * @param {string} superEventUrl parent/super event url that is passed to subevent
 * @param {string} subEventType Can be 'sub_umbrella' or 'sub_recurring' depending on parent/super event
 */
export const createSubEventsFromFormValues = (formValues, updateExisting, superEventUrl, subEventType) => {
    const formWithAllSubEvents = combineSubEventsFromEditor(formValues, updateExisting)
    const baseEvent = {...formWithAllSubEvents, sub_events: {}, super_event: {'@id': superEventUrl}, sub_event_type: subEventType}
    const subEvents = {...formWithAllSubEvents.sub_events}
    return Object.keys(subEvents)
        .map(key => ({...baseEvent, start_time: subEvents[key].start_time, end_time: subEvents[key].end_time}))
}

/**
 * Returns updated SubEvents
 * @param {object} formValues Form data
 * @param {Object[]} subEventsToUpdate
 * @return {Object[]}
 */
export const updateSubEventsFromFormValues = (formValues, subEventsToUpdate) => {
    const keysToExclude = ['start_time', 'end_time', 'id', 'super_event', 'super_event_type', 'sub_event_type', 'type_id']
    // update form data with sub event data where applicable
    return subEventsToUpdate
        // don't update canceled, deleted or past subevents (when editing an ongoing series =)
        .filter(subEvent => eventIsEditable(subEvent)['editable'])
        .map(subEvent => keysToExclude.reduce((acc, key) => set(acc, key, subEvent[key]), {...formValues}))
}
