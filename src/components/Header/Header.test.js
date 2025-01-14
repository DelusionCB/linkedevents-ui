import React from 'react';
import {shallow} from 'enzyme';
import {Button} from 'reactstrap';
import {NavLink} from 'react-router-dom'

import {mockUser} from '__mocks__/mockData';
import {UnconnectedHeaderBar} from './index';
import LanguageSelector from './LanguageSelector';
import ActiveOrganizationSelector from './ActiveOrganizationSelector';
import constants from '../../constants';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
const {APPLICATION_SUPPORT_TRANSLATION} = constants;
const LanguageOptions = APPLICATION_SUPPORT_TRANSLATION.map(item => ({
    label: item.toUpperCase(),
    value: item,
}));
import userManager from '../../utils/userManager';
userManager.settings.authority = 'test authority';
const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    user: mockUser,
    routerPush: () => {},
    setLocale: () => {},
    isOpen: false,
    showModerationLink: false,
    userLocale: {locale: 'fi'},
    location: window.location,
    clearUserData: () => {},
    auth: {user: {id_token: 'test-id-token'}},
    fetchOrganizations: jest.fn(),
};
const userAdmin = {
    displayName: 'Matti Meikäläinen',
    userType: 'admin',
    organizationsWithRegularUsers: ['jokuOrganisaatio'],
};

const userSuperAdmin = {
    displayName: 'superadmin user',
    userType: 'superadmin',
    organizationsWithRegularUsers: ['jokuOrganisaatio'],
};

const userRegular = {
    displayName: 'regular user',
    userType: 'regular',
    organizationsWithRegularUsers: ['jokuOrganisaatio'],
};

