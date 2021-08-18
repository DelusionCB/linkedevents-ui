import React from 'react'
import {shallow} from 'enzyme'
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {Modal} from 'reactstrap';
import ImageGalleryGrid from '../ImageGalleryGrid';
import {confirmAction} from 'src/actions/app.js';
import {ImagePicker} from './index'
import {mockUser, mockImages} from '__mocks__/mockData';

jest.mock('src/actions/app.js');

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const imageMock = mockImages[0]

const defaultProps = {
    editor: {
        values: {
            image: {imageMock},
        },
        validationErrors: {},
    },
    uiMode: '',
    user: mockUser,
    dispatch: jest.fn(),
    action: () => {},
    open: false,
    close: () => null,
    intl,
    defaultModal: false,
    images: {
        defaultImages: [],
        isFetching: false,
        fetchComplete: false,
        items: mockImages,
        selected: {},
    },
};

describe('ImagePicker', () => {
    function getWrapper(props) {
        return shallow(<ImagePicker {...defaultProps} {...props} />, {context: {intl}});
    }
    describe('render', () => {
        describe('components', () => {
            describe('modal', () => {
                test('correct props', () => {
                    const element = getWrapper().find(Modal);
                    expect(element).toHaveLength(1);
                    expect(element.prop('isOpen')).toEqual(defaultProps.open);
                    expect(element.prop('className')).toEqual('image-picker--dialog');
                    expect(element.prop('toggle')).toEqual(defaultProps.close);
                    expect(element.prop('size')).toEqual('xl');
                    expect(element.prop('role')).toEqual('dialog');
                    expect(element.prop('id')).toEqual('dialog1');
                    expect(element.prop('aria-modal')).toEqual('true');
                });
            })
            describe('formattedMessage', () => {
                test('correct amount', () => {
                    const element = getWrapper().find(FormattedMessage);
                    expect(element).toHaveLength(1);
                })
            })
            describe('imageGalleryGrid', () => {
                test('correct props', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    const element = wrapper.find(ImageGalleryGrid);
                    expect(element.prop('editor')).toEqual(defaultProps.editor);
                    expect(element.prop('user')).toEqual(defaultProps.user);
                    expect(element.prop('images')).toEqual(defaultProps.images);
                    expect(element.prop('locale')).toEqual(intl.locale);
                    expect(element.prop('defaultModal')).toEqual(defaultProps.open);
                    expect(element.prop('action')).toEqual(instance.handleDelete);
                    expect(element.prop('close')).toEqual(defaultProps.close);
                })
            })
        })
        describe('methods', () => {
            describe('handleDelete', () => {
                test('confirmAction called', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    instance.handleDelete()
                    expect(confirmAction).toHaveBeenCalled()
                })
            })
        })
    })
})
