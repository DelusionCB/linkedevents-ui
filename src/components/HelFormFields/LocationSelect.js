import './HelSelect.scss'

import React, {useRef, useEffect, useState} from 'react'
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async'
import {setData as setDataAction} from '../../actions/editor'
import {connect} from 'react-redux'
import {get, isNil} from 'lodash'
import ValidationNotification from '../ValidationNotification'
import client from '../../api/client'
import {injectIntl} from 'react-intl'
import {getStringWithLocale} from '../../utils/locale';
import {ariaOverrides, optionsMessageValue, screenReaderOverrideValue} from './utils/SelectHelper';

const LocationSelect = ({
    intl,
    setData,
    isClearable,
    isMultiselect,
    setDirtyState,
    resource,
    legend,
    selectedValue,
    validationErrors,
    placeholderId,
    name,
    optionalWrapperAttributes,
    currentLocale,
    required,
    disabled,
})  => {
    const labelRef = useRef(null)
    const selectInputRef = useRef(null)


    // react-select doesnt support attributes aria-required or required
    // this is a workaround way to add aria-required to react-select
    useEffect(() => {
        if (required && selectInputRef.current) {
            selectInputRef.current.inputRef.setAttribute('aria-required', 'true');
        }
    }, [selectInputRef.current, required])

    useEffect(() => {
        if (validationErrors) {
            selectInputRef.current.inputRef.setAttribute('class', 'validation-notification')
        } else {
            selectInputRef.current.inputRef.removeAttribute('class');
        }
    }, [validationErrors])

    useEffect(() => {
        const input = document.getElementById('react-select-2-input')
        if (input) {
            const newDiv = document.createElement('div');
            const parentDiv = document.getElementById('react-select-2-input').parentElement
            parentDiv.insertBefore(newDiv, input)
        }
    }, [])


    /**
     * setData to redux for location data
     * if value is null, set the data null.
     * @param {Object} value
     */
    const onChange = (value) => {
        if (isNil(value)) {
            setData({[name]: null})
        } else {
            setData({[name]: {
                name: value.names,
                id: value.value,
                '@id': value['@id'],
                position: value.position,
            }})
        }
        if (setDirtyState) {
            setDirtyState()
        }
    }

    /**
     * Takes users input w/ & parameters and
     * returns formatted object with data
     * for usage in other functions & React-selects AsyncSelect
     * @param {String} input
     * @returns {Promise<*>}
     */
    const getLocationOptions = async (input) => {
        const queryParams = {
            show_all_places: 1,
            text: input,
        }

        try {
            const response = await client.get(`${resource}`, queryParams)
            const options = response.data.data

            return options.map(item => {
                let previewLabel = get(item, ['name', 'fi'], '')
                let itemNames = get(item, 'name', '')
                let names = {}
                const keys = Object.keys(itemNames)

                keys.forEach(lang => {
                    names[`${lang}`] = `${itemNames[`${lang}`]}`;
                });

                if (item.data_source !== 'osoite' && item.street_address) {
                    const address = getStringWithLocale(item,'street_address', currentLocale || intl.locale)

                    previewLabel = `${itemNames[`${intl.locale}`] || itemNames.fi} (${address})`;
                    keys.forEach(lang => {
                        names[`${lang}`] = `${itemNames[`${lang}`]} (${getStringWithLocale(item, 'street_address',`${lang}`)})`;
                    });
                }
                return {
                    label: previewLabel,
                    value: item.id,
                    '@id': `/v1/${resource}/${item.id}/`,
                    id: item.id,
                    n_events: item.n_events,
                    position: item.position,
                    names: names,
                }
            })
        } catch (e) {
            throw Error(e)
        }
    }

    /**
     * Returns getLocationOptions with input if input.length > 2
     * We limit search with inputs length for better results.
     * @param {String} input
     * @returns {Promise<*|undefined>}
     */
    const getOptions = async (input) => {
        if (input.length > 2) {
            return getLocationOptions(input)
        }
    }

    /**
     * if React-selects selectedValue is null or has obj.key length 0,
     * @return null, else
     * @returns {{label: string, value}|null}
     */
    const getDefaultValue = () => {
        if (!selectedValue || Object.keys(selectedValue).length === 0) {
            return null
        }
        return ({
            label: getStringWithLocale(selectedValue,'name', currentLocale || intl.locale),
            value: selectedValue.id,
        })
    }

    /**
     * Takes label & n_count from item & formats it for React-selects AsyncSelect
     * to display it in the menu
     * @param {Object} item
     * @returns {JSX.Element}
     */
    const formatOption = (item) => (
        <React.Fragment>
            {item.label}
            {item && typeof item.n_events === 'number' &&
                <small>
                    <br/>
                    {intl.formatMessage(
                        {id: `format-select-count`},
                        {count: item.n_events}
                    )}
                </small>
            }
        </React.Fragment>
    )

    /**
     *  Override React-selects own styles for control
     *  in order to display glyphicon & custom styling w/ validationErrors
     * @param {Array} styles
     * @returns styles
     */
    const invalidStyles = (styles) => (
        {...styles,
            borderColor: validationErrors ? '#ff3d3d' : 'black',
            borderWidth: '2px',
            '&:hover': {
                borderColor: validationErrors ? '#ff3d3d' : '#0062ae',
            },
            '&:active': {
                borderColor: validationErrors ? '#ff3d3d' : '#0062ae',
            },
            '&:focus': {
                borderColor: validationErrors ? '#ff3d3d' : '#0062ae',
            },
            '&::before': {
                content: '"\\e003"', fontFamily: 'Glyphicons Halflings', height: '38px', width: '38px',
                backgroundColor: validationErrors ? '#ff3d3d' : '#0062ae', color: 'white',
                fontSize: '1.375rem', padding: '8px 8px 8px 8px', lineHeight: '1',
            },
        }
    )

    const optionsMessage = (value) => {
        return intl.formatMessage(optionsMessageValue(value));
    }

    const screenReaderOverride = (obj) => {
        return  intl.formatMessage(...screenReaderOverrideValue(obj))
    }


    return (
        <div {...optionalWrapperAttributes}>
            <label id={legend} ref={labelRef}>
                {legend}{required ? '*' : ''}
            </label>
            <AsyncSelect
                classNamePrefix='location-search'
                isClearable={isClearable}
                isMulti={isMultiselect}
                value={getDefaultValue()}
                loadOptions={getOptions}
                onChange={onChange}
                placeholder={intl.formatMessage({id: placeholderId})}
                loadingMessage={() => intl.formatMessage({id: 'loading'})}
                noOptionsMessage={({inputValue}) => optionsMessage(inputValue)}
                formatOptionLabel={formatOption}
                aria-label={intl.formatMessage({id: placeholderId})}
                ref={selectInputRef}
                styles={{control: invalidStyles}}
                isDisabled={disabled}
                ariaLiveMessages={ariaOverrides(intl, placeholderId, resource)}
                screenReaderStatus={screenReaderOverride}
            />
            <ValidationNotification
                anchor={labelRef.current}
                validationErrors={validationErrors}
                className='validation-select'
            />
        </div>
    )
}

LocationSelect.defaultProps = {
    placeholderId: 'select',
    isClearable: true,
    isMultiselect: false,
    required: false,
}

LocationSelect.propTypes = {
    inputValue: PropTypes.string,
    intl: PropTypes.object,
    setData: PropTypes.func,
    name: PropTypes.string,
    isClearable: PropTypes.bool,
    isMultiselect: PropTypes.bool,
    disabled: PropTypes.bool,
    setDirtyState: PropTypes.func,
    resource: PropTypes.string,
    legend: PropTypes.string,
    validationErrors: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    selectedValue: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    placeholderId: PropTypes.string,
    ariaId: PropTypes.string,
    customOnChangeHandler: PropTypes.func,
    optionalWrapperAttributes: PropTypes.object,
    currentLocale: PropTypes.string,
    required: PropTypes.bool,
}

const mapDispatchToProps = (dispatch) => ({
    setData: (value) => dispatch(setDataAction(value)),
})
export {LocationSelect as UnconnectedLocationSelect}
export default connect(null, mapDispatchToProps)(injectIntl(LocationSelect))
