import React from 'react';
import {UnconnectedEventPage} from './index.js';
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

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

window.scrollTo = jest.fn()

const defaultProps = {
    app: {
        flashMsg: null,
    },
    intl,
    userLocale: {
        locale: 'fi',
    },
    auth: {
        isLoadingUser: false,
        user: null,
    },
    user: null,
    isFetchingUser: false,
    setFlashMsg: () => {},
    routerPush: () => {},
    editor: {},
};

const {
    EVENT_STATUS,
    PUBLICATION_STATUS,
    SUPER_EVENT_TYPE_UMBRELLA,
    SUPER_EVENT_TYPE_RECURRING,
} = constants;

describe('EventPage', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedEventPage {...defaultProps} {...props} />, {context: {intl}});
    }

    describe('lifecycle methods', () => {
        describe('componentDidMount', () => {
            test('calls fetchEventData if auth.isLoadingUser is false', () => {
                const wrapper = getWrapper({auth: {isLoadingUser: false}});
                const instance = wrapper.instance();
                const fetchDataSpy = jest.spyOn(instance, 'fetchEventData');
                instance.componentDidMount();
                expect(fetchDataSpy).toHaveBeenCalledTimes(1);
            });
            test('does not call fetchEventData if auth.isLoadingUser is true', () => {
                const wrapper = getWrapper({auth: {isLoadingUser: true}});
                const instance = wrapper.instance();
                const fetchDataSpy = jest.spyOn(instance, 'fetchEventData');
                instance.componentDidMount();
                expect(fetchDataSpy).toHaveBeenCalledTimes(0);
            });
        });
        describe('componentDidUpdate', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();
            const fetchDataSpy = jest.spyOn(instance, 'fetchEventData');

            afterEach(() => { fetchDataSpy.mockClear() });
            afterAll(() => { fetchDataSpy.mockRestore() });

            test('fetchEventData is called if prevProps.isFetchingUser && !isFetchingUser and user is not the same as previously', () => {
                wrapper.setProps({isFetchingUser: true});
                expect(fetchDataSpy).toHaveBeenCalledTimes(0);
                wrapper.setProps({isFetchingUser: false, user: {id: 'userid'}});
                expect(fetchDataSpy).toHaveBeenCalledTimes(1);
            })

            test('fetchEventData is called if prevProps.auth.isLoadingUser && !auth.isLoadingUser && !auth.user && !isFetchingUser', () => {
                // oidc was loading the user but is no longer doing it, no oidc user exists, and we aren't fetching one from the backend.
                wrapper.setProps({auth: {isLoadingUser: true, user: null}});
                expect(fetchDataSpy).toHaveBeenCalledTimes(0);
                wrapper.setProps({auth: {isLoadingUser: false, user: null}, isFetchingUser: false});
                expect(fetchDataSpy).toHaveBeenCalledTimes(1);
            })

            test('fetchEventData is not called again when eventId does not change', () => {
                const eventOne = {match: {params: {eventId: 'system:one'}}};
                wrapper.setProps(eventOne);
                expect(fetchDataSpy).toHaveBeenCalledTimes(1);
                fetchDataSpy.mockClear();
                wrapper.setProps(eventOne);
                expect(fetchDataSpy).toHaveBeenCalledTimes(0);
            })
            test('fetchEventData is called when eventId changes and not fetchingUser', () => {
                const eventTwo = {match: {params: {eventId: 'system:two'}}};
                wrapper.setProps(eventTwo);
                expect(fetchDataSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('methods', () => {
        describe('handleConfirmedAction', () => {
            const setFlashMsg = jest.fn()
            const EVENT_CREATION = CONSTANTS.EVENT_CREATION
            const event = {publication_status: 'test'}
            afterEach(() => {
                setFlashMsg.mockClear()
            })

            test('calls setFlashMsg with correct params when action is delete', () => {
                const instance = getWrapper({setFlashMsg}).instance()
                const action = 'delete'
                instance.handleConfirmedAction(action, event)
                expect(setFlashMsg).toHaveBeenCalledTimes(1)
                expect(setFlashMsg).toHaveBeenCalledWith(EVENT_CREATION.DELETE_SUCCESS, 'success', {sticky: false})
            })

            test('calls setFlashMsg with correct params when action is cancel', () => {
                const instance = getWrapper({setFlashMsg}).instance()
                const action = 'cancel'
                instance.handleConfirmedAction(action, event)
                expect(setFlashMsg).toHaveBeenCalledTimes(1)
                expect(setFlashMsg).toHaveBeenCalledWith(EVENT_CREATION.CANCEL_SUCCESS, 'success', {sticky: false})
            })

            test('calls setFlashMsg with correct params when action is publish', () => {
                const instance = getWrapper({setFlashMsg}).instance()
                const action = 'publish'
                instance.handleConfirmedAction(action, event)
                expect(setFlashMsg).toHaveBeenCalledTimes(1)
                expect(setFlashMsg).toHaveBeenCalledWith(EVENT_CREATION.PUBLISH_SUCCESS, 'success', {sticky: false})
            })

            test('calls setFlashMsg with correct params when action is postpone', () => {
                const instance = getWrapper({setFlashMsg}).instance()
                const action = 'postpone'
                instance.handleConfirmedAction(action, event)
                expect(setFlashMsg).toHaveBeenCalledTimes(1)
                expect(setFlashMsg).toHaveBeenCalledWith(EVENT_CREATION.UPDATE_SUCCESS, 'success', {sticky: false})
            })
        })
        describe('getEventActions', () => {
            test('returns empty div if state.loading is true', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                wrapper.setState({loading: true});
                const returnValues = instance.getEventActions('test');
                const shallowValues = shallow(returnValues);
                expect(shallowValues.find('div')).toHaveLength(1);
                expect(shallowValues.find('div').children()).toHaveLength(0);
            });
        });
    });
    describe('render', () => {
        describe('Helmet', () => {
            test('with correct props when state.event is not empty', () => {
                const event = {id: 'test-id', name: {en: 'test name'}}
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                instance.setState({event})
                const helmet = wrapper.find(Helmet)
                expect(helmet).toHaveLength(1)
                expect(helmet.prop('title')).toBe(
                    'Linkedevents - ' + getStringWithLocale(event, 'name', defaultProps.userLocale.locale)
                )
            })

            test('with correct props when state.event is empty', () => {
                const helmet = getWrapper().find(Helmet);
                expect(helmet).toHaveLength(1)
                expect(helmet.prop('title')).toBe('Linkedevents - ' + intl.formatMessage({id: 'event-page-default-title'}))
            })
        })
        describe('event badges', () => {
            test('based on event_status', () => {
                const wrapper = getWrapper();
                let event;

                const statuses = [EVENT_STATUS.CANCELLED, EVENT_STATUS.POSTPONED];
                const eventTypes = ['cancelled', 'postponed'];
                statuses.forEach((status, index) => {
                    event = {
                        super_event_type: 'something',
                        publication_status: 'something',
                        event_status: status,
                    };
                    wrapper.setState({event: event, loading: false});
                    const headerElement = wrapper.find('h2');
                    expect(headerElement).toHaveLength(1);
                    const expectedBadge = wrapper.find(Badge);
                    expect(expectedBadge).toHaveLength(1);
                    expect(expectedBadge.prop('className')).toBe(`${eventTypes[index]} `);
                    expect(expectedBadge.prop('variant')).toBe(eventTypes[index]);
                });
            })
            test('based on super_event_type', () => {
                const wrapper = getWrapper();
                let event;

                const statuses = [SUPER_EVENT_TYPE_UMBRELLA, SUPER_EVENT_TYPE_RECURRING];
                const eventTypes = ['umbrella', 'series'];
                statuses.forEach((status, index) => {
                    event = {
                        super_event_type: status,
                        publication_status: 'something',
                        event_status: EVENT_STATUS.SCHEDULED,
                    };
                    wrapper.setState({event: event, loading: false});
                    const headerElement = wrapper.find('h2');
                    expect(headerElement).toHaveLength(1);
                    const expectedBadge = wrapper.find(Badge);
                    expect(expectedBadge).toHaveLength(1);
                    expect(expectedBadge.prop('className')).toBe(`${eventTypes[index]} `);
                    expect(expectedBadge.prop('variant')).toBe(eventTypes[index]);
                });
            })
            test('based on publication_status', () => {
                const wrapper = getWrapper();
                let event = {
                    super_event_type: 'something',
                    publication_status: PUBLICATION_STATUS.DRAFT,
                    event_status: EVENT_STATUS.SCHEDULED,
                };
                wrapper.setState({event: event, loading: false});
                const headerElement = wrapper.find('h2');
                expect(headerElement).toHaveLength(1);
                const expectedBadge = wrapper.find(Badge);
                expect(expectedBadge).toHaveLength(1);
                expect(expectedBadge.prop('className')).toBe('draft ');
                expect(expectedBadge.prop('variant')).toBe('draft');
            });
            test('when multiple badges', () => {
                const wrapper = getWrapper();
                let event = {
                    super_event_type: SUPER_EVENT_TYPE_UMBRELLA,
                    publication_status: PUBLICATION_STATUS.DRAFT,
                    event_status: EVENT_STATUS.POSTPONED,
                };
                const expectedClassNames = ['postponed', 'draft', 'umbrella'];
                wrapper.setState({event: event, loading: false});
                const headerElement = wrapper.find('h2');
                expect(headerElement).toHaveLength(1);
                const expectedBadge = wrapper.find(Badge);
                expect(expectedBadge).toHaveLength(3);
                expectedBadge.forEach((element, index) => {
                    expect(element.prop('className')).toBe(`${expectedClassNames[index]} `);
                    expect(element.prop('variant')).toBe(expectedClassNames[index]);
                });
            });
        });
        describe('EventDetails', () => {
            test('is rendered with correct props if loading is false', () => {
                const wrapper = getWrapper();
                const expectedProps = {
                    values: mapAPIDataToUIFormat(wrapper.state('event')),
                    superEvent: wrapper.state('superEvent'),
                    rawData: wrapper.state('event'),
                    publisher: wrapper.state('publisher'),
                    editor: defaultProps.editor,
                };
                wrapper.setState({loading: false});
                const elements = wrapper.find(EventDetails);
                expect(elements).toHaveLength(1);
                expect(elements.prop('values')).toEqual(expectedProps.values);
                expect(elements.prop('superEvent')).toEqual(expectedProps.superEvent);
                expect(elements.prop('rawData')).toEqual(expectedProps.rawData);
                expect(elements.prop('publisher')).toEqual(expectedProps.publisher);
                expect(elements.prop('editor')).toEqual(expectedProps.editor);
            });
            test('is not rendered is loading is true', () => {
                const wrapper = getWrapper();
                wrapper.setState({loading: true});
                const elements = wrapper.find(EventDetails);
                expect(elements).toHaveLength(0);
            });
        });
        describe('Spinner', () => {
            test('is rendered with correct props if loading is true', () => {
                const wrapper = getWrapper();
                const headerText = wrapper.find('h1');
                const element = headerText.find(Spinner);
                expect(element).toHaveLength(1);
                expect(element.prop('animation')).toBe('border');
                expect(element.prop('role')).toBe('status');
                const srOnlyElement = element.find('span');
                expect(srOnlyElement.prop('className')).toBe('sr-only');
            });
            test('is not rendered and is replaced with event name when loading is false', () => {
                const wrapper = getWrapper();
                wrapper.setState({loading: false, event:{name:{fi:'event name'}}});
                const headerText = wrapper.find('h1');
                expect(headerText.find(Spinner)).toHaveLength(0);
                expect(headerText.text()).toBe('event name');
            });
        });
    });
});
