import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
import {mockEditorNewEvent, mockSideFields} from '../../../../__mocks__/mockData';
import  {UnconnectedInstructions as Instructions} from '.';
import InstructionEditor from './InstructionsComponents/InstructionEditor';

const defaultProps = {
    intl: intl,
    editor: {...mockEditorNewEvent, sideFields: mockSideFields},
}

function getWrapper(props) {
    return shallow(<Instructions {...defaultProps} {...props} />, {context: {intl}});
}

describe('Admin panel instructions', () => {
    describe('renders', () => {
        test('InstructionEditor', () => {
            const editor = getWrapper().find(InstructionEditor)
            expect(editor).toHaveLength(1)
            expect(editor.prop('intl')).toBe(defaultProps.intl)
            expect(editor.prop('editor')).toBe(defaultProps.editor)
        })
    })
})
