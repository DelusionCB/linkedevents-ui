import React from 'react'
import {shallow, mount} from 'enzyme';
import DatePickerButton from '../../../CustomFormFields/Dateinputs/DatePickerButton';
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {Label, Input} from 'reactstrap';
import DatePicker from 'react-datepicker'
import moment from 'moment'
import CustomDateSelector from '../CustomDateSelector';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    label: 'admin-org-founding',
    name: 'test-name',
    id: 'test-id',
    value: undefined,
    onChange: () => {},
    type: 'date',
    disabled: false,
    required: false,
    validation: {error: false, errorMsg: ''},
}
    
describe('CustomDateSelector', () => {
    function getWrapper(props) {
        return shallow(<CustomDateSelector {...defaultProps} {...props} />, {context: {intl}});
    }
    describe('renders', () => {
        describe('FormattedMessage', () => {
            test('with correct props & amount', () => {
                const wrapper = getWrapper();
                const label = wrapper.find(FormattedMessage)
                expect(label).toHaveLength(1);
                expect(label.prop('id')).toBe(defaultProps.label)
            })
            test('with correct props & amount while validation is true', () => {
                const wrapper = getWrapper({validation: {error: true, errorMsg: ''}});
                const label = wrapper.find(FormattedMessage)
                expect(label).toHaveLength(2);
                expect(label.at(0).prop('id')).toBe(defaultProps.label)
                expect(label.at(1).prop('id')).toBe(defaultProps.validation.errorMsg)
            })
        })

        describe('Input', () => {
            test('with default props', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                const input = wrapper.find(Input)
                expect(input).toHaveLength(1);
                expect(input.prop('type')).toBe('text')
                expect(input.prop('name')).toBe(defaultProps.name)
                expect(input.prop('id')).toBe(defaultProps.id)
                expect(input.prop('value')).toBe(instance.state.inputValue)
                expect(input.prop('onChange')).toBe(instance.handleInputChange)
                expect(input.prop('onBlur')).toBe(instance.handleInputBlur)
                expect(input.prop('aria-describedby')).toBe(undefined)
                expect(input.prop('disabled')).toBe(defaultProps.disabled)
                expect(input.prop('aria-required')).toBe(defaultProps.required)
            })

            test('prop value is not empty when state.inputValue is defined', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance()
                const inputValue = '01.02'
                instance.setState({inputValue})
                const input = wrapper.find(Input)
                expect(input.prop('value')).toBe(inputValue)
            })

            test('prop aria-describedby is defined when state.showValidationError is true', () => {
                const wrapper = getWrapper();
                wrapper.setProps({validation: {error: true, errorMsg: ''}})
                const input = wrapper.find(Input)
                expect(input.prop('aria-describedby')).toBe('date-input-error__' + defaultProps.id)
            })

            test('prop aria-invalid is equal to state.showValidationError', () => {
                const wrapper = getWrapper();
                wrapper.setProps({validation: {error: true, errorMsg: ''}})
                const input = wrapper.find(Input)
                expect(input.prop('aria-invalid')).toBe(true)
            })
        })

        describe('DatePicker', () => {
            test('with default props', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                const datePicker = wrapper.find(DatePicker)
                expect(datePicker).toHaveLength(1);
                expect(datePicker.prop('disabled')).toBe(defaultProps.disabled)
                expect(datePicker.prop('openToDate')).toBeDefined()
                expect(datePicker.prop('onChange')).toBe(instance.handleDatePickerChange)
                expect(datePicker.prop('customInput')).toEqual(<DatePickerButton disabled={defaultProps.disabled} type={defaultProps.type}/>)
                expect(datePicker.prop('locale')).toBe(instance.context.intl.locale)
                expect(datePicker.prop('showTimeSelect')).toBe(false)
                expect(datePicker.prop('showPopperArrow')).toBe(true)
                expect(datePicker.prop('popperPlacement')).toBe('bottom-end')
                expect(datePicker.prop('popperModifiers')).toEqual({
                    preventOverflow: {
                        enabled: true,
                        escapeWithReference: false,
                        boundariesElement: 'viewport',
                    },
                })
            })
        })

        describe('validation error', () => {

            test('error text is shown when validation.error is true', () => {
                const wrapper = getWrapper();
                wrapper.setProps({validation: {error: true, errorMsg: 'test-vali'}})
                const errorMessage = wrapper.find(FormattedMessage)

                expect(errorMessage).toHaveLength(2)
                expect(errorMessage.at(1).prop('id')).toBe('test-vali')
            })

            test('error text is not shown when state.showValidationError is false', () => {
                const errorMessage = getWrapper().find(FormattedMessage)
                expect(errorMessage).toHaveLength(1)
                expect(errorMessage.prop('id')).toBe('admin-org-founding')
            })
        })
    })

    describe('functions', () => {

        describe('convertDateToLocaleString', () => {
            test('returns correct date string', () => {
                const date = moment('2020-03-23')
                const instance = getWrapper().instance()
                expect(instance.convertDateToLocaleString(date)).toBe('2020-03-23')
            })
        })

        describe('getDateFormat', () => {
            describe('returns correct date format string', () => {
                const instance = getWrapper().instance()

                test('by default', () => {
                    expect(instance.getDateFormat('date')).toBe('YYYY-MM-DD')
                })
            })
        })

        describe('handleInputChange', () => {
            test('sets state.inputValue to correct value', () => {
                const instance = getWrapper().instance()
                const expectedValue = 'test-value'
                const event = {target: {value: expectedValue}}
                instance.handleInputChange(event)
                expect(instance.state.inputValue).toBe(expectedValue)
            })
        })

        describe('handleInputBlur', () => {
            const onChange = jest.fn()
            const instance = getWrapper({onChange}).instance()

            afterEach(() => {
                onChange.mockReset()
            })

            describe('when state.inputValue is not empty', () => {
                test('calls props.onChange when state.inputValue is valid', () => {
                    const testInput = '2020-03-23'
                    instance.state = {inputValue: testInput}
                    instance.handleInputBlur()
                    const expectedDate = instance.roundDateToCorrectUnit(
                        moment(testInput, instance.getDateFormat(), true))
                    expect(onChange.mock.calls.length).toBe(1);
                    expect(onChange.mock.calls[0][0]).toEqual(expectedDate)
                })

                test('calls props.onChange when state.inputValue is not valid with correct params', () => {
                    const testInput = 'abc'
                    instance.state = {inputValue: testInput}
                    instance.handleInputBlur()
                    expect(onChange.mock.calls.length).toBe(1);
                })
            })

            describe('when state.inputValue is empty', () => {
                test('calls props.onChange with arg undefined', () => {
                    const value = moment('2020-03-23')
                    const wrapper = getWrapper({value, onChange})
                    const instance = wrapper.instance();
                    instance.state = {inputValue: ''}
                    instance.handleInputBlur()
                    expect(onChange.mock.calls.length).toBe(1);
                    expect(onChange.mock.calls[0][0]).toBe(undefined)
                })

                test('doesnt call props.onChange if props.defaultValue is empty', () => {
                    const wrapper = getWrapper({onChange})
                    const instance = wrapper.instance();
                    instance.state = {inputValue: ''}
                    instance.handleInputBlur()
                    expect(onChange.mock.calls.length).toBe(0);
                })
            })
        })

        describe('handleDatePickerChange', () => {
            test('sets state.inputValue to correct value', () => {
                const instance = getWrapper().instance()
                const date = new Date()
                instance.handleDatePickerChange(date)
                expect(instance.state.inputValue).toBe(instance.convertDateToLocaleString(date))
            })

            test('calls props.onChange', () => {
                const onChange = jest.fn()
                const instance = getWrapper({onChange}).instance()
                const date = new Date()
                instance.handleDatePickerChange(date)
                expect(onChange.mock.calls.length).toBe(1);
                expect(onChange.mock.calls[0][0]).toEqual(
                    instance.roundDateToCorrectUnit(moment(date, instance.getDateFormat(instance.props.type))))
            })
        })

        describe('getDatePickerOpenDate', () => {
            const instance = getWrapper().instance()

            test('returns defaultValue if it is defined', () => {
                const defaultValue = moment()
                expect(instance.getDatePickerOpenDate(defaultValue)).toEqual(new Date(defaultValue))
            })

            test('returns new date if value is not valid', () => {
                const value = ''
                expect(instance.getDatePickerOpenDate(value)).toEqual(
                    new Date(instance.roundDateToCorrectUnit(moment()))
                )
            })
        })

        describe('roundDateToCorrectUnit', () => {
            test('returns date rounded to days', () => {
                const instance = getWrapper().instance()
                const date = moment('2020-02-08 09:30:26')
                const expectedDate = moment('2020-02-08 09:30:26').startOf('day')
                expect(instance.roundDateToCorrectUnit(date)).toEqual(expectedDate)
            })
        })

        describe('componentDidUpdate', () => {

            describe('setState', () => {
                test('calls setState if prevProps.value is different to this.props.value', () => {
                    const instance = getWrapper({value: '2020-02-08'}).instance()
                    const spy = jest.spyOn(instance, 'setState')
                    const prevProps = {...defaultProps, value: '2021-02-08'}
                    instance.componentDidUpdate(prevProps)
                    expect(spy).toHaveBeenCalledTimes(1)
                    expect(spy).toHaveBeenCalledWith({
                        inputValue: '2020-02-08',
                    })
                })
            })
        })
    })
})
