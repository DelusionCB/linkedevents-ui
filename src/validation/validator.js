import CONSTANTS from '../constants'
import validationFn from './validationRules'
import {getCharacterLimitByRule} from '../utils/helpers'
import {each, remove, pickBy, isEmpty, omitBy, includes} from 'lodash'
import moment from 'moment'

const {
    VALIDATION_RULES,
    PUBLICATION_STATUS,
    EVENT_TYPE,
} = CONSTANTS


// Validations for draft
const draftValidations = {
    name: [VALIDATION_RULES.REQUIRE_MULTI, VALIDATION_RULES.REQUIRED_IN_CONTENT_LANGUAGE, VALIDATION_RULES.SHORT_STRING],
    location: [VALIDATION_RULES.REQUIRE_AT_ID],
    start_time: [VALIDATION_RULES.REQUIRED_STRING, VALIDATION_RULES.IS_DATE],
    end_time: [VALIDATION_RULES.REQUIRED_STRING, VALIDATION_RULES.AFTER_START_TIME, VALIDATION_RULES.IN_THE_FUTURE],
    short_description: [VALIDATION_RULES.REQUIRE_MULTI, VALIDATION_RULES.REQUIRED_IN_CONTENT_LANGUAGE, VALIDATION_RULES.SHORT_STRING],
    offers: {
        price: [VALIDATION_RULES.HAS_PRICE, VALIDATION_RULES.HAS_VALID_PRICE],
        info_url: [VALIDATION_RULES.IS_URL],
        description: [VALIDATION_RULES.LONG_STRING],
    },
    sub_events: {
        start_time: [VALIDATION_RULES.REQUIRED_STRING, VALIDATION_RULES.IS_DATE],
        end_time: [VALIDATION_RULES.REQUIRED_STRING, VALIDATION_RULES.AFTER_START_TIME, VALIDATION_RULES.IS_DATE, VALIDATION_RULES.IN_THE_FUTURE],
    },
    description: [VALIDATION_RULES.LONG_STRING],
    info_url: [VALIDATION_RULES.IS_URL],
    virtualevent_url: [VALIDATION_RULES.IS_URL],
    extlink_facebook: [VALIDATION_RULES.IS_URL],
    extlink_twitter: [VALIDATION_RULES.IS_URL],
    extlink_instagram: [VALIDATION_RULES.IS_URL],
    audience_min_age: [VALIDATION_RULES.IS_INT, VALIDATION_RULES.IS_POSITIVE_INT, VALIDATION_RULES.IS_LESS_THAN_MAX_AGE, VALIDATION_RULES.IS_LESS_THAN_MAX_AGE_LIMIT],
    audience_max_age: [VALIDATION_RULES.IS_INT, VALIDATION_RULES.IS_POSITIVE_INT, VALIDATION_RULES.IS_MORE_THAN_MIN_AGE, VALIDATION_RULES.IS_LESS_THAN_MAX_AGE_LIMIT],
    enrolment_start_time: [VALIDATION_RULES.IS_DATE],
    enrolment_end_time: [VALIDATION_RULES.AFTER_ENROLMENT_START_TIME, VALIDATION_RULES.IN_THE_FUTURE, VALIDATION_RULES.IS_DATE],
    enrolment_url: [ VALIDATION_RULES.IS_URL],
    minimum_attendee_capacity: [VALIDATION_RULES.IS_INT, VALIDATION_RULES.IS_POSITIVE_INT, VALIDATION_RULES.IS_LESS_THAN_MAX_CAPACITY],
    maximum_attendee_capacity: [VALIDATION_RULES.IS_INT, VALIDATION_RULES.IS_POSITIVE_INT, VALIDATION_RULES.IS_MORE_THAN_MIN_CAPACITY],
    videos: {
        url: [VALIDATION_RULES.IS_URL, VALIDATION_RULES.REQUIRED_VIDEO_FIELD],
        name: [VALIDATION_RULES.SHORT_STRING, VALIDATION_RULES.REQUIRED_VIDEO_FIELD],
        alt_text: [VALIDATION_RULES.MEDIUM_STRING, VALIDATION_RULES.REQUIRED_VIDEO_FIELD],
    },
}

