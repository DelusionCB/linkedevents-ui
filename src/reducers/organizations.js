import constants from '../constants'
import updater from 'immutability-helper';

const initialState = {
    isOrganizationsFetching: false,
    data: [],
}

function update(state = initialState, action) {
    switch(action.type) {
        // Successfully received organizations data.
        case constants.RECEIVE_ORGANIZATIONSDATA:
            if(action.payload && !!action.payload.data) {
                return updater(state, {
                    isOrganizationsFetching:{$set: false},
                    data: {$set: action.payload.data},
                })
            }
            return state
        // Set boolean displaying if organizationdata is currently being fetched.
        case constants.FETCHING_ORGANIZATIONSDATA:
            return updater(state, {
                isOrganizationsFetching: {$set: action.payload},
            })
        case constants.RECEIVE_ORGANIZATIONS_ERROR:
            return updater(state, {
                isOrganizationsFetching: {$set: false},
                data: {$set: initialState.data},
            })
        default:
            return state
    }
}

export default update
