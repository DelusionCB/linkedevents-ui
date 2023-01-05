import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {mockOrganizations} from '../../../../../__mocks__/mockData';
import OrganizationSelect from '../../utils/OrganizationSelect';

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

const defaultProps = {
    intl: intl,
    organization: {},
    executeSendRequestOrg: jest.fn(),
    mode: 'edit',
    orgMode: jest.fn(),
    organizations: mockOrganizations,
}

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
    })
})
