import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {UnconnectedConfirmDialog} from './index';
import {Button, Modal} from 'reactstrap';
import {cancelAction, doAction} from '../../actions/app';
jest.mock('../../actions/app');

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const dispatch = jest.fn()

const defaultProps = {
    app: {
        confirmAction: {
            data: {
                action: jest.fn(),
                additionalMarkup: ' ',
                additionalMsg: 'test-test',
            },
            actionButtonLabel: 'switch-type',
            msg: 'confirm-type-switch',
            style: 'warning',
        },
        flashMsg: null,
    },
    intl,
    cancel: jest.fn(),
    do: jest.fn(),
    dispatch: jest.fn(),
}

describe('UmbrellaSelector', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedConfirmDialog {...defaultProps} {...props} />, {context: {dispatch}});
    }
    
    describe('components', () => {
        describe('Modal component', () => {
            test('correct props', () => {
                const wrapper = getWrapper().find(Modal)
                expect(wrapper.prop('size')).toBe('lg')
                expect(wrapper.prop('isOpen')).toBe(!!defaultProps.app.confirmAction)
                expect(wrapper.prop('onClose')).toBeDefined()
                expect(wrapper.prop('className')).toBe('ConfirmationModal')
                expect(wrapper.prop('centered')).toBe(true)
            })
        })
        describe('Button components', () => {
            test('correct props', () => {
                const wrapper = getWrapper().find(Button)
                expect(wrapper).toHaveLength(2)
                wrapper.forEach((element, index) => {
                    expect(element.prop('variant')).toBe('contained')
                    expect(element.prop('color')).toBe(['secondary', 'danger'][index])
                    expect(element.prop('onClick')).toBeDefined()
                });
            })
        })
        describe('FormattedMessages', () => {
            test('correct amount', () => {
                const wrapper = getWrapper().find(FormattedMessage)
                expect(wrapper).toHaveLength(3)
            })
        })
    })

    describe('simulates', () => {
        describe('cancel', () => {
            test('simulate cancel call', () => {
                const wrapper = getWrapper()
                const spy = jest.spyOn(wrapper.instance().props, 'cancel');
                const buttonElement = wrapper.find(Button).at(0)
                buttonElement.simulate('click')
                expect(spy).toHaveBeenCalledTimes(1)
            })
        })
        describe('cancelAction', () => {
            test('simulate close call', () => {
                const wrapper = getWrapper()
                const modalElement = wrapper.find(Modal)
                modalElement.simulate('close')
                expect(cancelAction).toHaveBeenCalledTimes(1)
            })
        })
        describe('do', () => {
            test('simulate do call', () => {
                const wrapper = getWrapper()
                const buttonElement = wrapper.find(Button).at(1)
                buttonElement.simulate('click')
                expect(defaultProps.do.mock.calls.length).toBe(1);
                expect(defaultProps.do.mock.calls[0][0]).toBe(defaultProps.app.confirmAction.data);
            })
        })
    })
})
