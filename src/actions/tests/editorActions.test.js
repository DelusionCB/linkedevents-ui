import {
    setData,
    updateSubEvent,
    deleteSubEvent,
    sortSubEvents,
    setEventData,
    setOfferData,
    addOffer,
    clearValue,
    setFreeOffers,
    setLanguages,
    deleteOffer,
    clearData,
    validateFor,
    receivePaymentMethods,
    receiveKeywordSets,
    receiveLanguages,
    prepareFormValues,
    setValidationErrors,
} from '../editor';
import constants from '../../constants.js'
import * as formDataFunctions from '../../utils/formDataMapping';
import moment from 'moment-timezone';
import {merge} from 'lodash';
import {mockUserEvents, mockLanguages, mockPaymentMethods, mockKeywordSets, mockUser, mockImages} from '__mocks__/mockData';
const mockEvent = mockUserEvents[0];

const {
    PUBLICATION_STATUS,
    EDITOR_SETDATA,
    EDITOR_UPDATE_SUB_EVENT,
    EDITOR_DELETE_SUB_EVENT,
    EDITOR_SORT_SUB_EVENTS,
    EDITOR_ADD_OFFER,
    EDITOR_CLEAR_VALUE,
    EDITOR_SET_FREE_OFFERS,
    EDITOR_SETLANGUAGES,
    EDITOR_DELETE_OFFER,
    EDITOR_CLEARDATA,
    EDITOR_RECEIVE_LANGUAGES,
    EDITOR_RECEIVE_KEYWORDSETS,
    EDITOR_RECEIVE_PAYMENTMETHODS,
    VALIDATE_FOR,
    SUPER_EVENT_TYPE_RECURRING,
} = constants;

/**
 * Returns pre-filled formValues with multi-language values according to languages.
 * @param {string[]} languages
 * @returns {*}
 */
function createFormValues(languages) {
    const values = {
        name: {},
        short_description: {},
        description: {},
        offers: [{is_free: false, info_url: {}, price: {}, description: {}}],
        start_time: moment().tz('Europe/Helsinki').add(1, 'days').endOf('day').toISOString(),
        end_time: moment().tz('Europe/Helsinki').add(10, 'days').endOf('day').toISOString(),
        image: mockImages[0],
        type_id: 'General',
        keywords: [{value: mockKeywordSets[0].keywords[0]['@id'], label: mockKeywordSets[0].keywords[0].name.fi, name: mockKeywordSets[0].keywords[0].name}],
        location: {'@id': 'something'},
        sub_events: {
            '0':{
                'start_time': moment().tz('Europe/Helsinki').add(3, 'days').startOf('day').toISOString(),
                'end_time': moment().tz('Europe/Helsinki').add(3, 'days').endOf('day').toISOString(),
            },
            '1':{
                'start_time': moment().tz('Europe/Helsinki').add(4, 'days').startOf('day').toISOString(),
                'end_time': moment().tz('Europe/Helsinki').add(4, 'days').endOf('day').toISOString(),
            },
        },
    };
    languages.forEach((lang) => {
        values.name[lang] = `${lang}-name`
        values.short_description[lang] = `${lang}-short_description`
        values.description[lang] = `${lang}-description`;
        values.offers[0].price[lang] = '10';
        values.offers[0].description[lang] = `${lang}-description`
        values.offers[0].info_url[lang] = `http://${lang}info.domain`
    })
    return values
}

