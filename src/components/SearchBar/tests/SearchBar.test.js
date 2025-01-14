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
import constants from '../../../constants';

const {EVENT_TYPE_PARAM} = constants

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


    describe('renders', () => {
        test('main wrapper div.search-bar', () => {
            const div = getWrapper().find('div.search-bar')
            expect(div).toHaveLength(1)
        })
        test('wrapper div.search-bar', () => {
            const div = getWrapper().find('div.search-bar--dates')
            expect(div).toHaveLength(1)
        })

        describe('CustomDatePicker', () => {
            test('for both start and end time', () => {
                const datePickers = getWrapper().find(CustomDatePicker)
                expect(datePickers).toHaveLength(2)
            })

            test('for selecting start time with correct default props', () => {
                const datePicker = getWrapper().find(CustomDatePicker).first()
                expect(datePicker.prop('id')).toBe('startTime')
                expect(datePicker.prop('name')).toBe('startTime')
                expect(datePicker.prop('label')).toBe('search-date-label-start')
                expect(datePicker.prop('defaultValue')).toEqual(moment().startOf('day'))
                expect(datePicker.prop('onChange')).toBeDefined()
                expect(datePicker.prop('maxDate')).toBe(undefined)
                expect(datePicker.prop('type')).toBe('date')
            })

            test('for selecting end time with correct default props', () => {
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

        test('wrapper div.search-bar--input', () => {
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
            expect(input.prop('onBlur')).toBeDefined()
            expect(input.prop('value')).toBe('');
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
                const intlIDs = ['event', 'hobby', 'courses']
                const elementIds = [EVENT_TYPE_PARAM.EVENT, EVENT_TYPE_PARAM.HOBBY, EVENT_TYPE_PARAM.COURSE]

                //contextType is state that contains values under as default
                //States cannot be tested in functional components with Jest, that's why predefined array
                const contextType = [EVENT_TYPE_PARAM.EVENT, EVENT_TYPE_PARAM.HOBBY, EVENT_TYPE_PARAM.COURSE];

                expect(checkBox).toHaveLength(3)
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
                checkBox.at(0).simulate('change', {target: {id: EVENT_TYPE_PARAM.EVENT}});
                expect(wrapper.find(HelCheckbox).at(0).prop('disabled')).toBe(false)
                expect(wrapper.find(HelCheckbox).at(0).prop('defaultChecked')).toBe(false)
                expect(wrapper.find(HelCheckbox).at(1).prop('disabled')).toBe(false)
                expect(wrapper.find(HelCheckbox).at(1).prop('defaultChecked')).toBe(true)
                expect(wrapper.find(HelCheckbox).at(2).prop('disabled')).toBe(false)
                expect(wrapper.find(HelCheckbox).at(2).prop('defaultChecked')).toBe(true)
            })
        })
        describe('handleQueryChange', () => {
            test.each(['blur','change'])('is called on input event on%s', (inputEvent) => {
                const wrapper = getWrapper();
                const expectedValue = `${inputEvent} was called with this value.`;
                wrapper.find('input').simulate(inputEvent, {target:{value:expectedValue}});
                expect(wrapper.find('input').prop('value')).toBe(expectedValue);
            });
        });
        describe('handleSubmit', () => {
            test('is called on Form submit', () => {
                const mockFormSubmit = jest.fn();
                const mockEvent = {preventDefault: jest.fn()};
                const expectedValues = [
                    'search text',
                    [EVENT_TYPE_PARAM.EVENT, EVENT_TYPE_PARAM.HOBBY, EVENT_TYPE_PARAM.COURSE],
                    moment().startOf('day'),
                    null,
                ];
                const wrapper = getWrapper({onFormSubmit: mockFormSubmit});
                wrapper.find('input').simulate('change', {target:{value:expectedValues[0]}});
                wrapper.find(Form).simulate('submit', mockEvent);
                expect(mockFormSubmit).toHaveBeenCalledTimes(1);
                expect(mockFormSubmit).toHaveBeenCalledWith(...expectedValues);
                expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
            });
        });
    });
})
