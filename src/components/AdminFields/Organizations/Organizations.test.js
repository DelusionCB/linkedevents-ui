import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {mockOrganizations,  mockUser} from '../../../../__mocks__/mockData';
import OrganizationEditor from './OrganizationPermissions/OrganizationEditor';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
import {UnconnectedOrganizations} from './index';

const org = {
    'id': 'turku:853',
    'data_source': 'turku',
    'classification': 'org:3',
    'name': 'Turun kaupunki Edited',
    'founding_date': null,
    'dissolution_date': null,
    'parent_organization': null,
    'sub_organizations': [],
    'affiliated_organizations': [],
    'created_time': '2022-11-16T06:34:02.325022Z',
    'last_modified_time': '2022-11-16T06:34:02.325859Z',
    'is_affiliated': false,
    'replaced_by': null,
    'has_regular_users': false,
    '@id': 'http://localhost:8006/v1/organization/turku:853/',
    '@context': 'http://schema.org',
    '@type': 'Organization',
};
  
const defaultProps = {
    intl: intl,
    organizations: mockOrganizations,
    user: mockUser,
    activeOrganization: 'turku:853',
}

const mockSuperAdminUser = JSON.parse(JSON.stringify(mockUser));
mockSuperAdminUser.userType = 'superadmin';

function getWrapper(props) {
    return shallow(<UnconnectedOrganizations {...defaultProps} {...props} />, {context: {intl}});
}

describe('renders', () => {
    describe('element', () => {
        test('dev containing organizations-view', () => {
            const wrapper = getWrapper();
            const div = wrapper.find('.organizations-view');
            expect(div).toHaveLength(1);
        })
        test('OrganizationEditor', () => {
            const wrapper = getWrapper();
            const organizationEditor = wrapper.find(OrganizationEditor);
            expect(organizationEditor).toHaveLength(1);
        })
    })

    describe('methods', () => {  
        describe('componentDidMount', () => {
            test('selectOrg to be called', ()=>{
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const selectOrg = jest.spyOn(instance, 'selectOrg');
                instance.componentDidMount();
                expect(selectOrg).toBeCalled();
            })
        
        })
        describe('componentDidUpdate', () => {
            test('selectOrg to be called', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const orgs = mockOrganizations.filter((org)=> org.id !== defaultProps.activeOrganization);
                const updatedOrgs = [...orgs, org];
                const selectOrg = jest.spyOn(instance, 'selectOrg');
                const prevProps = {...instance.props, organizations: updatedOrgs}
                const prevState = {...instance.state}
                instance.componentDidUpdate(prevProps, prevState)
                expect(selectOrg).toBeCalled();
            })
        })
    })

})
