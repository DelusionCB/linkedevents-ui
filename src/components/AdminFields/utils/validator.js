import moment from 'moment';
import client from '../../../api/client';

/**
 * Returns validations
 * @param {Object} values
 * @param {Boolean} update
 * @returns {Promise<*>}
 */
export const validateOrg = async (values, update) => {
    const validations = new Map()
    const normalValues = update ? ['founding_date'] : ['classification', 'founding_date']
    const syncValues = ['name']

    for (const value of syncValues) {
        const validateValues = await validator(values, value,  update, true)
        if (validateValues && validateValues.error) {
            validations.set(value, validateValues)
        }
    }
    for (const value of normalValues) {
        const validateValues = await validator(values, value,  update, false)
        if (validateValues && validateValues.error) {
            validations.set(value, validateValues)
        }
    }
    return validations
}

/**
 * returns validation functions based on async -Boolean
 * @param {Object} values
 * @param {String} data
 * @param {Boolean} update
 * @param {Boolean }async
 * @returns {Promise<{error: boolean, errorMsg: string}>}
 */
export const validator = async (values, data, update, async) => {
    try {
        if (async) {
            return await asyncValidationFunc(values, data, update)
        } else {
            return normalValidationFunc(values, data)
        }
    } catch (e) {
        throw new Error();
    }
}

/**
 * Returns Promise based on type
 * @param {Object} value
 * @param {String} type
 * @returns {Promise<{}|*>}
 */
export const checkIfExists = async (value, type = '') => {
    // remove possible leading and trailing space
    const name = (value.name).trim();
    let queryParams = {exact_name: name}
    //if (type === 'origin_id') {queryParams = `${value.data_source}:${value.origin_id}`}
    if (type === 'id') {queryParams = `${value.id}`}
    try {
        let params = ['organization', queryParams]
        // if (type === 'origin_id' || type === 'id') {params = [`organization/${queryParams}`]}
        if (type === 'id') {params = [`organization/${queryParams}`]}
        let response = await client.get(...params)
        return response.data
    } catch (e) {
        return {}
    }
}

/**
 * Checks validation for async-values
 * @param {Object} values
 * @param {String} data
 * @param {Boolean} update
 * @returns {Promise<{error: boolean, errorMsg: string}>}
 */
export const asyncValidationFunc = async (values, data, update = false) => {
    const validationStatus = {
        error: false,
        errorMsg: '',
    };
    if (data === 'name') {
        // remove possible leading and trailing space
        const name = (values.name).trim();
        if (!name) {
            validationStatus.error = true;
            validationStatus.errorMsg = 'admin-error-noName';
        }
        else if (name.length < 4 || name.length > 40) {
            validationStatus.error = true;
            validationStatus.errorMsg = name.length < 4 ? 'admin-error-tooShort' : 'admin-error-tooLong';
        }
        else {
            const response = await checkIfExists(values, 'name');
            const lowerValueName = name.toLowerCase();
            const lowerDataName = (response.data[0].name).toLowerCase();
            if (update) {
                if (response.meta.count && response.data[0].id !== values.id && lowerValueName === lowerDataName) {
                    validationStatus.error = true;
                    validationStatus.errorMsg = 'admin-error-nameUsed';
                }
            }
            else if (response.meta.count && lowerValueName === lowerDataName) {
                validationStatus.error = true;
                validationStatus.errorMsg = 'admin-error-nameUsed';
            }
        }
    }
    /*
    Enable this if you allow users to create unique unique_id 's for organizations.
    else if (data === 'origin_id') {
        if (!values.origin_id) {
            validationStatus.error = true;
            validationStatus.errorMsg = 'admin-error-noId';
        }
        else if (values.origin_id.length < 4 || values.origin_id.length > 12) {
            validationStatus.error = true;
            validationStatus.errorMsg = values.origin_id.length < 4 ? 'admin-error-shortId' : 'admin-error-longId'
        }
        else if (values.data_source) {
            const response = await checkIfExists(values, 'origin_id');
            if (Object.keys(response).length) {
                validationStatus.error = true;
                validationStatus.errorMsg = 'admin-error-idUsed';
            }
        }
    }
     */
    return validationStatus;
}

/**
 * Checks validations for values
 * @param {Object} values
 * @param {String} data
 * @returns {{error: boolean, errorMsg: string}}
 */
export const normalValidationFunc = (values, data) => {
    const validationStatus = {
        error: false,
        errorMsg: '',
    };
    /*
    Enable if you allow user to change data_source
    if (data === 'data_source' && !values.data_source) {
        validationStatus.error = true
        validationStatus.errorMsg = 'admin-error-noDataSource'
    } else if (data === 'classification' && !values.classification) {

     */
    if (data === 'classification' && !values.classification) {
        validationStatus.error = true
        validationStatus.errorMsg = 'admin-error-noClassification'
    } else if (data === 'founding_date' && values.founding_date) {
        const validTime = !moment(values.founding_date, moment.ISO_8601, true).isValid()
        validationStatus.error = validTime
        validationStatus.errorMsg = validTime ? 'admin-error-incorrectDate' : ''
    }
    return validationStatus
}

export default validateOrg
