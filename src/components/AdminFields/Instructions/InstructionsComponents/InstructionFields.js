import React from 'react'
import PropTypes from 'prop-types';
import CustomTextField from '../../utils/CustomTextField';
import {intlShape, injectIntl} from 'react-intl';


function InstructionFields({currentFieldType, fields, intl, onChange, selectedField, validations}){
    return (
        <div id="admin-instruction-field-texts">
            {Object.entries(fields).map(fieldEntry => 
                <CustomTextField
                    key={`${selectedField}-${fieldEntry[0]}`}
                    label={intl.formatMessage({id: selectedField}) + ' ' + intl.formatMessage({id: `in-${fieldEntry[0]}`})}
                    id={`${selectedField}-field-${fieldEntry[0]}`}
                    value={fieldEntry[1]}
                    required={true}
                    type='textarea'
                    maxLength={currentFieldType.maxCharacters}
                    onChange={(event) => onChange(event, fieldEntry[0])}
                    validation={Object.keys(validations).length > 0 ? validations[fieldEntry[0]] : undefined}
                />
            )}
        </div>
    )
}

InstructionFields.propTypes = {
    currentFieldType: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    selectedField: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    onChange: PropTypes.func.isRequired,
    validations: PropTypes.object.isRequired,
}

export {InstructionFields as UnconnectedInstructionFields};
export default injectIntl(InstructionFields)
