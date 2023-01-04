import constants from '../constants.js'
import {set, get} from 'lodash'
import {setEditorAuthFlashMsg} from './editor'
import client from '../api/client'
import {getAdminOrganizations, getRegularOrganizations, getPublicOrganizations} from '../utils/user'
import store from '../store.js'

const {RECEIVE_USERDATA, CLEAR_USERDATA, USER_TYPE, FETCHING_USERDATA, SET_ACTIVE_ORGANIZATION} = constants

// Handled by the user reducer
export function receiveUserData(data) {
    return {
        type: RECEIVE_USERDATA,
        payload: data,
    }
}

// Handled by the user reducer
export function clearUserData() {
    return {
        type: CLEAR_USERDATA,
    }
}

/**
 * Set user.isFetching boolean
 * @param {boolean} data
 * @returns {{payload: boolean, type: string}}
 */
export function loadingUser(data) {
    return {
        type: FETCHING_USERDATA,
        payload: data,
    }
}

export function setActiveOrganization (org) {
    return {
        type: SET_ACTIVE_ORGANIZATION,
        payload: org,
    }
}
const getUserType = (permissions) => {
    if (permissions.includes(USER_TYPE.SUPERADMIN)) {
        return USER_TYPE.SUPERADMIN
    }
    if (permissions.includes(USER_TYPE.ADMIN)) {
        return USER_TYPE.ADMIN
    }
    if (permissions.includes(USER_TYPE.REGULAR)) {
        return USER_TYPE.REGULAR
    }
    if (permissions.includes(USER_TYPE.PUBLIC)) {
        return USER_TYPE.PUBLIC
    }
}

// Handles getting user data from backend api with given id.
export const fetchUser = (id) => async (dispatch) => {
    try {
        dispatch(loadingUser(true))
        // try to get user data from user endpoint
        const userResponse = await client.get(`user/${id}`)
        const userData = userResponse.data
        // add correct permissions to user based on user's organizations
        const permissions = []

        const state = store.getState();
        const {user:{activeOrganization}} = state;
        const adminInOrgs = get(userData, 'admin_organizations', [])
        const regularInOrgs = get(userData, 'organization_memberships', [])
        const publicOrgs = get(userData, 'public_memberships', [])
        const activeOrgId = activeOrganization ?? userData.organization;

        if (adminInOrgs.length > 0 && (adminInOrgs).includes(activeOrgId)) {
            permissions.push(USER_TYPE.ADMIN)
        }
        if (regularInOrgs.length > 0 && (regularInOrgs).includes(activeOrgId)) {
            permissions.push(USER_TYPE.REGULAR)
        }
        if (publicOrgs.length > 0 && (publicOrgs).includes(activeOrgId)) {
            permissions.push(USER_TYPE.PUBLIC)
        }
        if (get(userData, 'is_superuser', false)) {
            permissions.push(USER_TYPE.SUPERADMIN)
        }


        // add all desired user data in an object which will be stored into redux store
        const mergedUser = {
            id: get(userData, 'uuid', null),
            displayName: get(userData, 'display_name', null),
            firstName: get(userData, 'first_name', null),
            lastName: get(userData, 'last_name', null),
            username: get(userData, 'username', null),
            email: get(userData, 'email', null),
            organization: get(userData, 'organization', null),
            adminOrganizations: get(userData, 'admin_organizations', null),
            organizationMemberships: get(userData, 'organization_memberships', null),
            publicMemberships: get(userData, 'public_memberships', null),
            permissions,
            userType: getUserType(permissions),
        }

        const adminOrganizations = await Promise.all(getAdminOrganizations(mergedUser))
        const regularOrganizations = await Promise.all(getRegularOrganizations(mergedUser))
        const publicOrganizations = await Promise.all(getPublicOrganizations(mergedUser))
        // store data of all the organizations that the user is admin in
        mergedUser.adminOrganizationData = adminOrganizations
            .reduce((acc, organization) => set(acc, `${organization.data.id}`, organization.data), {})
        // store data of all the organizations where the user is a regular user
        mergedUser.regularOrganizationData = regularOrganizations
            .reduce((acc, organization) => set(acc, `${organization.data.id}`, organization.data), {})
        // store data of all the organizations where the user is public user
        mergedUser.publicOrganizationData = publicOrganizations
            .reduce((acc, organization) => set(acc, `${organization.data.id}`, organization.data), {})
        // get organizations with regular users
        mergedUser.organizationsWithRegularUsers = adminOrganizations
            .filter(organization => get(organization, ['data', 'has_regular_users'], false))
            .map(organization => organization.data.id)
        dispatch(setActiveOrganization(activeOrgId))
        dispatch(receiveUserData(mergedUser))
        dispatch(setEditorAuthFlashMsg())
    } catch (e) {
        dispatch(loadingUser(false))
        throw Error(e)
    }
}
