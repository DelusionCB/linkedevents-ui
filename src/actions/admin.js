import constants from '../constants'
import client from '../api/client';
import {setFlashMsg} from './app';
import {sendDataComplete,setLoading} from './editor';
import {scrollToTop} from '../utils/helpers';


export async function makeOrgUserRequest(id, pageSize, pageNumber = null, filter) {
    const params = {
        organization: id,
        page_size: pageSize,
        page: pageNumber,
        full_name: filter,
    }
    try {
        const response = await client.get('user', params);

        // Append the page number to the JSON array so that it can be easily used in the pagination
        if (pageNumber !== null) {
            response.data.meta.currentPage = pageNumber;
        }
        return response.data
    } catch (e) {
        throw Error(e)
    }
}

// Fetch AdminOptions
export const fetchAdminOptions = () => async (dispatch) => {
    try {
        const responseOne = await client.get('organization_class')
        const options = responseOne.data.data
        dispatch(receiveAdminOptions(options))
    } catch (e) {
        throw Error(e)
    }
}

// Receive AdminOptions
export const receiveAdminOptions = (data) => {
    return {
        type: constants.ADMIN.RECEIVE_ADMINDATA,
        data,
    }
}

export const formatValues = (data, updating) => {

    if (data.sub_organizations && data.sub_organizations.length !== 0) {
        data.sub_organizations = data.sub_organizations.reduce((acc, curr) => {
            acc.push(curr['@id'])
            return acc
        }, [])
    }
    if (!data.parent_organization.length) {
        data.parent_organization = undefined
    }
    if (data.founding_date === '') {
        data.founding_date = undefined
    }
    if (!updating) {
        data.origin_id = ''
    }
    data.affiliated_organizations = []
    data.replaced_by = ''
    return data
}


export const executeSendRequestOrg = (
    orgValues,
    updatingOrganization,
) => async (dispatch) => {

    let preparedOrgValues

    if (!orgValues) {
        return
    } else {
        preparedOrgValues = formatValues(orgValues, updatingOrganization)
    }


    try {
        const url = updatingOrganization
            ? `organization/${orgValues.id}/`
            : 'organization/'

        const response = updatingOrganization
            ? await client.put(url, preparedOrgValues)
            : await client.post(url, preparedOrgValues)


        let data = response.data
        // validation errors
        if (response.status === 400) {
            data.apiErrorMsg = 'validation-error'
            data.response = response
        }

        // auth errors
        if (response.status === 401 || response.status === 403) {
            data.apiErrorMsg = 'authorization-required'
            data.response = response
        }
        if (response.status === 201 || response.status === 200) {
            data.apisuccessMsg = updatingOrganization ? 'admin-org-updated' : 'admin-org-created'
        }

        dispatch(sendOrgComplete(data))
    } catch (error) {
        dispatch(setFlashMsg('server-error', 'error', error))
        dispatch(setLoading(false))
        new Error(error)
    }
}

export const executeSendRequestUser = (
    userValues,
) => async (dispatch) => {

    let preparedUserValues

    if (!userValues) {
        return
    } else {
        preparedUserValues = userValues
    }


    try {
        const url = `user/${userValues.username}/update_organization_levels`

        preparedUserValues.username = undefined
        const response = await client.put(url, preparedUserValues)


        let data = response.data

        // validation errors
        if (response.status === 400) {
            data.apiErrorMsg = 'validation-error'
            data.response = response
        }

        // auth errors
        if (response.status === 401 || response.status === 403) {
            data.apiErrorMsg = 'authorization-required'
            data.response = response
        }
        if (response.status === 200) {
            data.apisuccessMsg =  'admin-user-updated'
        }
        dispatch(sendOrgComplete(data))
    } catch (error) {
        dispatch(setFlashMsg('server-error', 'error', error))
        dispatch(setLoading(false))
        new Error(error)
    }
}

export const sendOrgComplete = (data) => (dispatch) => {
    const error = data.apiErrorMsg;
    const flashMsg = {
        msg: error || data.apisuccessMsg,
        style: error ? 'error' : 'message',
        data: data,
    }
    dispatch(setFlashMsg(flashMsg.msg, flashMsg.style, flashMsg.data))
    if (!error) {
        scrollToTop()
    }
}