describe('actions/editor', () => {
    describe('setData', () => {
        test('return object with correct type & values', () => {
            const expectedResult = {type: EDITOR_SETDATA, values: mockEvent};
            expect(setData(mockEvent)).toEqual(expectedResult);
        });
    });

    describe('updateSubEvent', () => {
        test('return object with correct type, value, property and eventKey', () => {
            const expectedResult  = {type: EDITOR_UPDATE_SUB_EVENT, value: 'foo', property: 'bar', eventKey: 1}
            expect(updateSubEvent('foo', 'bar', 1)).toEqual(expectedResult);
        });
    });

    describe('deleteSubEvent', () => {
        test('return object with correct type & event', () => {
            const expectedResult  = {type: EDITOR_DELETE_SUB_EVENT, event: mockEvent}
            expect(deleteSubEvent(mockEvent)).toEqual(expectedResult);
        });
    });

    describe('sortSubEvents', () => {
        test('return object with correct type', () => {
            const expectedResult  = {type: EDITOR_SORT_SUB_EVENTS}
            expect(sortSubEvents()).toEqual(expectedResult);
        });
    });

    describe('setEventData', () => {
        test('return object with correct type, key, values & event', () => {
            const expectedResult  = {type: EDITOR_SETDATA, key: 1, values: mockEvent, event: true}
            expect(setEventData(mockEvent, 1)).toEqual(expectedResult);
        });
    });

    describe('setOfferData', () => {
        test('return object with correct type, key, values & offer', () => {
            const expectedResult  = {type: constants.EDITOR_SETDATA, key: 1, values: mockEvent, offer: true}
            expect(setOfferData(mockEvent, 1)).toEqual(expectedResult);
        });
    });

    describe('addOffer', () => {
        test('return object with correct type & values', () => {
            const expectedResult  = {type: EDITOR_ADD_OFFER, values: mockEvent}
            expect(addOffer(mockEvent)).toEqual(expectedResult);
        });
    });

    describe('deleteOffer', () => {
        test('return object with correct type & offerKey', () => {
            const expectedResult  = {type: EDITOR_DELETE_OFFER, offerKey: 1}
            expect(deleteOffer(1)).toEqual(expectedResult);
        });
    });

    describe('clearValue', () => {
        test('return object with correct type & values for clearing', () => {
            const stringValues = 'testvalue'
            const expectedResult  = {type: EDITOR_CLEAR_VALUE, values: stringValues}
            expect(clearValue(stringValues)).toEqual(expectedResult);
        });
    });

    describe('setFreeOffers', () => {
        test('return object with correct type & isFree', () => {
            const expectedResult  = {type: EDITOR_SET_FREE_OFFERS}
            expect(setFreeOffers()).toEqual(expectedResult);
        });
    });

    describe('setLanguages', () => {
        test('return object with correct type & languages', () => {
            const expectedResult  = {type: EDITOR_SETLANGUAGES, languages: mockLanguages}
            expect(setLanguages(mockLanguages)).toEqual(expectedResult);
        });
    });
    describe('clearData', () => {
        test('return object with correct type', () => {
            const expectedResult  = {type: EDITOR_CLEARDATA}
            expect(clearData()).toEqual(expectedResult);
        });
    });
    describe('validateFor', () => {
        let expectedResult = {type: VALIDATE_FOR};
        beforeEach(() => {
            expectedResult = {type: VALIDATE_FOR};
        })
        test('returns correct object when publicationStatus is public', () => {
            expectedResult.validateFor = PUBLICATION_STATUS.PUBLIC;
            expect(validateFor(PUBLICATION_STATUS.PUBLIC)).toEqual(expectedResult);
        });
        test('returns correct object when publicationStatus is draft', () => {
            expectedResult.validateFor = PUBLICATION_STATUS.DRAFT;
            expect(validateFor(PUBLICATION_STATUS.DRAFT)).toEqual(expectedResult);
        });
        test('returns correct object when no publicationStatus', () => {
            expectedResult.validateFor = null;
            expect(validateFor()).toEqual(expectedResult);
        })
    });
    describe('receivePaymentMethods', () => {
        test('returns object with correct values & saves payment methods to localStorage', () => {
            localStorage.clear()
            const paymentMethods = mockPaymentMethods
            const expectedResult  = {type: EDITOR_RECEIVE_PAYMENTMETHODS, paymentMethods}
            expect(receivePaymentMethods(paymentMethods)).toEqual(expectedResult);
            const expectedLocalStorage = JSON.stringify(paymentMethods);
            expect(localStorage.getItem('PAYMENTMETHODS')).toEqual(expectedLocalStorage);
        });
    });
    describe('receiveKeywordSets', () => {
        test('returns object with correct values & saves keywordSets to localStorage', () => {
            localStorage.clear()
            const keywordSets = mockKeywordSets
            const expectedResult  = {type: EDITOR_RECEIVE_KEYWORDSETS, keywordSets}
            expect(receiveKeywordSets(keywordSets)).toEqual(expectedResult);
            const expectedLocalStorage = JSON.stringify(keywordSets);
            expect(localStorage.getItem('KEYWORDSETS')).toEqual(expectedLocalStorage);
        });
    });
    describe('receiveLanguages', () => {
        test('returns object with correct values & saves languages to localStorage', () => {
            localStorage.clear()
            const languages = mockLanguages
            const expectedResult  = {type: EDITOR_RECEIVE_LANGUAGES, languages}
            expect(receiveLanguages(languages)).toEqual(expectedResult);
            const expectedLocalStorage = JSON.stringify(languages);
            expect(localStorage.getItem('LANGUAGES')).toEqual(expectedLocalStorage);
        });
    });
    describe('prepareFormValues', () => {
        const mockLanguages = ['fi','sv'];

        /**
         * Returns prepareFormValues with default params.
         * Additional params can be used to override the defaults.
         * @param {Object} params
         * @returns {{}|*}
         */
        function getPrepareFormValues(params = {}) {
            const defaultParams = {
                values: createFormValues(mockLanguages),
                mockLanguages: mockLanguages,
                user: mockUser,
                updateExisting: false,
                publicationStatus: PUBLICATION_STATUS.DRAFT,
                dispatch: () => {},
                keywordSets: mockKeywordSets,
            };
            const mergedParams = merge(defaultParams, params);
            return prepareFormValues(...Object.values(mergedParams));
        }

        test('returns correct object when creating a new recurring event', () => {
            /**
             * Final object should contain start_time and end_time that are calculated from the sub events,
             * object should also contain a super_event_type key with correct value.
             */

            const mockFormValues = createFormValues(mockLanguages);
            const values = getPrepareFormValues();
            const subStarts = [], subEnds = [];
            for (let i = 0; i < 2; i++) {
                subStarts.push(moment(mockFormValues.sub_events[i.toString()]['start_time']));
                subEnds.push(moment(mockFormValues.sub_events[i.toString()]['end_time']));
            }
            const mostDistantPast = moment.min(subStarts);
            const mostDistantFuture = moment.max(subEnds);
            const expectedStart = moment(mostDistantPast).tz('Europe/Helsinki').utc().toISOString();
            const expectedEnd = moment(mostDistantFuture).tz('Europe/Helsinki').utc().toISOString();
            // final start_time is calculated from the sub events
            expect(values.start_time).toBe(expectedStart);
            // final end_time is calculated from the sub events
            expect(values.end_time).toBe(expectedEnd);
            // super_event_type is correct
            expect(values.super_event_type).toBe(SUPER_EVENT_TYPE_RECURRING);
        });
        test('returns correct object when updating existing recurring event but not modifying the sub events', () => {
            const mockFormValues = createFormValues(mockLanguages);
            mockFormValues.name.fi = 'updated finnish name';
            mockFormValues.sub_events['0']['@id'] = 'first sub id';
            mockFormValues.sub_events['1']['@id'] = 'second sub id';

            const values = getPrepareFormValues({values: mockFormValues, updateExisting: true});
            expect(values.super_event_type).toBeUndefined();
        });
        test.skip('all offers without payment methods get the first offers payment methods if they exist.', () => {
            const expectedPaymentMethods = mockPaymentMethods.slice(2);
            const mockFormValues = createFormValues(mockLanguages);
            mockFormValues.offers[0].payment_methods = expectedPaymentMethods;
            mockFormValues.offers.push({
                description: {fi:'second',sv:'andra'},
                info_url: {fi:'http://suomi.fi/2',sv:'http://suomi.fi/2'},
                price: {fi:'22',sv:'22'},
                is_free: false,
            });
            mockFormValues.offers.push({
                description: {fi:'third',sv:'tredje'},
                info_url: {fi:'http://suomi.fi/3',sv:'http://suomi.fi/3'},
                price: {fi:'33',sv:'33'},
                is_free: false,
            });
            const values = getPrepareFormValues({values: mockFormValues});
            expect(values.offers).toHaveLength(3);
            expect(values.offers[0].payment_methods).toEqual(expectedPaymentMethods);
            expect(values.offers[1].payment_methods).toEqual(expectedPaymentMethods);
            expect(values.offers[2].payment_methods).toEqual(expectedPaymentMethods);
        });
        test.skip('only offers that dont have payment methods get the same payment methods as the first offer', () => {
            const expectedDefaultPaymentMethods = mockPaymentMethods.slice(2);
            const specificPaymentMethod = [{'@id': 'this is a specific payment method only used here.'}];
            const mockFormValues = createFormValues(mockLanguages);
            mockFormValues.offers[0].payment_methods = expectedDefaultPaymentMethods;
            mockFormValues.offers.push({
                description: {fi:'second',sv:'andra'},
                info_url: {fi:'http://suomi.fi/2',sv:'http://suomi.fi/2'},
                price: {fi:'22',sv:'22'},
                payment_methods: specificPaymentMethod,
                is_free: false,
            });
            mockFormValues.offers.push({
                description: {fi:'third',sv:'tredje'},
                info_url: {fi:'http://suomi.fi/3',sv:'http://suomi.fi/3'},
                price: {fi:'33',sv:'33'},
                is_free: false,
            });
            const values = getPrepareFormValues({values: mockFormValues});
            expect(values.offers).toHaveLength(3);
            expect(values.offers[0].payment_methods).toEqual(expectedDefaultPaymentMethods);
            expect(values.offers[1].payment_methods).toEqual(specificPaymentMethod);
            expect(values.offers[2].payment_methods).toEqual(expectedDefaultPaymentMethods);
        });
        test('dispatches correctly and returns undefined if form values contained validation errors', () => {
            const mockDispatch = jest.fn();
            const mockFormValues = createFormValues(mockLanguages);
            // Name value set to empty string, this causes a validation error.
            mockFormValues.name.fi = '';
            const expectedValidationError = {name: {fi: ['requiredMulti']}};
            const values = getPrepareFormValues({values: mockFormValues,dispatch: mockDispatch});
            expect(values).toBeUndefined();
            // First dispatch is actually setLoading(false) but it appears as an anonymous function.
            expect(mockDispatch).toHaveBeenNthCalledWith(1, expect.any(Function));
            expect(mockDispatch).toHaveBeenNthCalledWith(2, setValidationErrors(expectedValidationError));
        });
        test('calls mapUIDataToAPIFormat when returning', () => {
            const spy = jest.spyOn(formDataFunctions, 'mapUIDataToAPIFormat');
            const mockFormValues = createFormValues(mockLanguages);
            const values = getPrepareFormValues({values: mockFormValues});
            expect(spy).toHaveBeenCalledTimes(1);
            expect(values).toBeTruthy();
        });
    });
});
