import './helpers.scss'
import {get, isArray, isNil, isNull, keys, some} from 'lodash';
import constants from '../constants'
import {FormattedMessage} from 'react-intl'
import React from 'react'
import moment from 'moment'
import Badge from 'react-bootstrap/Badge'
import sanitizeHtml from 'sanitize-html';

const {VALIDATION_RULES, CHARACTER_LIMIT, EVENT_TYPE} = constants

/**
 * Get text limit base on it's rule
 * @param {string} ruleName - Validation rule
 * @return {number} Character limit
 * @return {null} Return false if they're not string count rules
 */
export const getCharacterLimitByRule = (ruleName) => {
    if(ruleName === VALIDATION_RULES.SHORT_STRING) {
        return CHARACTER_LIMIT.SHORT_STRING
    }
    if(ruleName === VALIDATION_RULES.MEDIUM_STRING) {
        return CHARACTER_LIMIT.MEDIUM_STRING
    }
    if(ruleName === VALIDATION_RULES.LONG_STRING) {
        return CHARACTER_LIMIT.LONG_STRING
    }
    return null
}

export const sanitizeString = (string) => {
    return sanitizeHtml(string, {
        allowedTags: [
            'a', 'abbr', 'acronym', 'b',
            'blockquote', 'code', 'em', 'i',
            'li', 'ol', 'strong', 'ul',
            'p', 'div', 'br'],
        disallowedTagsMode: 'discard',
        allowedAttributes: {
            'a': [ 'href' ],
        },
        allowedIframeHostnames: ['www.youtube.com'],
    })
}

/**
 * @param {string} language locale
 * @param {string} type terms / help / instructions
 * @returns {*} file with markdown texts
 */
export const getContent = (language, type = 'help') => {
    if (language === 'fi') {
        return require(`@city-assets/md/${type}-content.fi.md`);}
    if (language === 'en') {
        return require(`@city-assets/md/${type}-content.en.md`);}
    if (language === 'sv') {
        return require(`@city-assets/md/${type}-content.sv.md`);}
    return require(`src/assets/default/assets/md/${type}-content.fi.md`);
}

/**
 * Check if text input is reaching the limit
 * @param  {object || string } value
 * @param  {int} limit
 * @return {boolean} validation status
 */
export const textLimitValidator = (value, limit) => {
    if (typeof value === 'object') {
        return !some(value, item => !isNull(item) && item.length > limit)
    } else if (typeof value === 'string') {
        return value.length <= limit
    }
    return true
}

/**
 * Check events type & return keywordSets based on the type
 * @param  {string} values type_id
 * @returns {string} keywordSet
 */
export const getCurrentTypeSet = (values) => {
    switch(values){
        case EVENT_TYPE.HOBBIES:
            return 'turku:hobbytopics'
        case EVENT_TYPE.COURSE:
            return 'turku:coursetopics'
        case EVENT_TYPE.GENERAL:
        default:
            return 'turku:topic_content'
    }
}

// set a property of an object to empty value based on its type
export const emptyField = (object, field) => {
    let value = object[field];
    const fieldValueType = isArray(value) ? 'array' : typeof value;

    switch (fieldValueType) {
        case 'array':
            value = []
            break
        case 'object':
            value = {}
            break
        case 'string':
        case 'number':
            value = ''
            break
        default:
    }

    return Object.assign({}, object, {[field]: value})
}

/**
 * Nullifies multi language fields based on selected languages
 * @param   {object}    formValues          form containing the multi language field that will be nullified
 * @param   {array}     contentLanguages    selected languages
 * @return  {Object}                       nullified multi language fields for unselected languages
 */
