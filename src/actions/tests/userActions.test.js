import {receiveUserData, clearUserData, setActiveOrganization, loadingUser} from '../user';
import constants from '../../constants.js'


const {RECEIVE_USERDATA, CLEAR_USERDATA, SET_ACTIVE_ORGANIZATION, FETCHING_USERDATA} = constants

describe('actions/user', () => {
    describe('receiveUserData', () => {
        test('returns object with correct type and payload', () => {
            const data = {testData: 123};
            const expectedResult = {type: RECEIVE_USERDATA, payload: data};
            const result = receiveUserData(data);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('clearUserData', () => {
        test('returns object with correct type', () => {
            const expectedResult = {type: CLEAR_USERDATA};
            const result = clearUserData();
            expect(result).toEqual(expectedResult);
        });
    });

    describe('setActiveOrganization', () => {
        test('returns object with correct type', () => {
            const org = 'turku:853';
            const expectedResult = {type: SET_ACTIVE_ORGANIZATION, payload: org};
            const result = setActiveOrganization(org);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('loadingUser', () => {
        test('returns object with correct type', () => {
            const data = {testData: 123};
            const expectedResult = {type: FETCHING_USERDATA, payload: data};
            const result = loadingUser(data);
            expect(result).toEqual(expectedResult);
        });
    });
});
