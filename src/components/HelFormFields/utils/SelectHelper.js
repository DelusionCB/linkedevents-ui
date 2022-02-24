
export const ariaOverrides = (intl, placeholderId, resource) => {
    return {
        guidance: ({isSearchable, isMulti, isDisabled, tabSelectsValue, context}) => {
            switch (context) {
                case 'menu':
                    return `${intl.formatMessage({id: 'select-menu-choose'})} ${
                        !isDisabled && intl.formatMessage({id: 'select-menu-disabled'})
                    } ${intl.formatMessage({id: 'select-menu-exit'})} ${
                        tabSelectsValue && resource === 'keyword' ?
                            intl.formatMessage({id: 'select-menu-tab-keyword'})
                            :
                            intl.formatMessage({id: 'select-menu-tab'})
                    }.`;
                case 'input':
                    return `${intl.formatMessage({id: placeholderId})} ${intl.formatMessage({id: 'select-input-isfocused'})} ${
                        isSearchable && intl.formatMessage({id: 'select-input-search'})
                    } ${intl.formatMessage({id: 'select-input-open'})} ${
                        isMulti && intl.formatMessage({id: 'select-input-isMulti'})
                    }`;
                case 'value':
                    return isMulti && intl.formatMessage({id: 'select-value-isMulti'});
                default:
                    return '';
            }
        },

        onChange: ({label, action, labels, isDisabled}) => {
            switch (action) {
                case 'deselect-option':
                case 'pop-value':
                case 'remove-value':
                    return intl.formatMessage({id: 'select-deselect-value'}, {label: label});
                case 'clear':
                    return intl.formatMessage({id: 'select-clear'});
                case 'initial-input-focus':
                    return intl.formatMessage({id: 'select-input-focus'}, {labels: labels.join(',')})
                case 'select-option':
                    return isDisabled
                        ? intl.formatMessage({id: 'select-option-disabled'}, {label: label})
                        : intl.formatMessage({id: 'select-option-selected'}, {label: label})
                default:
                    return '';
            }
        },

        onFocus: ({context, focused, isDisabled, isSelected, label, options, selectValue}) => {
            const getArrayIndex = (arr,item = options) =>
                arr && arr.length ? intl.formatMessage({id: 'select-length'}, {length: arr.length, index: arr.indexOf(item) + 1}) : '';
            if (context === 'menu') {
                const disabled = isDisabled ? intl.formatMessage({id: 'select-disabled'}) : '';
                const status = isSelected ? intl.formatMessage({id: 'select-selected'}) : intl.formatMessage({id: 'select-focused'}, {disabled: disabled});
                return intl.formatMessage({id: 'select-menu-option'}, {label: label, status: status, number: getArrayIndex(selectValue, focused)})
            }
            if (context === 'value' && selectValue) {
                return intl.formatMessage({id: 'select-value-selectValue'}, {label: label, number: getArrayIndex(selectValue, focused)})
            }
            return '';
        },

        onFilter: ({inputValue, resultsMessage}) => {
            return inputValue && intl.formatMessage({id: 'select-results'}, {results: resultsMessage, input: inputValue})
        },
    }
}


/**
 * Returns object with correct id value depending on value.length
 * @param {Object[]} value
 * @returns {{id: (string)}}
 */
export const optionsMessageValue = (value = []) => {
    return {
        id: value.length > 2 ? 'search-no-results' : 'search-minimum-length',
    };
};

/**
 * Returns object for screenReaderOverride
 * @param {Object} value
 * @returns {[{id: string}, {count}]}
 */
export const screenReaderOverrideValue = (value) => {
    return [{id: 'select-reader'}, {count: value.count}];
};

