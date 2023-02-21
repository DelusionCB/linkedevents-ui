import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
import {UnconnectedFieldTypeSelector as FieldTypeSelector} from '../FieldTypeSelector';
import {FIELD_TYPES} from '../../../utils/constants';

const defaultProps = {
    intl: intl,
    currentFieldType: {},
    onChange: jest.fn(),
}

function getWrapper(props) {
    return shallow(<FieldTypeSelector {...defaultProps} {...props} />, {context: {intl}});
}

describe('renders', () => {
    test('wrapping fieldset', () => {
        const fieldset = getWrapper().find('fieldset')
        expect(fieldset).toHaveLength(1)
        expect(fieldset.prop('id')).toBe('instruction-type-selector')
    })

    test('legend', () => {
        const legend = getWrapper().find('legend')
        expect(legend).toHaveLength(1)
        expect(legend.prop('children')).toBe(intl.formatMessage({id: 'admin-instructions-field-type-legend'}))
    })

    test('there are correct amount of divs, inputs and labels', () => {
        const divs = getWrapper().find('div')
        expect(divs).toHaveLength(2)
        const inputs = getWrapper().find('input')
        expect(inputs).toHaveLength(2)
        const labels = getWrapper().find('label')
        expect(labels).toHaveLength(2)
    })

    describe('instruction text', () => {
        test('input', () => {
            const input = getWrapper().find('input').at(0)
            expect(input.prop('type')).toBe('radio')
            expect(input.prop('name')).toBe(FIELD_TYPES.INSTRUCTION_TEXT.id)
            expect(input.prop('id')).toBe(FIELD_TYPES.INSTRUCTION_TEXT.id)
            expect(input.prop('value')).toBe(FIELD_TYPES.INSTRUCTION_TEXT.id)
            expect(input.prop('checked')).toBe(
                defaultProps.currentFieldType.id === FIELD_TYPES.INSTRUCTION_TEXT.id
            )
            expect(input.prop('onChange')).toBe(defaultProps.onChange)
        })

        test('label', () => {
            const label = getWrapper().find('label').at(0)
            expect(label.prop('htmlFor')).toBe(FIELD_TYPES.INSTRUCTION_TEXT.id)
            expect(label.prop('children')).toBe(
                intl.formatMessage({id: FIELD_TYPES.INSTRUCTION_TEXT.translationId})
            )
        })
    })

    describe('mobile button name', () => {
        test('input', () => {
            const input = getWrapper().find('input').at(1)
            expect(input.prop('type')).toBe('radio')
            expect(input.prop('name')).toBe(FIELD_TYPES.MOBILE_BUTTON.id)
            expect(input.prop('id')).toBe(FIELD_TYPES.MOBILE_BUTTON.id)
            expect(input.prop('value')).toBe(FIELD_TYPES.MOBILE_BUTTON.id)
            expect(input.prop('checked')).toBe(
                defaultProps.currentFieldType.id === FIELD_TYPES.MOBILE_BUTTON.id
            )
            expect(input.prop('onChange')).toBe(defaultProps.onChange)
        })
        
        test('label', () => {
            const label = getWrapper().find('label').at(1)
            expect(label.prop('htmlFor')).toBe(FIELD_TYPES.MOBILE_BUTTON.id)
            expect(label.prop('children')).toBe(
                intl.formatMessage({id: FIELD_TYPES.MOBILE_BUTTON.translationId})
            )
        })
    })
})
