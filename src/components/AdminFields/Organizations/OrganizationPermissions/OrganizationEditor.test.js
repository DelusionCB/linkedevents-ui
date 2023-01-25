import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import {Button} from 'reactstrap';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {mockOrganizations, mockOrgClassifications} from '../../../../../__mocks__/mockData';
import OrganizationSelect from '../../utils/OrganizationSelect';
import CustomSelect from '../../utils/CustomSelect';
import CustomTextField from '../../utils/CustomTextField';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
import {UnconnectedOrganizationEditor} from './OrganizationEditor';

const organizationData = {
    classification: 'org:3',
    data_source: 'turku',
    founding_date: null,
    id: 'turku:4032',
    internal_type: undefined,
    name: 'Ammatillinen koulutus',
    parent_organization: 'http://localhost:8006/v1/organization/turku:40/',
}

const selectedOrganization = {
    classification: 'org:3',
    data_source: 'turku',
    founding_date: null,
    id: 'turku:853',
    name: 'Turun kaupunki',
    parent_organization: null,
    internal_type: null,
}

const defaultProps = {
    intl: intl,
    organization: {},
    executeSendRequestOrg: jest.fn(),
    mode: 'edit',
    orgMode: jest.fn(),
    organizations: mockOrganizations,
}

const validations = new Map(),
    validationErrors = validations.set('name', {error: true, errorMsg: 'admin-error-nameUsed'});

function getWrapper(props) {
    return shallow(<UnconnectedOrganizationEditor {...defaultProps} {...props} />, {context: {intl}});
}

describe('renders', () => {
    describe('element', () => {
        test('dev containing organization-form', () => {
            const wrapper = getWrapper();
            const div = wrapper.find('.organization-form');
            expect(div).toHaveLength(1);
        })
        test('OrganizationSelect', () => {
            const wrapper = getWrapper();
            const organizationSelect = wrapper.find(OrganizationSelect);
            expect(organizationSelect).toHaveLength(1);
        })
        test('OrganizationSelect with correct props', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();
            instance.setState({organizationData, errors: false})
            const organizationSelect = wrapper.find(OrganizationSelect);
            expect(organizationSelect.prop('organizations')).toBe(defaultProps.organizations);
            expect(organizationSelect.prop('label')).toBe(intl.formatMessage({id: 'admin-org-child'}));
            expect(organizationSelect.prop('name')).toBe('parent_organization');
            expect(organizationSelect.prop('selectedValue')).toBe(organizationData.parent_organization);
            expect(organizationSelect.prop('getSelectedOrg')).toBeDefined();
        })
        test('customFields', () => {
            const wrapper = getWrapper();
            const customeFields = wrapper.find('.value-row');
            expect(customeFields).toHaveLength(6);
        })

        test('controlButtons', () => {
            const wrapper = getWrapper();
            const buttons = wrapper.find('.button-controls').find(Button);
            expect(buttons).toHaveLength(2);
        })
        test('adminOrgErrors', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();
            instance.setState({errors: true, validationErrors})
            const errorElement = wrapper.find('.red-alert');
            expect(errorElement).toHaveLength(1);
        })
        test('organization class with correct props', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();
            instance.setState({organizationData, errors: false, classifications: mockOrgClassifications})
            const orgClassSelect = wrapper.find(CustomSelect);
            expect(orgClassSelect).toHaveLength(1);
            expect(orgClassSelect.prop('options')).toBe(mockOrgClassifications);
            expect(orgClassSelect.prop('label')).toBe('admin-org-classification');
            expect(orgClassSelect.prop('id')).toBe('classification');
            expect(orgClassSelect.prop('required')).toBe(true);
            expect(orgClassSelect.prop('onChange')).toBeDefined();
            expect(orgClassSelect.prop('value')).toBe(organizationData.classification);
            expect(orgClassSelect.prop('disabled')).toBeDefined();
            expect(orgClassSelect.prop('validation')).toBeUndefined();
        })
        test('CustomTextField to have correct number', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();
            instance.setState({organizationData, errors: false})
            const textFields = wrapper.find(CustomTextField);
            expect(textFields).toHaveLength(3);
        })
    })

    describe('methods', () => {  
        describe('componentDidMount', () => {
            const wrapper = getWrapper({organization: selectedOrganization})
            const instance = wrapper.instance()
            const fetchAdminOptions = jest.spyOn(instance, 'fetchAdminOptions');
            const setOrg = jest.spyOn(instance, 'setOrg');
            instance.componentDidMount();
            expect(wrapper.state('organizationData')).toStrictEqual(selectedOrganization);
            expect(fetchAdminOptions).toBeCalled();
            expect(setOrg).toBeCalled();
        })
        describe('componentDidUpdate', () => {
            const wrapper = getWrapper({validationErrors: {}})
            const instance = wrapper.instance()
            const spy = jest.spyOn(instance, 'setState');
            instance.setState({error:true, organizationData:{}})
            const prevProps = {...instance.props}
            const prevState = {...instance.state}
            instance.componentDidUpdate(prevProps, prevState)
            expect(spy).toBeCalled();
            expect(wrapper.state('classifications')).toHaveLength(0)
            expect(wrapper.state('validationErrors')).toStrictEqual({})
        })
        describe('saveButton', () => {
            const wrapper = getWrapper()
            const instance = wrapper.instance()
            const dispatchData = jest.spyOn(instance, 'dispatchData');
            const saveButton = wrapper.find('#save-button').find(Button);
            expect(saveButton).toHaveLength(1);
            saveButton.prop('onClick')();
            expect(dispatchData).toBeCalled();
        })
        describe('cancelButton', () => {
            const orgMode = jest.fn();
            const wrapper = getWrapper({orgMode: orgMode})
            const cancelButton = wrapper.find('#cancel-button').find(Button);
            expect(cancelButton).toHaveLength(1);
            cancelButton.prop('onClick')();
            expect(orgMode).toBeCalledWith('cancel');
        })
        describe('setDisabled', () => {
            const wrapper = getWrapper()
            const instance = wrapper.instance()
            expect(instance.setDisabled(true)).toBe(true);
        })
        describe('onChange', () => {
            const organizationData = {
                name: '',
                data_source: 'system',
                id: '',
                classification: '',
                internal_type: 'normal',
                founding_date: '',
                parent_organization: '',
            }
            const wrapper = getWrapper()
            const instance = wrapper.instance()
            instance.setState({organizationData})
            const event = {target: {value: mockOrgClassifications[0].id}}
            instance.onChange('classification', event)
            expect(wrapper.state('organizationData').classification).toBe(mockOrgClassifications[0].id);
        })
        describe('fetchAdminOptions sets correct state', () => {
            const otherClass = mockOrgClassifications.find((org) => org.id === 'org:10'),
                rest = mockOrgClassifications.filter((org) => org.id !== 'org:10');
            const sortedClasses = otherClass ? [...rest, otherClass] : otherClass;
            const wrapper = getWrapper()
            const instance = wrapper.instance()
            const fetchAdminOptions = jest.spyOn(instance, 'fetchAdminOptions');
            UnconnectedOrganizationEditor.fetchAdminOptions = jest.fn().mockReturnValue(instance.setState({classifications: sortedClasses}))
            instance.componentDidMount();
            expect(fetchAdminOptions).toBeCalled();
            expect(wrapper.state('classifications')).toStrictEqual(sortedClasses);
        })
    })

})
