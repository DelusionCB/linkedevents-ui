import React from 'react'
import {injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import {FormGroup, Input, Label} from 'reactstrap';

function FieldSelector({intl, onChange, value, sideFields}){
    const options = Object.keys(sideFields) || []

    return (
        <FormGroup className='select'>
            <Label htmlFor='instruction-field-select'>
                {intl.formatMessage({id: 'admin-instructions-field-select-label'})}
            </Label>
            <Input
                id='instruction-field-select'
                value={value}
                onChange={onChange}
                type='select'
            >
                <option value="" disabled hidden>
                    {intl.formatMessage({id: 'admin-instructions-field-select-option-zero'})}
                </option>
                {options.map(option => (
                    <option
                        key={`${option}-option-key`} 
                        value={option}
                    >
                        {intl.formatMessage({id: option})}
                    </option>
                ))}
            </Input>
        </FormGroup>
    )
}

FieldSelector.propTypes = {
    value: PropTypes.string.isRequired,
    intl: intlShape,
    onChange: PropTypes.func.isRequired,
    sideFields: PropTypes.object,
}

export {FieldSelector as UnconnectedFieldSelector};
export default injectIntl(FieldSelector)
