import {createAction} from 'redux-actions';
import {USER_EXPIRED} from 'redux-oidc';

import constants from '../../constants';

import user from '../user';

/**
 * Returns initial state object with optional overrides from props.
 * @param {object} props
 * @returns {{data: null, isFetchingUser: boolean}}
 */
function getModifiedInitialState(props = {}) {
    const initialState = {
        data: null,
        isFetchingUser: false,
    };
    return {...initialState, ...props}
}

describe('reducers/user', () => {
    test('initial state is null', () => {
        const initialState = getModifiedInitialState();
        expect(user(initialState, {})).toEqual(initialState);
    });

    describe('actions', () => {
        describe('RECEIVE_USERDATA', () => {
            const receiveUserData = createAction(constants.RECEIVE_USERDATA);

            test('changes state.data and toggles isFetchingUser if payload.id exists', () => {
                const id = 'test-id'
                const initialFetchingState = getModifiedInitialState({isFetchingUser: true});
                const expectedState = getModifiedInitialState({data:{id:'test-id'}, isFetchingUser: false})
                const action = receiveUserData({id});
                const nextState = user(initialFetchingState, action);
                expect(nextState).toEqual(expectedState);
            });

            test('doesnt change state if action payload doesnt exist', () => {
                const action = receiveUserData();
                const initialState = getModifiedInitialState();
                const nextState = user(initialState, action);
                expect(nextState).toEqual(initialState);
            });

            test('doesnt change state if action payload id is missing', () => {
                const action = receiveUserData({testData: 'some data'});
                const initialState = getModifiedInitialState();
                const nextState = user(initialState, action);

                expect(nextState).toEqual(initialState);
            });
        });

        describe('FETCHING_USERDATA', () => {
            test.each([true, false])('toggles state.isFetchingUser boolean correctly when it is initially %s ', (state) => {
                const fetchingUser = createAction(constants.FETCHING_USERDATA);
                const action = fetchingUser(!state);
                const initialState = getModifiedInitialState({isFetchingUser: state});
                const nextState = user(initialState, action);
                expect(nextState.isFetchingUser).toBe(!state);
            })
        })

        describe('CLEAR_USERDATA', () => {
            test('sets state.data to null and isFetchingUser to false, back to initial state', () => {
                const clearUserData = createAction(constants.CLEAR_USERDATA);
                const action = clearUserData();
                const initialState = getModifiedInitialState({data: {id: 'test-id'}, isFetchingUser: true});
                const nextState = user(initialState, action);
                const expectedState = getModifiedInitialState();
                expect(nextState).toEqual(expectedState);
            });
        });
        describe('USER_EXPIRED', () => {
            test('sets state back to initial state', () => {
                const userExpired = createAction(USER_EXPIRED);
                const action = userExpired();
                const initialState = getModifiedInitialState({data: {id: 'test-id'}, isFetchingUser: true});
                const nextState = user(initialState, action);
                const expectedState = getModifiedInitialState();
                expect(nextState).toEqual(expectedState);
            });
        });
    });
});
