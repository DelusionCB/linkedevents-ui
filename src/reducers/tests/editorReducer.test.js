import constants from '../../constants';
import update from '../editor';
import {
    mockEditorExistingEvent,
    mockImages,
    mockKeywordSets,
    mockLanguages,
    mockPaymentMethods,
    mockSideFields,
} from '../../../__mocks__/mockData';
import {getProps} from '../../../__mocks__/testMocks';
import {mapAPIDataToUIFormat} from '../../utils/formDataMapping';

const {EDITOR_SETDATA, EDITOR_SETMETHODDATA, EDITOR_CLEAR_VALUE, EDITOR_UPDATE_SUB_EVENT,
    EDITOR_DELETE_SUB_EVENT, EDITOR_SORT_SUB_EVENTS, EDITOR_ADD_OFFER,
    EDITOR_DELETE_OFFER, EDITOR_SET_FREE_OFFERS, EDITOR_ADD_VIDEO, EDITOR_DELETE_VIDEO, EDITOR_SET_NO_VIDEOS, EDITOR_SETLANGUAGES,
    VALIDATE_FOR, EDITOR_REPLACEDATA, EDITOR_CLEARDATA, EDITOR_SENDDATA_SUCCESS,
    EDITOR_RECEIVE_KEYWORDSETS, EDITOR_RECEIVE_PAYMENTMETHODS,
    EDITOR_RECEIVE_LANGUAGES, EDITOR_RECEIVE_SIDEFIELDS, RECEIVE_EVENT_FOR_EDITING, SELECT_IMAGE_BY_ID,
    SET_VALIDATION_ERRORS, EDITOR_SET_LOADING, VALIDATION_STATUS, PUBLICATION_STATUS} = constants

const editorValues = {
    sub_events: {},
};

const INITIAL_STATE = {
    values: editorValues || {},
    languages: mockLanguages,
    contentLanguages: ['fi'],
    keywordSets: mockKeywordSets,
    paymentMethods: mockPaymentMethods,
    sideFields: mockSideFields,
    validationErrors: {},
    validateFor: null,
    loading: false,
};