// Validations for published event
const publicValidations = {
    name: [VALIDATION_RULES.REQUIRE_MULTI, VALIDATION_RULES.REQUIRED_IN_CONTENT_LANGUAGE, VALIDATION_RULES.SHORT_STRING],
    location: [VALIDATION_RULES.REQUIRE_AT_ID],
    start_time: [VALIDATION_RULES.REQUIRED_STRING, VALIDATION_RULES.IS_DATE], // Datetime is saved as ISO string
    end_time: [VALIDATION_RULES.REQUIRED_STRING, VALIDATION_RULES.AFTER_START_TIME, VALIDATION_RULES.IS_DATE, VALIDATION_RULES.IN_THE_FUTURE],
    short_description: [VALIDATION_RULES.REQUIRE_MULTI, VALIDATION_RULES.REQUIRED_IN_CONTENT_LANGUAGE, VALIDATION_RULES.SHORT_STRING],
    description: [VALIDATION_RULES.LONG_STRING],
    info_url: [VALIDATION_RULES.IS_URL],
    virtualevent_url: [VALIDATION_RULES.IS_URL],
    extlink_facebook: [VALIDATION_RULES.IS_URL],
    extlink_twitter: [VALIDATION_RULES.IS_URL],
    extlink_instagram: [VALIDATION_RULES.IS_URL],
    offers: {
        price: [VALIDATION_RULES.HAS_PRICE, VALIDATION_RULES.HAS_VALID_PRICE],
        info_url: [VALIDATION_RULES.IS_URL],
        description: [VALIDATION_RULES.LONG_STRING],
    },
    sub_events: {
        start_time: [VALIDATION_RULES.REQUIRED_STRING, VALIDATION_RULES.IS_DATE],
        end_time: [VALIDATION_RULES.REQUIRED_STRING, VALIDATION_RULES.AFTER_START_TIME, VALIDATION_RULES.IS_DATE, VALIDATION_RULES.IN_THE_FUTURE],
    },
    sub_length: [VALIDATION_RULES.IS_MORE_THAN_TWO, VALIDATION_RULES.IS_MORE_THAN_SIXTYFIVE],
    keywords: [VALIDATION_RULES.AT_LEAST_ONE_MAIN_CATEGORY],
    audience_min_age: [VALIDATION_RULES.IS_INT, VALIDATION_RULES.IS_POSITIVE_INT, VALIDATION_RULES.IS_LESS_THAN_MAX_AGE, VALIDATION_RULES.IS_LESS_THAN_MAX_AGE_LIMIT],
    audience_max_age: [VALIDATION_RULES.IS_INT, VALIDATION_RULES.IS_POSITIVE_INT, VALIDATION_RULES.IS_MORE_THAN_MIN_AGE, VALIDATION_RULES.IS_LESS_THAN_MAX_AGE_LIMIT],
    enrolment_start_time: [VALIDATION_RULES.IS_DATE],
    enrolment_end_time: [VALIDATION_RULES.AFTER_ENROLMENT_START_TIME,
        VALIDATION_RULES.IN_THE_FUTURE,
        VALIDATION_RULES.IS_DATE],
    enrolment_url: [ VALIDATION_RULES.IS_URL],
    minimum_attendee_capacity: [VALIDATION_RULES.IS_INT, VALIDATION_RULES.IS_POSITIVE_INT, VALIDATION_RULES.IS_LESS_THAN_MAX_CAPACITY],
    maximum_attendee_capacity: [VALIDATION_RULES.IS_INT, VALIDATION_RULES.IS_POSITIVE_INT, VALIDATION_RULES.IS_MORE_THAN_MIN_CAPACITY],
    videos: {
        url: [VALIDATION_RULES.IS_URL, VALIDATION_RULES.REQUIRED_VIDEO_FIELD],
        name: [VALIDATION_RULES.SHORT_STRING, VALIDATION_RULES.REQUIRED_VIDEO_FIELD],
        alt_text: [VALIDATION_RULES.MEDIUM_STRING, VALIDATION_RULES.REQUIRED_VIDEO_FIELD],
    },
    image: [VALIDATION_RULES.REQUIRED_IMAGE],
}

