import configureStore from 'redux-mock-store'
import React from 'react'
import thunk from 'redux-thunk'

import testReduxIntWrapper from '../../../__mocks__/testReduxIntWrapper'
import Search from './index'
import SearchBar from 'src/components/SearchBar/index'
import EventGrid from 'src/components/EventGrid';
import {mockUser} from '__mocks__/mockData';
import {shallow} from 'enzyme'
import Spinner from 'react-bootstrap/Spinner'
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {Helmet} from 'react-helmet'
import {mockUserEvents} from '../../../__mocks__/mockData'

jest.mock('../../utils/events', () => (
    {
        ...(jest.requireActual('../../utils/events')),
        fetchEvents: jest.fn(() =>(
            new Promise((resolve) => {
                process.nextTick(() =>
                    resolve({data: {data: mockUserEvents}})
                );
            })
        )),
    }
))
import {EventQueryParams, fetchEvents} from '../../utils/events'

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const mockStore = configureStore([thunk]);
const initialStore = {
    user: mockUser,
    events: [{
        apiErrorMsg: null,
        isFetching: false,
        fetchComplete: false,
        items: [],
        eventError: null,
        eventsError: null,
    }],
};

// mock moment to render search dates as expected
jest.mock('moment');

describe('Search Snapshot', () => {
    let store;

    it('should render view correctly', () => {
        const componentProps = {
            match: {
                params: {
                    action: 'search',
                },
            },
        } // Props which are added to component
        store = mockStore(initialStore);
        const componentToTest = <Search {...componentProps} />
        const wrapper = shallow(testReduxIntWrapper(store, componentToTest))

        expect(wrapper).toMatchSnapshot()

    })
})

const defaultProps = {
    intl,
}

