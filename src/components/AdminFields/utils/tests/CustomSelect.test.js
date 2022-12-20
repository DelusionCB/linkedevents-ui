import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {UnconnectedCustomSelect} from '../CustomSelect';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    label: 'test-id',
    options: [],
    value: '',
    onChange: () => {},
    required: false,
    disabled: false,
    validation: {error: false, errorMsg: ''},
    intl,
}


function getWrapper(props) {
    return shallow(<UnconnectedCustomSelect {...defaultProps} {...props} />, {intl: {intl}});
}

describe('UnconnectedCustomSelect', () => {

    describe('Components', () => {

        describe('FormattedMessage', () => {
            const wrapper = getWrapper()
            test('find one without validation being false', () => {
                const formatMsg = wrapper.find(FormattedMessage)
                expect(formatMsg).toHaveLength(2)
            })
            test('find two while validation being true', () => {
                wrapper.setProps({validation: {error: true, errorMsg: ''}})
                const formatMsg = wrapper.find(FormattedMessage)
                expect(formatMsg).toHaveLength(3)
            })
            test('correct IDs', () => {
                wrapper.setProps({validation: {error: true, errorMsg: 'test-validation'}})
                const formatMsg = wrapper.find(FormattedMessage)
                expect(formatMsg.at(0).prop('id')).toBe('test-id')
                expect(formatMsg.at(1).prop('id')).toBe('admin-org-select')
                expect(formatMsg.at(2).prop('id')).toBe('test-validation')
            })
        })

        describe('select', () => {
            const wrapper = getWrapper()
            test('correct props', () => {
                const select = wrapper.find('select')
                expect(select.prop('aria-required')).toBe(defaultProps.required)
                expect(select.prop('required')).toBe(defaultProps.required)
                expect(select.prop('className')).toBe('newOrg-select')
                expect(select.prop('disabled')).toBe(defaultProps.disabled)
                expect(select.prop('value')).toBe(defaultProps.value)
                expect(select.prop('onChange')).toBeDefined()
            })
            test('correct className during validation being true', () => {
                wrapper.setProps({validation: {error: true, errorMsg: 'test-validation'}})
                const select = wrapper.find('select')
                expect(select.prop('className')).toBe('newOrg-select invalid')
            })
        })
    })
})
