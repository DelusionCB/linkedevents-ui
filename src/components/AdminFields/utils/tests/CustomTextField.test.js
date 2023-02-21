import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {UnconnectedTextField} from '../CustomTextField';
import {FormGroup, FormText, Input, InputGroup, InputGroupAddon} from 'reactstrap';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    onChange: () => {},
    onBlur: () => {},
    label: 'test-label',
    id: 'test-id',
    placeholder: 'placeholder',
    value: '',
    required: false,
    disabled: false,
    validation: {error: false, errorMsg: ''},
    intl,
}


function getWrapper(props) {
    return shallow(<UnconnectedTextField {...defaultProps} {...props} />, {intl: {intl}});
}

describe('CustomTextField', () => {
    describe('renders', () => {
        test('wrapping FormGroup', () => {
            const formGroup = getWrapper().find(FormGroup)
            expect(formGroup).toHaveLength(1)
            expect(formGroup.prop('className')).toBe('admin-input')
        })
        describe('input label', () => {
            test('when prop required is true', () => {
                const label = getWrapper({required: true}).find('label')
                expect(label).toHaveLength(1)
                expect(label.prop('htmlFor')).toBe(defaultProps.id)
                expect(label.text()).toBe(defaultProps.label + '*')
                const labelSpan = label.find('span')
                expect(labelSpan).toHaveLength(1)
                expect(labelSpan.prop('aria-hidden')).toBe('true')
            })
            test('when prop required is false', () => {
                const label = getWrapper({required: false}).find('label')
                expect(label).toHaveLength(1)
                expect(label.prop('htmlFor')).toBe(defaultProps.id)
                expect(label.text()).toBe(defaultProps.label)
            })
        })

        describe('InputGroup', () => {
            const wrapper = getWrapper()
            test('correct amount & className', () => {
                const inputGroup = wrapper.find(InputGroup)
                expect(inputGroup.prop('className')).toBe('inputGroup')
            })
            test('correct className during validation being true', () => {
                wrapper.setProps({validation: {error: true, errorMsg: ''}})
                const inputGroup = wrapper.find(InputGroup)
                expect(inputGroup.prop('className')).toBe('inputGroup invalid')
            })
        })

        describe('InputGroupAddon', () => {
            const wrapper = getWrapper()
            test('correct props', () => {
                const inputGroup = wrapper.find(InputGroupAddon)
                expect(inputGroup).toHaveLength(1)
                expect(inputGroup.prop('className')).toBe('inputIcons')
                expect(inputGroup.prop('addonType')).toBe('prepend')
            })
        })
        describe('Glyphicon', () => {
            const wrapper = getWrapper()
            test('correct props', () => {
                const glyph = wrapper.find('span').at(0)
                expect(glyph.prop('className')).toBe('glyphicon glyphicon-pencil')
                expect(glyph.prop('aria-hidden')).toBe(true)
            })
        })
        describe('Input', () => {
            const wrapper = getWrapper()
            test('correct props', () => {
                const input = wrapper.find(Input)
                expect(input).toHaveLength(1)
                expect(input.prop('id')).toBe('test-id')
                expect(input.prop('type')).toBe('text')
                expect(input.prop('defaultValue')).toBe(defaultProps.value)
                expect(input.prop('aria-required')).toBe(defaultProps.required)
                expect(input.prop('onBlur')).toBe(defaultProps.onBlur)
                expect(input.prop('onChange')).toBe(defaultProps.onChange)
                expect(input.prop('disabled')).toBe(defaultProps.disabled)
                expect(input.prop('invalid')).toBe(defaultProps.validation.error)
                expect(input.prop('aria-invalid')).toBe(defaultProps.validation.error)
            })
        })
        describe('FormText for text length', () => {
            test('when maxLength is over 0 and no errors exist', () => {
                const formText = getWrapper({maxLength: 50, validation: {error: false}}).find(FormText)
                expect(formText).toHaveLength(1)
                const expectedText = intl.formatMessage(
                    {id: 'validation-stringLengthCounter'},
                    {counter: 50 - defaultProps.value.length + '/' + 50}
                )
                expect(formText.prop('children')).toBe(expectedText)
            })
            test('when maxLength is 0', () => {
                const formText = getWrapper({maxLength: 0, validation: {error: false}}).find(FormText)
                expect(formText).toHaveLength(0)
            })
        })
        describe('FormText for text max length error', () => {
            test('when maxLength is over 0 and there is a max chars error', () => {
                const validation = {
                    error: true, 
                    errorMaxChars: true, 
                    errorMsg: 'validation-stringLimitReached',
                }
                const formText = getWrapper({maxLength: 50, validation}).find(FormText)
                expect(formText).toHaveLength(1)
                expect(formText.prop('className')).toBe('red-alert')
                const expectedText = intl.formatMessage(
                    {id: validation.errorMsg},
                    {limit: 50}
                )
                expect(formText.prop('children')).toBe(expectedText)
            })
            test('when maxLength is 0 and there is no max chars error', () => {
                const validation = {
                    error: false, 
                    errorMaxChars: false, 
                    errorMsg: '',
                }
                const formText = getWrapper({maxLength: 0, validation}).find(FormText)
                expect(formText).toHaveLength(0)
            })
        })
        describe('FormattedMessage for input general errors', () => {
            test('when there is an error and it is not max chars error', () => {
                const validation = {
                    error: true, 
                    errorMaxChars: false, 
                    errorMsg: 'validation-required',
                }
                const msg = getWrapper({validation}).find(FormattedMessage)
                expect(msg).toHaveLength(1)
                expect(msg.prop('children')).toBeDefined()
            })
            test('when there are no errors', () => {
                const validation = {
                    error: false, 
                    errorMaxChars: false, 
                    errorMsg: '',
                }
                const msg = getWrapper({validation}).find(FormattedMessage)
                expect(msg).toHaveLength(0)
            })
        })
    })
})
