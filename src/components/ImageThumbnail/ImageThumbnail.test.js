import React from 'react'
import {shallow} from 'enzyme'
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {mockUser, mockImages} from '__mocks__/mockData';
import {UnconnectedImageThumbnail} from './index';
import {Button} from 'reactstrap'

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const imageMock = mockImages[0]

jest.mock('src/actions/app.js');

const defaultProps = {
    dispatch: jest.fn(),
    close: jest.fn(),
    confirmAction: jest.fn(),
    setFlashMsg: jest.fn(),
    deleteImage: jest.fn(),
    selectImage: jest.fn(),
    data: imageMock,
    defaultModal: false,
    user: mockUser,
    selected: false,
    locale: 'fi',
    url: 'www.google.com',
    editor: {
        values: {
            type_id: 'event',
        },
    },
};

describe('ImageThumbnail', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedImageThumbnail {...defaultProps} {...props} />, {context: {intl}});
    }

    describe('render', () => {
        describe('components', () => {
            describe('buttons', () => {
                test('reactstrap with correct props', () => {
                    const wrapper = getWrapper()
                    const element = wrapper.find(Button);
                    const instance = wrapper.instance();
                    const backGround = {'backgroundImage': 'url(www.google.com)'}
                    expect(element).toHaveLength(1);
                    expect(element.prop('aria-label')).toBe('Valitse kuvaksi');
                    expect(element.prop('className')).toBe('thumbnail');
                    expect(element.prop('style')).toEqual(backGround);
                    expect(element.prop('onClick')).toBe(instance.selectThis);
                });
                test('html with correct props', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    const element = wrapper.find('button');
                    expect(element).toHaveLength(2);
                    expect(element.at(0).prop('className')).toBe('btn')
                    expect(element.at(1).prop('className')).toBe('btn')
                    expect(element.at(0).prop('onClick')).toBeDefined()
                    expect(element.at(1).prop('onClick')).toBe(instance.handleDelete)
                    expect(element.at(0).prop('aria-label')).toBe('Muokkaa tätä kuvaa')
                    expect(element.at(1).prop('aria-label')).toBe('Poista tämä kuva järjestelmästä')
                });
                test('defaultModal true, buttons not found', () => {
                    const wrapper = getWrapper({defaultModal: true})
                    const element = wrapper.find('button');
                    expect(element).toHaveLength(0);
                });
            })
            describe('formattedMessage', () => {
                test('correct amount', () => {
                    const element = getWrapper().find(FormattedMessage);
                    expect(element).toHaveLength(1);
                })
            })
        })
        describe('methods', () => {
            describe('handleDelete', () => {
                test('confirmAction called', () => {
                    const wrapper = getWrapper({selected: true})
                    const instance = wrapper.instance();
                    const spy = jest.spyOn(wrapper.instance().props, 'confirmAction');
                    instance.handleDelete()
                    expect(spy).toHaveBeenCalled()
                })
            })
            describe('selectThis', () => {
                test('selectImage called', () => {
                    const wrapper = getWrapper({selected: true})
                    const instance = wrapper.instance();
                    const spy = jest.spyOn(wrapper.instance().props, 'selectImage');
                    instance.selectThis()
                    expect(spy).toHaveBeenCalled()
                })
                test('close is called', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    const spy = jest.spyOn(wrapper.instance().props, 'close');
                    instance.selectThis()
                    expect(spy).toHaveBeenCalled()
                })
            })
            describe('button sets edit as true', () => {
                test('toggle edit', () => {
                    const wrapper = getWrapper()
                    const element = wrapper.find('button').at(0);
                    element.simulate('click')
                    expect(wrapper.state('edit')).toBe(true)
                })
            })
        })
    })
})