/**
 * Run draft/public validations depending which document
 * @return {object} Validation errors object
 */
export function doValidations(values, languages, validateFor, keywordSets) {

    // Public validations
    if(validateFor === PUBLICATION_STATUS.PUBLIC) {
        return runValidationWithSettings(values, languages, publicValidations, keywordSets)
    }

    // Do draft validations
    else if (validateFor === PUBLICATION_STATUS.DRAFT) {
        return runValidationWithSettings(values, languages, draftValidations, keywordSets)
    }

    else {
        return {}
    }
}

function runValidationWithSettings(values, languages, settings, keywordSets) {
    let obj = {}

    // Add content languages to values to have them available in the validations
    const valuesWithLanguages = Object.assign({}, values, {
        _contentLanguages: languages,
    })

    each(settings, (validations, key) => {
        // Returns an array of validation errors (array of nulls if validation passed)
        let errors = []

        // validate sub events
        if (key === 'sub_events') {
            errors = {}
            each(values['sub_events'], (subEvent, eventKey) => {
                const subEventError = runValidationWithSettings(subEvent, languages, settings.sub_events)
                const error = isEmpty(subEventError) ? null : subEventError
                errors[eventKey] = error
            })

            // validate location & virtual event based on conditional
            // if event is virtual, location is not required
        } else if (key === 'location') {
            errors = validateLocation(values, validations)
            //validate sub_events length, minium of 2
        }  else if (key === 'sub_length') {
            errors = validateSubEventCount(values, validations)
            //Validate start_time
        } else if (key === 'start_time') {
            errors = validateTimes(values, validations, 'start_time')
            //Validate end_time
        } else if (key === 'end_time') {
            errors = validateTimes(values, validations, 'end_time')
        // check is_virtual boolean, is true check that virtualevent_url exists
        // validate virtual_url
        // Check for URL
        } else if (key === 'virtualevent_url') {
            errors = validateVirtualURL(values, validations)

            // validate offers
        } else if (key === 'offers') {
            errors = values.organization !== 'turku:853'
                ? validateOffers(values.offers, validations)
                : {}

        // validate keywords
        } else if (key === 'keywords') {
            const updatedValidations = [...validations];
            if (valuesWithLanguages.type_id === EVENT_TYPE.GENERAL) { updatedValidations.push(VALIDATION_RULES.AT_LEAST_ONE_SECONDARY_CATEGORY);}
            errors = updatedValidations.map(validation => validationFn[validation](valuesWithLanguages, valuesWithLanguages[key], keywordSets) ? null : validation)
        // validate videos
        } else if (key === 'videos') {
            errors = values && values.videos && values.videos.length
                ? validateVideos(values.videos, validations)
                : {}
        } else if (
            key.includes('audience') || key.includes('attendee'))
        {
            errors = validations.reduce((acc, curr) => {
                if (!validationFn[curr](valuesWithLanguages, valuesWithLanguages[key])) {
                    acc.push(curr);
                }
                return acc;
            }, [])
        }
        else {
            errors = validations.map(validation => validationFn[validation](valuesWithLanguages, valuesWithLanguages[key]) ? null : validation)
        }

        // Remove nulls
        if (key === 'sub_events') {
            errors = omitBy(errors, i => i === null)
        } else {
            remove(errors, i => i === null)
        }
        obj[key] = errors
    })
    obj = pickBy(obj, (validationErrors, key) => {
        if (key === 'sub_events' || key === 'offers' || key === 'videos') {
            return !isEmpty(validationErrors)
        }
        return validationErrors.length > 0
    })
    return obj
}
// Validate location
const validateLocation = (values, validations) => {
    const errors = []
    // Validation rule used for location select
    const validationError = VALIDATION_RULES.REQUIRE_AT_ID
    if (!values['is_virtualevent']) {
        if (!validationFn[validationError](values, values['location'])) {
            errors.push(validationError)
        }
    }
    return errors
}
// Validate is_virtual & virtualevent_url
// Check that virtualevent_url is url indeed
const validateVirtualURL = (values, validations) => {
    const errors = []
    if (values['is_virtualevent'] && values['virtualevent_url']) {
        validations.forEach((val) => {
            if (!validationFn[val](values, values['virtualevent_url'])) {
                errors.push(val)
            }
        })
    }
    return errors
}
//Validate start_time &/ end_time
//Check if sub_events exist
const validateTimes = (values, validations, type = '') => {
    const errors = []
    const isSingleMain = !values.hasOwnProperty('sub_events') ? true : Object.keys(values.sub_events).length === 0;
    const subEvent = values.hasOwnProperty(type)

    if (subEvent || isSingleMain) {
        validations.forEach((val) => {
            if (!validationFn[val](values, values[type])) {
                errors.push(val)
            }
        })
    }
    return errors
}

