import React from 'react'
import DatePicker, {registerLocale} from 'react-datepicker'
import PropTypes from 'prop-types'
import {FormGroup, Label, Input} from 'reactstrap'
import 'react-datepicker/dist/react-datepicker.css'
import '../../CustomFormFields/Dateinputs/CustomDatePicker.scss'
import moment from 'moment'
import {FormattedMessage} from 'react-intl'
import fi from 'date-fns/locale/fi'
import sv from 'date-fns/locale/sv'
import DatePickerButton from '../../CustomFormFields/Dateinputs/DatePickerButton'
import classNames from 'classnames';


class CustomDateSelector extends React.Component {
    constructor(props){
        super(props)

        // add language support for date picker
        registerLocale('fi', fi)
        registerLocale('sv', sv)

        this.state = {
            inputValue: props.value ? this.convertDateToLocaleString(props.value) : '',
        }

        this.convertDateToLocaleString = this.convertDateToLocaleString.bind(this)
        this.getDateFormat = this.getDateFormat.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleInputBlur = this.handleInputBlur.bind(this)
        this.handleDatePickerChange = this.handleDatePickerChange.bind(this)
        this.roundDateToCorrectUnit = this.roundDateToCorrectUnit.bind(this)
        this.getDatePickerOpenDate = this.getDatePickerOpenDate.bind(this)
    }

    static contextTypes = {
        intl: PropTypes.object,
    }

    /**
     * sets event to state
     * @param {Object} event
     */
    handleInputChange(event){
        this.setState({inputValue: event.target.value})
    }

    handleInputBlur(){
        const {onChange, value} = this.props
        const inputValue = this.state.inputValue

        if(inputValue){
            const date = this.roundDateToCorrectUnit(moment(inputValue, this.getDateFormat(), true))
            onChange(date)
        } else {
            // no need to update value if it's already empty
            if (value) {
                onChange(undefined)
            }
        }
    }

    handleDatePickerChange(value){
        this.setState({inputValue: this.convertDateToLocaleString(value)})
        const date = this.roundDateToCorrectUnit(moment(value, this.getDateFormat()))
        this.props.onChange(date)
    }
    
    convertDateToLocaleString(date){
        return date && moment(date).format(this.getDateFormat()) || ''
    }

    getDateFormat(){
        return 'YYYY-MM-DD'
    }

    roundDateToCorrectUnit(date){
        return date.startOf('day')
    }

    // returns the date DatePicker will show as selected when calendar is opened
    getDatePickerOpenDate(value){
        if(moment(value).isValid())
            return new Date(value)
        else
            return new Date(this.roundDateToCorrectUnit(moment()))
    }

    componentDidUpdate(prevProps) {
        const {value} = this.props
        if (prevProps.value !== value) {
            this.setState({inputValue: this.convertDateToLocaleString(value)})
        }
    }

    render(){
        const {label, name, id, value, type, disabled, required, validation} = this.props
        const inputValue = this.state.inputValue
        const inputErrorId = 'date-input-error__' + id
        return(
            <div className="custom-date-input">
                <FormGroup>
                    <FormattedMessage id={label}>{txt =>
                        <Label for={id}>{txt}{required ? '*' : ''}</Label>}
                    </FormattedMessage>
                    <div className={classNames('input-and-button', {invalid: validation.error})}>
                        <Input
                            aria-describedby={validation.error ? inputErrorId : undefined}
                            aria-invalid={validation.error}
                            invalid={validation.error}
                            type="text"
                            name={name}
                            id={id}
                            value={inputValue ? inputValue : ''}
                            onChange={this.handleInputChange}
                            onBlur={this.handleInputBlur}
                            disabled={disabled}
                            aria-required={required}
                        />
                        <DatePicker
                            id={id + type + '-button'}
                            disabled={disabled}
                            openToDate={this.getDatePickerOpenDate(value)}
                            onChange={this.handleDatePickerChange}
                            customInput={<DatePickerButton type={type} disabled={disabled} />}
                            locale={this.context.intl.locale}
                            showTimeSelect={false}
                            showPopperArrow={true}
                            popperPlacement={'bottom-end'}
                            popperModifiers={{
                                preventOverflow: {
                                    enabled: true,
                                    escapeWithReference: false,
                                    boundariesElement: 'viewport',
                                },
                            }}
                        />
                    </div>
                    {validation.error &&
                        <FormattedMessage id={validation.errorMsg}>{txt =>
                            <p id={inputErrorId} role="alert" className="date-input-error">{txt}</p>}
                        </FormattedMessage>
                    }
                </FormGroup>
            </div>
        )
    }
}

CustomDateSelector.defaultProps = {
    type: 'date',
    validation: {error: false, errorMsg: ''},
}

CustomDateSelector.propTypes = {
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
    onChange: PropTypes.func.isRequired,
    type: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    validation: PropTypes.object,
};


export default CustomDateSelector
