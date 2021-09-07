import React from 'react';
import {shallow} from 'enzyme';
import cookieUtil from '../../utils/cookieUtils';
jest.mock('../../utils/cookieUtils')
import {UnconnectedApp} from './';
import {mockUser} from '__mocks__/mockData';
import NavStartingPoint from '../../components/NavStartingPoint';
import Notification from '../Notification';

jest.mock('@city-images/favicon.ico', () => ({
    eventsFavicon: 'favicon for the site',
}),{virtual: true});

describe('views/App/index', () => {
    const defaultProps = {
        intl: {locale: 'fi'},
        app: {
            confirmAction: {msg: 'test-confirm-msg'},
            flashMsg: {msg: 'test-notification-msg', style: 'message', data: {sticky: true}},
        },
        user: mockUser,
        //dispatch: () => {},
        fetchLanguages: () => {},
        fetchKeywordSets: () => {},
        fetchUser: () => {},
        location: window.location,
        authUser: {profile: {sub: 'test-sub'}},
    }

    function getWrapper(props) {
        return shallow(<UnconnectedApp {...defaultProps} {...props}/>)
    }

    describe('renders', () => {
        test('NavStartingPoint', () => {
            const location = {pathname: '/test'}
            const navPoint = getWrapper({location}).find(NavStartingPoint)
            expect(navPoint).toHaveLength(1)
            expect(navPoint.prop('location')).toBe(location)
        });

        test('Notification', () => {
            const notification = getWrapper().find(Notification)
            expect(notification).toHaveLength(1)
            expect(notification.prop('flashMsg')).toBe(defaultProps.app.flashMsg)
        });

        describe('and ', () => {
            afterEach(() => {
                jest.clearAllMocks();
                delete appSettings.enable_cookies;
            })
            test('calls getConsentScripts if appSettings.enable_cookies is true', () => {
                appSettings.enable_cookies = true;
                const wrapper = getWrapper();
                expect(wrapper).toHaveLength(1);
                expect(cookieUtil.getConsentScripts).toHaveBeenCalled();
            });
            test('does not call getConsentScripts if appSettings.enable_cookies is false', () => {
                appSettings.enable_cookies = false;
                const wrapper = getWrapper();
                expect(wrapper).toHaveLength(1);
                expect(cookieUtil.getConsentScripts).not.toHaveBeenCalled();
            });
            test('calls getCookieScripts if appSettings.enable_cookies is true', () => {
                appSettings.enable_cookies = true;
                const wrapper = getWrapper();
                expect(wrapper).toHaveLength(1);
                expect(cookieUtil.getCookieScripts).toHaveBeenCalled();
            });
            test('does not call getCookieScripts if appSettings.enable_cookies is false', () => {
                appSettings.enable_cookies = false;
                const wrapper = getWrapper();
                expect(wrapper).toHaveLength(1);
                expect(cookieUtil.getCookieScripts).not.toHaveBeenCalled();
            });
        })


    })

    describe('componentWillMount', () => {
        const fetchLanguagesMock = jest.fn();
        const fetchKeywordSetsMock = jest.fn();
        test('fetchLanguages is called', () => {
            const wrapper = getWrapper({fetchLanguages: fetchLanguagesMock});
            expect(fetchLanguagesMock).toHaveBeenCalled();
        });
        test('fetchKeywordSets is called', () => {

            const wrapper = getWrapper({fetchKeywordSets: fetchKeywordSetsMock});
            expect(fetchKeywordSetsMock).toHaveBeenCalled();
        });
    });

    describe('componentDidUpdate', () => {
        describe('calls fetchUser', () => {
            test('when props contains new auth.user', () => {
                const fetchUser = jest.fn();
                let auth = {};
                const wrapper = getWrapper({fetchUser, auth});
                auth = {user: {profile: {sub: 'new-test-sub'}}};
                wrapper.setProps({auth});
                expect(fetchUser).toHaveBeenCalled();
                expect(fetchUser.mock.calls[0][0]).toEqual(auth.user.profile.sub)
            });
        });

        describe('doesnt call fetchUser', () => {
            test('when props doesnt have a new auth.user', () => {
                const fetchUser = jest.fn();
                const wrapper = getWrapper({fetchUser});
                const auth = {};
                wrapper.setProps({auth});
                expect(fetchUser).not.toHaveBeenCalled();
            });
        });
    });
});

