import constants from '../../constants';
import update from '../organizations';
import {createAction} from 'redux-actions';
import {mockOrganizations} from '../../../__mocks__/mockData';
const {FETCHING_ORGANIZATIONSDATA,
    RECEIVE_ORGANIZATIONSDATA,
    RECEIVE_ORGANIZATIONS_ERROR} = constants

function getModifiedInitialState(props = {}) {
    const initialState = {
        data: [],
        isOrganizationsFetching: false,
    };
    return {...initialState, ...props}
}

describe('reducers/organizations', () => {
    test('returns initial state if no action', () => {
        const initialState = getModifiedInitialState();
        expect(update(initialState, {})).toEqual(initialState);
    });

    describe('actions', () => {
        describe('RECEIVE_ORGANIZATIONSDATA', () => {
            const receiveOrganizationData = createAction(constants.RECEIVE_ORGANIZATIONSDATA);

            test('changes state.data and toggles isOrganizationsFetching if payload.data', () => {
                const initialFetchingState = getModifiedInitialState({isOrganizationsFetching: true});
                const expectedState = getModifiedInitialState({data: mockOrganizations, isOrganizationsFetching: false})
                const action = receiveOrganizationData({data: mockOrganizations});
                const nextState = update(initialFetchingState, action);
                expect(nextState).toEqual(expectedState);
            });

            test('does not change state if action payload does not exist', () => {
                const action = receiveOrganizationData();
                const initialState = getModifiedInitialState();
                const nextState = update(initialState, action);
                expect(nextState).toEqual(initialState);
            });
        });

        describe('FETCHING_ORGANIZATIONSDATA', () => {
            test.each([true, false])('toggles state.isOrganizationsFetching boolean correctly when it is initially %s ', (state) => {
                const fetchingOrganizations = createAction(constants.FETCHING_ORGANIZATIONSDATA);
                const action = fetchingOrganizations(!state);
                const initialState = getModifiedInitialState({isOrganizationsFetching: state});
                const nextState = update(initialState, action);
                expect(nextState.isOrganizationsFetching).toBe(!state);
            })
        })

        describe('RECEIVE_ORGANIZATIONS_ERROR', () => {
            const receiveOrganizationData = createAction(constants.RECEIVE_ORGANIZATIONS_ERROR);

            test('do not change state.data but toggles isOrganizationsFetching', () => {
                const initialFetchingState = getModifiedInitialState({isOrganizationsFetching: true});
                const expectedState = getModifiedInitialState({data: [], isOrganizationsFetching: false})
                const action = receiveOrganizationData({data: []});
                const nextState = update(initialFetchingState, action);
                expect(nextState).toEqual(expectedState);
            });
        });
    });
});
