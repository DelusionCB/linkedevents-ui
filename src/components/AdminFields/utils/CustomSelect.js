import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage, injectIntl} from 'react-intl';
import classNames from 'classnames';

const CustomSelect = ({
    id,
    options,
    onChange,
    disabled,
    label,
    value,
    required,
    validation,
}) => {
    const containerRef = useRef(null)

    /**
     * returns <option>s from array
     * @param {Array} options
     * @returns {JSX.Element}
     */
    const formatOptions = (options) => {
        return (
            options.map((option, key) => {
                return (
                    <option className='organization-select-option' value={option.id} key={key}>
                        {option.name}
                    </option>
                )
            })
        )
    }
    
    return (
        <div ref={containerRef}>
            <FormattedMessage id={label}>{txt => <label htmlFor={id}>{txt}</label>}</FormattedMessage>{required ? <span aria-hidden="true">*</span> : null}
            <select aria-required={required} required={required} id={id} className={classNames('newOrg-select', {invalid: validation.error})} disabled={disabled} value={value}
                onChange={e => onChange(e)}>
                <FormattedMessage id='admin-org-select'>
                    {txt => <option className='organization-select-option' value="" disabled hidden>{txt}</option>}
                </FormattedMessage>
                {formatOptions(options)}
            </select>
            {validation.error ? <FormattedMessage id={validation.errorMsg}>{txt => <p>{txt}</p>}</FormattedMessage> : <p />}
        </div>
    )
}

CustomSelect.defaultProps = {
    validation: {error: false, errorMsg: ''},
}

CustomSelect.propTypes = {
    options: PropTypes.array,
    id: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    label: PropTypes.string,
    validation: PropTypes.object,
}
export {CustomSelect as UnconnectedCustomSelect}
export default injectIntl(CustomSelect);