describe('components/Header/index', () => {
    describe('HeaderBar', () => {
        function getWrapper(props) {
            return shallow(<UnconnectedHeaderBar {...defaultProps} {...props}/>, {context: {intl}});
        }

        describe('methods', () => {
            describe('componentDidMount', () => {
                test('state.showModerationLink is true if user is admin and part of organization', () => {
                    const element = getWrapper({user: userAdmin});
                    expect(element.state('showModerationLink')).toBe(true);
                });
                test('fetchOrganizations to be called', () => {
                    const instance = getWrapper().instance();
                    const spy = jest.spyOn(instance.props, 'fetchOrganizations');
                    instance.componentDidMount()
                    expect(spy).toHaveBeenCalled()
                });
                test('fetchOrganizationsData to be called on mount', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    const spy = jest.spyOn(instance, 'fetchOrganizationsData');
                    instance.componentDidMount()
                    expect(spy).toHaveBeenCalled()
                })
                test('state.showAdminPanel is true if user is admin for organization', () => {
                    const element = getWrapper();
                    expect(element.state('showAdminPanel')).toBe(true);
                });
                test('state.showAdminPanel is true if user is SuperAdmin', () => {
                    const element = getWrapper({user: userSuperAdmin});
                    expect(element.state('showAdminPanel')).toBe(true);
                });
                test('state.showManageMediaLink is true if user is SuperAdmin', () => {
                    const element = getWrapper({user: userSuperAdmin});
                    expect(element.state('showManageMediaLink')).toBe(true);
                });
            });

            describe('componentDidUpdate', () => {
                test('state.showModerationLink is true if user is superAdmin', () => {
                    const wrapper = getWrapper();
                    const instance = wrapper.instance()
                    wrapper.setProps({...instance.props, user: userSuperAdmin})
                    const prevProps = {...instance.props}
                    const prevState = {...instance.state}
                    const prevContext = {...instance.context}
                    instance.componentDidUpdate(prevProps, prevState, prevContext)
                    expect(wrapper.state('showModerationLink')).toBe(true);
                });
                test('state.showAdminPanel is true if user is userSuperAdmin', () => {
                    const wrapper = getWrapper();
                    const instance = wrapper.instance()
                    wrapper.setProps({...instance.props, user: userSuperAdmin})
                    const prevProps = {...instance.props}
                    const prevState = {...instance.state}
                    const prevContext = {...instance.context}
                    instance.componentDidUpdate(prevProps, prevState, prevContext)
                    expect(wrapper.state('showModerationLink')).toBe(true);
                });
            });

            describe('handleLoginClick', () => {
                test('calls usermanager.signinRedirect with correct params', () => {
                    const instance = getWrapper().instance();
                    const spy = jest.spyOn(userManager, 'signinRedirect');
                    const expectedParams = {
                        data: {
                            redirectUrl: '/',
                        },
                        extraQueryParams: {
                            ui_locales: instance.props.userLocale.locale,
                        },
                    };
                    instance.handleLoginClick();

                    expect(spy).toHaveBeenCalled();
                    expect(spy.mock.calls[0][0]).toEqual(expectedParams);
                });
            });

            describe('handleLogoutClick', () => {
                test('calls clearUserData, removeUser and signoutRedirect with correct params', () => {
                    const clearUserData = jest.fn();
                    const instance = getWrapper({clearUserData}).instance();
                    const signoutRedirectSpy = jest.spyOn(userManager, 'signoutRedirect');
                    const removeUserSpy = jest.spyOn(userManager, 'removeUser');
                    const expectedParams = {
                        id_token_hint: instance.props.auth.user.id_token,
                    };
                    instance.handleLogoutClick();

                    expect(clearUserData).toHaveBeenCalled();
                    expect(removeUserSpy).toHaveBeenCalled();
                    expect(signoutRedirectSpy).toHaveBeenCalled();
                    expect(signoutRedirectSpy.mock.calls[0][0]).toEqual(expectedParams);
                });
            });

            describe('isActivePath', () => {
                test('returns true/false based on if given parameter === location.pathname', () => {
                    const wrapper = getWrapper({location:{pathname:'/'}});
                    const instance = wrapper.instance();
                    expect(instance.isActivePath('/')).toBe(true);
                    expect(instance.isActivePath('/help')).toBe(false);
                });
            });
        });

        describe('render', () => {
            test('contains LanguageSelector with correct props', () => {
                const element = getWrapper().find(LanguageSelector);
                expect(element.prop('languages')).toEqual(LanguageOptions);
                expect(element.prop('userLocale')).toEqual(defaultProps.userLocale);
                expect(element.prop('changeLanguage')).toBeDefined();
            });

            test('contains ActiveOrganizationSelector with correct props', () => {
                const element = getWrapper().find(ActiveOrganizationSelector);
                expect(element).toHaveLength(1)
            });

            test('does not contain ActiveOrganizationSelector when user is empty', () => {
                const element = getWrapper({user: null}).find('.active-organization-selector');
                expect(element).toHaveLength(0)
            });

            describe('Login button', () => {
                test('calls handleLoginClick', () => {
                    const user = undefined;
                    const wrapper = getWrapper({user});
                    const handleLoginClick = jest.fn();
                    wrapper.instance().handleLoginClick = handleLoginClick;
                    wrapper.instance().forceUpdate(); // update to register mocked function
                    const loginButton = wrapper.find('.bar__login-and-language').find(Button);
                    expect(loginButton).toHaveLength(1);
                    loginButton.prop('onClick')();
                    expect(handleLoginClick).toHaveBeenCalled();
                });
            });

            describe('NavLink', () => {
                test('render 6 NavLinks when user is not admin/superAdmin', () => {
                    const element = getWrapper({user: userRegular});
                    const navLinks = element.find(NavLink);
                    expect(navLinks).toHaveLength(6);
                });

                test('render 8 NavLinks when user is admin', () => {
                    const element = getWrapper({user: userAdmin});
                    const navLinks = element.find(NavLink);
                    expect(navLinks).toHaveLength(8);
                });

                test('render 9 NavLinks when user is superadmin', () => {
                    const navLinks = getWrapper({user: userSuperAdmin}).find(NavLink);
                    expect(navLinks).toHaveLength(9);
                });

                test('when user is admin, one of the NavLinks is to moderation', () => {
                    const element = getWrapper({user: userAdmin}).find(NavLink).filter('.moderator');
                    expect(element.prop('className')).toBe('nav-link moderator');
                });

                test('when user is not superadmin media NavLink should not be there', () => {
                    const navLink = getWrapper({user: userAdmin}).find(NavLink).filter('#media');
                    expect(navLink).toHaveLength(0);
                });

                test('when user is superadmin media NavLink should be there', () => {
                    const navLink = getWrapper({user: userSuperAdmin}).find(NavLink).filter('#media');
                    expect(navLink).toHaveLength(1);
                });

                test('NavLink is active based on location.pathname prop',() => {
                    const element = getWrapper({location:{pathname:'/listing'}});
                    let navLinks = element.find(NavLink);
                    expect(navLinks.at(0).prop('strict')).toBe(false);
                    expect(navLinks.at(1).prop('strict')).toBe(false);
                    expect(navLinks.at(2).prop('exact')).toBe(true);
                    expect(navLinks.at(3).prop('strict')).toBe(false);
                    expect(navLinks.at(4).prop('strict')).toBe(false);
                    expect(navLinks.at(5).prop('strict')).toBe(false);
                    element.setProps({location:{pathname:'/search'}});
                    navLinks = element.find(NavLink);
                    expect(navLinks.at(0).prop('strict')).toBe(false);
                    expect(navLinks.at(1).prop('strict')).toBe(true);
                    expect(navLinks.at(2).prop('strict')).toBe(false);
                    expect(navLinks.at(3).prop('strict')).toBe(false);
                    expect(navLinks.at(4).prop('strict')).toBe(false);
                    expect(navLinks.at(5).prop('strict')).toBe(false);
                    element.setProps({location:{pathname:'/help'}});
                    navLinks = element.find(NavLink);
                    expect(navLinks.at(0).prop('strict')).toBe(false);
                    expect(navLinks.at(1).prop('strict')).toBe(false);
                    expect(navLinks.at(2).prop('strict')).toBe(false);
                    expect(navLinks.at(3).prop('strict')).toBe(true);
                    expect(navLinks.at(4).prop('strict')).toBe(false);
                    expect(navLinks.at(5).prop('strict')).toBe(false);
                    element.setProps({location:{pathname:'/terms'}});
                    navLinks = element.find(NavLink);
                    expect(navLinks.at(0).prop('strict')).toBe(false);
                    expect(navLinks.at(1).prop('strict')).toBe(false);
                    expect(navLinks.at(2).prop('strict')).toBe(false);
                    expect(navLinks.at(3).prop('strict')).toBe(false);
                    expect(navLinks.at(4).prop('strict')).toBe(true);
                    expect(navLinks.at(5).prop('strict')).toBe(false);
                    element.setProps({location:{pathname:'/instructions'}});
                    navLinks = element.find(NavLink);
                    expect(navLinks.at(0).prop('strict')).toBe(false);
                    expect(navLinks.at(1).prop('strict')).toBe(false);
                    expect(navLinks.at(2).prop('strict')).toBe(false);
                    expect(navLinks.at(3).prop('strict')).toBe(false);
                    expect(navLinks.at(4).prop('strict')).toBe(false);
                    expect(navLinks.at(5).prop('strict')).toBe(true);
                });
            });
        });
    });
});

