import '../Organizations/OrganizationPermissions/index.scss'
import React from 'react';
import PropTypes from 'prop-types'
import {injectIntl, intlShape} from 'react-intl';
import AsyncSelect from 'react-select/async';
import client from '../../../api/client';
import {optionsMessageValue} from '../../HelFormFields/utils/SelectHelper';

class OrganizationSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
        }
    }

    /**
     * passes value to props.getSelectedOrg
     * @param {Object} value
     */
    onChange = (value) => {
        if (this.props.name === 'name') {
            this.props.getSelectedOrg(value)
        }
        if (this.props.name === 'parent_organization') {
            this.props.getSelectedOrg(value)
        }
        if (this.props.name === 'userOrg') {
            this.props.getSelectedOrg(value)
        }
    }

    /**
     * Takes users input w/ & parameters and
     * returns formatted object with data
     * for usage in other functions
     * @param {String} input
     * @returns {Promise<*>}
     */
    getOrganizationOptions = async (input) => {
        const queryParams = {
            name: input,
            include: 'parent_organization, sub_organizations',
        }
        try {
            const response = await client.get(`organization`, queryParams)
            const options = response.data.data
            return options.map(item => {
                if (this.props.name !== 'userOrg') {
                    return {
                        data_source: item.data_source,
                        classification: item.classification,
                        name: item.name,
                        founding_date: item.founding_date,
                        parent_organization: item.parent_organization,
                        sub_organizations: item.sub_organizations,
                        id: item.id,
                        '@id': item['@id'],
                    }
                } else {
                    return {
                        name: item.name,
                        id: item.id,
                    }
                }
            })
        } catch (e) {
            throw Error(e)
        }
    }

    /**
     * Returns getOrganizationOptions with input if input.length > 3
     * We limit search with inputs length for better results.
     * @param {String} input
     * @returns {Promise<*|undefined>}
     */
    getOptions = async (input) => {
        if (input.length > 3) {
            return this.getOrganizationOptions(input)
        }
    }

    /**
     * if React-selects selectedValue is null or has obj.key length 0,
     * @return null, else
     * @returns {{name,value}|null}
     */
    getDefaultValue = () => {
        const {selectedValue, name, organizations} = this.props;
        if (!selectedValue) {
            return null
        }
        if (name === 'name' || name === 'userOrg') {
            return ({
                name: selectedValue,
                value: selectedValue,
            })
        }
        if(name === 'parent_organization'){
            const orgId = selectedValue.split('/').findLast((item)=> item !== ''),
                organization = organizations.find((org) => org.id === orgId)

            return({
                name: organization.name,
                value: organization['@id'],
            })
        }
        return ({
            name: selectedValue.name,
            value: selectedValue['@id'],
        })
    }

    /**
     * Takes label from item & formats it for React-selects AsyncSelect
     * to display it in the menu
     * @param {Object} item
     * @returns {JSX.Element}
     */
    formatOption = (item) => (
        <React.Fragment>
            {item.name}
        </React.Fragment>
    )

    optionsMessage = (value) => {
        return this.props.intl.formatMessage(optionsMessageValue(value));
    }

    render() {
        const {label} = this.props;
        return (
            <div>
                <label htmlFor='select'>{label}</label>
                <AsyncSelect
                    classNamePrefix='user-search'
                    isClearable={false}
                    defaultOptions={true}
                    value={this.getDefaultValue()}
                    loadOptions={this.getOptions}
                    onChange={this.onChange}
                    placeholder={this.props.intl.formatMessage({id: 'select'})}
                    loadingMessage={() => this.props.intl.formatMessage({id: 'loading'})}
                    noOptionsMessage={({inputValue}) => this.optionsMessage(inputValue)}
                    formatOptionLabel={this.formatOption}
                    aria-label={this.props.intl.formatMessage({id: 'select'})}
                    isDisabled={this.props.disabled}
                    inputId='select'
                />
            </div>
        );
    }
}

OrganizationSelect.propTypes = {
    intl: PropTypes.oneOfType([
        PropTypes.object,
        intlShape.isRequired,
    ]),
    user: PropTypes.object,
    admin: PropTypes.object,
    selectedValue: PropTypes.string,
    name: PropTypes.string,
    disabled: PropTypes.bool,
    getSelectedOrg: PropTypes.func,
    label: PropTypes.string,
    organizations: PropTypes.array,
}
export {OrganizationSelect as UnconnectedOrganizationSelect}
export default injectIntl(OrganizationSelect)
