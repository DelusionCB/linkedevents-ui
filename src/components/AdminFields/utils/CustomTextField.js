import PropTypes from 'prop-types';
import React from 'react'
import {Input, InputGroup, InputGroupAddon} from 'reactstrap';
import classNames from 'classnames';
import {FormattedMessage, injectIntl} from 'react-intl';

const CustomTextField = ({
    onChange,
    label,
    id,
    value,
    required,
    disabled,
    validation,
}) => {

    return (
        <div className='newOrg-input'>
            <FormattedMessage id={label}>{txt => <label htmlFor={id}>{txt}</label>}</FormattedMessage>{required ? <span aria-hidden='true'>*</span> : null}
            <InputGroup className={classNames('inputGroup', {invalid: validation.error})}>
                <InputGroupAddon className='inputIcons' addonType='prepend'>
                    <span aria-hidden className='glyphicon glyphicon-pencil'/>
                </InputGroupAddon>
                <Input
                    id={id}
                    type='text'
                    defaultValue={value}
                    aria-required={required}
                    onBlur={e => onChange(e)}
                    disabled={disabled}
                    invalid={validation.error}
                    aria-invalid={validation.error}
                />
            </InputGroup>
            {validation.error ? <FormattedMessage id={validation.errorMsg}>{txt => <p className='red-alert' role='status'>{txt}</p>}</FormattedMessage> : <p />}
        </div>
    )
}

CustomTextField.defaultProps = {
    validation: {error: false, errorMsg: ''},
}

CustomTextField.propTypes = {
    onChange: PropTypes.func,
    label: PropTypes.string,
    id: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    validation: PropTypes.object,
    intl: PropTypes.object,
}
export {CustomTextField as UnconnectedTextField}
export default injectIntl(CustomTextField);
