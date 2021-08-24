import React from 'react';
import {UnconnectedEventPage} from './index.js';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import {Helmet} from 'react-helmet';
import Badge from 'react-bootstrap/Badge';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import constants from 'src/constants'
import {getStringWithLocale} from '../../utils/locale.js';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    intl,
    userLocale: {
        locale: 'fi',
    },
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

    describe('functions', () => {
        describe('componentDidUpdate', () => {
            const wrapper = getWrapper()
            const instance = wrapper.instance()
            const fetchDataSpy = jest.spyOn(instance, 'fetchEventData')

            afterEach(() => { fetchDataSpy.mockClear() })
            afterAll(() => { fetchDataSpy.mockRestore() })

            test('fetchEventData is called when user prop changes', () => {
                wrapper.setProps({user: {id: '123abc'}})
                wrapper.setProps({user: {id: '567fgh'}})
                wrapper.setProps({user: null})
                expect(fetchDataSpy).toHaveBeenCalledTimes(3)
            })

            test('fetchEventData is not called when user prop does not change', () => {
                const user = {user: {id: '123abc'}}
                wrapper.setProps({user})
                expect(fetchDataSpy).toHaveBeenCalledTimes(1)
                fetchDataSpy.mockClear()
                wrapper.setProps({user})
                expect(fetchDataSpy).toHaveBeenCalledTimes(0)
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
    });
});