describe('reducers/editor', () => {
    test('initial state is', () => {
        expect(update(getProps(INITIAL_STATE), {})).toEqual(INITIAL_STATE);
    });

    describe('actions', () => {

        describe('EDITOR_SETDATA', () => {

            test('normal values are set', () => {
                // add values
                const nextState = update(
                    INITIAL_STATE,
                    {type: EDITOR_SETDATA, values: {name: {fi: 'test'}}}
                );
                const expectedState = getProps(
                    INITIAL_STATE,
                    {values: {name: {fi: 'test'}, sub_events: {}}}
                );
                expect(nextState).toEqual(expectedState);
            });

            test('offer values are set', () => {
                // add offer
                const stateWithOffer = update(
                    INITIAL_STATE,
                    {type: EDITOR_ADD_OFFER, values: {0: {price: '5'}}}
                );
                // update offer values
                const stateWithUpdatedOffer = update(
                    stateWithOffer,
                    {type: EDITOR_SETDATA, offer: true, key: '0', values: {'0': {'description': 'test'}}}
                );
                const expectedState = getProps(
                    stateWithUpdatedOffer,
                    {
                        values: {
                            ...INITIAL_STATE.values,
                            offers: [{'0': {price: '5'}, description: 'test'}],
                        },
                    }
                );
                expect(stateWithUpdatedOffer).toEqual(expectedState);
            });

            test('video values are set', () => {
                // add video
                const stateWithVideo = update(
                    INITIAL_STATE,
                    {type: EDITOR_ADD_VIDEO, values:  {0: {url: 'https://google.fi'}}}
                );
                // update video values
                const stateWithUpdatedVideo = update(
                    stateWithVideo,
                    {type: EDITOR_SETDATA, video: true, key: '0', values: {'0': {'name': 'test'}}}
                );
                const expectedState = getProps(
                    stateWithUpdatedVideo,
                    {
                        values: {
                            ...INITIAL_STATE.values,
                            videos: [{'0': {url: 'https://google.fi'}, name: 'test'}],
                        },
                    }
                );
                expect(stateWithUpdatedVideo).toEqual(expectedState);
            });

            test('sub_events are set', () => {
                // add sub-event
                const setValuesToState = update(
                    INITIAL_STATE,
                    {type: EDITOR_SETDATA, event: true, key: 0, values: {0: {'start_time': '15.02.2051'}}}
                );
                const expectedState = getProps(
                    setValuesToState,
                    {values: {sub_events: {0: {'start_time': '15.02.2051'}}}}
                );
                expect(setValuesToState).toEqual(expectedState);
            });
        });

        describe('EDITOR_SETMETHODDATA', () => {
            test('set payment_methods to offer 0', () => {
                // add offer
                const nextState = update(
                    INITIAL_STATE,
                    {type: EDITOR_ADD_OFFER, values: {0: {price: '5'}}}
                );
                // updated offer values
                const stateWithMethods = update(
                    nextState,
                    {type: EDITOR_SETMETHODDATA, values: {payment_methods: [mockPaymentMethods]}, key: 0}
                );
                expect(stateWithMethods.values.offers).toEqual(
                    [{'0': {price: '5'}, payment_methods: [mockPaymentMethods]}]
                );
            });
        });

        describe('EDITOR_CLEAR_VALUE', () => {
            test('clear value', () => {
                // add values
                const setValuesToState = update(
                    INITIAL_STATE,
                    {type: EDITOR_SETDATA, values: {name: {fi: 'test'}, short_description: {fi: 'testdesc'}}}
                );
                // clear name key
                const nextState = update(
                    setValuesToState,
                    {type: EDITOR_CLEAR_VALUE, values: ['name']}
                );
                const expectedState = getProps({...nextState.values, short_description: {fi: 'testdesc'}});
                expect(nextState.values).toEqual(expectedState);
            });
        });

        describe('EDITOR_UPDATE_SUB_EVENT', () => {
            test('update sub_events value', () => {
                // add sub-event
                const setValuesToState = update(
                    INITIAL_STATE,
                    {type: EDITOR_SETDATA, event: true, key: 0, values: {0: {'start_time': '15.02.2051'}}}
                );
                // update sub-event start_time value
                const nextState = update(
                    setValuesToState,
                    {type: EDITOR_UPDATE_SUB_EVENT, eventKey: 0, property: 'start_time', value: '14.02.2051'}
                );
                expect(nextState.values.sub_events).toEqual({0: {'start_time': '14.02.2051'}});
            });
        });

        describe('EDITOR_DELETE_SUB_EVENT', () => {
            test('delete sub_event', () => {
                // add sub-event
                const setValuesToState = update(
                    INITIAL_STATE,
                    {type: EDITOR_SETDATA, event: true, key: 0, values: {0: {'start_time': '15.02.2051'}}}
                );
                // delete sub-event
                const nextState = update(
                    setValuesToState,
                    {type: EDITOR_DELETE_SUB_EVENT, event: 0}
                );
                expect(nextState).toEqual(INITIAL_STATE);
            });
        });

        describe('EDITOR_SORT_SUB_EVENTS', () => {
            test('sort sub_events based on start_time', () => {
                // add first sub-event
                const stateWithOneSub = update(
                    INITIAL_STATE,
                    {type: EDITOR_SETDATA, event: true, key: 0, values: {0: {'start_time': '15.02.2051'}}}
                );
                // add second sub-event
                const stateWithTwoSubs = update(
                    stateWithOneSub,
                    {type: EDITOR_SETDATA, event: true, key: 1, values: {1: {'start_time': '11.02.2051'}}}
                );
                const nextState = update(stateWithTwoSubs, {type: EDITOR_SORT_SUB_EVENTS})
                expect(nextState.values.sub_events).toEqual(
                    {
                        0: {'start_time': '11.02.2051'},
                        1: {'start_time': '15.02.2051'},
                    }
                );
            });
        });

        describe('EDITOR_ADD_OFFER', () => {
            test('add offer to values', () => {
                const nextState = update(
                    INITIAL_STATE,
                    {type: EDITOR_ADD_OFFER, values: {0: {price: '5'}}}
                );
                const expectedState = getProps(
                    INITIAL_STATE,
                    {values:{...INITIAL_STATE.values, offers:[{0: {price: '5'}}]}}
                );
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('EDITOR_ADD_VIDEO', () => {
            test('add video to values', () => {
                const nextState = update(
                    INITIAL_STATE,
                    {type: EDITOR_ADD_VIDEO, values: {0: {url: '', name: {}, alt_text: {}}}}
                );
                const expectedState = getProps(
                    INITIAL_STATE,
                    {values:{...INITIAL_STATE.values, videos:[{0: {url: '', name: {}, alt_text: {}}}]}}
                );
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('EDITOR_DELETE_OFFER', () => {
            test('return state with updated offers', () => {
                // add first offer
                const stateWithOneOffer = update(
                    INITIAL_STATE,
                    {type: EDITOR_ADD_OFFER, values: {0: {price: '5'}}}
                );
                // add second offer
                const stateWithTwoOffers = update(
                    stateWithOneOffer,
                    {type: EDITOR_ADD_OFFER, values: {1: {price: '10'}}}
                );
                // remove second offer
                const stateWithOfferRemoved = update(stateWithTwoOffers, {type: EDITOR_DELETE_OFFER, offerKey: 1})
                expect(stateWithOfferRemoved).toEqual(stateWithOneOffer);
            });
        });

        describe('EDITOR_DELETE_VIDEO', () => {
            test('return state with updated videos', () => {
                // add first video
                const stateWithOneVideo = update(
                    INITIAL_STATE,
                    {type: EDITOR_ADD_VIDEO, values: {0: {url: '', name: {}, alt_text: {}}}}
                );
                // add second video
                const stateWithTwoVideos = update(
                    stateWithOneVideo,
                    {type: EDITOR_ADD_VIDEO, values: {1: {url: '', name: {}, alt_text: {}}}}
                );
                // remove second video
                const stateWithVideoRemoved = update(stateWithTwoVideos, {type: EDITOR_DELETE_VIDEO, videoKey: 1})
                expect(stateWithVideoRemoved).toEqual(stateWithOneVideo);
            });
        });

        describe('EDITOR_SET_FREE_OFFERS', () => {
            test('existing offer is set free & deleted', () => {
                const newStateWithOffers = update(
                    INITIAL_STATE,
                    {type: EDITOR_ADD_OFFER, values: [{price: '5'}]}
                );
                const stateWithFreeOffers = update(
                    newStateWithOffers,
                    {type: EDITOR_SET_FREE_OFFERS, isFree: true}
                );
                expect(stateWithFreeOffers).toEqual(INITIAL_STATE);
            });
        });

        describe('EDITOR_SET_NO_VIDEOS', () => {
            test('existing offer is set free & deleted', () => {
                const newStateWithVideo = update(
                    INITIAL_STATE,
                    {type: EDITOR_ADD_VIDEO, values: [{price: '5'}]}
                );
                const stateWithFreeOffers = update(
                    newStateWithVideo,
                    {type: EDITOR_SET_NO_VIDEOS, isFree: true}
                );
                expect(stateWithFreeOffers).toEqual(INITIAL_STATE);
            });
        });

        describe('EDITOR_SETLANGUAGES', () => {
            test('returns state with contentLanguages set cleares languages not in content', () => {
                const langState = update(
                    INITIAL_STATE,
                    {type: EDITOR_SETLANGUAGES, languages: ['fi','sv']}
                )
                const firstState = update(
                    langState,
                    {type: EDITOR_SETDATA, values: {name: {sv: 'test', fi: 'test'},
                        short_description: {sv: 'testdesc', fi: 'testdesc'}},
                    contentLanguages: ['fi', 'sv']}
                );
                const nextState = update(
                    firstState,
                    {type: EDITOR_SETLANGUAGES, languages: ['fi']}
                );
                const expectedState = getProps(nextState,{
                    values: {
                        name: {fi: 'test'},
                        short_description: {fi: 'testdesc'},
                        sub_events: {},
                    },
                    contentLanguages: ['fi'],
                });
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('VALIDATE_FOR', () => {
            test('returns state with validateFor set', () => {
                const nextState = update(
                    INITIAL_STATE,
                    {type: VALIDATE_FOR, validateFor: PUBLICATION_STATUS.PUBLIC}
                );
                const expectedState = getProps(
                    INITIAL_STATE,
                    {validateFor: PUBLICATION_STATUS.PUBLIC}
                );
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('EDITOR_REPLACEDATA', () => {
            test('returns state with old values/contentLanguages replaced with new values', () => {
                const oldState = update(
                    INITIAL_STATE,
                    {type: EDITOR_SETDATA,
                        values:{name:{fi: 'testname'}},
                        contentLanguages: ['sv'],
                    }
                );
                const nextState = update(
                    oldState,
                    {
                        type: EDITOR_REPLACEDATA,
                        values: {description: {fi: 'test', en: 'test'}},
                    }
                );
                const expectedState = getProps(
                    INITIAL_STATE,
                    {
                        values: {description: {fi: 'test', en: 'test'}},
                        contentLanguages: ['fi', 'en'],
                    }
                );
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('EDITOR_CLEARDATA', () => {
            test('all data is cleared and localStorage.EDITOR_VALUES cleared', () => {
                localStorage.clear();
                localStorage.setItem('EDITOR_VALUES', 'dummy content');
                const stateWithData = update(
                    INITIAL_STATE,
                    {type: EDITOR_SETDATA, values:{name:{fi:'test'}}}
                );
                const nextState = update(stateWithData, {type: EDITOR_CLEARDATA});
                const expectedState = getProps(INITIAL_STATE, {validationStatus: VALIDATION_STATUS.CLEARED});
                expect(nextState).toEqual(expectedState);
                expect(localStorage.getItem('EDITOR_VALUES')).toEqual('{}');
            });
        });

        describe('EDITOR_SENDDATA_SUCCESS', () => {
            test('returns state with values set to editorValues and localStorage.EDITOR_VALUES cleared', () => {
                localStorage.clear();
                localStorage.setItem('EDITOR_VALUES', 'dummy content');
                const nextState = update(
                    INITIAL_STATE,
                    {type: EDITOR_SENDDATA_SUCCESS, values: editorValues}
                );
                const expectedState = getProps(INITIAL_STATE, {values: editorValues});
                expect(nextState).toEqual(expectedState);
                expect(localStorage.getItem('EDITOR_VALUES')).toEqual('{}');
            });
        });

        describe('EDITOR_RECEIVE_KEYWORDSETS', () => {
            test('returns state with keywordSets set', () => {
                const nextState = update(
                    INITIAL_STATE,
                    {type: EDITOR_RECEIVE_KEYWORDSETS, keywordSets: mockKeywordSets}
                );
                const expectedState = getProps(INITIAL_STATE, {keywordSets: mockKeywordSets});
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('EDITOR_RECEIVE_PAYMENTMETHODS', () => {
            test('returns state with paymentMethods set', () => {
                const nextState = update(
                    INITIAL_STATE,
                    {type: EDITOR_RECEIVE_PAYMENTMETHODS, paymentMethods: mockPaymentMethods}
                );
                const expectedState = getProps(
                    INITIAL_STATE,
                    {paymentMethods: mockPaymentMethods}
                );
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('EDITOR_RECEIVE_LANGUAGES', () => {
            test('returns state with languages set', () => {
                const nextState = update(
                    INITIAL_STATE,
                    {type: EDITOR_RECEIVE_LANGUAGES, languages: mockLanguages}
                );
                const expectedState = getProps(INITIAL_STATE, {languages: mockLanguages});
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('EDITOR_RECEIVE_SIDEFIELDS', () => {
            test('returns state with sideFields set', () => {
                const nextState = update(
                    INITIAL_STATE,
                    {type: EDITOR_RECEIVE_SIDEFIELDS, sidefields: mockSideFields}
                );
                const expectedState = getProps(INITIAL_STATE, {sideFields: mockSideFields});
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('RECEIVE_EVENT_FOR_EDITING', () => {
            test('returns state with values being passed through mapAPIDataToUIFormat function', () => {
                const nextState = update(
                    INITIAL_STATE,
                    {type: RECEIVE_EVENT_FOR_EDITING, event: {...mockEditorExistingEvent}}
                );
                const expectedState = getProps(
                    INITIAL_STATE,
                    {values: mapAPIDataToUIFormat(mockEditorExistingEvent)}
                );
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('SELECT_IMAGE_BY_ID', () => {
            test('returns state with updated values containing correct image', () => {
                const nextState = update(
                    INITIAL_STATE,
                    {type: SELECT_IMAGE_BY_ID, img: mockImages[0]}
                );
                const expectedState = getProps(
                    INITIAL_STATE,
                    {values: {...INITIAL_STATE.values, image: mockImages[0]}}
                );
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('SET_VALIDATION_ERRORS', () => {
            test('returns state with updated values to validationErrors & validationStatus', () => {
                const nextState = update(
                    INITIAL_STATE,
                    {type: SET_VALIDATION_ERRORS, errors: {name: ['test-error']}}
                );
                const expectedState = getProps(
                    INITIAL_STATE,
                    {validationErrors: {name: ['test-error']}, validationStatus: VALIDATION_STATUS.RESOLVE}
                );
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('EDITOR_SET_LOADING', () => {
            test('returns state with loading value set', () => {
                const nextState = update(INITIAL_STATE, {type: EDITOR_SET_LOADING, loading: true});
                const expectedState = getProps(INITIAL_STATE, {loading: true});
                expect(nextState).toEqual(expectedState);
            });
        });
    });
});
