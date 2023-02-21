import PropTypes from 'prop-types';
import React from 'react'
import {Input, InputGroup, InputGroupAddon, FormText, FormGroup} from 'reactstrap';
import classNames from 'classnames';
import {FormattedMessage, injectIntl} from 'react-intl';

const CustomTextField = ({
    onBlur,
    onChange,
    label,
    id,
    value,
    required,
    disabled,
    validation,
    type,
    maxLength,
    intl,
}) => {

    return (
        <FormGroup className='admin-input'>
            <label htmlFor={id}>
                {label}{required ? <span aria-hidden="true">*</span> : null}
            </label>
            <InputGroup className={classNames('inputGroup', {invalid: validation.error})}>
                <InputGroupAddon className='inputIcons' addonType='prepend'>
                    <span aria-hidden className='glyphicon glyphicon-pencil'/>
                </InputGroupAddon>
                <Input
                    id={id}
                    type={type}
                    defaultValue={value}
                    aria-required={required}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    invalid={validation.error}
                    aria-invalid={validation.error}
                />
            </InputGroup>
            {(maxLength > 0 && !validation.error) && (
                <FormText>
                    {intl.formatMessage(
                        {id: 'validation-stringLengthCounter'},
                        {counter: maxLength - value.length + '/' + maxLength}
                    )}
                </FormText>
            )}
            {(maxLength > 0 && validation.error && validation.errorMaxChars) && (
                <FormText className='red-alert'>
                    {intl.formatMessage(
                        {id: validation.errorMsg},
                        {limit: maxLength}
                    )}
                </FormText>
            )}
            {(validation.error && !validation.errorMaxChars) && (
                <FormattedMessage id={validation.errorMsg}>
                    {txt => <p className='red-alert' role='status'>{txt}</p>}
                </FormattedMessage>
            )}
        </FormGroup>
    )
}

CustomTextField.defaultProps = {
    validation: {error: false, errorMsg: ''},
    type: 'text',
    maxLength: 0,
}

CustomTextField.propTypes = {
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    label: PropTypes.string,
    id: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    validation: PropTypes.object,
    type: PropTypes.string,
    intl: PropTypes.object,
    maxLength: PropTypes.number,
}
export {CustomTextField as UnconnectedTextField}
export default injectIntl(CustomTextField);
