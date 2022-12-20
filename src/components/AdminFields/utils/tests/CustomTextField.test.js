import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import constants from '../../../../constants'
import {UnconnectedTextField} from '../CustomTextField';
import {Input, InputGroup, InputGroupAddon} from 'reactstrap';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    onChange: () => {},
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

    describe('Components', () => {

        describe('FormattedMessage', () => {
            const wrapper = getWrapper()
            test('find one without validation being false', () => {
                const formatMsg = wrapper.find(FormattedMessage)
                expect(formatMsg).toHaveLength(1)
            })
            test('find two while validation being true', () => {
                wrapper.setProps({validation: {error: true, errorMsg: ''}})
                const formatMsg = wrapper.find(FormattedMessage)
                expect(formatMsg).toHaveLength(2)
            })
            test('correct IDs', () => {
                wrapper.setProps({validation: {error: true, errorMsg: 'test-validation'}})
                const formatMsg = wrapper.find(FormattedMessage)
                expect(formatMsg.at(0).prop('id')).toBe('test-label')
                expect(formatMsg.at(1).prop('id')).toBe('test-validation')
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
                expect(input.prop('onBlur')).toBeDefined()
                expect(input.prop('disabled')).toBe(defaultProps.disabled)
                expect(input.prop('invalid')).toBe(defaultProps.validation.error)
                expect(input.prop('aria-invalid')).toBe(defaultProps.validation.error)
            })
        })
    })
})
