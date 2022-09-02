import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {Button} from 'reactstrap';
import {Helmet} from 'react-helmet';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

// these 2 mocks are for the EventMap component
jest.mock(
    '@city-i18n/localization.json',
    () => ({
        mapPosition: [60.451744, 22.266601],
    }),
    {virtual: true}
);

jest.mock(
    '@city-assets/urls.json',
    () => ({
        rasterMapTiles: 'this is a url to the maptiles',
    }),
    {virtual: true}
);

import {EditorPage} from './index';
import {mockUser, mockEditorNewEvent, mockEditorExistingEvent} from '../../../__mocks__/mockData';

const initialStoreNewEvent = {
    user: mockUser,
    editor: mockEditorNewEvent,
};
const initialStoreExistingEvent = {
    user: mockUser,
    editor: mockEditorExistingEvent,
};

describe('Editor Snapshot', () => {
    it('should render view correctly when new event', () => {
        const componentProps = {
            setLoading: () => {},
            fetchingUser: false,
            match: {
                params: {
                    action: 'create',
                    eventId: 'new?_k=dn954b',
                },
            },
            app: {
                flashMsg: null,
                confirmAction: null,
            },
            setFlashMsg: jest.fn(),
            setEditorAuthFlashMsg: jest.fn(),
            intl: {
                formatMessage: jest.fn(),
            },
            ...initialStoreNewEvent,
        }; // Props which are added to component
        const wrapper = shallow(<EditorPage {...componentProps} />, {context: {intl}});
        expect(wrapper).toMatchSnapshot();
    });

    it('should render view correctly when editing existing event', () => {
        const componentProps = {
            setLoading: () => {},
            fetchingUser: false,
            match: {
                params: {
                    action: 'update',
                    eventId: 'helsinki:afqxukccli',
                },
            },
            app: {
                flashMsg: null,
                confirmAction: null,
            },
            setFlashMsg: jest.fn(),
            setEditorAuthFlashMsg: jest.fn(),
            intl: {
                formatMessage: jest.fn(),
            },
            ...initialStoreExistingEvent,
        }; // Props which are added to component
        const wrapper = shallow(<EditorPage {...componentProps} />, {context: {intl}});
        expect(wrapper).toMatchSnapshot();
    });

    it('should render view correctly when creating new event from existing one', () => {
        const componentProps = {
            setLoading: () => {},
            fetchingUser: false,
            match: {
                params: {
                    action: 'create',
                    eventId: 'new?_k=dn954b',
                },
            },
            app: {
                flashMsg: null,
                confirmAction: null,
            },
            setFlashMsg: jest.fn(),
            setEditorAuthFlashMsg: jest.fn(),
            intl: {
                formatMessage: jest.fn(),
            },
            ...initialStoreExistingEvent,
        }; // Props which are added to component
        const wrapper = shallow(<EditorPage {...componentProps} />, {context: {intl}});
        expect(wrapper).toMatchSnapshot();
    });

    const defaultProps = {
        setLoading: () => {},
        user: mockUser,
        fetchingUser: false,
        editor: mockEditorExistingEvent,
        match: {
            params: {
                action: 'create',
                eventId: 'new?_k=dn954b',
            },
        },
        setFlashMsg: jest.fn(),
        setEditorAuthFlashMsg: jest.fn(),
        routerPush: jest.fn(),
        intl,
    };
    function getWrapper(props) {
        return shallow(<EditorPage {...defaultProps} {...props} />, {context: {intl}});
    }

    describe('lifecycle methods', () => {
        describe('componentDidMount', () => {
            test('routerPush is called if mounting with no user and editing an event', () => {
                const props = {
                    user: null,
                    routerPush: jest.fn(),
                    match: {
                        params: {
                            action: 'update',
                        },
                    },
                };
                const wrapper = getWrapper(props);
                const instance = wrapper.instance();
                // spy on fetchEventData function which is normally called on mount when editing.
                const spy = jest.spyOn(instance, 'fetchEventData');
                jest.clearAllMocks();
                instance.componentDidMount();
                // routerPush should've been called because user was missing.
                expect(props.routerPush).toHaveBeenCalledWith('/404');
                // fetchEventData shouldn't have been called because user is missing.
                expect(spy).not.toHaveBeenCalled();
            });
            test('setFlashMsg is called if mounting with user but user doesnt belong to any org', () => {
                const adminUser = Object.assign({}, mockUser);
                adminUser.adminOrganizations = null;
                const props = {
                    user: adminUser,
                    setFlashMsg: jest.fn(),
                };
                getWrapper(props);
                const expectedValues = ['user-no-rights-create', 'error', {sticky: true}];
                expect(props.setFlashMsg).toHaveBeenCalledWith(...expectedValues);
            });
        });
    });
    test('correct amount of FormattedMessages', () => {
        const element = getWrapper().find(FormattedMessage);
        expect(element).toHaveLength(1);
    });
    test('react-helmet is defined and gets title prop', () => {
        const wrapper = getWrapper({intl:{formatMessage: jest.fn()}}).find(Helmet);
        const pageTitle = wrapper.prop('title');
        expect(wrapper).toBeDefined();
        expect(pageTitle).toBeDefined();
        expect(pageTitle).toHaveLength(24);
    });
    test('Button toggles showPreviewEventModal state', () => {
        const wrapper = getWrapper();
        const element = wrapper.find(Button);
        expect(wrapper.state('showPreviewEventModal')).toBe(false);
        element.simulate('click');
        expect(wrapper.state('showPreviewEventModal')).toBe(true);
    });
});
