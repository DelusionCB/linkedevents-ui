import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedActiveOrganizationSelector} from './ActiveOrganizationSelector';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {mockOrganizations} from '../../../__mocks__/mockData';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const user = {
    'last_login': null,
    'username': 'u-5kpfsb3fqyi63e4d5oiwvzwzaa',
    'email': 'email@example.com',
    'date_joined': '2022-11-16T10:16:12+02:00',
    'first_name': 'firstName',
    'last_name': 'lastName',
    'uuid': 'ea9e5907-6586-11ed-9383-eb916ae6d900',
    'department_name': null,
    'is_staff': true,
    'is_superuser': false,
    'display_name': 'Display Name',
    'organization': 'yksilo:2000',
    'admin_organizations': [
        'yksilo:2000',
    ],
    'organization_memberships': [
        'turku:853',
        'turku:4032',
        'yksilo:2000',
        'dev:3',
    ],
    'public_memberships': [
        'yksilo:2000',
    ],
}
const defaultProps = {
    user: user,
    organizations: mockOrganizations,
    activeOrganization: user.organization,
    auth: {user: {id_token: 'test-id-token',profile: {sub: 'ea9e5907-6586-11ed-9383-eb916ae6d900'}}},
    setActiveOrganization: jest.fn(),
    fetchUser: jest.fn(),
};

describe('ActiveOrganizationSelector', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedActiveOrganizationSelector {...defaultProps} {...props} />, {context: {intl}});
    }
    describe('methods', () => {
        describe('componentDidMount', () => {
            const {user: {admin_organizations, organization_memberships, public_memberships, organization}, organizations} = defaultProps;
            const user = {
                ...user,
                adminOrganizations : admin_organizations,
                organizationMemberships : organization_memberships,
                publicMemberships : public_memberships,
            };
            const userOrganizationIds = [...new Set([...admin_organizations, ...organization_memberships, ...public_memberships])];
            const userOrganizations = organizations.filter(org => userOrganizationIds.includes(org.id));
            const defaultOrg = userOrganizations.find((org)=> org.id === organization);
            const wrapper = getWrapper({user});
            const instance = wrapper.instance();
            const elementMock = document.addEventListener = jest.fn();

            beforeEach(() => {
                instance.componentDidMount();
            });

            test('sets userOrganizations to the state', () => {
                expect(instance.state.userOrganizations).toEqual(userOrganizations);
            });
            test('sets activeOrganization to the state', () => {
                expect(instance.state.activeOrganization).toEqual(defaultOrg);
            });
            test('addEventListener is called', () => {
                expect(elementMock).toBeCalled()
            });
            test('addEventListener is called with correct args', () => {                
                expect(elementMock).toBeCalledWith('click', expect.any(Function), false)
            });
        });

        describe('componentDidUpdate', () => {
            const {user: {admin_organizations, organization_memberships, public_memberships, organization}, organizations} = defaultProps;
            const user = {
                ...user,
                adminOrganizations : admin_organizations,
                organizationMemberships : organization_memberships,
                publicMemberships : public_memberships,
            };
            const userOrganizationIds = [...new Set([...admin_organizations, ...organization_memberships, ...public_memberships])];
            const userOrganizations = organizations.filter(org => userOrganizationIds.includes(org.id));
            const defaultOrg = userOrganizations.find((org)=> org.id === organization);
            const wrapper = getWrapper({user});
            const instance = wrapper.instance();
            const elementMock = document.addEventListener = jest.fn();

            beforeEach(() => {
                const prevProps = {...instance.props, organizations:[]}
                const prevState = {...instance.state}
                instance.componentDidUpdate(prevProps, prevState)
            });

            test('sets userOrganizations to the state', () => {
                expect(instance.state.userOrganizations).toEqual(userOrganizations);
            });
            test('sets activeOrganization to the state', () => {
                expect(instance.state.activeOrganization).toEqual(defaultOrg);
            });
            test('addEventListener is called', () => {
                expect(elementMock).toBeCalled()
            });
            test('addEventListener is called with correct args', () => {                
                expect(elementMock).toBeCalledWith('click', expect.any(Function), false)
            });
        });

        describe('componentWillUnmount', () => {
            const {user: {admin_organizations, organization_memberships, public_memberships}, organizations} = defaultProps;
            const user = {
                ...user,
                adminOrganizations : admin_organizations,
                organizationMemberships : organization_memberships,
                publicMemberships : public_memberships,
            };
            const elementMock = document.removeEventListener = jest.fn();
            const wrapper = getWrapper({user})
            const instance = wrapper.instance()
            beforeEach(() => {
                instance.componentWillUnmount()
            });
            test('removeEventListener is called', () => {
                expect(elementMock).toBeCalled()
                expect(elementMock).toHaveBeenCalledTimes(1)
            })
            test('removeEventListener is called with correct args', () => {
                expect(elementMock).toBeCalledWith('click', expect.any(Function), false)
            })
        })

        describe('component methods', () => {
            const {user: {admin_organizations, organization_memberships, public_memberships}, organizations} = defaultProps;
            const user = {
                ...user,
                adminOrganizations : admin_organizations,
                organizationMemberships : organization_memberships,
                publicMemberships : public_memberships,
            };
            test('isOpen default state', () => {
                const wrapper = getWrapper({user});
                const instance = wrapper.instance();
                instance.componentDidMount();
                expect(instance.state.isOpen).toBe(false);
            });
            test('<li> element gets correct props', () => {
                const wrapper = getWrapper({user});
                const instance = wrapper.instance();
                instance.componentDidMount();
                const element = wrapper.find('li');
                expect(element).toHaveLength(3);
                const first = element.at(1);
                expect(first.prop('role')).toBe('presentation');
                expect(first.prop('onClick')).toBeDefined();
                expect(first.prop('className')).toBe('org-item');
            });
            test('handleActiveOrganizationChange', () => {
                const selectedOrganization = organizations.find((org) => org.id === 'turku:853');
                const wrapper = getWrapper({user});
                const instance = wrapper.instance();
                const prevent = {preventDefault: jest.fn()}
                instance.componentDidMount();
                instance.handleActiveOrganizationChange(selectedOrganization, prevent);
                expect(instance.state.activeOrganization).toBe(selectedOrganization);
            });
        });

        describe('render', ()=>{
            const {user: {admin_organizations, organization_memberships, public_memberships}, organizations} = defaultProps;
            const user = {
                ...user,
                adminOrganizations : admin_organizations,
                organizationMemberships : organization_memberships,
                publicMemberships : public_memberships,
            };
            test('default activeorganization to exist', () => {
                const wrapper = getWrapper({user});
                const instance = wrapper.instance();
                instance.componentDidMount();
                const element = wrapper.find('.activeOrganization');
                expect(element).toHaveLength(1);
            });
        })
    });
});
