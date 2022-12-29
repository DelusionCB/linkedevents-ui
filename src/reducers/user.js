import constants from '../constants'
import {USER_EXPIRED} from 'redux-oidc'
import updater from 'immutability-helper';

const initialState = {
    isFetchingUser: false,
    activeOrganization: null,
    data: null,
}

function update(state = initialState, action) {
    switch(action.type) {
        // Successfully completed login and received userdata.
        case constants.RECEIVE_USERDATA:
            if(action.payload && action.payload.id) {
                return updater(state, {
                    isFetchingUser:{$set: false},
                    data: {$set: action.payload},
                })
            }
            return state
        // Set boolean displaying if userdata is currently being fetched.
        case constants.FETCHING_USERDATA:
            return updater(state, {
                isFetchingUser: {$set: action.payload},
            })
        // set active organization to user
        case constants.SET_ACTIVE_ORGANIZATION:
            return updater(
                state,
                {
                    activeOrganization: {$set: action.payload}, 
                }
            )
        case constants.CLEAR_USERDATA: // Logout
        case USER_EXPIRED: // if oidc login expires, user data should be cleared
            return initialState
        default:
            return state
    }
}

export default update
