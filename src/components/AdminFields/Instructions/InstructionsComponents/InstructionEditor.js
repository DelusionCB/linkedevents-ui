import '../index.scss'

import React from 'react';
import {injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import {Button} from 'reactstrap';
import {connect} from 'react-redux';

import {FIELD_TYPES} from '../../utils/constants';
import {updateSidefields as updateSidefieldsAction} from '../../../../actions/admin';
import {fetchSideFields as fetchSideFieldsAction} from '../../../../actions/editor';
import InstructionFields from './InstructionFields';
import FieldTypeSelector from './FieldTypeSelector';
import ContentTypeSelector from './ContentTypeSelector';
import FieldSelector from './FieldSelector';
import {
    filterSideFieldByType,
    getFieldValidation,
    getSideFieldIdByTypeId,
    getValidationInitValues,
    hasAnyValidationErrors,
} from './utils';


class InstructionEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedContentType: '', // e.g. hobbies, courses etc..
            fieldType: FIELD_TYPES.INSTRUCTION_TEXT,
            selectedFieldId: '', // a sidefield's id
            fieldValues: null, // fi, en, sv texts
            validations: {},
            showSubmitError: false,
            isSubmitting: false,
        }

        this.handleContentTypeChange = this.handleContentTypeChange.bind(this)
        this.handleFieldChange = this.handleFieldChange.bind(this)
        this.handleFieldTypeChange = this.handleFieldTypeChange.bind(this)
        this.handleInstructionTextChange = this.handleInstructionTextChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleContentTypeChange(event){
        const {value} = event.target
        this.setState({
            selectedContentType: value,
            fieldType: FIELD_TYPES.INSTRUCTION_TEXT,
            selectedFieldId: '',
            fieldValues: null,
            validations: {},
            showSubmitError: false,
        })
    }

    handleFieldTypeChange(event){
        const {value} = event.target
        const type = Object.values(FIELD_TYPES).find(fieldType => fieldType.id === value)
        this.setState({
            fieldType: type,
            selectedFieldId: '', 
            fieldValues: null,
            validations: {},
            showSubmitError: false,
        })
    }

    handleFieldChange(event){
        const {fieldType, selectedContentType} = this.state
        const {editor} = this.props
        const {value} = event.target

        const dataToEdit = filterSideFieldByType(fieldType, selectedContentType, editor.sideFields)[value]

        this.setState({
            selectedFieldId: value,
            fieldValues: dataToEdit,
            validations: getValidationInitValues(dataToEdit, fieldType),
            showSubmitError: false,
        })
    }

    handleInstructionTextChange(event, language){
        const {value} = event.target
        const {fieldValues, fieldType, validations} = this.state

        const validation = getFieldValidation(value, fieldType.maxCharacters, true)
        this.setState({
            fieldValues: {...fieldValues, [language]: value},
            validations: {...validations, [language]: validation},
            showSubmitError: false,
        })
    }

    handleSubmit(){
        const {validations, fieldValues, selectedContentType, selectedFieldId} = this.state
        const {editor} = this.props

        if (hasAnyValidationErrors(validations)) {
            this.setState({showSubmitError: true})
        }
        else {
            this.setState({isSubmitting: true})
            const data = {[selectedFieldId]: fieldValues}
            this.props.updateSidefields(
                data,
                getSideFieldIdByTypeId(editor.sideFields, selectedContentType)
            ).then(() => {
                this.setState({
                    isSubmitting: false,
                })
            })
        }
    }
    
    render() {
        const {intl, editor} = this.props;
        const {
            selectedContentType,
            selectedFieldId,
            isEditing,
            fieldType,
            validations,
            fieldValues,
            showSubmitError,
            isSubmitting,
        } = this.state;

        return (
            <div className='instructions-editor'>
                <h1>{intl.formatMessage({id: 'admin-instructions-control'})}</h1>
                <ContentTypeSelector
                    disabled={isEditing}
                    onChange={this.handleContentTypeChange}
                    value={selectedContentType}
                />
                
                {selectedContentType && (
                    <React.Fragment>
                        <FieldTypeSelector
                            onChange={this.handleFieldTypeChange}
                            currentFieldType={fieldType}
                        />
                        <FieldSelector
                            sideFields={filterSideFieldByType(fieldType, selectedContentType, editor.sideFields)}
                            onChange={this.handleFieldChange}
                            value={selectedFieldId}
                        />
                    </React.Fragment>
                )}

                {fieldValues && (
                    <InstructionFields
                        fields={fieldValues}
                        sideFields={filterSideFieldByType(fieldType, selectedContentType, editor.sideFields)}
                        selectedField={selectedFieldId}
                        selectedSet={selectedContentType}
                        currentFieldType={fieldType}
                        onChange={this.handleInstructionTextChange}
                        validations={validations}
                    />
                )}

                {selectedFieldId && (
                    <React.Fragment>
                        <div className='button-controls'>
                            <Button
                                onClick={this.handleSubmit}
                                disabled={showSubmitError || isSubmitting}
                            >
                                {intl.formatMessage({id: 'admin-instructions-save'})}
                            </Button>
                        </div>
                        <div className='admin-form-errors'>
                            {showSubmitError && (
                                <p className='red-alert' role='alert'>
                                    {intl.formatMessage({id: 'admin-instructions-errors'})}
                                </p>
                            )}
                        </div>
                    </React.Fragment>
                )}
            </div>
        )
    }
}

InstructionEditor.propTypes = {
    editor: PropTypes.object,
    intl: PropTypes.oneOfType([
        PropTypes.object,
        intlShape.isRequired,
    ]),
    updateSidefields: PropTypes.func,
    fetchSideFields: PropTypes.func,
}

const mapDispatchToProps = (dispatch) => ({
    fetchSideFields:() => dispatch(fetchSideFieldsAction()),
    updateSidefields: (values, type) => dispatch(updateSidefieldsAction(values, type)),
})

export {InstructionEditor as UnconnectedInstructionEditor};
export default connect(null, mapDispatchToProps)(injectIntl(InstructionEditor))
