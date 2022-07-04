import {find} from 'lodash'
import {getStringWithLocale} from './locale'

export function mapKeywordSetToForm(keywordSets, id, locale = 'fi') {
    let keywordSet = find(keywordSets, {'id': id})
    if(keywordSet && keywordSet.keywords) {
        return keywordSet.keywords.map((item) => {
            let label = getStringWithLocale(item, 'name', locale)
            // we don't want yso parentheses visible in keyword sets, so only pick the part before them
            label = label.split([' ('])[0]
            return {
                value: item['@id'],
                label: label,
                name: item.name,
            }
        })
    }

    else {
        return []
    }
}

export function mapPaymentMethodsToForm(paymentMethods, locale = 'fi') {
    if(paymentMethods) {
        return paymentMethods.map((item) => {
            let label = getStringWithLocale(item, 'name', locale)
            label = label.split([' ('])[0]
            return {
                value: item['@id'],
                label: label,
                name: item.name,
            }
        })
    }
    else {
        return []
    }
}

export function mapLanguagesSetToForm(set, locale = 'fi') {
    if(set && set.length) {
        return set.map((item) => {
            let label = getStringWithLocale(item, 'name', locale, item.id)
            return {
                value: item['@id'],
                label: label,
            }
        })
    }

    else {
        return []
    }
}

export function mapSideFieldsToForm(allSidefields, typeId = 'General', locale = 'fi') {
    let sideFieldDataForType = find(allSidefields, {'type_id': typeId})
    const myFields = ['category', 'keyword', 'location', 'offers', 'times', 'umbrella']
    let mappedFields = {}
    if (!sideFieldDataForType) {
        // side field data is missing for some reason, fill content accordingly..
        myFields.forEach(field => {
            mappedFields[field] = {content: '', mobileHeader: ''}
        });
    } else {
        myFields.forEach(field => {
            // fill each field with content and mobile header
            // handle and fill missing field content accordingly
            mappedFields[field] = {
                content: `${field}_sidefield` in sideFieldDataForType ? sideFieldDataForType[`${field}_sidefield`][locale] || '' : '',
                mobileHeader: `${field}_mobile` in sideFieldDataForType ? sideFieldDataForType[`${field}_mobile`][locale] || '' : '',
            }
        });
    }
    return mappedFields
}
