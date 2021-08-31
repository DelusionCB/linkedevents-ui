import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import moment from 'moment';
import {Button, Form, FormGroup} from 'reactstrap';

import fiMessages from 'src/i18n/fi.json';
import {SearchBarWithoutIntl} from '../index'
import CustomDatePicker from '../../CustomFormFields/Dateinputs/CustomDatePicker'
import {HelCheckbox} from '../../HelFormFields';

describe('SearchBar', () => {
    const testMessages = mapValues(fiMessages, (value, key) => value);
    const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
    const {intl} = intlProvider.getChildContext();

    const defaultProps = {
        intl,
        onFormSubmit: () => {},
    }

    function getWrapper(props) {
        return shallow(<SearchBarWithoutIntl {...defaultProps} {...props}/>, {context: {intl}});
    }


    describe('components', () => {
        test('div search-bar', () => {
            const div = getWrapper().find('div.search-bar')
            expect(div).toHaveLength(1)
        })
        test('div search-bar', () => {
            const div = getWrapper().find('div.search-bar--dates')
            expect(div).toHaveLength(1)
        })

        describe('CustomDatePicker', () => {
            test('for both start and end time', () => {
                const datePickers = getWrapper().find(CustomDatePicker)
                expect(datePickers).toHaveLength(2)
            })

            test('start time', () => {
                const datePicker = getWrapper().find(CustomDatePicker).first()
                expect(datePicker.prop('id')).toBe('startTime')
                expect(datePicker.prop('name')).toBe('startTime')
                expect(datePicker.prop('label')).toBe('search-date-label-start')
                expect(datePicker.prop('defaultValue')).toEqual(moment().startOf('day'))
                expect(datePicker.prop('onChange')).toBeDefined()
                expect(datePicker.prop('maxDate')).toBe(undefined)
                expect(datePicker.prop('type')).toBe('date')
            })

            test('end time', () => {
                const datePicker = getWrapper().find(CustomDatePicker).last()
                expect(datePicker.prop('id')).toBe('endTime')
                expect(datePicker.prop('name')).toBe('endTime')
                expect(datePicker.prop('label')).toBe('search-date-label-end')
                expect(datePicker.prop('defaultValue')).toBe(null)
                expect(datePicker.prop('onChange')).toBeDefined()
                expect(datePicker.prop('minDate')).toEqual(moment().startOf('day'))
                expect(datePicker.prop('type')).toBe('date')
            })
        })

        test('div search-bar--input', () => {
            const div = getWrapper().find('div.search-bar--input')
            expect(div).toHaveLength(1)
            expect(div.prop('className')).toBe('search-bar--input event-input')
        })

        test('Form', () => {
            const form = getWrapper().find(Form)
            expect(form).toHaveLength(1)

            const formGroup = form.find(FormGroup)
            expect(formGroup).toHaveLength(1)

            const label = formGroup.find('label')
            expect(label).toHaveLength(1)
            expect(label.prop('htmlFor')).toBe('search')
            expect(label.text()).toBe(intl.formatMessage({id: 'event-name-or-place'}))

            const input = formGroup.find('input')
            expect(input).toHaveLength(1)
            expect(input.prop('id')).toBe('search')
            expect(input.prop('aria-label')).toBeDefined()
            expect(input.prop('className')).toBe('event-search-bar')
            expect(input.prop('type')).toBe('text')
            expect(input.prop('onChange')).toBeDefined()
            expect(input.prop('onKeyPress')).toBeDefined()
        })

        test('Button', () => {
            const button = getWrapper().find(Button)
            expect(button).toHaveLength(1)
            expect(button.prop('variant')).toBe('contained')
            expect(button.prop('color')).toBe('primary')
            expect(button.prop('onClick')).toBeDefined()
            const msg = button.find(FormattedMessage)
            expect(msg).toHaveLength(1)
            expect(msg.prop('id')).toBe('search-event-button')
        })
        describe('HelCheckBoxes', () => {
            test('correct props', () => {
                const wrapper = getWrapper();
                const checkBox = wrapper.find(HelCheckbox)
                const intlIDs = ['event', 'hobby']
                const elementIds = ['eventgeneral', 'eventhobbies']

                //contextType is state that contains values under as default
                //States cannot be tested in functional components with Jest, that's why predefined array
                const contextType = ['eventgeneral', 'eventhobbies'];

                expect(checkBox).toHaveLength(2)
                checkBox.forEach((box, index) => {
                    expect(box.prop('label')).toEqual(<FormattedMessage id={intlIDs[index]} />)
                    expect(box.prop('fieldID')).toBe(elementIds[index]);
                    expect(box.prop('defaultChecked')).toBe(contextType.includes(elementIds[index]))
                    expect(box.prop('onChange')).toBeDefined()
                    expect(box.prop('disabled')).toBeDefined()
                })
            })
        })
    })
    describe('methods', () => {
        describe('onFormSubmit', () => {
            test('Button onClick calls onFormSubmit', () => {
                const onFormSubmit = jest.fn()
                const button = getWrapper({onFormSubmit}).find(Button)
                button.simulate('click')
                expect(onFormSubmit).toBeCalledTimes(1)
            })
        })
        describe('checkboxes', () => {
            test('checked changes booleans', () => {
                const wrapper = getWrapper();
                const checkBox = wrapper.find(HelCheckbox)
                checkBox.at(0).simulate('change', {target: {id: 'eventgeneral'}});
                expect(wrapper.find(HelCheckbox).at(0).prop('disabled')).toBe(false)
                expect(wrapper.find(HelCheckbox).at(0).prop('defaultChecked')).toBe(false)
                expect(wrapper.find(HelCheckbox).at(1).prop('disabled')).toBe(true)
                expect(wrapper.find(HelCheckbox).at(1).prop('defaultChecked')).toBe(true)
            })
        })
    })
})
