import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
import {UnconnectedInstructionEditor as InstructionEditor} from '../InstructionEditor';
import {mockEditorNewEvent, mockSideFields} from '../../../../../../__mocks__/mockData';
import ContentTypeSelector from '../ContentTypeSelector';
import FieldTypeSelector from '../FieldTypeSelector';
import {CONTENT_CATEGORIES, FIELD_TYPES} from '../../../utils/constants';
import FieldSelector from '../FieldSelector';
import {filterSideFieldByType, getFieldValidation, getValidationInitValues} from '../utils';
import InstructionFields from '../InstructionFields';
import {Button} from 'reactstrap';

const submitSuccessTestData = {fi: 'success', en: 'success', sv: 'success'}

const defaultProps = {
    intl: intl,
    updateSidefields: jest.fn().mockImplementation(() => Promise.resolve(submitSuccessTestData)),
    fetchSideFields: jest.fn(),
    editor: {...mockEditorNewEvent, sideFields: mockSideFields},
}

function getWrapper(props) {
    return shallow(<InstructionEditor {...defaultProps} {...props} />, {context: {intl}});
}

describe('InstructionEditor', () => {
    describe('renders', () => {
        test('wrapping div', () => {
            const div = getWrapper().find('.instructions-editor')
            expect(div).toHaveLength(1)
        })
        test('h1 title', () => {
            const title = getWrapper().find('h1')
            expect(title).toHaveLength(1)
            expect(title.prop('children')).toBe(intl.formatMessage({id: 'admin-instructions-control'}))
        })
        test('ContentTypeSelector', () => {
            const wrapper = getWrapper()
            const instance = wrapper.instance()
            const contentTypeSelector = wrapper.find(ContentTypeSelector)
            expect(contentTypeSelector).toHaveLength(1)
            expect(contentTypeSelector.prop('disabled')).toBe(instance.state.isEditing)
            expect(contentTypeSelector.prop('onChange')).toBe(instance.handleContentTypeChange)
            expect(contentTypeSelector.prop('value')).toBe(instance.state.selectedContentType)
        })

        describe('FieldTypeSelector', () => {
            test('when state.selectedContentType is truthy', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                instance.setState({selectedContentType: CONTENT_CATEGORIES.GENERAL.typeId})
                const fieldTypeSelector = wrapper.find(FieldTypeSelector)
                expect(fieldTypeSelector).toHaveLength(1)
                expect(fieldTypeSelector.prop('onChange')).toBe(instance.handleFieldTypeChange)
                expect(fieldTypeSelector.prop('currentFieldType')).toBe(instance.state.fieldType)
            })
            test('when state.selectedContentType is falsy', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                instance.setState({selectedContentType: ''})
                const fieldTypeSelector = wrapper.find(FieldTypeSelector)
                expect(fieldTypeSelector).toHaveLength(0)
            })
        })

        describe('FieldSelector', () => {
            test('when state.selectedContentType is truthy', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                instance.setState({selectedContentType: CONTENT_CATEGORIES.GENERAL.typeId})
                const fieldSelector = wrapper.find(FieldSelector)
                expect(fieldSelector).toHaveLength(1)
                expect(fieldSelector.prop('sideFields')).toStrictEqual(
                    filterSideFieldByType(
                        instance.state.fieldType,
                        instance.state.selectedContentType,
                        defaultProps.editor.sideFields)
                )
                expect(fieldSelector.prop('onChange')).toBe(instance.handleFieldChange)
                expect(fieldSelector.prop('value')).toBe(instance.state.selectedFieldId)
            })
            test('when state.selectedContentType is falsy', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                instance.setState({selectedContentType: ''})
                const fieldSelector = wrapper.find(FieldSelector)
                expect(fieldSelector).toHaveLength(0)
            })
        })

        describe('InstructionFields', () => {
            test('when state.fieldValues is truthy', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                instance.setState({
                    selectedContentType: CONTENT_CATEGORIES.GENERAL.typeId,
                    fieldValues: {fi: 'fi', en: 'en', sv: 'sv'},
                })
                const instructionFields = wrapper.find(InstructionFields)
                expect(instructionFields).toHaveLength(1)
                expect(instructionFields.prop('fields')).toBe(instance.state.fieldValues)
                expect(instructionFields.prop('sideFields')).toStrictEqual(
                    filterSideFieldByType(
                        instance.state.fieldType,
                        instance.state.selectedContentType,
                        defaultProps.editor.sideFields)
                )
                expect(instructionFields.prop('selectedField')).toBe(instance.state.selectedFieldId)
                expect(instructionFields.prop('selectedSet')).toBe(instance.state.selectedContentType)
                expect(instructionFields.prop('currentFieldType')).toBe(instance.state.fieldType)
                expect(instructionFields.prop('onChange')).toBe(instance.handleInstructionTextChange)
                expect(instructionFields.prop('validations')).toBe(instance.state.validations)
            })
            test('when state.fieldValues is falsy', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                instance.setState({selectedContentType: ''})
                const instructionFields = wrapper.find(InstructionFields)
                expect(instructionFields).toHaveLength(0)
            })
        })

        describe('button controls', () => {
            describe('when state.selectedFieldId is truthy', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                instance.setState({selectedFieldId: '123'})

                test('btn control div', () => {
                    const div = wrapper.find('div.button-controls')
                    expect(div).toHaveLength(1)
                })
                test('submit button', () => {
                    const button = wrapper.find('div.button-controls').find(Button)
                    expect(button).toHaveLength(1)
                    expect(button.prop('onClick')).toBe(instance.handleSubmit)
                    expect(button.prop('disabled')).toBe(
                        instance.state.showSubmitError || instance.state.isSubmitting)
                    expect(button.prop('children')).toBe(intl.formatMessage({id: 'admin-instructions-save'}))
                })
            })
            describe('when state.selectedFieldId is falsy', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                instance.setState({selectedFieldId: ''})

                test('btn control div', () => {
                    const div = wrapper.find('div.button-controls')
                    expect(div).toHaveLength(0)
                })
                test('submit button', () => {
                    const button = wrapper.find('div.button-controls').find(Button)
                    expect(button).toHaveLength(0)
                })
            })
        })

        describe('admin form errors', () => {
            describe('when state.selectedFieldId is truthy', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                instance.setState({selectedFieldId: '123'})
                
                test('form errors div', () => {
                    const div = wrapper.find('div.admin-form-errors')
                    expect(div).toHaveLength(1)
                })
                test('error text when state.showSubmitError is true', () => {
                    instance.setState({showSubmitError: true})
                    const errorText = wrapper.find('div.admin-form-errors').find('p.red-alert')
                    expect(errorText).toHaveLength(1)
                    expect(errorText.prop('role')).toBe('alert')
                    expect(errorText.prop('children')).toBe(intl.formatMessage({id: 'admin-instructions-errors'}))
                })
                test('error text when state.showSubmitError is false', () => {
                    instance.setState({showSubmitError: false})
                    const errorText = wrapper.find('div.admin-form-errors').find('p.red-alert')
                    expect(errorText).toHaveLength(0)
                })
            })
            describe('when state.selectedFieldId is falsy', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                instance.setState({selectedFieldId: ''})
                
                test('form errors div', () => {
                    const div = wrapper.find('div.admin-form-errors')
                    expect(div).toHaveLength(0)
                })
                test('error text', () => {
                    instance.setState({showSubmitError: true})
                    const errorText = wrapper.find('div.admin-form-errors').find('p.red-alert')
                    expect(errorText).toHaveLength(0)
                })
            })
        })
    })

    describe('methods', () => {
        describe('handleContentTypeChange', () => {
            test('calls setState with correct value', () => {
                const instance = getWrapper().instance()
                const spy = jest.spyOn(instance, 'setState')
                const event = {target: {value: CONTENT_CATEGORIES.GENERAL.typeId}}
                instance.handleContentTypeChange(event)
                expect(spy).toHaveBeenCalledTimes(1)
                expect(spy).toHaveBeenCalledWith({
                    selectedContentType: event.target.value,
                    fieldType: FIELD_TYPES.INSTRUCTION_TEXT,
                    selectedFieldId: '',
                    fieldValues: null,
                    validations: {},
                    showSubmitError: false,
                })
            })
        })

        describe('handleFieldTypeChange', () => {
            test('calls setState with correct value', () => {
                const instance = getWrapper().instance()
                const spy = jest.spyOn(instance, 'setState')
                const event = {target: {value: FIELD_TYPES.MOBILE_BUTTON.id}}
                instance.handleFieldTypeChange(event)
                expect(spy).toHaveBeenCalledTimes(1)
                expect(spy).toHaveBeenCalledWith({
                    fieldType: FIELD_TYPES.MOBILE_BUTTON,
                    selectedFieldId: '',
                    fieldValues: null,
                    validations: {},
                    showSubmitError: false,
                })
            })
        })

        describe('handleFieldChange', () => {
            test('calls setState with correct value', () => {
                const instance = getWrapper().instance()
                instance.setState({
                    fieldType: FIELD_TYPES.MOBILE_BUTTON,
                    selectedContentType: CONTENT_CATEGORIES.GENERAL.typeId,
                })
                const spy = jest.spyOn(instance, 'setState')
                const event = {target: {value: 'category_mobile'}}
                instance.handleFieldChange(event)
                expect(spy).toHaveBeenCalledTimes(1)
                expect(spy).toHaveBeenCalledWith({
                    selectedFieldId: event.target.value,
                    fieldValues: mockSideFields[0].category_mobile,
                    validations: getValidationInitValues(
                        mockSideFields[0].category_mobile, FIELD_TYPES.MOBILE_BUTTON
                    ),
                    showSubmitError: false,
                })
            })
        })

        describe('handleInstructionTextChange', () => {
            test('calls setState with correct value', () => {
                const instance = getWrapper().instance()
                instance.setState({
                    fieldType: FIELD_TYPES.MOBILE_BUTTON,
                    selectedContentType: CONTENT_CATEGORIES.GENERAL.typeId,
                    fieldValues: mockSideFields[0].category_mobile,
                    validations: getValidationInitValues(
                        mockSideFields[0].category_mobile, FIELD_TYPES.MOBILE_BUTTON
                    ),
                })
                const spy = jest.spyOn(instance, 'setState')
                const event = {target: {value: 'test text..'}}
                const language = 'fi'
                instance.handleInstructionTextChange(event, language)
                expect(spy).toHaveBeenCalledTimes(1)
                expect(spy).toHaveBeenCalledWith({
                    fieldValues: {...mockSideFields[0].category_mobile, fi: event.target.value},
                    validations: {
                        ...instance.state.validations,
                        [language]: getFieldValidation(
                            event.target.value, FIELD_TYPES.MOBILE_BUTTON.maxCharacters, true
                        ),
                    },
                    showSubmitError: false,
                })
            })
        })

        describe('handleSubmit', () => {
            test('calls setState with correct value when form has errors', () => {
                const instance = getWrapper().instance()
                instance.setState({validations: {fi: {error: true}}})
                const spy = jest.spyOn(instance, 'setState')
                instance.handleSubmit()
                expect(spy).toHaveBeenCalledTimes(1)
                expect(spy).toHaveBeenCalledWith({
                    showSubmitError: true,
                })
            })
            test('calls setState with correct value when form has no errors', async () => {
                const instance = getWrapper().instance()
                instance.setState({validations: {fi: {error: false}}})
                const spy = jest.spyOn(instance, 'setState')
                await instance.handleSubmit()
                expect(spy).toHaveBeenCalledTimes(2)
                expect(spy.mock.calls[0][0]).toStrictEqual({'isSubmitting': true})
                expect(spy.mock.calls[1][0]).toStrictEqual({'isSubmitting': false})
            })
            test('calls updateSidefields with correct params', async () => {
                defaultProps.updateSidefields.mockClear()
                const instance = getWrapper().instance()
                const sideFields = {...mockSideFields}
                sideFields[0].id = 'test-id'
                instance.setState({
                    editor: {...defaultProps.editor, ...sideFields},
                    validations: {fi: {error: false}},
                    selectedContentType: CONTENT_CATEGORIES.GENERAL.typeId,
                    selectedFieldId: 'category_mobile',
                    fieldValues: mockSideFields[0].category_mobile,
                })
                await instance.handleSubmit()
                expect(defaultProps.updateSidefields).toHaveBeenCalledTimes(1)
                expect(defaultProps.updateSidefields).toHaveBeenCalledWith(
                    {category_mobile: mockSideFields[0].category_mobile}, 'test-id'
                )
            })
        })
    })
})
