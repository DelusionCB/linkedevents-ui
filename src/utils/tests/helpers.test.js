import React from 'react'
import {shallow} from 'enzyme';
import * as helpers from '../helpers'
import moment from 'moment';
import constants from '../../constants'
import Badge from 'react-bootstrap/Badge'
import {getDate} from '../helpers';

const {VALIDATION_RULES, CHARACTER_LIMIT, EVENT_TYPE} = constants

/**
 * Returns an object consisting of multiple multi-language key/val.
 * @param {string[]} languages Multi-language object keys are specified by these values.
 * @param {{lang: string, value: *, keys: string[]}} specifyLangValue Specify lang,value and keys that are used instead when setting values.
 * @returns {{offers: [{price: {}, is_free: boolean, description: {}, info_url: {}}], videos: [{name: {}, url: '', alt_text: {}}], short_description: {}, name: {}, description: {}}}
 */
function createMultiLangValues(languages, specifyLangValue = {lang: '', value: '', keys: []}) {
    const values = {
        name: {},
        short_description: {},
        description: {},
        offers: [{is_free: false, info_url: {}, price: {}, description: {}}],
        videos: [{url: '', alt_text: {}, name: {}}],
    };
    // check if lang is same as specifyLangValue.lang.
    const langSpecified = (lang, key) => lang === specifyLangValue.lang && specifyLangValue.keys.includes(key);
    languages.forEach((lang) => {
        values.name[lang] = langSpecified(lang, 'name') ? specifyLangValue.value : `${lang}-name`
        values.short_description[lang] = langSpecified(lang, 'short_description') ? specifyLangValue.value : `${lang}-short_description`
        values.description[lang] = langSpecified(lang, 'description') ? specifyLangValue.value : `${lang}-description`;
        values.offers[0].price[lang] = langSpecified(lang, 'price') ? specifyLangValue.value : `${lang}-price`;
        values.offers[0].info_url[lang] = langSpecified(lang, 'info_url') ? specifyLangValue.value : `${lang}-info`
        values.offers[0].description[lang] = langSpecified(lang, 'offer_description') ? specifyLangValue.value : `${lang}-description`
        values.videos[0].alt_text[lang] = langSpecified(lang, 'video_alt_text') ? specifyLangValue.value : `${lang}-alt_text`
        values.videos[0].name[lang] = langSpecified(lang, 'video_name') ? specifyLangValue.value : `${lang}-name`
    })
    return values
}

const CONTENT_LANGUAGES = ['fi', 'sv', 'en'];

