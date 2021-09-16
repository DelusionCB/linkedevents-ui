import React from 'react';
import CheckBoxCell from '../CheckBoxCell';
import {Input} from 'reactstrap';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';

import fiMessages from 'src/i18n/fi.json';
const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();  

const defaultProps = {
    checked: false,
    disabled: false,
    onChange: jest.fn(),
    event: {
        id: '',
    },
    tableName: 'pöytäNimi',
};

describe('CheckBoxCell', () => {
    function getWrapper(props) {
        return shallow(<CheckBoxCell {...defaultProps} {...props}/>, {context: {intl}});
    }
    describe('components', () => {
        describe('input', () => {
            test('correct props', () => {
                const element = getWrapper();
                const inputElement = element.find('input');
                expect(inputElement).toHaveLength(1);
                expect(inputElement.prop('checked')).toEqual(defaultProps.checked);
                expect(inputElement.prop('type')).toBe('checkbox');
                expect(inputElement.prop('disabled')).toEqual(defaultProps.disabled);
                expect(inputElement.prop('onChange')).toBeDefined();
            })
        })
        describe('label', () => {
            test('correct props', () => {
                const wrapper = getWrapper()
                const labelElement = wrapper.find('label')
                expect(labelElement.prop('className')).toBe('custom-control-label')
                expect(labelElement.prop('htmlFor')).toBe(defaultProps.event.id)
            })
        })
    })
    describe('methods', () => {
        describe('isChecked-state', () => {
            test('changes correctly', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                expect(wrapper.state('isChecked')).toBe(false)
                instance.handleRowSelection()
                expect(wrapper.state('isChecked')).toBe(true)
            })
        })
        describe('onChange', () => {
            test('called with right params', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                const spy = jest.spyOn(wrapper.instance().props, 'onChange')

                jest.clearAllMocks()
                instance.handleRowSelection()

                expect(spy).toHaveBeenCalledTimes(1)
                expect(spy).toHaveBeenCalledWith(wrapper.state('isChecked'), defaultProps.event.id, defaultProps.tableName)
            })
        })
    })
})

