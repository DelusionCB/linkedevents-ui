import './OrganizationSelector.scss'
import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {get} from 'lodash';
import {Input} from 'reactstrap'

function renderSelectOptions(options) {
    return(
        options.map((option, index) => {
            return(<option key={index} value={option.value}>{option.label}</option>)
        })
    )
}

const OrganizationSelector = ({formType, selectedOption, options, onChange, labelOrg, activeOrganization, isSuperAdmin}) => {
    const label = selectedOption.label ? selectedOption.label : '';
    const activeOrganizationLabel = options.find((org)=> org.value === activeOrganization)?.label;

    return (
        <React.Fragment>
            <label className='event-publisher' htmlFor='event-publisher'>{<FormattedMessage id={labelOrg} />}</label>
            {formType === 'update' ? (
                <Input
                    className='event-publisher-input-disabled'
                    id='event-publisher'
                    aria-disabled={true}
                    value={label}
                    readOnly
                />
            ) : (!isSuperAdmin && (activeOrganization && activeOrganizationLabel)) ? 
                (
                    <Input
                        readOnly
                        className='event-publisher-input-disabled'
                        id='event-publisher'
                        aria-disabled={true}
                        value={activeOrganizationLabel}
                    />
                )
                : options.length > 1 ? (
                    <React.Fragment>
                        <Input
                            className="event-publisher-input"
                            id="event-publisher"
                            name="event-publisher"
                            onChange={onChange}
                            type="select"
                            value={selectedOption.value}
                        >
                            {renderSelectOptions(options)}
                        </Input>
                    </React.Fragment>
                ) : (
                    <Input
                        readOnly
                        className='event-publisher-input-disabled'
                        id='event-publisher'
                        aria-disabled={true}
                        value={get(options, '[0].label', '')}
                    />
                )}
        </React.Fragment>
    );
};

OrganizationSelector.propTypes = {
    options: PropTypes.arrayOf(PropTypes.object),
    formType: PropTypes.oneOf(['update', 'create', 'add']),
    selectedOption: PropTypes.object,
    onChange: PropTypes.func,
    labelOrg: PropTypes.string,
    activeOrganization: PropTypes.string,
    isSuperAdmin: PropTypes.bool,
}
export default OrganizationSelector;
