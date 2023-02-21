import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
import {UnconnectedInstructionFields as InstructionFields} from '../InstructionFields';
import {FIELD_TYPES} from '../../../utils/constants';
import {getValidationInitValues} from '../utils'
import CustomTextField from '../../../utils/CustomTextField';

const fields = {
    fi: 'times_sidefield_fi',
    sv: 'times_sidefield_sv',
    en: 'times_sidefield_en',
}

const defaultProps = {
    intl: intl,
    fields,
    selectedField: 'times_sidefield',
    currentFieldType: FIELD_TYPES.INSTRUCTION_TEXT,
    onChange: jest.fn(),
    validations: getValidationInitValues(fields, FIELD_TYPES.INSTRUCTION_TEXT),
}

function getWrapper(props) {
    return shallow(<InstructionFields {...defaultProps} {...props} />, {context: {intl}});
}

describe('renders', () => {
    test('wrapping div', () => {
        const div = getWrapper().find('div')
        expect(div).toHaveLength(1)
        expect(div.prop('id')).toBe('admin-instruction-field-texts')
    })

    test('CustomTextFields', () => {
        const textFields = getWrapper().find(CustomTextField)
        expect(textFields).toHaveLength(Object.keys(defaultProps.fields).length)
        const fieldKeys = Object.keys(defaultProps.fields)
        const fieldValues = Object.values(defaultProps.fields)
        for (let index = 0; index < textFields.length; index++) {
            const textField = textFields.at(index);
            expect(textField.prop('label')).toBe(
                intl.formatMessage({id: defaultProps.selectedField}) + ' ' + intl.formatMessage({id: `in-${fieldKeys[index]}`})
            )
            expect(textField.prop('id')).toBe(`${defaultProps.selectedField}-field-${fieldKeys[index]}`)
            expect(textField.prop('value')).toBe(fieldValues[index])
            expect(textField.prop('required')).toBe(true)
            expect(textField.prop('type')).toBe('textarea')
            expect(textField.prop('maxLength')).toBe(defaultProps.currentFieldType.maxCharacters)
            expect(textField.prop('onChange')).toBeDefined()
            expect(textField.prop('validation')).toBe(defaultProps.validations[fieldKeys[index]])
        }
    })
})
