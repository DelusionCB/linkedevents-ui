import constants from '../../constants'
import updater from 'immutability-helper';

const initialState = {
    data: {},
}

function update(state = initialState, action) {
    if (action.type === constants.ADMIN.SET_SIDEFIELD_DATA) {
        const newValues = updater(state, {
            data: {
                $merge: action.values,
            },
        })
        return Object.assign({}, state, {
            newValues,
        })
    }
    if (action.type === constants.ADMIN.REPLACE_SIDEFIELDS) {
        const newValues = updater(state, {
            data: {
                $set: action.values,
            },
        })
        return Object.assign({}, state, {
            newValues,
        })
    }
    if (action.type === constants.ADMIN.CLEAR_SIDEFIELDS) {
        return Object.assign({}, state, {
            data: {
                $set: {},
            },
        })
    }
    return state
}

export default update
