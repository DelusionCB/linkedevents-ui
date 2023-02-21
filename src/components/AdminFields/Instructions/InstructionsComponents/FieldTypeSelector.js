import React from 'react'
import {injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

import {FIELD_TYPES} from '../../utils/constants'

function FieldTypeSelector({currentFieldType, intl, onChange}){
    return(
        <fieldset id='instruction-type-selector'>
            <legend>{intl.formatMessage({id: 'admin-instructions-field-type-legend'})}</legend>
            <div>
                <input
                    type="radio"
                    name={FIELD_TYPES.INSTRUCTION_TEXT.id}
                    id={FIELD_TYPES.INSTRUCTION_TEXT.id}
                    value={FIELD_TYPES.INSTRUCTION_TEXT.id}
                    checked={currentFieldType.id === FIELD_TYPES.INSTRUCTION_TEXT.id}
                    onChange={onChange}
                />
                <label htmlFor={FIELD_TYPES.INSTRUCTION_TEXT.id}>
                    {intl.formatMessage({id: FIELD_TYPES.INSTRUCTION_TEXT.translationId})}
                </label>
            </div>
            <div>
                <input
                    type="radio"
                    name={FIELD_TYPES.MOBILE_BUTTON.id}
                    id={FIELD_TYPES.MOBILE_BUTTON.id}
                    value={FIELD_TYPES.MOBILE_BUTTON.id}
                    checked={currentFieldType.id === FIELD_TYPES.MOBILE_BUTTON.id}
                    onChange={onChange}
                />
                <label htmlFor={FIELD_TYPES.MOBILE_BUTTON.id}>
                    {intl.formatMessage({id: FIELD_TYPES.MOBILE_BUTTON.translationId})}
                </label>
            </div>
        </fieldset>        
    )
}

FieldTypeSelector.propTypes = {
    currentFieldType: PropTypes.object.isRequired,
    intl: intlShape,
    onChange: PropTypes.func.isRequired,
}

export {FieldTypeSelector as UnconnectedFieldTypeSelector};
export default injectIntl(FieldTypeSelector)
