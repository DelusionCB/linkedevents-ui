import './index.scss'
import React from 'react';
import PropTypes from 'prop-types'
import {injectIntl} from 'react-intl';
import {executeSendRequestOrg as executeSendRequestOrgAction} from '../../../../actions/admin';
import {connect} from 'react-redux';
import OrganizationSelect from '../../utils/OrganizationSelect';
import {Button} from 'reactstrap';
import moment from 'moment';
import CustomSelect from '../../utils/CustomSelect';
import CustomTextField from '../../utils/CustomTextField';
import {validateOrg} from '../../utils/validator';
import CustomDateSelector from '../../utils/CustomDateSelector';
import client from '../../../../api/client';

class OrganizationEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: false,
            validationErrors: {},
            classifications: [],
            organizationData: {
                name: '',
                data_source: 'system',
                id: '',
                classification: '',
                internal_type: 'normal',
                founding_date: '',
                parent_organization: '',
            },
        }
    }

    componentDidMount() {
        this.setOrg()
        this.fetchAdminOptions()
    }

    async componentDidUpdate(prevProps, prevState) {
        const {errors, organizationData} = this.state;
        const {mode} = this.props;

        if (errors && prevState.organizationData !== organizationData) {
            // Update validation on every value change, all values are checked for changes.
            const validationCheck = await validateOrg(organizationData, mode === 'edit')
            const newState = {validationErrors: validationCheck};
            if (errors && validationCheck.size === 0) {
                newState.errors = false;
            }
            this.setState(newState);
        }
    }

    /**
     * Sets organization to state if mode is edit
     */
    setOrg = () => {
        const {organization, mode} = this.props;
        if (mode === 'edit') {
            this.setState({
                organizationData: {
                    id: organization.id,
                    name: organization.name,
                    data_source: organization.data_source,
                    classification: organization.classification,
                    internal_type: organization.internal_type,
                    founding_date: organization.founding_date,
                    parent_organization: organization.parent_organization,
                },
            })
        }
    }

    /**
     * Sets values to state
     * @param {String} name
     * @param {Object} e
     */
    onChange = (name, e) => {
        const values = ['name', 'data_source', 'classification', 'internal_type', 'origin_id']
        const useValue = values.includes(name);
        let newValue = e;
        if (useValue) {newValue = newValue.target.value}
        if (name === 'founding_date') { newValue = moment(e).tz('Europe/Helsinki').utc(e, 'YYYY-MM-DD').format('YYYY-MM-DD')}
        this.setState({
            organizationData: {
                ...this.state.organizationData,
                [name]: newValue,
            },
        })
    }

    /**
     * @param {Boolean} disabled
     * @returns {Boolean}
     */
    setDisabled = (disabled = false) => {
        const {mode} = this.props;
        const edit = mode === 'edit';
        return disabled && edit
    }

    /**
     * Returns organization_classes & set them to state
     * @returns setState
     */
    fetchAdminOptions = async () => {
        try {
            const response = await client.get('organization_class')
            return this.setState({classifications: response.data.data})
        } catch (e) {
            throw Error(e)
        }
    }

    /**
     * Checks if validation.length 0, dispatch, else setStates
     * @returns {Promise} || setState
     */
    dispatchData = async () => {
        const {mode, orgMode} = this.props;
        const {organizationData} = this.state;

        const validationCheck = await validateOrg(organizationData, mode === 'edit')
        if (validationCheck.size === 0) {
            this.props.executeSendRequestOrg(organizationData, mode === 'edit').then(() => {
                orgMode('cancel')
            })
        } else {
            return this.setState({errors: true, validationErrors: validationCheck})
        }
    }

    /**
     * Returns validation for name
     * @param {string} name
     * @returns {boolean}
     */
    validateValues = (name) => {
        const {errors, validationErrors} = this.state;
        if (errors) {
            return validationErrors.get(name)
        }
    }

    render() {
        const {orgMode, intl} = this.props;
        const {organizationData, errors} = this.state;

        return (
            <div className='organization-form'>
                <div className='value-row'>
                    <CustomTextField
                        id='admin-datasource'
                        label='admin-org-datasource'
                        value={organizationData.data_source}
                        disabled={true}
                    />
                </div>
                <div className='value-row'>
                    <CustomTextField
                        id='admin-internal'
                        label='admin-org-internal'
                        value={organizationData.internal_type}
                        disabled={true}
                    />
                </div>
                <div className='value-row'>
                    <CustomSelect
                        options={this.state.classifications}
                        label='admin-org-classification'
                        id='classification'
                        required={true}
                        onChange={e => this.onChange('classification', e)}
                        value={organizationData.classification}
                        disabled={this.setDisabled(true)}
                        validation={this.validateValues('classification')}
                    />
                </div>
                {/*
                Enable this, if you want user to change internal_type
                Update CustomSelects formatOptions for internal_types options
                <div className='value-row'>
                    <CustomSelect
                        label='admin-org-internal'
                        required={false}
                        id='internal_type'
                        onChange={e => this.onChange('internal_type', e)}
                        value={organizationData.internal_type}
                        disabled={this.setDisabled()}
                        validation={this.validateValues('internal_type')}
                    />
                </div>
                */}
                <div className='value-row'>
                    <CustomTextField
                        id='admin-name'
                        required={true}
                        label='admin-org-name'
                        onChange={e => this.onChange('name', e)}
                        placeholder='admin-org-name'
                        value={organizationData.name}
                        disabled={this.setDisabled()}
                        validation={this.validateValues('name')}
                    />
                </div>
                {/*
                Enable this, if you want users to create their own unique origin_id.
                Add origin_id to onChange- functions array of strings
                See ../utils/validation.js for validation
                <div className='value-row'>
                    {mode !== 'edit' &&
                        <CustomTextField
                            required={mode === 'add'}
                            label='admin-org-originid'
                            onChange={e => this.onChange('origin_id', e)}
                            placeholder='admin-org-originid'
                            value={organizationData.origin_id}
                            disabled={this.setDisabled(true)}
                            id='origin_id'
                            validation={this.validateValues('origin_id')}
                        />
                    }
                </div>
                */}
                <div className='value-row'>
                    <CustomDateSelector
                        name='founding_date'
                        id="founding_date"
                        label='admin-org-founding'
                        onChange={(e) => this.onChange('founding_date', e)}
                        value={organizationData.founding_date}
                        disabled={this.setDisabled()}
                        validation={this.validateValues('founding_date')}
                    />
                </div>
                <div className='value-row'>
                    <OrganizationSelect label={intl.formatMessage({id: 'admin-org-child'})} disabled={this.setDisabled()} name='parent_organization'
                        getSelectedOrg={(e) => this.onChange('parent_organization', e)} selectedValue={organizationData.parent_organization}/>
                </div>
                <div className='button-controls'>
                    <Button disabled={errors} onClick={() => this.dispatchData()}>{intl.formatMessage({id: 'admin-org-save'})}</Button>
                    <Button onClick={() => orgMode('cancel')}>{intl.formatMessage({id: 'admin-org-cancel'})}</Button>
                </div>
                {errors && <p className='red-alert' role='status'>{intl.formatMessage({id: 'admin-org-errors'})}</p>}
            </div>
        )
    }
}

OrganizationEditor.propTypes = {
    intl: PropTypes.object,
    organization: PropTypes.object,
    executeSendRequestOrg: PropTypes.func,
    mode: PropTypes.string,
    orgMode: PropTypes.func,
}

const mapDispatchToProps = (dispatch) => ({
    executeSendRequestOrg: (orgValues, updatingOrganization) => dispatch(executeSendRequestOrgAction(orgValues, updatingOrganization)),
})

export default connect(null, mapDispatchToProps)(injectIntl(OrganizationEditor))