export const nullifyMultiLanguageValues = (formValues, contentLanguages) => {
    const multiLanguageFields = ['name', 'description', 'short_description', 'provider', 'location_extra_info', 'info_url', 'offers', 'videos']

    const nullifyAndSanitizeField = value => {
        return Object.keys(value).reduce((acc, curr) => {
            if (contentLanguages.includes(curr)) {
                if (typeof value[curr] === 'string' && value[curr].length === 0) {
                    acc[curr] = null
                } else {
                    acc[curr] = sanitizeString(value[curr])
                }
            } else {
                acc[curr] = null
            }
            return acc;
        }, {})
    }

    return multiLanguageFields.reduce((multiLanguageValues, field) => {
        if (!isNil(formValues[field])) {
            if (field === 'offers') {
                multiLanguageValues[field] = formValues[field].reduce((offers, offer, index) => {
                    offers.push(offer);
                    Object.keys(offer).filter(key => !['is_free', 'payment_methods'].includes(key))
                        .forEach(key => offers[index][key] = !isNil(offer[key]) ? nullifyAndSanitizeField(offer[key]) : null)
                    return offers
                }, [])
            } else if (field === 'videos') {
                multiLanguageValues[field] = formValues[field].reduce((videos, video, index) => {
                    videos.push(video);
                    Object.keys(video).filter(key => !['url'].includes(key))
                        .forEach(key => videos[index][key] = !isNil(video[key]) ? nullifyAndSanitizeField(video[key]) : null)
                    return videos
                }, [])
            } else {
                multiLanguageValues[field] = nullifyAndSanitizeField(formValues[field])
            }
        }
        return multiLanguageValues;
    }, {})
}

/**
 * Scrolls to the top of the page
 */
export const scrollToTop = ()  => window.scrollTo(0, 0)

/**
 * Checks if language fields based on selected languages are found with value
 * @param {object} values editor values containing the multi language field that will be checked
 * @param {string[]} contentLanguages selected languages
 * @param {string} target check if values exist that have this key.
 * @return {boolean}  multi language fields exists for unselected languages
 * @example
 * let containsValuesForSV = checkMultiLanguageFieldValues({name:{fi:'text',sv:'text'}},['fi','sv'], 'sv');
 * containsValuesForSV === true;
 * containsValuesForSV = checkMultiLanguageFieldValues({name:{fi:'text',sv:''}}, ['fi','sv'], 'sv');
 * containsValuesForSV === false;
 */
export const checkMultiLanguageFieldValues = (values, contentLanguages, target) => {
    const multiLangFields =  ['name', 'description', 'short_description', 'provider', 'location_extra_info', 'info_url', 'offers', 'videos']
    const checkFieldLanguageValues = value => {
        let FOUND = false;
        for (const valueObj of value) {
            for (const prop in valueObj) {
                if (contentLanguages.includes(target) && target === prop && valueObj[prop]) {
                    FOUND = true
                    break;
                }
            }
            if (FOUND){break;}
        }
        return FOUND
    }

    const multiLangVals = multiLangFields.reduce((acc, curr) => {
        if (curr === 'offers' && values[curr]) {
            const offerKeys = ['description','info_url','price'];
            values[curr].forEach((offer) => {
                offerKeys.forEach((offerKey) => {
                    if (offer[offerKey]) {
                        acc.push(offer[offerKey])
                    }
                })
            });
        } else if (curr === 'videos' && values[curr]) {
            const offerKeys = ['name', 'alt_text'];
            values[curr].forEach((video) => {
                offerKeys.forEach((videoKey) => {
                    if (video[videoKey]) {
                        acc.push(video[videoKey])
                    }
                })
            });
        } else if (values[curr]) {
            acc.push(values[curr]);
        }
        return acc;
    }, []);
    return checkFieldLanguageValues(multiLangVals);
}

/**
 * Deletes all key/val according to unselectedLanguages that are found in multi-language fields.
 * @param {object} values Object containing certain multi-language key/val that are to be filtered.
 * @param {string[]} unselectedLanguages contains languages that are to be removed.
 * @returns {object} Object that contains no keys that were found in unselectedLanguages.
 * @example
 * const data = deleteUnselectedLangKeys({name:{fi:'value',sv:'value'}}, ['sv']);
 * data === {name:{fi:'value'}};
 */
