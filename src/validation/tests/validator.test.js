import React from 'react';
import * as validator from '../validator';
import {mockUserEvents} from '../../../__mocks__/mockData';
import CONSTANTS from '../../constants';
import {draftValidations, publicValidations} from '../validator';

const draftEvent = mockUserEvents[2]

const {
    VALIDATION_RULES,
    PUBLICATION_STATUS,
} = CONSTANTS

function generateSubs(count = 0) {
    const sub_events = [];
    for(let i = 0; i < count; i++) {
        sub_events.push({test: `random value ${i}`});
    }
    return {
        sub_events,
    }
}

function generateText(length){
    let text = '';
    const characters = 'DOGSANDCATSWELIKETHEMMATSDELUSIONCBCODINGLIKEmats0123456789';

    for (let i = 0; i < length; i++)
        text += characters.charAt(Math.floor(Math.random() * characters.length));
    return text;
}

describe('do validations for values', () => {

    describe('key validator functions', () => {

        describe('validateLocation', () => {
            test('returns error', () => {
                const validationResult = validator.validateLocation(draftEvent, validator.draftValidations.location)
                expect(validationResult).toEqual(['requiredAtId'])
            })
            test('does not return error', () => {
                draftEvent.location = {'@id': 'https://testlocation.location'}
                const validationResult = validator.validateLocation(draftEvent, validator.draftValidations.location)
                expect(validationResult).toEqual([])
            })
        })

        describe('validateTimes', () => {
            describe('start_time', () => {
                const testValuesStart = [
                    // Is normal event without times & draft
                    {
                        event: {start_time: '', end_time: ''},
                        validate: draftValidations.start_time,
                        status: PUBLICATION_STATUS.DRAFT,
                        expected: [],
                    },
                    // Is normal event without times & public
                    {
                        event: {start_time: '', end_time: ''},
                        validate: publicValidations.start_time,
                        status: PUBLICATION_STATUS.PUBLIC,
                        expected: [VALIDATION_RULES.REQUIRED_STRING],
                    },
                    // Is normal event with incorrect times & public
                    {
                        event: {start_time: 'th534y45', end_time: 'trhh455y'},
                        validate: publicValidations.start_time,
                        status: PUBLICATION_STATUS.PUBLIC,
                        expected: [
                            VALIDATION_RULES.IS_DATE,
                        ],
                    },
                    // Is super event umbrella without times & draft
                    {
                        event: {start_time: '', end_time: '', super_event_type: CONSTANTS.SUPER_EVENT_TYPE_UMBRELLA},
                        validate: draftValidations.start_time,
                        status: PUBLICATION_STATUS.DRAFT,
                        expected: [],
                    },
                    // Is super event umbrella without times & public
                    {
                        event: {start_time: '', end_time: '', super_event_type: CONSTANTS.SUPER_EVENT_TYPE_UMBRELLA},
                        validate: publicValidations.start_time,
                        status: PUBLICATION_STATUS.PUBLIC,
                        expected: [VALIDATION_RULES.REQUIRED_STRING],
                    },
                    // Is super event umbrella with times & public
                    {
                        event: {
                            start_time: '2024-02-02T12:00:00Z',
                            end_time: '2024-02-02T13:00:00Z',
                            super_event_type: CONSTANTS.SUPER_EVENT_TYPE_UMBRELLA,
                        },
                        validate: publicValidations.start_time,
                        status: PUBLICATION_STATUS.PUBLIC,
                        expected: [],
                    },
                    // Is super event umbrella with times & draft
                    {
                        event: {
                            start_time: '2024-02-02T12:00:00Z',
                            end_time: '2024-02-02T13:00:00Z',
                            super_event_type: CONSTANTS.SUPER_EVENT_TYPE_UMBRELLA,
                        },
                        validate: publicValidations.start_time,
                        status: PUBLICATION_STATUS.PUBLIC,
                        expected: [],
                    },
                    // Is child of series without times & draft
                    {
                        event: {
                            start_time: '',
                            end_time: '',
                            sub_event_type: CONSTANTS.SUB_EVENT_TYPE_RECURRING,
                            super_event: {'@id': 'https://testEvent.event'},
                        },
                        validate: draftValidations.start_time,
                        status: PUBLICATION_STATUS.DRAFT,
                        expected: [],
                    },
                    // Is child of series without times & public
                    {
                        event: {
                            start_time: '',
                            end_time: '',
                            sub_event_type: CONSTANTS.SUB_EVENT_TYPE_RECURRING,
                            super_event: {'@id': 'https://testEvent.event'},
                        },
                        validate: draftValidations.start_time,
                        status: PUBLICATION_STATUS.DRAFT,
                        expected: [],
                    },
                    // Is child of series with incorrect times & draft
                    {
                        event: {
                            start_time: '2024-02-02T13:00:00Z',
                            end_time: '2024-02-02T12:00:00Z',
                            sub_event_type: CONSTANTS.SUB_EVENT_TYPE_RECURRING,
                            super_event: {'@id': 'https://testEvent.event'},
                        },
                        validate: publicValidations.start_time,
                        status: PUBLICATION_STATUS.PUBLIC,
                        expected: [],
                    },
                    // Is child of series with times & public
                    {
                        event: {
                            start_time: '2024-02-02T12:00:00Z',
                            end_time: '2024-02-02T13:00:00Z',
                            sub_event_type: CONSTANTS.SUB_EVENT_TYPE_RECURRING,
                            super_event: {'@id': 'https://testEvent.event'},
                        },
                        validate: publicValidations.start_time,
                        status: PUBLICATION_STATUS.PUBLIC,
                        expected: [],
                    },
                    // Has sub_events
                    {
                        event: {
                            start_time: '',
                            end_time: '',
                            sub_events: {
                                0: {},
                                1: {},
                            },
                        },
                        validate: publicValidations.start_time,
                        status: PUBLICATION_STATUS.PUBLIC,
                        expected: [],
                    },
                    // Is child of umbrella without times & draft
                    {
                        event: {start_time: '', end_time: ''},
                        validate: draftValidations.start_time,
                        status: PUBLICATION_STATUS,
                        expected: [],
                    },
                    // Is child of umbrella without times & public
                    {
                        event: {start_time: '', end_time: ''},
                        validate: publicValidations.start_time,
                        status: PUBLICATION_STATUS,
                        expected: [],
                    },
                    // Is child of umbrella with times & draft
                    {
                        event: {start_time: '2024-02-02T11:00:00Z', end_time: '2024-02-02T12:00:00Z'},
                        validate: draftValidations.start_time,
                        status: PUBLICATION_STATUS,
                        expected: [],
                    },
                    // Is child of umbrella with times & public
                    {
                        event: {start_time: '2024-02-02T12:00:00Z', end_time: '2024-02-02T14:00:00Z'},
                        validate: publicValidations.start_time,
                        status: PUBLICATION_STATUS,
                        expected: [],
                    },
                ]
                test.each(testValuesStart)(
                    '%o',
                    ({event, validate, status, expected}) => {
                        const validationResult = validator.validateTimes(event, validate, status, 'start_time')
                        expect(validationResult).toEqual(expected)
                    })

                describe('end_time', () => {
                    const testValuesEnd = [
                        // Is normal event without times & draft
                        {
                            event: {start_time: '', end_time: ''},
                            validate: draftValidations,
                            status: PUBLICATION_STATUS.DRAFT,
                            expected: [],
                        },
                        // Is normal event without times & public
                        {
                            event: {start_time: '', end_time: ''},
                            validate: publicValidations,
                            status: PUBLICATION_STATUS.PUBLIC,
                            expected: [VALIDATION_RULES.REQUIRED_STRING],
                        },
                        // Is normal event with incorrect times & public
                        {
                            event: {start_time: 'th534y45', end_time: 'trhh455y'},
                            validate: publicValidations,
                            status: PUBLICATION_STATUS.PUBLIC,
                            expected: [
                                VALIDATION_RULES.AFTER_START_TIME,
                                VALIDATION_RULES.IS_DATE,
                                VALIDATION_RULES.IN_THE_FUTURE],
                        },
                        // Is super event umbrella without times & draft
                        {
                            event: {start_time: '', end_time: '', super_event_type: CONSTANTS.SUPER_EVENT_TYPE_UMBRELLA},
                            validate: draftValidations,
                            status: PUBLICATION_STATUS.DRAFT,
                            expected: [],
                        },
                        // Is super event umbrella without times & public
                        {
                            event: {start_time: '', end_time: '', super_event_type: CONSTANTS.SUPER_EVENT_TYPE_UMBRELLA},
                            validate: publicValidations,
                            status: PUBLICATION_STATUS.PUBLIC,
                            expected: [VALIDATION_RULES.REQUIRED_STRING],
                        },
                        // Is super event umbrella with times & public
                        {
                            event: {
                                start_time: '2024-02-02T12:00:00Z',
                                end_time: '2024-02-02T13:00:00Z',
                                super_event_type: CONSTANTS.SUPER_EVENT_TYPE_UMBRELLA,
                            },
                            validate: publicValidations,
                            status: PUBLICATION_STATUS.PUBLIC,
                            expected: [],
                        },
                        // Is super event umbrella with times & draft
                        {
                            event: {
                                start_time: '2024-02-02T12:00:00Z',
                                end_time: '2024-02-02T13:00:00Z',
                                super_event_type: CONSTANTS.SUPER_EVENT_TYPE_UMBRELLA,
                            },
                            validate: publicValidations,
                            status: PUBLICATION_STATUS.PUBLIC,
                            expected: [],
                        },
                        // Is child of series without times & draft
                        {
                            event: {
                                start_time: '',
                                end_time: '',
                                sub_event_type: CONSTANTS.SUB_EVENT_TYPE_RECURRING,
                                super_event: {'@id': 'https://testEvent.event'},
                            },
                            validate: draftValidations,
                            status: PUBLICATION_STATUS.DRAFT,
                            expected: [],
                        },
                        // Is child of series without times & public
                        {
                            event: {
                                start_time: '',
                                end_time: '',
                                sub_event_type: CONSTANTS.SUB_EVENT_TYPE_RECURRING,
                                super_event: {'@id': 'https://testEvent.event'},
                            },
                            validate: draftValidations,
                            status: PUBLICATION_STATUS.DRAFT,
                            expected: [],
                        },
                        // Is child of series with incorrect times & draft
                        {
                            event: {
                                start_time: '2024-02-02T13:00:00Z',
                                end_time: '2024-02-02T12:00:00Z',
                                sub_event_type: CONSTANTS.SUB_EVENT_TYPE_RECURRING,
                                super_event: {'@id': 'https://testEvent.event'},
                            },
                            validate: publicValidations,
                            status: PUBLICATION_STATUS.PUBLIC,
                            expected: [VALIDATION_RULES.AFTER_START_TIME],
                        },
                        // Is child of series with times & public
                        {
                            event: {
                                start_time: '2024-02-02T12:00:00Z',
                                end_time: '2024-02-02T13:00:00Z',
                                sub_event_type: CONSTANTS.SUB_EVENT_TYPE_RECURRING,
                                super_event: {'@id': 'https://testEvent.event'},
                            },
                            validate: publicValidations,
                            status: PUBLICATION_STATUS.PUBLIC,
                            expected: [],
                        },
                        // Has sub_events
                        {
                            event: {
                                start_time: '',
                                end_time: '',
                                sub_events: {
                                    0: {},
                                    1: {},
                                },
                            },
                            validate: publicValidations,
                            status: PUBLICATION_STATUS.PUBLIC,
                            expected: [],
                        },
                        // Is child of umbrella without times & draft
                        {
                            event: {start_time: '', end_time: ''},
                            validate: draftValidations,
                            status: PUBLICATION_STATUS,
                            expected: [],
                        },
                        // Is child of umbrella without times & public
                        {
                            event: {start_time: '', end_time: ''},
                            validate: publicValidations,
                            status: PUBLICATION_STATUS,
                            expected: [],
                        },
                        // Is child of umbrella with times & draft
                        {
                            event: {start_time: '2024-02-02T11:00:00Z', end_time: '2024-02-02T12:00:00Z'},
                            validate: draftValidations,
                            status: PUBLICATION_STATUS,
                            expected: [],
                        },
                        // Is child of umbrella with times & public
                        {
                            event: {start_time: '2024-02-02T12:00:00Z', end_time: '2024-02-02T14:00:00Z'},
                            validate: publicValidations,
                            status: PUBLICATION_STATUS,
                            expected: [],
                        },
                    ]
                    test.each(testValuesEnd)(
                        '%o',
                        ({event, validate, status, expected}) => {
                            const validationResult = validator.validateTimes(event, validate.end_time, status, 'end_time')
                            expect(validationResult).toEqual(expected)
                        })
                })
            })
        })

        describe('validateVirtualURL', () => {
            test('does not return error', () => {
                const values = {is_virtualevent: true, virtualevent_url: 'https://testevent.event'}
                const validationResult = validator.validateVirtualURL(values, publicValidations.virtualevent_url)
                expect(validationResult).toEqual([])
            })
            test('return error', () => {
                const values = {is_virtualevent: true, virtualevent_url: '264wtwsetgsdgsd'}
                const validationResult = validator.validateVirtualURL(values, publicValidations.virtualevent_url)
                expect(validationResult).toEqual([VALIDATION_RULES.IS_URL])
            })
        })

        describe('validateSubEventCount', () => {
            test('returns no errors', () => {
                const validationResult = validator.validateSubEventCount(generateSubs(30), publicValidations.sub_length)
                expect(validationResult).toEqual([])
            })
            test('returns error isMoreThanTwo', () => {
                const validationResult = validator.validateSubEventCount(generateSubs(1), publicValidations.sub_length)
                expect(validationResult).toEqual([VALIDATION_RULES.IS_MORE_THAN_TWO])
            })
            test('returns error isMoreThanSixtyFive', () => {
                const validationResult = validator.validateSubEventCount(generateSubs(67), publicValidations.sub_length)
                expect(validationResult).toEqual([VALIDATION_RULES.IS_MORE_THAN_SIXTYFIVE])
            })
        })

        describe('validateMulti', () => {
            const testMultiValues = [
                // Name with values
                {
                    values: {name: {fi: 'test', en: 'test'}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.name,
                    key: 'name',
                    expected: {},
                },
                // Name with missing language values
                {
                    values: {name: {fi: 'test'}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.name,
                    key: 'name',
                    expected: {en: [VALIDATION_RULES.REQUIRED_MULTI]},
                },
                // Name with missing values completely
                {
                    values: {name: {}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.name,
                    key: 'name',
                    expected: {fi: [VALIDATION_RULES.REQUIRED_MULTI], en: [VALIDATION_RULES.REQUIRED_MULTI]},
                },
                // Name does not exist
                {
                    values: {_contentLanguages: ['fi', 'en']},
                    validate: publicValidations.name,
                    key: 'name',
                    expected: {fi: [VALIDATION_RULES.REQUIRED_MULTI], en: [VALIDATION_RULES.REQUIRED_MULTI]},
                },
                // Name has too long string
                {
                    values: {
                        name: {fi: generateText(250), en: generateText(250)},
                        _contentLanguages: ['fi', 'en'],
                    },
                    validate: publicValidations.name,
                    key: 'name',
                    expected: {fi: [VALIDATION_RULES.SHORT_STRING], en: [VALIDATION_RULES.SHORT_STRING]},
                },
                // Short description with values
                {
                    values: {short_description: {fi: 'test', en: 'test'}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.short_description,
                    key: 'short_description',
                    expected: {},
                },
                // Short description with missing language values
                {
                    values: {short_description: {fi: 'test'}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.short_description,
                    key: 'short_description',
                    expected: {en: [VALIDATION_RULES.REQUIRED_MULTI]},
                },
                // Short description with missing values completely
                {
                    values: {short_description: {}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.short_description,
                    key: 'short_description',
                    expected: {fi: [VALIDATION_RULES.REQUIRED_MULTI], en: [VALIDATION_RULES.REQUIRED_MULTI]},
                },
                // Short description does not exist
                {
                    values: {_contentLanguages: ['fi', 'en']},
                    validate: publicValidations.short_description,
                    key: 'short_description',
                    expected: {fi: [VALIDATION_RULES.REQUIRED_MULTI], en: [VALIDATION_RULES.REQUIRED_MULTI]},
                },
                // Short description has too long string
                {
                    values: {
                        short_description: {fi: generateText(550), en: generateText(550)},
                        _contentLanguages: ['fi', 'en'],
                    },
                    validate: publicValidations.short_description,
                    key: 'short_description',
                    expected: {fi: [VALIDATION_RULES.SHORT_STRING], en: [VALIDATION_RULES.SHORT_STRING]},
                },
                // Description with values
                {
                    values: {description: {fi: 'test', en: 'test'}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.description,
                    key: 'description',
                    expected: {},
                },
                // Description with missing language values
                {
                    values: {description: {fi: 'test'}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.description,
                    key: 'description',
                    expected: {},
                },
                // Description with missing values completely
                {
                    values: {description: {}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.description,
                    key: 'description',
                    expected: {},
                },
                // Description does not exist
                {
                    values: {_contentLanguages: ['fi', 'en']},
                    validate: publicValidations.description,
                    key: 'description',
                    expected: {},
                },
                // Description is too long
                {
                    values: {description: {en: generateText(5050)}, _contentLanguages: ['en']},
                    validate: publicValidations.description,
                    key: 'description',
                    expected: {en: [VALIDATION_RULES.LONG_STRING]},
                },
                // Info url with values
                {
                    values: {info_url: {fi: 'test', en: 'test'}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.info_url,
                    key: 'info_url',
                    expected: {en: [VALIDATION_RULES.IS_URL], fi: [VALIDATION_RULES.IS_URL]},
                },
                // Info url with missing language values
                {
                    values: {info_url: {fi: 'https://testEvent.event'}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.info_url,
                    key: 'info_url',
                    expected: {},
                },
                // Info url with missing values completely
                {
                    values: {info_url: {}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.info_url,
                    key: 'info_url',
                    expected: {},
                },
                // Info url does not exist
                {
                    values: {_contentLanguages: ['fi', 'en']},
                    validate: publicValidations.info_url,
                    key: 'info_url',
                    expected: {},
                },
                // Provider with values
                {
                    values: {provider: {fi: 'test', en: 'test'}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.provider,
                    key: 'provider',
                    expected: {},
                },
                // Provider with missing language values
                {
                    values: {provider: {fi: 'test'}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.provider,
                    key: 'provider',
                    expected: {},
                },
                // Provider with missing values completely
                {
                    values: {provider: {}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.provider,
                    key: 'provider',
                    expected: {},
                },
                // Provider does not exist
                {
                    values: {_contentLanguages: ['fi', 'en']},
                    validate: publicValidations.provider,
                    key: 'provider',
                    expected: {},
                },
                // Provider is too long
                {
                    values: {
                        provider: {en: generateText(5050), fi: generateText(100)},
                        _contentLanguages: ['fi', 'en'],
                    },
                    validate: publicValidations.provider,
                    key: 'provider',
                    expected: {en: [VALIDATION_RULES.SHORT_STRING]},
                },
                // Location extra info with values
                {
                    values: {location_extra_info: {fi: 'test', en: 'test'}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.location_extra_info,
                    key: 'location_extra_info',
                    expected: {},
                },
                // Location extra info with missing language values
                {
                    values: {location_extra_info: {fi: 'test'}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.location_extra_info,
                    key: 'location_extra_info',
                    expected: {},
                },
                // Location extra info with missing values completely
                {
                    values: {location_extra_info: {}, _contentLanguages: ['fi', 'en']},
                    validate: publicValidations.location_extra_info,
                    key: 'location_extra_info',
                    expected: {},
                },
                // Location extra info does not exist
                {
                    values: {_contentLanguages: ['fi', 'en']},
                    validate: publicValidations.location_extra_info,
                    key: 'location_extra_info',
                    expected: {},
                },
                // Location extra info is too long
                {
                    values: {
                        location_extra_info: {en: generateText(500), fi: generateText(50)},
                        _contentLanguages: ['fi', 'en'],
                    },
                    validate: publicValidations.location_extra_info,
                    key: 'location_extra_info',
                    expected: {en: [VALIDATION_RULES.SHORT_STRING]},
                },
            ]

            test.each(testMultiValues)(
                'objects with correct error returns',
                ({values, validate, key, expected}) => {
                    const validationResult = validator.validateMulti(values, validate, key)
                    expect(validationResult).toEqual(expected)
                })
        })

        describe('validateVideos', () => {
            const testVideoValues = [
                // Empty object for videos
                {
                    values: {_contentLanguages: ['fi', 'en'], videos: [{alt_text: {}, name: {}, url: ''}]},
                    expected: {
                        0: {
                            alt_text: {en: [VALIDATION_RULES.REQUIRED_VIDEO_FIELD], fi: [VALIDATION_RULES.REQUIRED_VIDEO_FIELD]},
                            name: {en: [VALIDATION_RULES.REQUIRED_VIDEO_FIELD], fi: [VALIDATION_RULES.REQUIRED_VIDEO_FIELD]},
                            url: [VALIDATION_RULES.REQUIRED_VIDEO_FIELD],
                        },
                    },
                    validate: publicValidations.videos,
                },
                // Correctly filled object for videos
                {
                    values: {
                        _contentLanguages: ['fi', 'en'],
                        videos: [{
                            alt_text: {fi: 'test', en: 'test'},
                            name: {fi: 'test', en: 'test'},
                            url: 'https://testVideo.video',
                        }],
                    },
                    validate: publicValidations.videos,
                    expected: {},
                },
                // Incorrectly filled video object
                {
                    values: {
                        _contentLanguages: ['fi', 'en'],
                        videos: [{
                            alt_text: {fi: generateText(500), en: ''},
                            name: {fi: generateText(500), en: generateText(500)},
                            url: 'test',
                        }],
                    },
                    validate: publicValidations.videos,
                    expected: {
                        0: {
                            alt_text: {en: [VALIDATION_RULES.REQUIRED_VIDEO_FIELD], fi: [VALIDATION_RULES.MEDIUM_STRING]},
                            name: {en: [VALIDATION_RULES.SHORT_STRING], fi: [VALIDATION_RULES.SHORT_STRING]},
                            url: [VALIDATION_RULES.IS_URL],
                        },
                    },
                },
                // Multiple incorrect objects
                {
                    values: {
                        _contentLanguages: ['fi', 'en'],
                        videos: [{
                            alt_text: {fi: generateText(500), en: ''},
                            name: {fi: generateText(500), en: generateText(500)},
                            url: 'test',
                        },
                        {
                            alt_text: {en: generateText(500), fi: ''},
                            name: {fi: '', en: generateText(500)},
                            url: 'test',
                        }],
                    },
                    validate: publicValidations.videos,
                    expected: {
                        0: {
                            alt_text: {en: [VALIDATION_RULES.REQUIRED_VIDEO_FIELD], fi: [VALIDATION_RULES.MEDIUM_STRING]},
                            name: {en: [VALIDATION_RULES.SHORT_STRING], fi: [VALIDATION_RULES.SHORT_STRING]},
                            url: [VALIDATION_RULES.IS_URL],
                        },
                        1: {
                            alt_text: {en: [VALIDATION_RULES.MEDIUM_STRING], fi: [VALIDATION_RULES.REQUIRED_VIDEO_FIELD]},
                            name: {en: [VALIDATION_RULES.SHORT_STRING], fi: [VALIDATION_RULES.REQUIRED_VIDEO_FIELD]},
                            url: [VALIDATION_RULES.IS_URL],
                        },
                    },
                },
            ]

            test.each(testVideoValues)(
                'objects with correct error returns',
                ({values, validate, expected}) => {
                    const validationResult = validator.validateVideos(values, validate)
                    expect(validationResult).toEqual(expected)
                })
        })

        describe('validateOffers', () => {
            const testOfferValues = [
                // Empty object for offers
                {
                    values: [{is_free: false, price: {}, info_url: {}, description: {}}],
                    languages: ['fi', 'en'],
                    expected: {
                        0: {
                            price: {
                                fi: [VALIDATION_RULES.HAS_PRICE, VALIDATION_RULES.HAS_VALID_PRICE],
                                en: [VALIDATION_RULES.HAS_PRICE, VALIDATION_RULES.HAS_VALID_PRICE],
                            },
                        },
                    },
                    validate: publicValidations.offers,
                },
                // Correctly filled object for offers
                {
                    values: [{
                        is_free: false,
                        price: {fi: '5', en: '5'},
                        info_url: {fi: 'https://testOffer.offer'},
                        description: {fi: 'testOffer'},
                    },
                    ],
                    languages: ['fi', 'en'],
                    expected: {},
                    validate: publicValidations.offers,
                },
                // Incorrectly filled object for offers
                {
                    values: [{
                        is_free: false,
                        price: {fi: 'test', en: 'test'},
                        info_url: {fi: 'test'},
                        description: {fi: generateText(6000)},
                    },
                    ],
                    languages: ['fi', 'en'],
                    expected: {
                        0: {
                            price: {fi: [VALIDATION_RULES.HAS_VALID_PRICE], en: [VALIDATION_RULES.HAS_VALID_PRICE]},
                            info_url: {fi: [VALIDATION_RULES.IS_URL]},
                            description: {fi: [VALIDATION_RULES.LONG_STRING]},
                        },
                    },
                    validate: publicValidations.offers,
                },
                // Multiple incorrect offers
                {
                    values: [{
                        is_free: false,
                        price: {fi: 'test', en: 'test'},
                        info_url: {fi: 'test'},
                        description: {fi: generateText(6000)},
                    }, {
                        is_free: false,
                        price: {fi: '-5', en: ''},
                        info_url: {en: 'test'},
                        description: {en: generateText(6000)},
                    },
                    ],
                    languages: ['fi', 'en'],
                    expected: {
                        0: {
                            price: {fi: [VALIDATION_RULES.HAS_VALID_PRICE], en: [VALIDATION_RULES.HAS_VALID_PRICE]},
                            info_url: {fi: [VALIDATION_RULES.IS_URL]},
                            description: {fi: [VALIDATION_RULES.LONG_STRING]},
                        },
                        1: {
                            price: {fi: [VALIDATION_RULES.HAS_VALID_PRICE], en: [VALIDATION_RULES.HAS_PRICE, VALIDATION_RULES.HAS_VALID_PRICE]},
                            info_url: {en: [VALIDATION_RULES.IS_URL]},
                            description: {en: [VALIDATION_RULES.LONG_STRING]},
                        },
                    },
                    validate: publicValidations.offers,
                },
            ]

            test.each(testOfferValues)(
                'objects with correct error returns',
                ({values, languages, validate, expected}) => {
                    const validationResult = validator.validateOffers(values, validate, languages)
                    expect(validationResult).toEqual(expected)
                })
        })

        describe('validateSubEvents', () => {
            const testSubValues = [
                // Empty sub_event object
                {
                    values: {sub_events: {0: {}}},
                    expected: {},
                    validate: publicValidations.sub_events,
                },
                // Object with empty values
                {
                    values: {sub_events: {0: {start_time: '', end_time: ''}},
                    },
                    expected: {
                        0: {start_time: [VALIDATION_RULES.REQUIRED_STRING], end_time: [VALIDATION_RULES.REQUIRED_STRING]},
                    },
                    validate: publicValidations.sub_events,
                },
                // Object with correct values
                {
                    values: {sub_events: {0: {start_time: '2024-02-02T12:00:00Z', end_time: '2024-02-04T14:00:00Z'}},
                    },
                    expected: {},
                    validate: publicValidations.sub_events,
                },
                // Object with incorrect values
                {
                    values: {sub_events: {0: {start_time: '2024-02-02T15:00:00Z', end_time: '2024-02-02T12:00:00Z'}},
                    },
                    expected: {0: {end_time: [VALIDATION_RULES.AFTER_START_TIME]},
                    },
                    validate: publicValidations.sub_events,
                },
                // Object with multiple incorrect objects
                {
                    values: {
                        sub_events: {
                            0: {start_time: '52523', end_time: '532532'},
                            1: {start_time: '532532', end_time: '523523'},
                        },
                    },
                    expected: {
                        0: {
                            start_time: [VALIDATION_RULES.IS_DATE],
                            end_time: [VALIDATION_RULES.AFTER_START_TIME, VALIDATION_RULES.IS_DATE, VALIDATION_RULES.IN_THE_FUTURE],
                        },
                        1: {
                            start_time: [VALIDATION_RULES.IS_DATE],
                            end_time: [VALIDATION_RULES.AFTER_START_TIME, VALIDATION_RULES.IS_DATE, VALIDATION_RULES.IN_THE_FUTURE],
                        },
                    },
                    validate: publicValidations.sub_events,
                },
                // Object with some values as undefined
                {
                    values: {
                        sub_events: {
                            0: {start_time: '2034-02-02T15:00:00Z', end_time: undefined},
                            1: {start_time: undefined, end_time: '2034-02-02T15:00:00Z'},
                        },
                    },
                    expected: {
                        0: {end_time: [VALIDATION_RULES.REQUIRED_STRING]},
                        1: {start_time: [VALIDATION_RULES.REQUIRED_STRING]},
                    },
                    validate: publicValidations.sub_events,
                },
            ]

            test.each(testSubValues)(
                'objects with correct error returns',
                ({values, validate, expected}) => {
                    const validationResult = validator.validateSubEvents(values, validate)
                    expect(validationResult).toEqual(expected)
                })
        })
    })
})
