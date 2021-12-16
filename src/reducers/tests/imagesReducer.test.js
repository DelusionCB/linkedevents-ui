import constants from '../../constants';
import update from '../images';
import {mockImages} from '../../../__mocks__/mockData';
import {getProps} from '../../../__mocks__/testMocks';
const {RECEIVE_IMAGES,
    RECEIVE_IMAGES_AND_META,
    RECEIVE_DEFAULT_IMAGES,
    RECEIVE_IMAGES_ERROR,
    REQUEST_IMAGES,
    REQUEST_IMAGES_AND_META,
    IMAGE_UPLOAD_SUCCESS} = constants

const INITIAL_STATE = {
    isFetching: false,
    fetchComplete: false,
    items: [],
    selected: {},
    defaultImages: [],
}

describe('reducers/images', () => {
    test('returns state if no action', () => {
        expect(update(getProps(INITIAL_STATE), {})).toEqual(INITIAL_STATE);
    });

    describe('actions', () => {
        describe('RECEIVE_IMAGES', () => {
            test('return state with updated fetchComplete & items values', () => {
                const stateWhenFetching = {...INITIAL_STATE, isFetching: true, fetchComplete: false};
                const nextState = update(stateWhenFetching, {type: RECEIVE_IMAGES, items: [mockImages]});
                const expectedResult = getProps(
                    stateWhenFetching,
                    {isFetching: false, fetchComplete: true, items: [mockImages]}
                );
                expect(nextState).toEqual(expectedResult);
            });
        });

        describe('RECEIVE_IMAGES_AND_META', () => {
            test('return state with updated booleans & values set to items/meta keys', () => {
                const stateWhenFetching = {...INITIAL_STATE, fetchComplete: false, isFetching: true};
                const nextState = update(stateWhenFetching, {type: RECEIVE_IMAGES_AND_META, items: [mockImages], meta: ['test']});
                const expectedResult = getProps(
                    stateWhenFetching,
                    {fetchComplete: true, isFetching: false, items: [mockImages], meta: ['test']}
                );
                expect(nextState).toEqual(expectedResult);
            });
        });

        describe('RECEIVE_DEFAULT_IMAGES', () => {
            test('return state with updated booleans & values set to defaultImages', () => {
                const stateWhenFetching = {...INITIAL_STATE, fetchComplete: false, isFetching: true};
                const nextState = update(stateWhenFetching, {type: RECEIVE_DEFAULT_IMAGES, items: [mockImages]});
                const expectedResult = getProps(
                    stateWhenFetching,
                    {fetchComplete: true, isFetching: false, defaultImages: [mockImages]}
                );
                expect(nextState).toEqual(expectedResult);
            });
        });

        describe('RECEIVE_IMAGES_ERROR', () => {
            test('return state with updated booleans and values set to items', () => {
                const stateWhenFetching = {...INITIAL_STATE, fetchComplete: false, isFetching: true};
                const nextState = update(
                    stateWhenFetching,
                    {type: RECEIVE_IMAGES_ERROR, items: ['something went wrong']}
                );
                const expectedResult = getProps(
                    stateWhenFetching,
                    {fetchComplete: true, isFetching: false, items: ['something went wrong']}
                );
                expect(nextState).toEqual(expectedResult);
            });
        });

        describe('REQUEST_IMAGES', () => {
            test(' return state with updated isFetching and empty array set to items', () => {
                const nextState = update(INITIAL_STATE, {type: REQUEST_IMAGES});
                const expectedState = getProps(INITIAL_STATE,{isFetching: true});
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('REQUEST_IMAGES_AND_META', () => {
            test('return state with updated isFetching and meta set to empty obj', () => {
                const nextState = update(INITIAL_STATE, {type: REQUEST_IMAGES_AND_META});
                const expectedState = getProps(INITIAL_STATE,{isFetching: true, meta: {}});
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('IMAGE_UPLOAD_SUCCESS', () => {
            test('return state with updated fetchComplete and selected set to data', () => {
                const stateWhenFetchComplete = {...INITIAL_STATE, fetchComplete: true};
                const nextState = update(
                    stateWhenFetchComplete,
                    {type: IMAGE_UPLOAD_SUCCESS, data: mockImages[0]}
                );
                const expectedState = getProps(
                    stateWhenFetchComplete,{selected: mockImages[0], fetchComplete: false}
                );
                expect(nextState).toEqual(expectedState);
            });
        });
    });
});
