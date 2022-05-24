import PropTypes from 'prop-types';
import React,{Fragment, Component} from 'react'
import {setData} from 'src/actions/editor.js'
import validationRules from 'src/validation/validationRules';
import ValidationNotification from 'src/components/ValidationNotification'
import constants from '../../constants'
import {Input, FormText, InputGroup, InputGroupAddon} from 'reactstrap';
import classNames from 'classnames';

const {VALIDATION_RULES, CHARACTER_LIMIT} = constants

class HelTextField extends Component {
    constructor(props) {
        super(props)

        this.state = {
            error: false,
            errorMessage: '',
            value: this.props.defaultValue || '',
        }
    }

    static contextTypes = {
        intl: PropTypes.object,
        dispatch: PropTypes.func,
    }

    componentDidMount() {
        this.setValidationErrorsToState();

        if(this.props.setInitialFocus){
            this.inputRef.focus()
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if(!(_.isEqual(nextProps.defaultValue, this.props.defaultValue))) {
            // Bootstrap or React textarea has a bug where null value gets interpreted
            // as uncontrolled, so no updates are done
            this.setState({value: nextProps.defaultValue ? nextProps.defaultValue : ''})
        }
        this.forceUpdate()
    }

    getStringLengthValidationText() {
        let isShortString = _.find(this.props.validations, i => i === VALIDATION_RULES.SHORT_STRING)
        let isMediumString = _.find(this.props.validations, i => i === VALIDATION_RULES.MEDIUM_STRING)
        let isLongString = _.find(this.props.validations, i => i === VALIDATION_RULES.LONG_STRING)

        let limit
        if (!this.state.error && (isShortString || isMediumString || isLongString)) {
            if(isShortString) {
                limit = CHARACTER_LIMIT.SHORT_STRING
            }
            else if(isMediumString) {
                limit = CHARACTER_LIMIT.MEDIUM_STRING
            }
            else if(isLongString) {
                limit = CHARACTER_LIMIT.LONG_STRING
            }

            const diff =  limit - this.state.value.length.toString()

            if(diff >= 0) {
                return this.context.intl.formatMessage({id: 'validation-stringLengthCounter'}, {counter: diff + '/' + limit})
            }
        }

        return this.state.errorMessage;
        //return this.state.error
    }

    getValue() {
        return this.inputRef.value
    }

    helpText() {
        let urlmsg = this.context.intl.formatMessage({id: 'validation-isUrl'})
        let isUrl = _.find(this.props.validations, i => i === VALIDATION_RULES.IS_URL)

        const stringLengthMessage = this.getStringLengthValidationText()
        if(stringLengthMessage) return stringLengthMessage
        else if (isUrl) {
            return this.state.error
                ? urlmsg
                : this.state.error
        }
    }

    handleChange = (event) => {
        const {onChange} = this.props
        const value = event.target.value

        this.setState({value})
        this.setValidationErrorsToState()

        if (typeof onChange === 'function') {
            onChange(event, value)
        }
    }

    handleBlur = (event) => {
        const {name, forceApplyToStore, setDirtyState, onBlur} = this.props
        const value = event.target.value
        if (typeof onBlur === 'function') {
            onBlur(event, value)
        }

        // Apply changes to store if no validation errors, or the prop 'forceApplyToStore' is defined
        else if (
            name
            && this.getValidationErrors().length === 0
            && !name.includes('time') || name
            && forceApplyToStore
        ) {
            this.context.dispatch(setData({[name]: value}))

            if (setDirtyState) {
                setDirtyState()
            }
        }
    }

    getValidationErrors() {
        if(this.inputRef && this.inputRef.value && this.props.validations && this.props.validations.length) {
            let validations = this.props.validations.map(item => {
                if(typeof validationRules[item] === 'function') {
                    return {
                        rule: item,
                        passed: validationRules[item](null, this.inputRef.value),
                    }
                } else {
                    return {
                        rule: item,
                        passed: true,
                    }
                }
            })

            validations = validations.filter(i => (i.passed === false))

            if(validations.length) {
                return validations;
            }
        }
        return []
    }

    setValidationErrorsToState() {
        let errors = this.getValidationErrors()

        if(errors.length > 0) {
            let limit

            switch (errors[0].rule) {
                case VALIDATION_RULES.SHORT_STRING:
                    limit = CHARACTER_LIMIT.SHORT_STRING
                    break;
                case VALIDATION_RULES.MEDIUM_STRING:
                    limit = CHARACTER_LIMIT.MEDIUM_STRING
                    break;
                case VALIDATION_RULES.LONG_STRING:
                    limit = CHARACTER_LIMIT.LONG_STRING
                    break;
            }
            this.setState({error:true});
            return limit ? this.setState({errorMessage: this.context.intl.formatMessage({id: `validation-stringLimitReached`}, {limit})}) :
                this.setState({errorMessage: this.context.intl.formatMessage({id: `validation-${errors[0].rule}`})})
        }
        else {
            this.setState({error: false})
        }
    }

    noValidationErrors() {
        let errors = this.getValidationErrors()
        return (errors.length === 0)
    }

    /**
     * Push glyphicons into array based on name & type
     * @param {string} nameRef
     * @param {string} type
     * @returns {JSX.Element[]} returns array of elements
     */
    getCorrectIcons(nameRef, type) {
        const extlinks = ['extlink_facebook', 'extlink_twitter', 'extlink_instagram'];
        const icons = ['facebookIcon', 'twitterIcon', 'instaIcon'];
        const types = ['text', 'textarea', 'url', 'number'];
        const typeIcons = ['pencil', 'pencil', 'link', 'euro'];

        let content = extlinks.reduce((acc, curr, index) => {
            if (nameRef === curr) {
                acc.push(<span aria-hidden key={Math.random()} className={icons[index]} />);
            }
            return acc;
        }, []);

        if (content.length === 0) {
            content = types.reduce((acc, curr, index) => {
                if (type === curr) {
                    const classNames = type === 'number' && nameRef !== 'price' ? 'numberIcon' : `glyphicon glyphicon-${typeIcons[index]}`;
                    acc.push(<span aria-hidden key={Math.random()} className={classNames} />);
                }
                return acc;
            }, []);
        }

        return [...content]
    }

    render () {
        const {value} = this.state
        const {
            required,
            disabled,
            label,
            placeholder,
            validationErrors,
            index,
            name,
            min,
            max,
            className,
            nameRef,
        } = this.props
        const type = this.props.type;
        const alert = this.state.error ? {role: 'alert', className: 'red-alert'} : '';
        const inputId = `${label}-${this.props.id}`.toLowerCase().replace(/\s+/g, '-');

        return (
            <Fragment>
                <div className={classNames(`event-input`, className)}>
                    <label htmlFor={inputId}>
                        {label}{required ? <span aria-hidden="true">*</span> : null}
                    </label>
                    <InputGroup>
                        <InputGroupAddon className={classNames('inputIcons', {'error': validationErrors && validationErrors.length !== 0})} addonType="prepend">
                            {this.getCorrectIcons(nameRef, type)}
                        </InputGroupAddon>
                        <Input
                            id={inputId}
                            placeholder={placeholder}
                            type={type}
                            name={name}
                            value={value}
                            aria-required={required}
                            onChange={this.handleChange}
                            onBlur={this.handleBlur}
                            innerRef={ref => this.inputRef = ref}
                            disabled={disabled}
                            min={min}
                            max={max}
                            invalid={Array.isArray(validationErrors) && validationErrors.length !== 0}
                        />
                        {validationErrors &&
                        <div className='validation-notification' />
                        }
                    </InputGroup>
                    <FormText {...alert}>
                        {this.helpText()}
                    </FormText>
                    <ValidationNotification
                        className='validation-fields'
                        index={index}
                        anchor={this.inputRef}
                        validationErrors={validationErrors}
                    />
                </div>
            </Fragment>
        )
    }
}

HelTextField.propTypes = {
    name: PropTypes.string,
    placeholder: PropTypes.string,
    defaultValue: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    onChange: PropTypes.func,
    validations: PropTypes.array,
    forceApplyToStore: PropTypes.bool,
    setDirtyState: PropTypes.func,
    onBlur: PropTypes.func,
    multiLine: PropTypes.bool,
    required: PropTypes.bool,
    className: PropTypes.string,
    label: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
    validationErrors: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    index: PropTypes.string,
    disabled: PropTypes.bool,
    type: PropTypes.string,
    maxLength: PropTypes.number,
    id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    setInitialFocus: PropTypes.bool,
    min: PropTypes.number,
    max: PropTypes.number,
    nameRef: PropTypes.string,
}

HelTextField.defaultProps = {
    type: 'text',
    className: undefined,
};


export default HelTextField