describe('Search', () => {
    function getWrapper(props) {
        return shallow(<Search {...defaultProps} {...props}/>, {context: {intl}});
    }
    describe('render', () => {

        test('SearchBar element', () => {
            const element = getWrapper().find(SearchBar);
            expect(element).toHaveLength(1);
            expect(element.props('onFormSubmit')).toBeDefined();
        });

        test('search results status div', () => {
            const div = getWrapper().find('#search-page-results-count-status')
            expect(div).toHaveLength(1)
            expect(div.prop('role')).toBe('status')
            expect(div.prop('aria-live')).toBe('polite')
            expect(div.prop('aria-atomic')).toBe('true')
        })

        describe('search results status count text', () => {
            test('when search has not been executed', () => {
                const wrapper = getWrapper()
                wrapper.setState({searchExecuted: false})
                const resultsText = wrapper.find('#search-results-count')
                expect(resultsText).toHaveLength(0)
            })
            test('when search has been executed', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                wrapper.setState({searchExecuted: true})
                const resultsText = wrapper.find('#search-results-count')
                expect(resultsText).toHaveLength(1)
                expect(resultsText.prop('values')).toStrictEqual({count: instance.state.events.length})
                expect(resultsText.prop('children')).toBeDefined()
            })
        })

        test('results section', () => {
            const section = getWrapper().find('section.container-fluid')
            expect(section).toHaveLength(1)
        })

        test('Spinner element when loading', () => {
            const element = getWrapper();
            element.setState({loading: true});
            const spinnerElement = element.find(Spinner);
            expect(spinnerElement).toHaveLength(1);
        });
        test('FormattedMessage element inside of the Spinner element', () => {
            const wrapper = getWrapper();
            wrapper.setState({loading: true});
            const messageElement = wrapper.find(Spinner).find(FormattedMessage);
            expect(messageElement).toHaveLength(1);
            expect(messageElement.prop('id')).toBe('loading');
        })

        describe('FormattedMessages', () => {
            test('default amount', () => {
                const element = getWrapper().find(FormattedMessage);
                expect(element).toHaveLength(3);
            });
            test('correct amount when !events & searchExecuted', () => {
                const element = getWrapper();
                element.setState({searchExecuted: true});
                const formattedMessages = element.find(FormattedMessage);
                expect(formattedMessages).toHaveLength(4);
            });
            test('correct amount when events & searchExecuted', () => {
                const element = getWrapper()
                element.setState({searchExecuted: true, events:['Tammi','Koivu']});
                const grid = element.find(EventGrid)
                expect(grid).toHaveLength(1);
                expect(grid.prop('events')).toEqual(element.state('events'));
            });
            test('correct amount when loading', () => {
                const element = getWrapper();
                element.setState({loading: true});
                const formattedMessages = element.find(FormattedMessage);
                expect(formattedMessages).toHaveLength(4);
            });
        });

        describe('react-helmet', () => {
            test('react-helmet is defined and gets title prop', () => {
                const wrapper = getWrapper().find(Helmet);
                const pageTitle = wrapper.prop('title');
                expect(wrapper).toBeDefined();
                expect(pageTitle).toBe('Linkedevents - Etsi sisältöjä');
            });
        });

        describe('correct count to search results FormattedMessage when search has been executed', () => {
            let element;

            beforeEach(() => {
                element = getWrapper();
                element.setState({searchExecuted: true});
            });
            test('when no results', () => {
                const resultCount = element.find(FormattedMessage).at(3);
                const count = element.state('events');
                expect(resultCount.prop('values')).toEqual({'count': count.length});
            });
            test('when results', () => {
                element.setState({events:['Tammi','Koivu']});
                const resultCount = element.find(FormattedMessage).at(3);
                const count = element.state('events');
                expect(resultCount.prop('values')).toEqual({'count': count.length});
            });
        });
    });

    describe('functions', () => {
        describe('searchEvents', () => {
            const searchQuery = 'testing'
            const startDate = undefined
            const endDate = undefined
            const context = ['eventgeneral']

            test('calls fetchEvents with correct parameters', () => {
                const date = new Date(`2021`)
                jest.spyOn(global.Date, 'now').mockImplementationOnce(() => date);
                const instance = getWrapper().instance()
                const queryParams = new EventQueryParams()
                queryParams.page_size = 100
                queryParams.sort = 'start_time'
                queryParams.nocache = date
                queryParams.text = searchQuery
                queryParams.type_id = context.join()
                instance.searchEvents(searchQuery, context, startDate, endDate)
                expect(fetchEvents).toHaveBeenCalledTimes(1)
                expect(fetchEvents).toHaveBeenCalledWith(queryParams);
            })

            test('sets correct state values', async () => {
                const instance = getWrapper().instance()
                const initialState = {...instance.state}
                expect(instance.state.events).toStrictEqual(initialState.events)
                expect(instance.state.searchExecuted).toBe(initialState.loading)
                expect(instance.state.loading).toBe(initialState.searchExecuted)
                await instance.searchEvents(searchQuery, context, startDate, endDate)
                expect(instance.state.events).toBe(mockUserEvents)
                expect(instance.state.searchExecuted).toBe(true)
                expect(instance.state.loading).toBe(false)
            })
        });
        describe('getResults', () => {
            test('returns null when searchExecuted && !events.length > 0', () => {
                const wrapper = getWrapper();
                wrapper.setState({searchExecuted: true, events:[]});
                const instance = wrapper.instance();
                const values = instance.getResults();
                expect(values).toBe(null)
            });

            test('returns EventGrid when searchExecuted is true and events length is > 0', () => {
                const wrapper = getWrapper();
                const initEvents = ['first','second'];
                wrapper.setState({searchExecuted: true, events: initEvents});
                const instance = wrapper.instance();
                const values = instance.getResults();
                const store = mockStore(initialStore);
                const results = shallow(testReduxIntWrapper(store, values));
                const expectedElement = results.find(EventGrid);
                expect(expectedElement).toHaveLength(1);
                expect(expectedElement.prop('events')).toEqual(initEvents);
            });
            test('returns EventGrid when searchExecuted is false and events length is > 0', () => {
                const wrapper = getWrapper();
                const initEvents = ['first','second'];
                wrapper.setState({searchExecuted: false, events: initEvents});
                const instance = wrapper.instance();
                const values = instance.getResults();
                const store = mockStore(initialStore);
                const results = shallow(testReduxIntWrapper(store, values));
                const expectedElement = results.find(EventGrid);
                expect(expectedElement).toHaveLength(1);
                expect(expectedElement.prop('events')).toEqual(initEvents);
            });
        })
    })
})



