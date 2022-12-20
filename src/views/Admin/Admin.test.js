import React from 'react';
import {UnconnectedAdminPanel} from './index.js';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import {Helmet} from 'react-helmet';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner'
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import constants from 'src/constants'
import {getStringWithLocale} from '../../utils/locale.js';
import CONSTANTS from '../../constants'
import EventDetails from '../../components/EventDetails';
import {mapAPIDataToUIFormat} from '../../utils/formDataMapping';
import Users from '../../components/AdminFields/User';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

window.scrollTo = jest.fn()

const defaultProps = {
    editor: {},
    user: {},
    auth: {},
    isFetchingUser: false,
    location: {},
    match: {},
    intl,
    routerPush: () => {},
};

const {
    EVENT_STATUS,
    PUBLICATION_STATUS,
    SUPER_EVENT_TYPE_UMBRELLA,
    SUPER_EVENT_TYPE_RECURRING,
} = constants;

describe('AdminPanel', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedAdminPanel {...defaultProps} {...props} />, {context: {intl}});
    }

    describe('lifecycle methods', () => {

        describe('componentDidMount', () => {

            const routerPush = jest.fn()
            afterEach(() => {
                routerPush.mockClear()
            })
            test('calls routerPush when no user exists', () => {
                const tempAuth = {
                    isLoadingUser: false,
                    user: undefined,
                };
                const tempUser = null;
                const wrapper = getWrapper({routerPush, user: tempUser, auth: tempAuth, isFetchingUser: false});
                expect(routerPush).toHaveBeenCalledTimes(1)
                expect(routerPush).toHaveBeenCalledWith('/')
            })

            test('does not call routerPush when superadmin exists', () => {
                const tempAuth = {
                    isLoadingUser: false,
                    user: undefined,
                };
                const tempUser = {name: 'test-name', userType: constants.USER_TYPE.SUPERADMIN};
                const wrapper = getWrapper({routerPush, user: tempUser, auth: tempAuth, isFetchingUser: false});
                expect(routerPush).toHaveBeenCalledTimes(0)
            })
        });

        describe('componentDidUpdate', () => {

            const routerPush = jest.fn()
            afterEach(() => {
                routerPush.mockClear()
            })
            test('calls routerPush when no user exists', () => {
                const tempAuth = {
                    isLoadingUser: false,
                    user: undefined,
                };
                const tempUser = null;
                const wrapper = getWrapper({routerPush, user: tempUser, auth: tempAuth, isFetchingUser: false});
                expect(routerPush).toHaveBeenCalledTimes(1)
                expect(routerPush).toHaveBeenCalledWith('/')
            })

            test('does not call routerPush when superadmin exists', () => {
                const tempAuth = {
                    isLoadingUser: false,
                    user: undefined,
                };
                const tempUser = {name: 'test-name', userType: constants.USER_TYPE.SUPERADMIN};
                const wrapper = getWrapper({routerPush, user: tempUser, auth: tempAuth, isFetchingUser: false});
                expect(routerPush).toHaveBeenCalledTimes(0)
            })
        });
    });

    describe('methods', () => {

        describe('isActivePath', () => {
            test('return true if pathname is same', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                wrapper.setProps({location: {pathname: 'test/test-path'}})
                const isPath = instance.isActivePath('test/test-path')
                expect(isPath).toBe(true)
            })
            test('return false if pathname is same', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                wrapper.setProps({location: {pathname: 'test/test'}})
                const isPath = instance.isActivePath('test/test-path')
                expect(isPath).toBe(false)
            })
        })

        describe('handleOnClick', () => {
            test('calls routerPush with correct string', () => {
                const routerPush = jest.fn()
                const wrapper = getWrapper({routerPush})
                const instance = wrapper.instance()
                wrapper.setState({isOpen: true})
                instance.handleOnClick('admin')
                expect(routerPush).toHaveBeenCalledWith('admin')
            })
        })

        describe('getComponent', () => {
            test('returns correct component', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const component = instance.getComponent('users')
                expect(component).toStrictEqual(<Users intl={defaultProps.intl} />)
            })
        })
    });

    describe('render', () => {

        describe('Helmet', () => {
            test('with correct props', () => {
                const wrapper = getWrapper()
                const helmet = wrapper.find(Helmet)
                expect(helmet).toHaveLength(1)
                expect(helmet.prop('title')).toBe(
                    `Linkedevents - ${intl.formatMessage({id: 'admin-panel'})}`
                )
            })
        })

        describe('Spinner', () => {
            test('is rendered when user does not exist', () => {
                const wrapper = getWrapper({user: null});
                const element = wrapper.find(Spinner);
                expect(element).toHaveLength(1);
                expect(element.prop('animation')).toBe('border');

            });
            test('is not rendered when user exists', () => {
                const wrapper = getWrapper({user: {name: 'test'}});
                const element = wrapper.find(Spinner);
                expect(element).toHaveLength(0);
            });
        });
    });
});
