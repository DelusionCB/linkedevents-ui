import configureStore from 'redux-mock-store';
import React from 'react';
import thunk from 'redux-thunk';
import {shallow} from 'enzyme';
import renderer from 'react-test-renderer';
import {IntlProvider} from 'react-intl';
import {Helmet} from 'react-helmet';

import testReduxIntWrapper from '../../../__mocks__/testReduxIntWrapper';
import {mockCurrentTime, resetMockDate} from '../../../__mocks__/testMocks';
import ConnectedModeration, {Moderation} from './Moderation';

import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import EventTable from '../../components/EventTable/EventTable';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

jest.mock('../../utils/events', () => {
    return {
        fetchEvents: jest.fn().mockImplementation(() => {
            return {
                data: {data:{},meta:{count:0}},
            }
        }),
        EventQueryParams: jest.fn().mockImplementation(() => {
            return {
                setPublisher: () => {},
                setSort: () => {},
            }
        }),
    }
});
const mockStore = configureStore([thunk]);
const initialStore = {
    user: {
        data: {
            id: 'testuser',
            username: 'fooUser',
            provider: 'helsinki',
        },
        isFetchingUser: false,

    },
    app: {
        flashMsg: null,
        confirmAction: null,
    },
    auth: {
        isLoadingUser: false,
        user: {},
    },
};

const defaultProps = {
    intl,
    auth: {
        isLoadingUser: false,
        user: null,
    },
    isFetchingUser: false,
    routerPush: jest.fn(),
};

