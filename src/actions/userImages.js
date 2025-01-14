import {createAction} from 'redux-actions'
import constants from '../constants'
import {setData} from './editor'
import {setFlashMsg} from './app'
import {get as getIfExists} from 'lodash'
import client from '../api/client'
import urls from '@city-assets/urls.json';
import {getParentOrgId} from '../utils/helpers';

const {USER_TYPE} = constants;

/**
 * Fetch images from the API.
 *
 * @param user
 * @param pageSize = page size, how many images do you want to display on a single page.
 * @param pageNumber
 * @returns Object
 */
async function makeImageRequest(user = {}, pageSize, pageNumber = null, publisher, activeOrganization, parentOrg) {
    const superAdminUser = user.userTyper === USER_TYPE.SUPERADMIN;
    const params = {
        page_size: pageSize,
        page: pageNumber,
        publisher: !superAdminUser ? activeOrganization : null,
        created_by: [USER_TYPE.PUBLIC].includes(user.userType) ? 'me' : null,
        parent: !superAdminUser ? parentOrg : null,
    }

    if(publisher){
        params.publisher = publisher;
    }

    const result = await client.get('image', params);

    // Append the page number to the JSON array so that it can be easily used in the pagination
    if (pageNumber !== null) {
        result.data.meta.currentPage = pageNumber;
    }

    return result;
}
async function makeFilteredImageRequest(user = {}, pageSize, pageNumber = null, filteredName = null, publisher, activeOrganization, parentOrg) {
    const superAdminUser = user.userTyper === USER_TYPE.SUPERADMIN;
    const params = {
        page_size: pageSize,
        page: pageNumber,
        image_text: filteredName,
        publisher: !superAdminUser ? activeOrganization : null,
        created_by: [USER_TYPE.PUBLIC].includes(user.userType) ? 'me' : null,
        parent: !superAdminUser ? parentOrg : null,
    }
    if(publisher){
        params.publisher = publisher;
    }

    const result = await client.get('image', params);

    // Append the page number to the JSON array so that it can be easily used in the pagination
    if (pageNumber !== null) {
        result.data.meta.currentPage = pageNumber;
    }

    return result;
}
async function makeImageRequestDefault(user = {}, pageSize, pageNumber = null, publisher) {
    const params = {
        page_size: pageSize,
        page: pageNumber,
        publisher: publisher,
        created_by: [USER_TYPE.PUBLIC].includes(user.userType) ? 'me' : null,
    }

    const result = await client.get('image', params);

    // Append the page number to the JSON array so that it can be easily used in the pagination
    if (pageNumber !== null) {
        result.data.meta.currentPage = pageNumber;
    }

    return result;
}

export function fetchUserImages(pageSize = 50, pageNumber = null, publisher = null, publicImages = false, filter = false, filterString = null) {

    if (publicImages) {
        return async (dispatch, getState) => {
            let response;
            try {
                dispatch({type: constants.REQUEST_IMAGES_AND_META});

                response = await makeImageRequestDefault({}, pageSize, pageNumber, urls.defaultImagesPublisherId);

                dispatch(receiveDefaultImagesAndMeta(response));
            } catch (error) {
                dispatch(setFlashMsg(getIfExists(response, 'detail', 'Error fetching images'), 'error', response));
                dispatch(receiveUserImagesFail(response));
                new Error(error);
            }
        };
    } if (filter) {
        return async (dispatch, getState) => {
            const {user, organizations} = getState();
            const parentOrg = getParentOrgId(organizations.data, user.activeOrganization);
            let response;

            try {
                dispatch({type: constants.REQUEST_IMAGES_AND_META});
                response = await makeFilteredImageRequest(user.data, pageSize, pageNumber, filterString, publisher, user.activeOrganization, parentOrg);
                dispatch(receiveUserImagesAndMeta(response));
            } catch (error) {
                dispatch(setFlashMsg(getIfExists(response, 'detail', 'Error fetching images'), 'error', response));
                dispatch(receiveUserImagesFail(response));
                new Error(error);
            }
        };
    } else {
        return async (dispatch, getState) => {
            const {user, organizations} = getState();
            const parentOrg = getParentOrgId(organizations.data, user.activeOrganization);
            let response;

            try {
                dispatch({type: constants.REQUEST_IMAGES_AND_META});
                response = await makeImageRequest(user.data, pageSize, pageNumber, publisher, user.activeOrganization, parentOrg);

                dispatch(receiveUserImagesAndMeta(response));
            } catch (error) {
                dispatch(setFlashMsg(getIfExists(response, 'detail', 'Error fetching images'), 'error', response));
                dispatch(receiveUserImagesFail(response));
                new Error(error);
            }
        };
    }
}

export function selectImage(image) {
    return {
        type: constants.SELECT_IMAGE_BY_ID,
        img: image,
    }
}

/**
 * An action for fetching both images and meta data, that holds the next / previous page information and image count.
 *
 * @param response
 * @returns Object
 */
export function receiveUserImagesAndMeta(response) {
    return {
        type: constants.RECEIVE_IMAGES_AND_META,
        items: response.data.data,
        meta: response.data.meta,
    }
}

export function receiveDefaultImagesAndMeta(response) {
    return {
        type: constants.RECEIVE_DEFAULT_IMAGES,
        items: response.data.data,
        meta: response.data.meta,
    }
}

export function receiveUserImagesFail(response) {
    return {
        type: constants.RECEIVE_IMAGES_ERROR,
        items: [],
    }
}

export function imageUploadFailed(json) {
    return {
        type: constants.IMAGE_UPLOAD_ERROR,
        data: json,
    }
}

export function imageUploadComplete(json) {
    return {
        type: constants.IMAGE_UPLOAD_SUCCESS,
        data: json,
    }
}

export function postImage(formData, user, imageId = null) {
    return async (dispatch) => {
        try {
            let request;

            // Use PUT when updating the existing image metadata, use POST when adding a new image.
            if (imageId) {
                request = await client.put(`image/${imageId}`, formData);
            } else {
                request = await client.post(`image/`, formData);

                // Append uploaded image data to the form
                dispatch(setData({'image': request.data}));
            }

            dispatch(imageUploadComplete(request));
            dispatch(setFlashMsg(imageId ? 'image-update-success' : 'image-creation-success', 'success', request))

            // Update image listing
            dispatch(fetchUserImages());
        } catch (error) {
            dispatch(setFlashMsg('image-creation-error', 'error'));

            dispatch(imageUploadFailed(error));

            new Error(error);
        }
    }
}

export function deleteImage(selectedImage, user) {
    return async (dispatch) => {
        try {
            const request = await client.delete(`image/${selectedImage.id}`);

            // Update form image value
            dispatch(setData({'image': null}));

            dispatch(setFlashMsg('image-deletion-success', 'success', ''));

            // Update image listing
            dispatch(fetchUserImages());
        } catch (error) {
            dispatch(setFlashMsg('image-deletion-error', 'error', error));

            new Error(error);
        }
    }
}
