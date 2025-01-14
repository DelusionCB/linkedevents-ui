import {get} from 'lodash'
import constants from '../constants';

/**
 * A safe getter for multi language field
 *
 * Example usage:
 * // let label = getStringWithLocale(this.props, 'editor.values.name', 'fi')
 *
 * @param  {object} obj    multi language field
 * @param  {string} fieldPath  string path for the field
 * @param  {string} locale 'fi', 'sv' or 'en'
 * @param  {string} defaultValue
 * @return {string} language string
 */
export function getStringWithLocale(obj, fieldPath = '', locale = 'fi', defaultValue = '') {
    let field = get(obj, fieldPath, {})

    if (typeof field === 'object' && field) {
        return field[locale] || field.fi || field.sv || field.en || defaultValue
    }

    return defaultValue
}


/**
 * Returns locale_type string based on value
 * @param {string} value
 * @returns {string}
 */

export function getEventLanguageType(value) {
    switch (value) {
        case constants.EVENT_TYPE.HOBBIES: {
            return constants.LOCALE_TYPE.HOBBY
        }
        case constants.EVENT_TYPE.GENERAL: {
            return constants.LOCALE_TYPE.EVENT
        }
        case constants.EVENT_TYPE.COURSE: {
            return constants.LOCALE_TYPE.COURSE
        }
        default: {
            return constants.LOCALE_TYPE.EVENT
        }
    }
}

/**
 * Save locale to localStorage
 * @example
 * localStorage.setItem('userLocale',locale)
 * @param {string} locale
 * @returns {void|undefined}
 */
export function saveLocaleToLocalStorage(locale) {
    try {
        return locale && typeof locale === 'string' ? localStorage.setItem('userLocale', locale) : undefined;
    } catch(err) {
        return undefined;
    }
}

/**
 * Load locale from localStorage
 * @example
 * localStorage.getItem('userLocale')
 * @returns {string|undefined}
 */
export function loadLocaleFromLocalStorage() {
    try {
        const locale = localStorage.getItem('userLocale');
        if (locale === null) {
            return undefined;
        }
        return locale;
    } catch(err) {
        return undefined;
    }
}
