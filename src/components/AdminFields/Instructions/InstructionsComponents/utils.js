/**
 * Returns obj containing validation data for given field e.g.
 * {error: true, errorMsg: 'error-translation-id'}
 * @param {string} fieldValue 
 * @param {number} maxCharacters 
 * @param {boolean} [false] required 
 * @returns {Object} validation data obj
 */
export function getFieldValidation(fieldValue, maxCharacters, required = false){
    if(fieldValue.length > maxCharacters){
        return {
            error: true,
            errorMaxChars: true,
            errorMsg: 'validation-stringLimitReached',
        }
    }
    
    if(required && fieldValue.length === 0){
        return {error: true, errorMsg: 'validation-required'}
    }

    return {error: false, errorMsg: ''}
}

/**
 * Tells whether validation errors exist or not.
 * @param {Object} validations 
 * @returns {boolean} true when errors exist, false when not.
 */
export function hasAnyValidationErrors(validations){
    const errorValues = Object.values(validations)
    for (let index = 0; index < errorValues.length; index++) {
        if(errorValues[index].error){
            return true
        }
    }
    return false
}

/**
 * Returns initial validation data for each field e.g.
 * {fi: {error: false, errorMsg: ''}, sv: {...}, en: {...}}
 * @param {Object} fieldsToEdit 
 * @param {Object} fieldType 
 * @returns {Object} initial validation values for fields
 */
export function getValidationInitValues(fieldsToEdit, fieldType){
    const validations = {}
    Object.keys(fieldsToEdit).forEach(lang => {
        validations[lang] = getFieldValidation(fieldsToEdit[lang], fieldType.maxCharacters, true)
    });
    return validations
}

/**
 * Filters and returns given fields in given category by their type which can be either instruction
 * or button text
 * @param {Object} fieldType data obj containing info about the field in question
 * @param {string} contentType the main category of field e.g. General, Hobbies, Course
 * @param {Object[]} sideFields all sidefield data for different categories holding
 * instructions and mobile texts
 * @returns {Object} fields that are of given type
 */
export function filterSideFieldByType(fieldType, contentType, sideFields){
    const contentSideFields = getSideFieldsByContentType(contentType, sideFields)
    const sideFieldArray = Object.entries(contentSideFields)
    const filtered  = sideFieldArray.filter(([key]) => key.endsWith(fieldType.filterPhrase))
    return Object.fromEntries(filtered)
}

/**
 * Finds and returns sidefield data of given content/category type
 * @param {string} contentType the main category of field e.g. General, Hobbies, Course
 * @param {Object[]} sideFields all sidefield data for different categories holding
 * instructions and mobile texts
 * @returns {Object} single category's sidefield data
 */
export function getSideFieldsByContentType(contentType, sideFields){
    return sideFields.find(sideField => sideField.type_id && sideField.type_id === contentType)
}

/**
 * Finds and returns a sidefield's id by given sidefield typeId
 * @param {Object[]} sideFields all sidefield data for different categories holding
 * instructions and mobile texts
 * @param {string} typeId sidefield's content type id e.g. General, Hobbies, Course
 * @returns {string|undefined} id of a sidefield data set or undefined if no sideField
 * has given typeId
 */
export function getSideFieldIdByTypeId(sideFields, typeId){
    for (let index = 0; index < sideFields.length; index++) {
        const sideField = sideFields[index];
        if (sideField.type_id === typeId){
            return sideField.id
        }
    }
    return undefined
}
