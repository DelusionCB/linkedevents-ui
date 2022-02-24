import '../HelSelect.scss'

import React, {useRef, useEffect} from 'react'
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async'
import {setData as setDataAction} from '../../../actions/editor'
import {connect} from 'react-redux'
import {get, isNil} from 'lodash'
import client from '../../../api/client'
import {injectIntl} from 'react-intl'
import {getStringWithLocale} from '../../../utils/locale';
import {ariaOverrides, optionsMessageValue, screenReaderOverrideValue} from '../utils/SelectHelper'
import HelKeywordBoxes from './HelKeywordBoxes';

class KeywordSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedValue: {},
        };

        this.labelRef = React.createRef()
        this.selectInputRef = React.createRef()
    }


    /**
     * Set value to selectedValue State, if null, set selectedValue to empty object
     * because React-selects clearing of value returns null.
     * if reFetch = true, we fetch new value based on value.id & set it to state
     * to use it in HelKeywordBoxes for checkbox-mapping.
     * @param {Object} value
     * @param {Boolean} reFetch
     */
    onChange = (value, reFetch = false) => {
        if (value === null) {
            this.setState({selectedValue: {}})
        } else if (reFetch === true) {
            this.getKeywordOptions(value.id, true).then(data => {
                data.map((item) => {
                    this.setState({
                        selectedValue: item,
                    })
                })
            })
        } else {
            this.setState({selectedValue: value})
        }
    }

    getKeywordOptions = async (input, hierarchy = false) => {
        const {intl, resource, currentLocale} = this.props;
        const queryParams = {
            show_all_keywords: 1,
            data_source: 'yso',
            text: input,
            locale: currentLocale,
        }

        let request
        let options
        try {
            if (hierarchy) {
                request = await client.get(`${resource}/${input}`)
                options = [request.data]
            } else {
                request = await client.get(`${resource}`, queryParams)
                options = request.data.data
            }
            return options.map((item) => {
                return ({
                    ...this.formatKeyword(item, currentLocale, intl),
                    parents: item.parents.map((item) => {
                        return this.formatKeyword(item, currentLocale, intl)
                    }),
                    children: item.children.map((item) => {
                        return this.formatKeyword(item, currentLocale, intl)
                    }),
                })
            })
        } catch (e) {
            throw Error(e)
        }
    }

    /**
     * Takes item & formats it to return new object
     * instead of mapping every array in getKeywordOptions separately.
     * @param {Object} item
     * @param {String} currentLocale
     * @param {Object} intl
     * @returns {{ontology_type, name, id, label: string, value}}
     */
    formatKeyword = (item, currentLocale, intl) => (
        {
            value: item['@id'],
            id : item.id,
            label: getStringWithLocale(item,'name', currentLocale || intl.locale),
            ontology_type: item.ontology_type,
            name: item.name,
        }
    )

    /**
     * If inputs length is greater than 2,
     * we return options from getKeywordOptions.
     * We limit search with inputs length for better results.
     * @param {String} input
     * @returns {Promise<Object[]>}
     */
    getOptions = async (input) => {
        if (input.length > 2) {
            return this.getKeywordOptions(input)
        }
    }

    getDefaultValue = () => {
        const {selectedValue} = this.state;
        const {intl, currentLocale} = this.props;
        if (!selectedValue || Object.keys(selectedValue).length === 0) {
            return null
        }
        return ({
            label: getStringWithLocale(selectedValue,'name', currentLocale || intl.locale),
            value: selectedValue.value,
        })
    }

    /**
     * Takes label from item & formats it for React-selects AsyncSelect
     * @param {Object} item
     * @returns {JSX.Element}
     */
    formatOption = (item) => (
        <React.Fragment>
            {item.label}
        </React.Fragment>
    )

    /**
     *  Override React-selects own styles for control
     *  in order to display glyphicon & custom styling
     * @param {Array} styles
     * @returns styles
     */
    selectStyles = (styles) => (
        {...styles,
            borderColor: 'black',
            borderWidth: '2px',
            '&:hover': {
                borderColor: '#0062ae',
            },
            '&:active': {
                borderColor: '#0062ae',
            },
            '&:focus': {
                borderColor: '#0062ae',
            },
            '&::before': {
                content: '"\\e003"', fontFamily: 'Glyphicons Halflings', height: '38px', width: '38px',
                backgroundColor: '#0062ae', color: 'white',
                fontSize: '1.375rem', padding: '8px 8px 8px 8px', lineHeight: '1',
            },
        }
    )

    optionsMessage = (value) => {
        return this.props.intl.formatMessage(optionsMessageValue(value));
    }

    screenReaderOverride = (obj) => {
        return  this.props.intl.formatMessage(...screenReaderOverrideValue(obj))
    }

    render() {
        const {legend, required, intl, disabled, placeholderId, isClearable,
            optionalWrapperAttributes, currentLocale, customOnChangeHandler, keywordData,
            deleteValue, resource} = this.props;

        return (
            <div>
                <div {...optionalWrapperAttributes}>
                    <label id={legend} ref={this.labelRef}>
                        {legend}{required ? '*' : ''}
                    </label>
                    <AsyncSelect
                        classNamePrefix='keyword-search'
                        isClearable={isClearable}
                        value={this.getDefaultValue()}
                        loadOptions={this.getOptions}
                        onChange={this.onChange}
                        placeholder={intl.formatMessage({id: placeholderId})}
                        loadingMessage={() => intl.formatMessage({id: 'loading'})}
                        noOptionsMessage={({inputValue}) => this.optionsMessage(inputValue)}
                        formatOptionLabel={this.formatOption}
                        aria-label={intl.formatMessage({id: placeholderId})}
                        ref={this.selectInputRef}
                        isDisabled={disabled}
                        styles={{control: this.selectStyles}}
                        ariaLiveMessages={ariaOverrides(intl, placeholderId, resource)}
                        screenReaderStatus={this.screenReaderOverride}

                    />
                </div>
                <HelKeywordBoxes
                    deleteValue={deleteValue}
                    onValueChange={customOnChangeHandler}
                    keywords={keywordData}
                    onChange={(e) => this.onChange(e, true)}
                    currentLocale={currentLocale}
                    value={this.state.selectedValue}
                />
            </div>
        )
    }
}

KeywordSearch.defaultProps = {
    placeholderId: 'select',
    isClearable: true,
    isMultiselect: false,
    required: false,
}

KeywordSearch.propTypes = {
    intl: PropTypes.object,
    setData: PropTypes.func,
    deleteValue: PropTypes.func,
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
    keywordData: PropTypes.array,
}

const mapDispatchToProps = (dispatch) => ({
    setData: (value) => dispatch(setDataAction(value)),
})
export {KeywordSearch as UnconnectedKeywordSearch}
export default connect(null, mapDispatchToProps)(injectIntl(KeywordSearch))
