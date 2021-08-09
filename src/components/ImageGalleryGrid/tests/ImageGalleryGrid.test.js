import './index.scss';

import React from 'react';
import {shallow} from 'enzyme';
import ImagePagination from '../ImagePagination';
import {fetchUserImages} from 'src/actions/userImages'
import {Button, Input, Form} from 'reactstrap';
import Spinner from 'react-bootstrap/Spinner';
import {UnconnectedImageGalleryGrid} from '../index';
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {mockUser} from '../../../../__mocks__/mockData';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();



const defaultProps = {
    intl,
    fetchUserImages: jest.fn(),
    user: mockUser,
    defaultModal: false,
    pageSizeDefault: 50,
    editor: {
        values: {
                
        },
    },
    images: {
        fetchComplete: true,
        isFetching: false,
        meta: {},
        items: [],
    },
};

describe('ImageGalleryGrid', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedImageGalleryGrid {...defaultProps} {...props}/>, {context: {intl}});
    }

    describe('components', () => {

        describe('input', () => {
            test('with correct props', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const element = wrapper.find(Input);
                expect(element).toHaveLength(1);
                expect(element.prop('id')).toBe('search-imgs');
                expect(element.prop('placeholder')).toBe(intl.formatMessage({id: 'search-images-text'}));
                expect(element.prop('type')).toBe('text');
                expect(element.prop('onChange')).toBeDefined();
                expect(element.prop('value')).toBe(instance.state.searchString);
            });
            test('not found if user does not exist', () => {
                const wrapper = getWrapper({user: null})
                const element = wrapper.find(Input);
                expect(element).toHaveLength(0);
            })
        });

        describe('formattedMessages', () => {
            test('correct amount', () => {
                const wrapper = getWrapper()
                const message = wrapper.find(FormattedMessage);
                expect(message).toHaveLength(3);
            });
        });

        describe('form', () => {
            test('correct onSubmit', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const formElement = wrapper.find(Form);
                expect(formElement.prop('onSubmit')).toBe(instance.submitHandler);
            });
        });

        describe('button', () => {
            test('if updateExisting: true, set image data to state', () => {
                const wrapper = getWrapper()
                const buttonElement = wrapper.find(Button);
                expect(buttonElement).toHaveLength(1);
                expect(buttonElement.prop('color')).toBe('primary');
                expect(buttonElement.prop('variant')).toBe('contained');
                expect(buttonElement.prop('type')).toBe('submit');
            });
        });

        describe('imagePagination', () => {
            test('find with correct props', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const paginationElement = wrapper.find(ImagePagination);
                expect(paginationElement).toHaveLength(1);
                expect(paginationElement.prop('clickedPage')).toBe(instance.changeImagePage);
                expect(paginationElement.prop('responseMetadata')).toBe(defaultProps.images.meta);
            });
            test('not found if defaultModal is true', () => {
                const wrapper = getWrapper({defaultModal: true})
                const paginationElement = wrapper.find(ImagePagination);
                expect(paginationElement).toHaveLength(0);
            })
        });

        describe('spinner', () => {
            test('exists during isFetching being true', () => {
                const wrapper = getWrapper({images: {isFetching: true, fetchComplete: false, meta: {}, items: []}})
                const spinnerElement = wrapper.find(Spinner)
                wrapper.setProps({isFetching: true, fetchComplete: false})
                expect(spinnerElement).toHaveLength(1);
            });
            test('does not exists during isFetching being false', () => {
                const wrapper = getWrapper({images: {isFetching: false, fetchComplete: true, meta: {}, items: []}})
                const spinnerElement = wrapper.find(Spinner)
                expect(spinnerElement).toHaveLength(0);
            });
        });
    });


    describe('methods', () => {

        describe('componentDidMount', () => {
            test('fetchImages is called in mount', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const spy = jest.spyOn(instance, 'fetchImages');
                instance.componentDidMount()
                expect(spy).toHaveBeenCalled()
            })
        })
        describe('fetchImages', () => {
            test('default images', () => {
                const wrapper = getWrapper({defaultModal: true, user: null})
                const instance = wrapper.instance();
                const spy = jest.spyOn(wrapper.instance().props, 'fetchUserImages');
                instance.fetchImages()
                expect(spy).toHaveBeenCalledWith(50, 1, true)
            })
            test('images for user', () => {
                const wrapper = getWrapper({defaultModal: false})
                const instance = wrapper.instance();
                const spy = jest.spyOn(wrapper.instance().props, 'fetchUserImages');
                instance.fetchImages()
                expect(spy).toHaveBeenCalledWith(50, 1)
            })
            test('images with filter', () => {
                const wrapper = getWrapper({defaultModal: false})
                const instance = wrapper.instance();
                wrapper.setState({searchString: 'test'})
                const spy = jest.spyOn(wrapper.instance().props, 'fetchUserImages');
                spy.mockClear();
                wrapper.instance().fetchImages();
                expect(spy).toHaveBeenCalledWith(50, 1, false, true, instance.state.searchString)
            })
        })

        describe('changeImagePage', () => {
            test('fetchImages is called with correct pagenumber', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const spy = jest.spyOn(wrapper.instance(), 'fetchImages');
                instance.changeImagePage(1, {preventDefault: () => {}})
                expect(spy).toHaveBeenCalledWith(defaultProps.user, 50, 1)
            })
        })

        describe('searchOnChange', () => {
            const expectedValue = 'test-search'
            const event = expectedValue
            test('sets state searchString', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                instance.searchOnChange(event)
                expect(instance.state.searchString).toBe(expectedValue)
            })
        })

        describe('submitHandler', () => {
            test('click proper button for submitHandler', () => {
                const wrapper = getWrapper()
                const btnElement = wrapper.find(Button)
                const spy = jest.spyOn(wrapper.instance().props, 'fetchUserImages');
                wrapper.setState({searchString: 'test'})
                btnElement.simulate('click', {preventDefault: () => {}});
                expect(spy).toHaveBeenCalled()
            })
        })
    })

});
