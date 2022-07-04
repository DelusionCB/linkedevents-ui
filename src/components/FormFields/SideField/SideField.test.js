import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {UnconnectedSideField} from './SideField'
import {Collapse} from 'reactstrap';
import CollapseButton  from '../CollapseButton/CollapseButton';
import {mapSideFieldsToForm} from '../../../utils/apiDataMapping';
import {mockSideFields} from '../../../../__mocks__/mockData';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    id: 'event-category-header',
    type: 'category',
    editor: {
        values: {
            type_id: 'General',
        },
        sideFields: mockSideFields,
    },
    intl,
}

describe('SideField', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedSideField {...defaultProps} {...props} />, {context: {intl}});
    }

    describe('renders', () => {
        describe('components', () => {
            describe('Collapse', () => {
                test('correct props', () => {
                    const wrapper = getWrapper()
                    const collapse = wrapper.find(Collapse)
                    expect(collapse).toHaveLength(1)
                    expect(collapse.prop('isOpen')).toBe(wrapper.state('isOpen'))
                })
            })
            describe('CollapseButton', () => {
                test('correct props', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance()
                    const collapseButton = wrapper.find(CollapseButton)
                    const contextTexts = mapSideFieldsToForm(defaultProps.editor.sideFields, defaultProps.editor.values.type_id, intl.locale)
                    expect(collapseButton).toHaveLength(1)
                    expect(collapseButton.prop('targetCollapseNameId')).toBe(contextTexts[defaultProps.type].mobileHeader)
                    expect(collapseButton.prop('isOpen')).toBe(wrapper.state('isOpen'))
                    expect(collapseButton.prop('toggleHeader')).toBe(instance.toggleHeader)
                    expect(collapseButton.prop('useNameIdAsRawName')).toBe(true)
                })
            })
        })
        describe('methods', () => {
            describe('componentDidMount', () => {
                const elementMock = window.addEventListener = jest.fn();
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                beforeEach(() => {
                    jest.clearAllMocks()
                    instance.componentDidMount()
                });
                test('addEventListener is called', () => {
                    expect(elementMock).toBeCalled()
                    expect(elementMock).toHaveBeenCalledTimes(1)
                })
                test('addEventListener is called with correct args', () => {
                    expect(elementMock).toBeCalledWith('resize', expect.any(Function))
                })
            })
            describe('componentWillUnmount', () => {
                const elementMock = window.removeEventListener = jest.fn();
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                beforeEach(() => {
                    jest.clearAllMocks()
                    instance.componentWillUnmount()
                });
                test('removeEventListener is called', () => {
                    expect(elementMock).toBeCalled()
                    expect(elementMock).toHaveBeenCalledTimes(1)
                })
                test('removeEventListener is called with correct args', () => {
                    expect(elementMock).toBeCalledWith('resize', expect.any(Function))
                })
            })
            describe('toggleHeader', () => {
                test('changes state', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance()
                    expect(wrapper.state('isOpen')).toBe(true)
                    instance.toggleHeader()
                    expect(wrapper.state('isOpen')).toBe(false)
                })
            })
        })
    })
})