export const deleteUnselectedLangKeys = (values, unselectedLanguages) => {
    const multiLanguageFields = ['name', 'description', 'short_description', 'provider', 'location_extra_info', 'info_url', 'offers', 'videos'];
    // copy of values
    const clearedValues = JSON.parse(JSON.stringify(values))
    // delete keys for languages that are in unselectedLanguages
    multiLanguageFields.forEach((multiKey) => {
        if (values[multiKey] && multiKey === 'offers') {
            const offerKeys = ['price','description','info_url'];
            values[multiKey].forEach((offer, index) => {
                offerKeys.forEach((offerMultiKey) => {
                    const localKeys = offer[offerMultiKey] && Object.keys(offer[offerMultiKey]) || [];
                    const deleteKeys = localKeys.reduce((keysToRemove, current) => {
                        if (unselectedLanguages.includes(current)) {
                            keysToRemove.push(current);
                        }
                        return keysToRemove;
                    }, []);
                    if (deleteKeys.length) {
                        deleteKeys.forEach((deleteKey) => {
                            delete clearedValues[multiKey][index][offerMultiKey][deleteKey]
                        });
                    }
                });
            });
        }
        else if (values[multiKey] && multiKey === 'videos') {
            const offerKeys = ['name', 'alt_text'];
            values[multiKey].forEach((video, index) => {
                offerKeys.forEach((videoMultiKey) => {
                    const localKeys = video[videoMultiKey] && Object.keys(video[videoMultiKey]) || [];
                    const deleteKeys = localKeys.reduce((keysToRemove, current) => {
                        if (unselectedLanguages.includes(current)) {
                            keysToRemove.push(current);
                        }
                        return keysToRemove;
                    }, []);
                    if (deleteKeys.length) {
                        deleteKeys.forEach((deleteKey) => {
                            delete clearedValues[multiKey][index][videoMultiKey][deleteKey]
                        });
                    }
                });
            });
        } else if (values[multiKey]) {
            const localKeys = Object.keys(values[multiKey]);
            const deleteKeys = localKeys.reduce((keysToRemove, currentKey) => {
                if (unselectedLanguages.includes(currentKey)) {
                    keysToRemove.push(currentKey);
                }
                return keysToRemove;
            }, []);
            if (deleteKeys.length) {
                deleteKeys.forEach((deleteKey) => {
                    delete clearedValues[multiKey][deleteKey]
                });
            }
        }
    });
    return clearedValues;
}

/**
 * Returns the first defined value of a multi-language field
 * @param field             Multi-language field to get the value from
 * @param contentLanguages  Optional. If given, the value will only be looked for, for the given languages
 * @returns {string|undefined}
 */
export const getFirstMultiLanguageFieldValue = (field, contentLanguages = null) => {
    if (isNil(field)) {
        return undefined
    }
    return isArray(contentLanguages)
        ? get(field, keys(field).filter(key => contentLanguages.includes(key)).find(key => !isNil(field[key])), '')
        : get(field, keys(field).find(key => !isNil(field[key])), '')
}

/**
 * Returns a badge for the given type
 * @param type Type of the badge
 * @param size  Size of the badge
 * @returns {*}
 */
export const getBadge = (type, size = 'small') => {
    let badgeType = 'primary'

    switch (type) {
        case 'series':
            badgeType = 'success'
            break
        case 'umbrella':
        case 'event':
        case 'courses':
        case 'hobby':
            badgeType = 'info'
            break
        case 'draft':
            badgeType = 'warning'
            break
        case 'cancelled':
            badgeType = 'danger'
            break
    }

    return (
        <Badge
            className={`${type} `}
            pill
            variant={type}>
            {<FormattedMessage id={type}/>}
        </Badge>
    )
}

/**
 * Returns a formatted date
 * @param date  Date to format
 * @returns {string}
 */
export const getDate = date => moment(date).format('D.M.YYYY')

/**
 * Returns a formatted date time
 * @param date  Date to format
 * @returns {string}
 */
export const getDateTime = date => moment(date).format('D.M.YYYY HH:mm')

/**
 * Returns the button label
 * @param action
 * @param isRegularUser
 * @param isDraft
 * @param eventIsPublished
 * @param formHasSubEvents
 * @returns {string}
 */
export const getButtonLabel = (
    action,
    isRegularUser,
    isDraft,
    eventIsPublished,
    formHasSubEvents
) => {
    let buttonLabel = `${action}-events`

    if (action === 'return') {
        buttonLabel = 'return-without-saving'
    }
    if (action === 'copy') {
        buttonLabel = 'copy-event-to-draft'
    }
    if (action === 'update') {
        buttonLabel = isRegularUser
            ? isDraft ? 'event-action-save-draft-existing' : 'event-action-save-draft-new'
            : eventIsPublished ? 'event-action-save-existing' : 'event-action-save-new'

        if (!eventIsPublished && formHasSubEvents) {
            buttonLabel = 'event-action-save-multiple'
        }
    }

    return buttonLabel
}