//Validate sub_event count
const validateSubEventCount = (values, validations) => {
    let errors = []
    const eventHasSubEvents = values.hasOwnProperty('sub_events') && Object.keys(values.sub_events).length >= 1 && !values.hasOwnProperty('start_time')
    if (eventHasSubEvents) {
        validations.forEach((val) => {
            if (!validationFn[val](values, values['sub_events'])) {
                errors.push(val)
            }
        })
    }
    return errors
}

const validateOffers = (values, validations) => {
    const errors = {}
    if (!values) {
        return errors
    }
    // loop through all offer items to get the validation errors
    for (const [index, offerItem] of values.entries()) {
        // validate each field of the item

        const validationResult = Object.entries(offerItem)
            .reduce((acc, [key, itemValue]) => {
                // get the result for each validation rule
                if (!['is_free', 'payment_methods'].includes(key)) {
                    acc[key] = validations[key]
                        .map(validation =>
                            validationFn[validation](offerItem, itemValue, key) ? null : validation
                        )
                    // filter out null values
                        .filter(Boolean)

                } return acc
            }, {})

        // remove empty arrays
        Object.entries(validationResult)
            .forEach(([key, item]) => {
                if (isEmpty(item)) delete validationResult[key]
            })

        // continue if there are no errors
        if (Object.entries(validationResult).length === 0) continue

        // set the errors for the item
        errors[index] = validationResult
    }

    return errors
}

const validateVideos = (values, validations) => {
    const errors = {}

    if (!values) {
        return errors
    }

    // loop through all video items to get the validation errors
    for (const [index, videoItem] of values.entries()) {
        // validate each field of the item

        const validationResult = Object.entries(videoItem)
            .reduce((acc, [key, itemValue]) => {
                acc[key] = validations[key]
                // get the result for each validation rule
                    .map(validation =>
                        validation === VALIDATION_RULES.REQUIRED_VIDEO_FIELD
                            ? validationFn[validation](videoItem, itemValue, key) ? null : validation
                            : validationFn[validation](values, itemValue) ? null : validation
                    )
                    // filter out null values
                    .filter(Boolean)

                return acc
            }, {})

        // remove empty arrays
        Object.entries(validationResult)
            .forEach(([key, item]) => {
                if (isEmpty(item)) delete validationResult[key]
            })

        // continue if there are no errors
        if (Object.entries(validationResult).length === 0) continue

        // set the errors for the item
        errors[index] = validationResult
    }

    return errors
}
