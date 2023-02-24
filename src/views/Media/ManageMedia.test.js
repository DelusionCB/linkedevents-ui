import configureStore from 'redux-mock-store';
import React from 'react';
import thunk from 'redux-thunk';
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import testReduxIntWrapper from '../../../__mocks__/testReduxIntWrapper';
import ConnectedManageMedia, {ManageMedia} from './ManageMedia';
import {mockCurrentTime, resetMockDate} from '../../../__mocks__/testMocks';
import {mockImages, mockUser} from '../../../__mocks__/mockData';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import renderer from 'react-test-renderer';
import ImageGalleryGrid from '../../components/ImageGalleryGrid/index';
import {fetchOrganizations} from '../../actions/organizations';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const mockStore = configureStore([thunk]);

const mockUserSuperAdmin = mockUser;
mockUserSuperAdmin.userType = 'superadmin'

const initialStore = {
    user: mockUserSuperAdmin,
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
    routerPush: jest.fn(),
    user: mockUserSuperAdmin,
    isFetchingUser: false,
    editor: {
        values: {
                
        },
    },
    images: {
        fetchComplete: true,
        isFetching: false,
        meta: {},
        items: mockImages,
    },
    fetchOrganizations: jest.fn(),
    activeOrganization: 'turku:04',
    fetchUserImages: jest.fn(),

};

describe('Media Snapshot', () => {
    let store;

    beforeEach(() => {
        mockCurrentTime('2022-12-07T12:49:39.690Z');
    });

    afterEach(() => {
        resetMockDate();
    });

    it('should render view by default', () => {
        const componentProps = {
            editor: {
                values: {
                        
                },
            },
            user: mockUserSuperAdmin,
            showImageDetails: true,
            fetchOrganizations: jest.fn(),
            ...defaultProps,
        };
        const wrapper = shallow(<ManageMedia {...componentProps} />, {context: {intl}});
        expect(wrapper).toMatchSnapshot();
    });

    it('should render view correctly', () => {
        store = mockStore(initialStore);
        const componentProps = {
            editor: {
                values: {
                        
                },
            },
            user: mockUserSuperAdmin,
            showImageDetails: true,
            fetchOrganizations: jest.fn(),
            ...defaultProps,

        };
        const componentToTest = <ConnectedManageMedia {...componentProps} />;
        const wrapper = renderer.create(testReduxIntWrapper(store, componentToTest));

        expect(wrapper).toMatchSnapshot();
    });
});

describe('Media', () => {
    function getWrapper(props) {
        return shallow(<ManageMedia {...defaultProps} {...props} />, {context: {intl}});
    }

    describe('lifecycle methods', () => {
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

            describe('componentDidMount', () =>{
                test('fetchOrganizationsData is called in mount', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    const spy = jest.spyOn(instance, 'fetchOrganizationsData');
                    instance.componentDidMount()
                    expect(spy).toHaveBeenCalled()
                })
    
            })

            describe('componentDidUpdate', () =>{
                test('fetchOrganizationsData is called on update', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    const prevProps = {...instance.props, user: null}
                    const prevState = {...instance.state}
                    const spy = jest.spyOn(instance, 'fetchOrganizationsData');
                    instance.componentDidUpdate(prevProps, prevState)
                    expect(spy).toHaveBeenCalled()
                })

                test('fetchImages is called on update', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    const prevProps = {...instance.props, activeOrganization: 'turku:0719'}
                    const prevState = {...instance.state}
                    const spy = jest.spyOn(instance, 'fetchImages');
                    instance.componentDidUpdate(prevProps, prevState)
                    expect(spy).toHaveBeenCalled()
                })
            })
        });
    })
    describe('renders', () => {
        describe('manage media', () => {
            test('render div', () => {
                const wrapper = getWrapper();
                const div = wrapper.find('div');
                expect(div).toHaveLength(1)
                expect(div.prop('className')).toBe('container manageMedia')
            });
            
            test('message', () => {
                const wrapper = getWrapper();
                const message = wrapper.find('#manage-media');
                expect(message).toHaveLength(1)
            });
        });
    });
});
