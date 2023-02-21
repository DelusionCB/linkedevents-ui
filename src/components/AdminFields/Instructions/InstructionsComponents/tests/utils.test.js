import {mockSideFields} from '../../../../../../__mocks__/mockData'
import {FIELD_TYPES, CONTENT_CATEGORIES} from '../../../utils/constants'
import {
    filterSideFieldByType,
    getFieldValidation,
    getSideFieldIdByTypeId,
    getSideFieldsByContentType,
    getValidationInitValues,
    hasAnyValidationErrors,
} from '../utils'

describe('Admin instruction utils', () => {
    describe('getFieldValidation', () => {
        test('returns correct obj when field has over max chars', () => {
            const fieldValue = '1234567890'
            const maxCharacters = 9
            const expected = {
                error: true,
                errorMaxChars: true,
                errorMsg: 'validation-stringLimitReached',
            }
            expect(getFieldValidation(fieldValue, maxCharacters)).toStrictEqual(expected)
        })

        test('returns correct obj when field is required and value is missing', () => {
            const fieldValue = ''
            const maxCharacters = 9
            const expected = {error: true, errorMsg: 'validation-required'}
            expect(getFieldValidation(fieldValue, maxCharacters, true)).toStrictEqual(expected)
        })

        test('returns correct obj when field is not required and value is missing', () => {
            const fieldValue = ''
            const maxCharacters = 9
            const expected = {error: false, errorMsg: ''}
            expect(getFieldValidation(fieldValue, maxCharacters, false)).toStrictEqual(expected)
        })

        test('returns correct obj when field has no issues', () => {
            const fieldValue = '123'
            const maxCharacters = 9
            const expected = {error: false, errorMsg: ''}
            expect(getFieldValidation(fieldValue, maxCharacters, true)).toStrictEqual(expected)
        })
    })

    describe('hasAnyValidationErrors', () => {
        test('returns true when validations contain errors', () => {
            const validations = {fi: {error: false}, en: {error: true}, sv: {error: false}}
            expect(hasAnyValidationErrors(validations)).toBe(true)
        })

        test('returns false when validations dont contain errors', () => {
            const validations = {fi: {error: false}, en: {error: false}, sv: {error: false}}
            expect(hasAnyValidationErrors(validations)).toBe(false)
        })
    })

    describe('getValidationInitValues', () => {
        test('returns correct obj for btn field type', () => {
            const fieldsToEdit = {
                fi: 'abc',
                en: 'abc',
                sv: 'a'.repeat(FIELD_TYPES.MOBILE_BUTTON.maxCharacters + 1),
            }
            const fieldType = FIELD_TYPES.MOBILE_BUTTON
            const expected = {
                fi: {error: false, errorMsg: ''},
                en: {error: false, errorMsg: ''},
                sv: {
                    error: true,
                    errorMaxChars: true,
                    errorMsg: 'validation-stringLimitReached',
                },
            }
            expect(getValidationInitValues(fieldsToEdit, fieldType)).toStrictEqual(expected)
        })

        test('returns correct obj for instruction text field type', () => {
            const fieldsToEdit = {
                fi: 'abc',
                en: 'abc',
                sv: '',
            }
            const fieldType = FIELD_TYPES.INSTRUCTION_TEXT
            const expected = {
                fi: {error: false, errorMsg: ''},
                en: {error: false, errorMsg: ''},
                sv: {
                    error: true,
                    errorMsg: 'validation-required',
                },
            }
            expect(getValidationInitValues(fieldsToEdit, fieldType)).toStrictEqual(expected)
        })
    })

    describe('filterSideFieldByType', () => {
        test('returns correct fields obj when field type is mobile btn', () => {
            const fieldType = FIELD_TYPES.MOBILE_BUTTON
            const contentType = CONTENT_CATEGORIES.GENERAL.typeId
            const sideFields = mockSideFields
            const expected = {
                category_mobile: {
                    fi: 'category_mobile_fi',
                    sv: 'category_mobile_sv',
                    en: 'category_mobile_en',
                },
                umbrella_mobile: {
                    fi: 'umbrella_mobile_fi',
                    sv: 'umbrella_mobile_sv',
                    en: 'umbrella_mobile_en',
                },
                offers_mobile: {
                    fi: 'offers_mobile_fi',
                    sv: 'offers_mobile_sv',
                    en: 'offers_mobile_en',
                },
                times_mobile: {
                    fi: 'times_mobile_fi',
                    sv: 'times_mobile_sv',
                    en: 'times_mobile_en',
                },
                keyword_mobile: {
                    fi: 'keyword_mobile_fi',
                    sv: 'keyword_mobile_sv',
                    en: 'keyword_mobile_en',
                },
                location_mobile: {
                    fi: 'location_mobile_fi',
                    sv: 'location_mobile_sv',
                    en: 'location_mobile_en',
                },
            }
            expect(filterSideFieldByType(fieldType, contentType, sideFields)).toStrictEqual(expected)
        })

        test('returns correct fields obj when field type is instruction text', () => {
            const fieldType = FIELD_TYPES.INSTRUCTION_TEXT
            const contentType = CONTENT_CATEGORIES.GENERAL.typeId
            const sideFields = mockSideFields
            const expected = {
                times_sidefield: {
                    fi: 'times_sidefield_fi',
                    sv: 'times_sidefield_sv',
                    en: 'times_sidefield_en',
                },
                keyword_sidefield: {
                    fi: 'keyword_sidefield_fi',
                    sv: 'keyword_sidefield_sv',
                    en: 'keyword_sidefield_en',
                },
                offers_sidefield: {
                    fi: 'offers_sidefield_fi',
                    sv: 'offers_sidefield_sv',
                    en: 'offers_sidefield_en',
                },
                location_sidefield: {
                    fi: 'location_sidefield_fi',
                    sv: 'location_sidefield_sv',
                    en: 'location_sidefield_en',
                },
                category_sidefield: {
                    fi: 'category_sidefield_fi',
                    sv: 'category_sidefield_sv',
                    en: 'category_sidefield_en',
                },
                umbrella_sidefield: {
                    fi: 'umbrella_sidefield_fi',
                    sv: 'umbrella_sidefield_sv',
                    en: 'umbrella_sidefield_en',
                },
            }
            expect(filterSideFieldByType(fieldType, contentType, sideFields)).toStrictEqual(expected)
        })
    })

    describe('getSideFieldsByContentType', () => {
        test('returns correct sidefields by content type', () => {
            const contentType = CONTENT_CATEGORIES.GENERAL.typeId
            const sideFields = [
                {
                    type_id: CONTENT_CATEGORIES.GENERAL.typeId,
                    sidefieldset_name: CONTENT_CATEGORIES.GENERAL.typeId,
                    category_mobile: {
                        fi: 'general_category_mobile_fi',
                        sv: 'general_category_mobile_sv',
                        en: 'general_category_mobile_en',
                    },
                },
                {
                    type_id: CONTENT_CATEGORIES.COURSES.typeId,
                    sidefieldset_name: CONTENT_CATEGORIES.COURSES.typeId,
                    category_mobile: {
                        fi: 'courses_category_mobile_fi',
                        sv: 'courses_category_mobile_sv',
                        en: 'courses_category_mobile_en',
                    },
                },
            ]
            expect(getSideFieldsByContentType(contentType, sideFields)).toStrictEqual(sideFields[0])
        })
    })

    describe('getSideFieldIdByTypeId', () => {
        test('returns correct id string when a sidefield contains given id', () => {
            const sideFields = [
                {
                    type_id: CONTENT_CATEGORIES.GENERAL.typeId,
                    id: 'general-id',
                    sidefieldset_name: CONTENT_CATEGORIES.GENERAL.typeId,
                    category_mobile: {
                        fi: 'general_category_mobile_fi',
                        sv: 'general_category_mobile_sv',
                        en: 'general_category_mobile_en',
                    },
                },
                {
                    type_id: CONTENT_CATEGORIES.COURSES.typeId,
                    id: 'courses-id',
                    sidefieldset_name: CONTENT_CATEGORIES.COURSES.typeId,
                    category_mobile: {
                        fi: 'courses_category_mobile_fi',
                        sv: 'courses_category_mobile_sv',
                        en: 'courses_category_mobile_en',
                    },
                },
            ]
            const typeId = CONTENT_CATEGORIES.GENERAL.typeId
            expect(getSideFieldIdByTypeId(sideFields, typeId)).toBe('general-id')
        })

        test('returns undefined when no sidefield has the given type id', () => {
            const sideFields = [
                {
                    type_id: CONTENT_CATEGORIES.GENERAL.typeId,
                    id: 'general-id',
                    sidefieldset_name: CONTENT_CATEGORIES.GENERAL.typeId,
                    category_mobile: {
                        fi: 'general_category_mobile_fi',
                        sv: 'general_category_mobile_sv',
                        en: 'general_category_mobile_en',
                    },
                },
                {
                    type_id: CONTENT_CATEGORIES.COURSES.typeId,
                    id: 'courses-id',
                    sidefieldset_name: CONTENT_CATEGORIES.COURSES.typeId,
                    category_mobile: {
                        fi: 'courses_category_mobile_fi',
                        sv: 'courses_category_mobile_sv',
                        en: 'courses_category_mobile_en',
                    },
                },
            ]
            const typeId = CONTENT_CATEGORIES.HOBBIES.typeId
            expect(getSideFieldIdByTypeId(sideFields, typeId)).toBe(undefined)
        })
    })
})
