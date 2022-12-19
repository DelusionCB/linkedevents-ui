import constants from '../constants.js'
import client from '../api/client'

const {FETCHING_ORGANIZATIONSDATA, RECEIVE_ORGANIZATIONSDATA, RECEIVE_ORGANIZATIONS_ERROR} = constants

// Handled by the organizations reducer
export function receiveOrganizationsData(data) {
    return {
        type: RECEIVE_ORGANIZATIONSDATA,
        payload: data,
    }
}

export function receiveOrganizationsFail() {
    return {
        type: constants.RECEIVE_ORGANIZATIONS_ERROR,
        payload: [],
    }
}
/**
 * Set organizations.isOrganizationsFetching boolean
 * @param {boolean} data
 * @returns {{payload: boolean, type: string}}
 */
export function loadingOrganizationsData(data) {
    return {
        type: FETCHING_ORGANIZATIONSDATA,
        payload: data,
    }
}

// Handles getting all organizations data from api
export const fetchOrganizations = () => async (dispatch) => {
    let organizationsResponse;
    try {
        dispatch(loadingOrganizationsData(true))
        // fetch organizations from endpoint
        organizationsResponse = await client.get('organization')
        const organizationsData = organizationsResponse.data
        dispatch(receiveOrganizationsData(organizationsData))
    } catch (error) {
        dispatch(loadingOrganizationsData(false))
        dispatch(receiveOrganizationsFail(organizationsResponse))
        new Error(error);
    }
}