describe('Moderation Snapshot', () => {
    let store;

    beforeEach(() => {
        mockCurrentTime('2018-11-10T12:00:00z');
    });

    afterEach(() => {
        resetMockDate();
    });

    it('should render view by default', () => {
        const componentProps = {
            confirm: jest.fn(),
            routerPush: jest.fn(),
            setFlashMsg: jest.fn(),
            user: {},
            auth: {
                isLoadingUser: false,
                user: null,
            },
        };
        const wrapper = shallow(<Moderation {...componentProps} />, {context: {intl}});
        expect(wrapper).toMatchSnapshot();
    });

    it('should render view correctly', () => {
        store = mockStore(initialStore);
        const componentProps = {
            confirm: jest.fn(),
            routerPush: jest.fn(),
            setFlashMsg: jest.fn(),
            user: {},
            auth: {
                isLoadingUser: false,
                user: null,
            },
        };
        const componentToTest = <ConnectedModeration {...componentProps} />;
        const wrapper = renderer.create(testReduxIntWrapper(store, componentToTest));

        expect(wrapper).toMatchSnapshot();
    });
});
describe('Moderation', () => {
    function getWrapper(props) {
        return shallow(<Moderation {...defaultProps} {...props} />, {context: {intl}});
    }
    describe('lifecycle methods', () => {
        describe('componentDidMount', () => {
            test('calls fetchTableData if !auth.isLoadingUser, user is not null, and user belongs to org', () => {
                const mockUser = {organizationsWithRegularUsers: ['first','second']};
                const wrapper = getWrapper({user: mockUser});
                const instance = wrapper.instance();
                const fetchDataSpy = jest.spyOn(instance, 'fetchTableData');
                instance.componentDidMount();
                expect(fetchDataSpy).toHaveBeenCalledTimes(1);
            });
            test('does not call fetchTableData if auth.isLoadingUser, user is not null, and user belongs to org', () => {
                const mockUser = {organizationsWithRegularUsers: ['first','second']};
                const wrapper = getWrapper({user: mockUser, auth:{isLoadingUser: true}});
                const instance = wrapper.instance();
                const fetchDataSpy = jest.spyOn(instance, 'fetchTableData');
                instance.componentDidMount();
                expect(fetchDataSpy).toHaveBeenCalledTimes(0);
            })
            test('does not call fetchTableData if user is null', () => {
                const wrapper = getWrapper({user: null, auth:{isLoadingUser: false}});
                const instance = wrapper.instance();
                const fetchDataSpy = jest.spyOn(instance, 'fetchTableData');
                instance.componentDidMount();
                expect(fetchDataSpy).toHaveBeenCalledTimes(0);
            });
            test('does not call fetchTableData if user does not belong to organization with regular users', () => {
                const wrapper = getWrapper({user: {id:'test'}, auth:{isLoadingUser: false}});
                const instance = wrapper.instance();
                const fetchDataSpy = jest.spyOn(instance, 'fetchTableData');
                instance.componentDidMount();
                expect(fetchDataSpy).toHaveBeenCalledTimes(0);
            });
        });
        describe('componentDidUpdate', () => {
            describe('routerPush', () => {
                afterEach(() => {
                    jest.clearAllMocks();
                })
                test('is called if user is null && !isFetchingUser && !auth.isLoadingUser && !auth.user', () => {
                    const wrapper = getWrapper({user: {}});
                    expect(defaultProps.routerPush).not.toHaveBeenCalled();
                    wrapper.setProps({user: null});
                    expect(defaultProps.routerPush).toHaveBeenCalled();
                    expect(defaultProps.routerPush).toHaveBeenCalledWith('/');
                });
                test('is not called if user is null && !isFetchingUser && !auth.isLoadingUser && auth.user', () => {
                    const wrapper = getWrapper({user: {}});
                    expect(defaultProps.routerPush).not.toHaveBeenCalled();
                    wrapper.setProps({user: null, auth:{isLoadingUser: false, user: {}}});
                    expect(defaultProps.routerPush).not.toHaveBeenCalled();
                });
                test('is not called if user is null && !isFetchingUser && auth.isLoadingUser', () => {
                    const wrapper = getWrapper({user: {}});
                    expect(defaultProps.routerPush).not.toHaveBeenCalled();
                    wrapper.setProps({user: null, auth:{isLoadingUser: true}});
                    expect(defaultProps.routerPush).not.toHaveBeenCalled();
                });
                test('is not called if user is null && isFetchingUser', () => {
                    const wrapper = getWrapper({user: {}});
                    expect(defaultProps.routerPush).not.toHaveBeenCalled();
                    wrapper.setProps({user: null, isFetchingUser: true});
                    expect(defaultProps.routerPush).not.toHaveBeenCalled();
                });
            });
            describe('fetchTableData', () => {
                test('is called if prevProps.user is null && user && user has org with regular users', () => {
                    const wrapper = getWrapper({user: null});
                    const instance = wrapper.instance();
                    const fetchDataSpy = jest.spyOn(instance, 'fetchTableData');
                    wrapper.setProps({user: {organizationsWithRegularUsers:['first','second']}});
                    expect(fetchDataSpy).toHaveBeenCalled();
                });
                test('is not called if prevProps.user is null && user && user does not have org with regular users', () => {
                    const wrapper = getWrapper({user: null});
                    const instance = wrapper.instance();
                    const fetchDataSpy = jest.spyOn(instance, 'fetchTableData');
                    wrapper.setProps({user: {organizationsWithRegularUsers:[]}});
                    expect(fetchDataSpy).not.toHaveBeenCalled();
                });
                test('is not called if prevProps.user is null && !user ', () => {
                    const wrapper = getWrapper({user: null});
                    const instance = wrapper.instance();
                    const fetchDataSpy = jest.spyOn(instance, 'fetchTableData');
                    wrapper.setProps({user: undefined});
                    expect(fetchDataSpy).not.toHaveBeenCalled();
                });
                test('is not called if prevProps.user is not null', () => {
                    const wrapper = getWrapper({user: {}});
                    const instance = wrapper.instance();
                    const fetchDataSpy = jest.spyOn(instance, 'fetchTableData');
                    wrapper.setProps({user: undefined});
                    expect(fetchDataSpy).not.toHaveBeenCalled();
                });
            });
        });
    });
    describe('renders', () => {
        test('react-helmet is defined and gets title prop', () => {
            const wrapper = getWrapper().find(Helmet);
            const pageTitle = wrapper.prop('title');
            expect(wrapper).toBeDefined();
            expect(pageTitle).toBe('Linkedevents - Moderoi sisältöjä');
        });
        describe('EventTable', () => {
            test('correct amount of EventTable components if user is logged in', () => {
                const wrapper = getWrapper({user: {}});
                let tableComponents = wrapper.find(EventTable);
                expect(tableComponents).toHaveLength(2)
            });
            test('no EventTable components are rendered if user not logged in', () => {
                const wrapper = getWrapper();
                let tableComponents = wrapper.find(EventTable);
                expect(tableComponents).toHaveLength(0)
            });
        });
    });
});
