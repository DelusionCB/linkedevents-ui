
import moment from 'moment'
import {includes} from 'lodash';
import constants from '../constants'
import {getCurrentTypeSet, textLimitValidator} from '../utils/helpers'
import {mapKeywordSetToForm} from '../utils/apiDataMapping'
/**
 * Notice that all the validation functions follow the Formsy's parameter setup (values, value)
 * where values are all the form valus and value the tested field value
 */

let _isExisty = function _isExisty(value) {
    return value !== null && value !== undefined;
}

let isEmpty = function isEmpty(value) {
    if (value === '') {return true}
    if (value === null) {return true}
    if (typeof value == 'object') {
        const vals = Object.values(value);
        if (vals.length > 0 && vals[0] === '') {return true}
        if (vals.length === 0) {return true}
    }
}

const _isUrl = function(values, value) {
    return validations.matchRegexp(values, value, /^(https?):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i);
}

var validations = {
    isDefaultRequiredValue: function isDefaultRequiredValue(values, value) {
        return value === undefined || value === '';
    },
    isExisty: function isExisty(values, value) {
        return _isExisty(value);
    },
    matchRegexp: function matchRegexp(values, value, regexp) {
        return !_isExisty(value) || isEmpty(value) || regexp.test(value);
    },
    isUndefined: function isUndefined(values, value) {
        return value === undefined;
    },
    isEmptyString: function isEmptyString(values, value) {
        return isEmpty(value);
    },
    /* eslint-disable */
    /*
    Validation for Emails is not used in Linked Events, therefore this function should not be enabled until it has usage.
    isEmail: function isEmail(values, value) {
        return validations.matchRegexp(values, value, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i);
    },

     */
    /* eslint-enable */
    isUrl: function isUrl(values, value, language) {
        if (language === undefined) {
            return _isUrl(values, value)
        } else {
            return _isUrl(values, value[language])
        }
    },
    isTrue: function isTrue(values, value) {
        return value === true;
    },
    isFalse: function isFalse(values, value) {
        return value === false;
    },
    isNumeric: function isNumeric(values, value) {
        if (typeof value === 'number') {
            return true;
        }
        return validations.matchRegexp(values, value, /^[-+]?(?:\d*[.])?\d+$/);
    },
    isAlpha: function isAlpha(values, value) {
        return validations.matchRegexp(values, value, /^[A-Z]+$/i);
    },
    isAlphanumeric: function isAlphanumeric(values, value) {
        return validations.matchRegexp(values, value, /^[0-9A-Z]+$/i);
    },
    isInt: function isInt(values, value) {
        return validations.matchRegexp(values, value, /^(?:[-+]?(?:0|[1-9]\d*))$/);
    },
    isAtLeastZero: function isAtLeastZero(values, value) {
        return Number.parseFloat(value) && value >= 0
    },
    isWords: function isWords(values, value) {
        return validations.matchRegexp(values, value, /^[A-Z\s]+$/i);
    },
    isSpecialWords: function isSpecialWords(values, value) {
        return validations.matchRegexp(values, value, /^[A-Z\s\u00C0-\u017F]+$/i);
    },
    isLength: function isLength(values, value, length) {
        return !_isExisty(value) || isEmpty(value) || value.length === length;
    },
    equals: function equals(values, value, eql) {
        return !_isExisty(value) || isEmpty(value) || value == eql;
    },
    equalsField: function equalsField(values, value, field) {
        return value == values[field];
    },
    maxLength: function maxLength(values, value, length) {
        return !_isExisty(value) || value.length <= length;
    },
    minLength: function minLength(values, value, length) {
        return !_isExisty(value) || isEmpty(value) || value.length >= length;
    },
    isTime: function isTime(values, value) {
        // Empty string needs not match, because HelTimePicker does not run validations on empty strings anyway.
        // However, HelDateTimeField itself runs this too, and there we must *not* accept empty time.
        return validations.matchRegexp(values, value, /(24((:|\.)00)?)|^((2[0-3]|1[0-9]|0[0-9]|[0-9])((:|\.)[0-5][0-9])?)$/i);
    },
    isDate: function isDate(values, value) {
        // Emtpy string needs to match, to allow empty *or* valid date.
        // Required (non-empty) fields are validated separately.
        return !value || moment(value, moment.ISO_8601, true).isValid()
    },
    isLessThanMaxAge: function isLessThanMaxAge(values, value) {
        if (!values.audience_max_age || !value) {
            return true
        }
        return value <= Number.parseInt(values.audience_max_age)
    },
    isMoreThanMinAge: function isMoreThanMinAge(values, value) {
        if (!values.audience_min_age || !value) {
            return true
        }
        return value >= Number.parseInt(values.audience_min_age)
    },
    isMoreThanMinimumCapacity: function isMoreThanMinimumCapacity(values, value) {
        if (!values.minimum_attendee_capacity || !value) {
            return true
        }
        return value >= Number.parseInt(values.minimum_attendee_capacity)
    },
    isLessThanMaximumCapacity: function isLessThanMaximumCapacity(values, value) {
        if (!values.maximum_attendee_capacity || !value) {
            return true
        }
        return value <= Number.parseInt(values.maximum_attendee_capacity)
    },
    afterStartTime: function afterStartTime(values, value) {
        if (!values.start_time || !value) return true

        const time = new Date(value)
        const start_time = new Date(values.start_time)

        return time - start_time >= 0;
    },
    afterEnrolmentStartTime: function afterEnrolmentStartTime(values, value) {
        if(!values.enrolment_start_time || !value) { return true }
        return new Date(value) >= new Date(values.enrolment_start_time)
    },
    inTheFuture: function inTheFuture(values, value) {

        if(!value) {return true}

        let now = new Date()
        let time = new Date(value)

        if (time - now >= 0) {
            return true;
        }

        return false;
    },
    required: function required(values, value) {
        return _isExisty(value)
    },
    requiredImage: function requiredImage(values, value) {
        if(typeof value !== 'object' || !value) {
            return false
        }
        if (Object.keys(value).length === 0) {
            return false;
        }
        return true
    },
    requiredForCourses: function requiredForCourses(values, value){
        if (values['type_id'] === constants.EVENT_TYPE.GENERAL) {
            return true;
        }
        return this.required(values, value);
    },
    requiredString: function requiredString(values, value) {
        if(typeof value === 'string' && value.length > 0) {
            return true
        }
        return false
    },
    requiredStringForCourses: function requiredStringForCourses(values, value){
        if (values['type_id'] === constants.EVENT_TYPE.GENERAL) {
            return true;
        }
        return this.requiredString(values, value);
    },
    requiredMulti: function requiredMulti(values, value, language) {
        if (!value || !value[language]) {
            return false
        } else {
            return value[language].length > 0
        }
    },
    requiredAtId: function requiredAtId(values, value) {
        if(typeof value !== 'object' || !value) {
            return false
        }
        if(typeof value['@id'] !== 'string') {
            return false
        }
        if(value['@id'].length === 0) {
            return false
        }

        return true
    },
    atLeastOne: function atLeastOne(values, value) {
        if(value && value.length && value.length > 0) {
            return true
        }
        return false
    },
    atLeastOneMainCategory(values, value, keywordSets) {
        const typeSet = getCurrentTypeSet(values['type_id'])
        if (!value) {
            return false
        }
        return mapKeywordSetToForm(keywordSets, typeSet)
            .map(item => item.value)
            .some(item => value.find(_item => _item.value.includes(item)))
    },
    atLeastOneSecondaryCategory(values, value, keywordSets) {
        if (!value) {
            return false
        }
        return mapKeywordSetToForm(keywordSets, 'turku:topic_type')
            .map(item => item.value)
            .some(item => value.find(_item => _item.value.includes(item)))
    },
    shortString: function shortString(values, value, language) {
        if (language === undefined) {
            return textLimitValidator(value, constants.CHARACTER_LIMIT.SHORT_STRING)
        } else {
            return textLimitValidator(value[language], constants.CHARACTER_LIMIT.SHORT_STRING)
        }
    },
    mediumString: function mediumString(values, value, language) {
        if (language === undefined) {
            return textLimitValidator(value, constants.CHARACTER_LIMIT.MEDIUM_STRING)
        } else {
            return textLimitValidator(value[language], constants.CHARACTER_LIMIT.MEDIUM_STRING)
        }
    },
    longString: function longString(values, value, language) {
        if (language === undefined) {
            return textLimitValidator(value, constants.CHARACTER_LIMIT.LONG_STRING)
        } else {
            return textLimitValidator(value[language], constants.CHARACTER_LIMIT.LONG_STRING)
        }
    },
    atLeastOneIsTrue: function atLeastOneIsTrue(values, value) {
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                if(value[key]) {
                    return true
                }
            }
        }
        return false
    },
    isPositiveInt: function isPositiveInt(values, value) {
        if (!value) {
            return true
        }
        return value >= 0
    },
    isLessThanMaxAgeLimit: function isLessThanMaxAgeLimit(values, value) {
        if (!value) {
            return true
        }
        return value <= constants.MAX_AGE_LIMIT
    },
    isMoreThanOne: function isMoreThanOne(values, value) {
        return value > 0 ? true : false
    },
    isMoreThanTwo: function isMoreThanTwo(values, value) {
        return Object.keys(value).length >= 2
    },
    isMoreThanSixtyFive: function isMoreThanSixtyFive(values, value) {
        return Object.keys(value).length <= 65
    },
    isMoreThanSix: function isMoreThanSix(values, value) {
        return value.length >= 6
    },
    daysWithinInterval: function daysWithinInterval(values, value) {
        if (!(value < 6)) { return true }
        const {start_day_index, end_day_index, daysSelected} = values
        const dayCodes = {
            monday: 0,
            tuesday: 1,
            wednesday: 2,
            thursday: 3,
            friday: 4,
            saturday: 5,
            sunday: 6,
        };
        let daysSelectedState = [];
        let betweenInterval;

        if (start_day_index <= end_day_index) {
            betweenInterval = true
        } else {
            betweenInterval = false
        }

        for (const key in daysSelected) {
            if (daysSelected[key] === true) {
                if (betweenInterval) {
                    daysSelectedState.push(start_day_index <= dayCodes[key] && dayCodes[key] <= end_day_index)
                } else {
                    daysSelectedState.push(dayCodes[key] <= end_day_index || start_day_index <= dayCodes[key])
                }
            }
        }

        if (includes(daysSelectedState, false)) {
            return false;
        } else {
            return true;
        }
    },
    hasValidPrice: function hasValidPrice(values, value, language) {
        if (values.price !== null) {
            return this.isAtLeastZero(values, value[language])
        } else {
            return true
        }
    },
    hasPrice: function hasPrice(values, value, language) {
        if (values.is_free !== undefined && !values.is_free) {
            return value[language] && !!value[language].length;
        } else {
            return true
        }
    },
    requiredVideoField(values, value, language, key) {
        // check whether all values are empty
        const allEmpty = Object.values(values).every(isEmpty)

        if (!allEmpty) {
            if (key === 'url' && language === undefined) {
                return value.length !== 0
            }
            if (['name','alt_text'].includes(key) && value[language] !== null) {
                return Object.keys(value).length > 0 && value[language].length > 0
            } else {
                return false
            }
        } else {
            return true
        }
    },
};

export default validations;