describe('utils/helpers', () => {

    describe('getCharacterLimitByRule', () => {
        const rules = [
            {rule: VALIDATION_RULES.SHORT_STRING, limit: CHARACTER_LIMIT.SHORT_STRING},
            {rule: VALIDATION_RULES.MEDIUM_STRING, limit: CHARACTER_LIMIT.MEDIUM_STRING},
            {rule: VALIDATION_RULES.LONG_STRING, limit: CHARACTER_LIMIT.LONG_STRING},
        ]
        test.each(rules) (
            'expect rule return correct limit %o',
            ({rule, limit}) => {
                expect(helpers.getCharacterLimitByRule(rule)).toBe(limit)
            }
        )
    })

    describe('sanitizeString', () => {
        test('return sanitized string', () => {
            const sanitizer = helpers.sanitizeString(`<script></script>test`)
            expect(sanitizer).toBe('test')
        })
    })

    describe('textLimitValidator', () => {
        const values = [
            {value: {test: 'tests'}, limit: 5},
            {value: 'tests', limit: 5},
        ]
        test.each(values) (
            'expect return true when value (object || string) is over limit %o',
            ({value, limit}) => {
                expect(helpers.textLimitValidator(value, limit)).toBe(true)
            }
        )
    })

    describe('getCurrentTypeSet', () => {
        const value = [
            {value: EVENT_TYPE.GENERAL, topic: 'turku:topic_content'},
            {value: EVENT_TYPE.HOBBIES, topic: 'turku:hobbytopics'},
            {value: EVENT_TYPE.COURSE, topic: 'turku:coursetopics'},
        ]
        test.each(value) (
            'return correct string for keywordset based on event type %o',
            ({value, topic}) => {
                expect(helpers.getCurrentTypeSet(value)).toBe(topic)
            }
        )
    })

    describe('emptyField', () => {
        const empty = [
            {value: {array: [{test: 0}]}, field: 'array', expected: {array: []}},
            {value: {obj: {fi: 'test'}}, field: 'obj', expected: {obj: {}}},
            {value: {string: 'General'}, field: 'string', expected: {string: ''}},
            {value: {number: 5}, field: 'number', expected: {number: ''}},
        ]
        test.each(empty) (
            'set a property of an object (%o) to empty value',
            ({value, field, expected}) => {
                const empty = helpers.emptyField(value, field)
                expect(empty).toEqual(expected)
            })
    })

    describe('nullifyMultiLanguageValues', () => {
        test.each([
            'fi', 'sv', 'en',
        ])('nullifies %s values that are empty strings', (keyToNullify) => {
            // values that contain empty strings as values for a specific lang key.
            const baseValues = createMultiLangValues(CONTENT_LANGUAGES, {lang: keyToNullify, value: '', keys:['name','price']});
            // expected values that contain null instead of the previous empty strings.
            const expectedValues = createMultiLangValues(CONTENT_LANGUAGES, {lang: keyToNullify, value: null, keys:['name','price']});
            const returnValues = helpers.nullifyMultiLanguageValues(baseValues, CONTENT_LANGUAGES);
            expect(returnValues).toEqual(expectedValues);
        })
    })

    describe('scrollToTop', () => {
        test('scroll to top of the page', () => {
            window.scrollTo = jest.fn();
            helpers.scrollToTop()
            expect(window.scrollTo).toBeCalledWith(0,0)
        })
    })

    describe('checkMultiLanguageFieldValues', () => {
        test.each([
            'fi', 'sv', 'en',
        ])('returns true if any %s key has a truthy value', (lang) => {
            const values = createMultiLangValues(CONTENT_LANGUAGES);
            expect(helpers.checkMultiLanguageFieldValues(values, CONTENT_LANGUAGES, lang)).toBe(true);
        });

        test.each([
            'fi', 'sv', 'en',
        ])('returns false if no %s key has a truthy value', (lang) => {
            const keysToNull = ['name','short_description','description','price','info_url','offer_description', 'video_alt_text', 'video_name'];
            const values = createMultiLangValues(CONTENT_LANGUAGES, {lang: lang, value: null, keys: keysToNull});
            expect(helpers.checkMultiLanguageFieldValues(values, CONTENT_LANGUAGES, lang)).toBe(false);
        });
    })

    describe('deleteUnselectedLangKeys', () => {
        test.each([
            'fi','sv','en',
        ])('deletes all %s keys but others remain unchanged', (lang) => {
            const baseValues = createMultiLangValues(CONTENT_LANGUAGES);
            // manually deleted all the same keys that should be deleted by deleteUnselectedLangKeys.
            const expectedValues = createMultiLangValues(CONTENT_LANGUAGES);
            delete expectedValues.name[lang];
            delete expectedValues.short_description[lang];
            delete expectedValues.description[lang];
            delete expectedValues.offers[0].price[lang];
            delete expectedValues.offers[0].info_url[lang];
            delete expectedValues.offers[0].description[lang];
            delete expectedValues.videos[0].alt_text[lang];
            delete expectedValues.videos[0].name[lang];
            const returnValues = helpers.deleteUnselectedLangKeys(baseValues,[lang]);
            expect(returnValues).toEqual(expectedValues);
        })
    })

    describe('getFirstMultiLanguageFieldValue', () => {
        test('returns first defined value based on keys from contentLanguages array', () => {
            const specificLanguages = ['sv']
            const field = createMultiLangValues(CONTENT_LANGUAGES)
            const deletedValues = helpers.getFirstMultiLanguageFieldValue(field.name, specificLanguages)
            expect(deletedValues).toBe('sv-name')
        })
        test('returns empty string if no defined value with a key from contentLanguages was found', () => {
            const specificLanguages = ['fr']
            const field = createMultiLangValues(CONTENT_LANGUAGES)
            const deletedValues = helpers.getFirstMultiLanguageFieldValue(field.name, specificLanguages)
            expect(deletedValues).toBe('')
        })

        test('returns first defined name value when no contentLanguages parameter', () => {
            const field = createMultiLangValues(CONTENT_LANGUAGES)
            const deletedValues = helpers.getFirstMultiLanguageFieldValue(field.name)
            expect(deletedValues).toBe('fi-name')
        })
    })

    describe('getBadge', () => {
        const badges = [
            'series',
            'umbrella',
            'event',
            'courses',
            'hobby',
            'draft',
            'cancelled',
        ]
        test.each(badges) (
            'returns correct labels for type: %s',
            (type) => {
                const badge = helpers.getBadge(type)
                const wrap = shallow(<div>{badge}</div>);
                const badgeElement = wrap.find(Badge)
                expect(badgeElement.prop('className')).toBe(`${type} `)
                expect(badgeElement.prop('pill')).toBe(true)
                expect(badgeElement.prop('variant')).toBe(type)
            })
    })

    describe('getDate', () => {
        test('format date correctly', () => {
            const today = Date.now();
            expect(helpers.getDate(today)).toBe(moment(today).format('D.M.YYYY'))
        })
    })

    describe('getDateTime', () => {
        test('format date & time correctly', () => {
            const today = Date.now();
            expect(helpers.getDateTime(today)).toBe(moment(today).format('D.M.YYYY HH:mm'))
        })
    })

    describe('getButtonLabel', () => {
        const labels = [
            {action: 'something', booleans: [], expected: 'something-events'},
            {action: 'return', booleans: [], expected: 'return-without-saving'},
            {action: 'copy', booleans: [], expected: 'copy-event-to-draft'},
            {action: 'update', booleans: [true, true, false, false], expected: 'event-action-save-draft-existing'},
            {action: 'update', booleans: [true, false, false, false], expected: 'event-action-save-draft-new'},
            {action: 'update', booleans: [false, true, true, false], expected: 'event-action-save-existing'},
            {action: 'update', booleans: [false, true, false, false], expected: 'event-action-save-new'},
            {action: 'update', booleans: [false, false, false, true], expected: 'event-action-save-multiple'},
        ]
        test.each(labels) (
            'returns correct label for obj %o',
            ({action, booleans, expected}) => {
                const correctLabel = helpers.getButtonLabel(action, ...booleans)
                expect(correctLabel).toEqual(expected)
            })
    })

    describe('getContent', () => {
        const langsAndTypes = [
            {language: 'fi', type: 'help'},
            {language: 'en', type: 'help'},
            {language: 'sv', type: 'help'},
            {language: 'fi', type: 'terms'},
            {language: 'en', type: 'terms'},
            {language: 'sv', type: 'terms'},
            {language: 'fi', type: 'tips'},
            {language: 'en', type: 'tips'},
            {language: 'sv', type: 'tips'},
        ]
        test.each(langsAndTypes) (
            'returns correct md-file for obj %o',
            ({language, type}) => {
                const correctContent = helpers.getContent(language, type)
                expect(correctContent).toBe(require(`@city-assets/md/${type}-content.${language}.md`))
            })
    })
})
