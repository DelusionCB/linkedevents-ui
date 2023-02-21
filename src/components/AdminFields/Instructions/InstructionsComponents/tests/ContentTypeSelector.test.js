import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
import {UnconnectedContentTypeSelector as ContentTypeSelector} from '../ContentTypeSelector';
import {FormGroup, Input, Label} from 'reactstrap';
import {CONTENT_CATEGORIES} from '../../../utils/constants';

const defaultProps = {
    intl: intl,
    value: '',
    onChange: jest.fn(),
}

function getWrapper(props) {
    return shallow(<ContentTypeSelector {...defaultProps} {...props} />, {context: {intl}});
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
        expect(label.prop('htmlFor')).toBe('instruction-content-type-select')
        expect(label.prop('children')).toBe(intl.formatMessage({id: 'admin-select-instructions'}))
    })

    test('input', () => {
        const input = getWrapper().find(Input)
        expect(input).toHaveLength(1)
        expect(input.prop('id')).toBe('instruction-content-type-select')
        expect(input.prop('className')).toBe('instruction-select')
        expect(input.prop('value')).toBe(defaultProps.value)
        expect(input.prop('onChange')).toBe(defaultProps.onChange)
        expect(input.prop('type')).toBe('select')
    })

    test('options', () => {
        const options = getWrapper().find('option')
        expect(options).toHaveLength(4)
        const firstOption = options.at(0)
        expect(firstOption.prop('value')).toBe('')
        expect(firstOption.prop('disabled')).toBe(true)
        expect(firstOption.prop('hidden')).toBe(true)
        expect(firstOption.prop('children')).toBe(intl.formatMessage({id: 'admin-select-set'}))

        const secondOption = options.at(1)
        expect(secondOption.prop('value')).toBe(CONTENT_CATEGORIES.GENERAL.typeId)
        expect(secondOption.prop('children')).toBe(
            intl.formatMessage({id: CONTENT_CATEGORIES.GENERAL.translationId})
        )

        const thirdOption = options.at(2)
        expect(thirdOption.prop('value')).toBe(CONTENT_CATEGORIES.HOBBIES.typeId)
        expect(thirdOption.prop('children')).toBe(
            intl.formatMessage({id: CONTENT_CATEGORIES.HOBBIES.translationId})
        )

        const fourthOption = options.at(3)
        expect(fourthOption.prop('value')).toBe(CONTENT_CATEGORIES.COURSES.typeId)
        expect(fourthOption.prop('children')).toBe(
            intl.formatMessage({id: CONTENT_CATEGORIES.COURSES.translationId})
        )
    })
})
