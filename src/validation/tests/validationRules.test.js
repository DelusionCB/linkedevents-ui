import React from 'react';
import validationFn from '../validationRules';
import constants from '../../constants';

describe('validation rules', () => {

    function generateText(length){
        let text = '';
        const characters = 'DOGSANDCATSWELIKETHEMMATSDELUSIONCBCODINGLIKEmats0123456789';

        for (let i = 0; i < length; i++)
            text += characters.charAt(Math.floor(Math.random() * characters.length));
        return text;
    }

    describe('isDefaultRequiredValue', () => {
        const testValues = [
            {values: {}, value: undefined, expected: true},
            {values: {}, value: '', expected: true},
            {values: {}, value: 'test', expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isDefaultRequiredValue(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isExisty', () => {
        const testValues = [
            {values: {}, value: null, expected: false},
            {values: {}, value: undefined, expected: false},
            {values: {}, value: 42, expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isExisty(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('matchRegexp', () => {
        const testValues = [
            {values: {}, value: undefined, regexp: new RegExp('foo'), expected: true},
            {values: {}, value: {fi: {}}, regexp: new RegExp('foo'), expected: false},
            {values: {}, value: 'foo', regexp: new RegExp('foo'), expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case: %#',
            ({values, value, expected, regexp}) => {
                const testFunction = validationFn.matchRegexp(values, value, regexp)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isUndefined', () => {
        const testValues = [
            {values: {}, value: undefined, expected: true},
            {values: {}, value: 'value', expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case: %#',
            ({values, value, expected}) => {
                const testFunction = validationFn.isUndefined(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isEmptyString', () => {
        const testValues = [
            {values: {}, value: '', expected: true},
            {values: {}, value: null, expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isEmptyString(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isUrl', () => {
        const testValues = [
            {values: {}, value: 'https://google.com', expected: true},
            {values: {}, value: 'google', expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isUrl(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isTrue', () => {
        const testValues = [
            {values: {}, value: true, expected: true},
            {values: {}, value: false, expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isTrue(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isFalse', () => {
        const testValues = [
            {values: {}, value: false, expected: true},
            {values: {}, value: true, expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isFalse(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isNumeric', () => {
        const testValues = [
            {values: {}, value: 42, expected: true},
            {values: {}, value: 'test', expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isNumeric(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isAlpha', () => {
        const testValues = [
            {values: {}, value: 'TEST', expected: true},
            {values: {}, value: 1, expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isAlpha(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isAlphanumeric', () => {
        const testValues = [
            {values: {}, value: '53A', expected: true},
            {values: {}, value: '-', expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isAlphanumeric(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isInt', () => {
        const testValues = [
            {values: {}, value: 52, expected: true},
            {values: {}, value: 'test', expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isInt(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isAtLeastZero', () => {
        const testValues = [
            {values: {}, value: 5, expected: true},
            {values: {}, value: -5, expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isAtLeastZero(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isWords', () => {
        const testValues = [
            {values: {}, value: 'words', expected: true},
            {values: {}, value: 1, expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isWords(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isSpecialWords', () => {
        const testValues = [
            {values: {}, value: 'test', expected: true},
            {values: {}, value: 'Ì', expected: true},
            {values: {}, value: 524, expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isSpecialWords(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isLength', () => {
        const testValues = [
            {values: {}, value: null, length: 5, expected: true},
            {values: {}, value: 'test4', length: 5, expected: true},
            {values: {}, value: '', length: 5, expected: true},
            {values: {}, value: 'whats going on here?', length: 5, expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case: %#',
            ({values, value, length, expected}) => {
                const testFunction = validationFn.isLength(values, value, length)
                expect(testFunction).toBe(expected)
            })
    })
    describe('equals', () => {
        const testValues = [
            {values: {}, value: 'test', eql: 'test', expected: true},
            {values: {}, value: 1, eql: 'test', expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, eql, expected}) => {
                const testFunction = validationFn.equals(values, value, eql)
                expect(testFunction).toBe(expected)
            })
    })
    describe('equalsField', () => {
        const testValues = [
            {values: {name: 'test'}, field: 'name', value: 'test', expected: true},
            {values: {name: 'test1'}, field: 'name', value: 'test', expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case %#',
            ({values, value, field, expected}) => {
                const testFunction = validationFn.equalsField(values, value, field)
                expect(testFunction).toBe(expected)
            })
    })
    describe('maxLength', () => {
        const testValues = [
            {values: {}, value: 'test', length: 5, expected: true},
            {values: {}, value: 'ttwerwerwerw', length: 5, expected: false},
            {values: {}, value: 1, length: 5, expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case %#',
            ({values, value, length, expected}) => {
                const testFunction = validationFn.maxLength(values, value, length)
                expect(testFunction).toBe(expected)
            })
    })
    describe('minLength', () => {
        const testValues = [
            {values: {}, value: 'tests', length: 5, expected: true},
            {values: {}, value: 'te', length: 5, expected: false},
            {values: {}, value: 1, length: 5, expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, length, expected}) => {
                const testFunction = validationFn.minLength(values, value, length)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isTime', () => {
        const testValues = [
            {values: {}, value: '15.54', expected: true},
            {values: {}, value: '27.05.2022', expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isTime(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isDate', () => {
        const testValues = [
            {values: {}, value: '2019-07-17', expected: true},
            {values: {}, value: '26042022', expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isDate(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isLessThanMaxAge', () => {
        const testValues = [
            {values: {audience_max_age: 50}, value: 25, expected: true},
            {values: {audience_max_age: 50}, value: 51, expected: false},
            {values: {}, value: '', expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isLessThanMaxAge(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isMoreThanMinAge', () => {
        const testValues = [
            {values: {audience_min_age: 15}, value: 25, expected: true},
            {values: {audience_min_age: 15}, value: 14, expected: false},
            {values: {}, value: '', expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isMoreThanMinAge(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isMoreThanMinimumCapacity', () => {
        const testValues = [
            {values: {minimum_attendee_capacity: 15}, value: 16, expected: true},
            {values: {minimum_attendee_capacity: 15}, value: 14, expected: false},
            {values: {}, value: '', expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case: %#',
            ({values, value, expected}) => {
                const testFunction = validationFn.isMoreThanMinimumCapacity(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isLessThanMaximumCapacity', () => {
        const testValues = [
            {values: {maximum_attendee_capacity: 50}, value: 45, expected: true},
            {values: {maximum_attendee_capacity: 50}, value: 55, expected: false},
            {values: {}, value: '', expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case: %#',
            ({values, value, expected}) => {
                const testFunction = validationFn.isLessThanMaximumCapacity(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('maximumCapacity', () => {
        const testValues = [
            {value: 15000, expected: true},
            {value: 150000, expected: false},
            {value: 100000, expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case: %#',
            ({values, value, expected}) => {
                const testFunction = validationFn.maximumCapacity(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('afterStartTime', () => {
        const testValues = [
            {values: {start_time: new Date('2022-12-17')}, value: new Date('2022-12-19'), expected: true},
            {values: {start_time: new Date('2022-12-17')}, value: new Date('2022-12-14'), expected: false},
            {values: {}, value: '', expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case: %#',
            ({values, value, expected}) => {
                const testFunction = validationFn.afterStartTime(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('afterEnrolmentStartTime', () => {
        const testValues = [
            {values: {enrolment_start_time: new Date('2022-12-17')}, value: new Date('2022-12-19'), expected: true},
            {values: {enrolment_start_time: new Date('2022-12-17')}, value: new Date('2022-12-14'), expected: false},
            {values: {}, value: '', expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case: %#',
            ({values, value, expected}) => {
                const testFunction = validationFn.afterEnrolmentStartTime(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('inTheFuture', () => {
        const testValues = [
            {values: {}, value: new Date('2222-12-17'), expected: true},
            {values: {}, value: new Date('2021-12-17'), expected: false},
            {values: {}, value: '', expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.inTheFuture(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('required', () => {
        const testValues = [
            {values: {}, value: null, expected: false},
            {values: {}, value: 'test', expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.required(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('requiredImage', () => {
        const testValues = [
            {values: {}, value: '', expected: false},
            {values: {}, value: {}, expected: false},
            {values: {}, value: {name: 'image', data: 3152345}, expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.requiredImage(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('requiredForCourses', () => {
        const testValues = [
            {values: {}, value: '', expected: true},
            {values: {type_id: constants.EVENT_TYPE.HOBBIES}, value: null, expected: false},
            {values: {type_id: constants.EVENT_TYPE.GENERAL}, value: 'test', expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.requiredForCourses(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('requiredString', () => {
        const testValues = [
            {values: {}, value: '', expected: false},
            {values: {}, value: undefined, expected: false},
            {values: {}, value: 'test', expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.requiredString(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('requiredStringForCourses', () => {
        const testValues = [
            {values: {}, value: '', expected: false},
            {values: {type_id: constants.EVENT_TYPE.HOBBIES}, value: null, expected: false},
            {values: {type_id: constants.EVENT_TYPE.GENERAL}, value: 'test', expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.requiredStringForCourses(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('requiredMulti', () => {
        const testValues = [
            {values: {}, value: '', expected: false},
            {values: {}, value: {sv: 'test'}, expected: false},
            {values: {}, value: {fi: ''}, expected: false},
            {values: {}, value: {fi: 'test'}, expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.requiredMulti(values, value, 'fi')
                expect(testFunction).toBe(expected)
            })
    })
    describe('requiredAtId', () => {
        const testValues = [
            {values: {}, value: '', expected: false},
            {values: {}, value: {'@id': {}}, expected: false},
            {values: {}, value: {'@id': ''}, expected: false},
            {values: {}, value: {'@id': 'test'}, expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.requiredAtId(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('atLeastOne', () => {
        const testValues = [
            {values: {}, value: 'test', expected: true},
            {values: {}, value: '', expected: false},
            {values: {}, value: null, expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.atLeastOne(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('atLeastOneMainCategory', () => {
        const testValues = [
            {values: {type_id: constants.EVENT_TYPE.GENERAL}, keywordSets: [], value: null, expected: false},
            {values: {type_id: constants.EVENT_TYPE.GENERAL}, keywordSets:
                    [{id: 'turku:topic_content', keywords: [{id: 'tsl:5353', '@id': 'https://google.com'}]}],
            value: [{id: 'tsl:5353', value: 'https://google.com'}], expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case: %#',
            ({values, value, keywordSets, expected}) => {
                const testFunction = validationFn.atLeastOneMainCategory(values, value, keywordSets)
                expect(testFunction).toBe(expected)
            })
    })
    describe('atLeastOneSecondaryCategory', () => {
        const testValues = [
            {values: {type_id: constants.EVENT_TYPE.GENERAL}, keywordSets: [], value: null, expected: false},
            {values: {type_id: constants.EVENT_TYPE.GENERAL}, keywordSets:
                    [{id: 'turku:topic_type', keywords: [{id: 'tsl:553', '@id': 'https://google.com'}]}],
            value: [{id: 'tsl:553', value: 'https://google.com'}], expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case: %#',
            ({values, value, keywordSets,  expected}) => {
                const testFunction = validationFn.atLeastOneSecondaryCategory(values, value, keywordSets)
                expect(testFunction).toBe(expected)
            })
    })
    describe('shortString', () => {
        const testValues = [
            {values: {}, value: generateText(161), language: undefined, expected: false},
            {values: {}, value: generateText(159), language: undefined, expected: true},
            {values: {}, value: {sv: generateText(161)}, language: 'sv', expected: false},
            {values: {}, value: {fi: generateText(159)}, language: 'fi', expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case: %#',
            ({values, value, language, expected}) => {
                const testFunction = validationFn.shortString(values, value, language)
                expect(testFunction).toBe(expected)
            })
    })
    describe('mediumString', () => {
        const testValues = [
            {values: {}, value: generateText(330), language: undefined, expected: false},
            {values: {}, value: generateText(315), language: undefined, expected: true},
            {values: {}, value: {sv: generateText(330)}, language: 'sv', expected: false},
            {values: {}, value: {fi: generateText(315)}, language: 'fi', expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case: %#',
            ({values, value, language, expected}) => {
                const testFunction = validationFn.mediumString(values, value, language)
                expect(testFunction).toBe(expected)
            })
    })
    describe('longString', () => {
        const testValues = [
            {values: {}, value: generateText(5050), language: undefined, expected: false},
            {values: {}, value: generateText(4950), language: undefined, expected: true},
            {values: {}, value: {sv: generateText(5050)}, language: 'sv', expected: false},
            {values: {}, value: {fi: generateText(4950)}, language: 'fi', expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case: %#',
            ({values, value, language, expected}) => {
                const testFunction = validationFn.longString(values, value, language)
                expect(testFunction).toBe(expected)
            })
    })
    describe('atLeastOneIsTrue', () => {
        const testValues = [
            {values: {}, value: {isTrue: true}, expected: true},
            {values: {}, value: '', expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.atLeastOneIsTrue(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isPositiveInt', () => {
        const testValues = [
            {values: {}, value: null, expected: true},
            {values: {}, value: -5, expected: false},
            {values: {}, value: 5, expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isPositiveInt(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isLessThanMaxAgeLimit', () => {
        const testValues = [
            {values: {}, value: null, expected: true},
            {values: {}, value: 155, expected: false},
            {values: {}, value: 149, expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isLessThanMaxAgeLimit(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isMoreThanOne', () => {
        const testValues = [
            {values: {}, value: 5, expected: true},
            {values: {}, value: null, expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isMoreThanOne(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isMoreThanTwo', () => {
        const testValues = [
            {values: {}, value: {}, expected: false},
            {values: {}, value: {fi: ''}, expected: false},
            {values: {}, value: {fi: '', sv: ''}, expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isMoreThanTwo(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isMoreThanSixtyFive', () => {
        const testValues = [
            {values: {}, value: new Object(generateText(66)), expected: false},
            {values: {}, value: new Object(generateText(55)), expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case: %#',
            ({values, value, expected}) => {
                const testFunction = validationFn.isMoreThanSixtyFive(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('isMoreThanSix', () => {
        const testValues = [
            {values: {}, value: 'testtest', expected: true},
            {values: {}, value: 'tes', expected: false},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.isMoreThanSix(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('daysWithinInterval', () => {
        const testValues = [
            {values: {
                daysSelected: {
                    friday: false,
                    monday: true,
                    saturday: false,
                    sunday: false,
                    thursday: true,
                    tuesday: true,
                    wednesday: true,
                },
                end_day_index: 6,
                start_day_index: 0,
                type: 'day_within_interval',
            }, value: 6, expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.daysWithinInterval(values, value)
                expect(testFunction).toBe(expected)
            })
    })
    describe('hasValidPrice', () => {
        const testValues = [
            {values: {price: null}, value: '', expected: true},
            {values: {price: {fi: -5}}, value: {fi: -5}, expected: false},
            {values: {price: {fi: 5}}, value: {fi: 5}, expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.hasValidPrice(values, value, 'fi')
                expect(testFunction).toBe(expected)
            })
    })
    describe('hasPrice', () => {
        const testValues = [
            {values: {}, value: '', expected: true},
            {values: {is_free: false}, value: {fi: '52'}, expected: true},
            {values: {is_free: false}, value: {fi: ''}},
        ]
        test.each(testValues) (
            'returns correct Booleans for values: %o',
            ({values, value, expected}) => {
                const testFunction = validationFn.hasPrice(values, value, 'fi')
                if (value.fi === '') {
                    expect(testFunction).toBeFalsy()
                } else {
                    expect(testFunction).toBe(expected)
                }
            })
    })
    describe('requiredVideoField', () => {
        const testValues = [
            {values: {alt_text: {}, name: {}, url: ''}, value: '', language: '', key: '', expected: false},
            {values: {alt_text: {fi: 'test'}, name: {}, url: ''}, value: '', language: undefined, key: 'url', expected: false},
            {values: {alt_text: {}, name: {}, url: ''}, value: {fi: 'test'}, language: 'fi', key: 'name', expected: true},
            {values: {alt_text: {sv: null}, name: {sv: null}, url: ''}, value: {}, language: 'sv', key: 'alt_text', expected: false},
            {values: {alt_text: {}, name: {fi: 'test', en: 'test'}, url: ''}, value: {fi: 'test', en: 'test'}, language: 'en', key: 'name', expected: true},
        ]
        test.each(testValues) (
            'returns correct Booleans for test case: %#',
            ({values, value, language, key, expected}) => {
                const testFunction = validationFn.requiredVideoField(values, value, language, key)
                expect(testFunction).toBe(expected)
            })
    })
})
