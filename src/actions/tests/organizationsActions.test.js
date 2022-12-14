import {
    loadingOrganizationsData,
    receiveOrganizationsData,
    receiveOrganizationsFail,
} from '../organizations';
import constants from '../../constants';
import {mockOrganizations} from '../../../__mocks__/mockData';
const {
    FETCHING_ORGANIZATIONSDATA,
    RECEIVE_ORGANIZATIONSDATA,
    RECEIVE_ORGANIZATIONS_ERROR} = constants

/**
 * Returns object with mockOrganizations
 * @returns {{data: [Object]}}
 */
function dataObjectOrganizations() {
    return {data: mockOrganizations}
}
describe('actions/organizations', () => {

    describe('receiveOrganizationsData', () => {
        test('returns object with correct type & data', () => {
            const mockData = dataObjectOrganizations()
            const expectedResult = {type: RECEIVE_ORGANIZATIONSDATA, payload: mockData};
            const result = receiveOrganizationsData(mockData);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('receiveOrganizationsFail', () => {
        test('returns object with correct type & empty items', () => {
            const expectedResult = {type: RECEIVE_ORGANIZATIONS_ERROR, payload: []};
            const result = receiveOrganizationsFail();
            expect(result).toEqual(expectedResult);
        });
    });

    describe('loadingOrganizationsData', () => {
        test('returns object with correct type & data', () => {
            const mockData = dataObjectOrganizations()
            const expectedResult = {type: FETCHING_ORGANIZATIONSDATA, payload: mockData};
            const result = loadingOrganizationsData(mockData);
            expect(result).toEqual(expectedResult);
        });
    });
});
