import React from 'react'
import {injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import {CONTENT_CATEGORIES} from '../../utils/constants';
import {FormGroup, Input, Label} from 'reactstrap';

function ContentTypeSelector({intl, onChange, value}){
    return (
        <FormGroup className='select'>
            <Label htmlFor='instruction-content-type-select'>
                {intl.formatMessage({id: 'admin-select-instructions'})}
            </Label>

            <Input
                id='instruction-content-type-select'
                className='instruction-select'
                value={value}
                onChange={onChange}
                type='select'
            >
                <option value="" disabled hidden>
                    {intl.formatMessage({id: 'admin-select-set'})}
                </option>
                <option value={CONTENT_CATEGORIES.GENERAL.typeId}>
                    {intl.formatMessage({id: CONTENT_CATEGORIES.GENERAL.translationId})}
                </option>
                <option value={CONTENT_CATEGORIES.HOBBIES.typeId}>
                    {intl.formatMessage({id: CONTENT_CATEGORIES.HOBBIES.translationId})}
                </option>
                <option value={CONTENT_CATEGORIES.COURSES.typeId}>
                    {intl.formatMessage({id: CONTENT_CATEGORIES.COURSES.translationId})}
                </option>
            </Input>
        </FormGroup>
    )
}

ContentTypeSelector.propTypes = {
    value: PropTypes.string.isRequired,
    intl: intlShape,
    onChange: PropTypes.func.isRequired,
}

export {ContentTypeSelector as UnconnectedContentTypeSelector};
export default injectIntl(ContentTypeSelector)
