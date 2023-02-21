import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
import {UnconnectedFieldSelector as FieldSelector} from '../FieldSelector';
import {FormGroup, Input, Label} from 'reactstrap';

const defaultProps = {
    intl: intl,
    value: '',
    onChange: jest.fn(),
    sideFields: {
        times_sidefield: {
            fi: 'times_sidefield_fi',
            sv: 'times_sidefield_sv',
            en: 'times_sidefield_en',
        },
        keyword_sidefield: {
            fi: 'keyword_sidefield_fi',
            sv: 'keyword_sidefield_sv',
            en: 'keyword_sidefield_en',
        },
        offers_sidefield: {
            fi: 'offers_sidefield_fi',
            sv: 'offers_sidefield_sv',
            en: 'offers_sidefield_en',
        },
        location_sidefield: {
            fi: 'location_sidefield_fi',
            sv: 'location_sidefield_sv',
            en: 'location_sidefield_en',
        },category_sidefield: {
            fi: 'category_sidefield_fi',
            sv: 'category_sidefield_sv',
            en: 'category_sidefield_en',
        },
        umbrella_sidefield: {
            fi: 'umbrella_sidefield_fi',
            sv: 'umbrella_sidefield_sv',
            en: 'umbrella_sidefield_en',
        },
    },
}

function getWrapper(props) {
    return shallow(<FieldSelector {...defaultProps} {...props} />, {context: {intl}});
}

describe('renders', () => {
    test('wrapping FormGroup', () => {
        const formGroup = getWrapper().find(FormGroup)
        expect(formGroup).toHaveLength(1)
        expect(formGroup.prop('className')).toBe('select')
    })

    test('label', () => {
        const label = getWrapper().find(Label)
        expect(label).toHaveLength(1)
        expect(label.prop('htmlFor')).toBe('instruction-field-select')
        expect(label.prop('children')).toBe(intl.formatMessage({id: 'admin-instructions-field-select-label'}))
    })

    test('input', () => {
        const input = getWrapper().find(Input)
        expect(input).toHaveLength(1)
        expect(input.prop('id')).toBe('instruction-field-select')
        expect(input.prop('value')).toBe(defaultProps.value)
        expect(input.prop('onChange')).toBe(defaultProps.onChange)
        expect(input.prop('type')).toBe('select')
    })

    describe('options', () => {
        test('there are correct amount', () => {
            const options = getWrapper().find('option')
            const expected = Object.keys(defaultProps.sideFields).length + 1
            expect(options).toHaveLength(expected)
        })

        test('first option', () => {
            const option = getWrapper().find('option').at(0)
            expect(option.prop('value')).toBe('')
            expect(option.prop('disabled')).toBe(true)
            expect(option.prop('hidden')).toBe(true)
            expect(option.prop('children')).toBe(
                intl.formatMessage({id: 'admin-instructions-field-select-option-zero'})
            )
        })

        test('sidefield options', () => {
            const options = getWrapper().find('options')
            const expectedValues = Object.keys(defaultProps.sideFields)
            for (let index = 1; index < options.length; index++) {
                const option = options[index];
                expect(option.prop('value')).toBe(expectedValues[index - 1])
                expect(option.prop('children')).toBe(intl.formatMessage({id: expectedValues[index - 1]}))
            }
        })
    })
})
