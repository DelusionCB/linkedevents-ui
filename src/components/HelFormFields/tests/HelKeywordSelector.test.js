import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import React from 'react'
import {UnconnectedHelKeywordSelector, filterValidations,
    handleKeywordDelete, handleKeywordChange, getKeywordIds,
} from '../HelKeywordSelector/HelKeywordSelector';
import SideField from '../../FormFields/SideField/SideField';
import {HelLabeledCheckboxGroup, HelSelect} from '../index';
import {mapKeywordSetToForm} from '../../../utils/apiDataMapping';
import {mockKeywordSets} from '../../../../__mocks__/mockData';
import CONSTANTS from '../../../constants';
import SelectedKeywords from '../../SelectedKeywords/SelectedKeywords';
import {CopyToClipboard} from 'react-copy-to-clipboard/lib/Component';
jest.mock('../../../utils/apiDataMapping')

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    currentLocale: 'fi',
    disabled: false,
    localeType: 'event',
    editor: {
        values: {
            keywords: [],
            type_id: CONSTANTS.EVENT_TYPE.GENERAL,
        },
        keywordSets: mockKeywordSets,
        validateFor: 'public',
        validationErrors: {
            keywords: [],
        },
    },
    intl,
    setDirtyState: () => {},
    setData: () => {},
}

describe('HelSelect', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedHelKeywordSelector {...defaultProps} {...props} />);
    }

    describe('renders', () => {

        describe('components', () => {

            afterEach(() => {
                jest.clearAllMocks()
            })

            describe('FormattedMessage', () => {
                test('correct amount', () => {
                    const wrapper = getWrapper()
                    const formattedElement = wrapper.find(FormattedMessage)
                    expect(formattedElement).toHaveLength(3)
                })
            })
            describe('Sidefield', () => {
                test('correct amount & props', () => {
                    const wrapper = getWrapper()
                    const sideElement = wrapper.find(SideField)
                    expect(sideElement).toHaveLength(2)

                    expect(sideElement.at(0).prop('id')).toBe('editor-tip-keyword-sidefield')
                    expect(sideElement.at(1).prop('id')).toBe('editor-tip-category-sidefield')
                })
            })
            describe('HelLabeledCheckBoxGroup', () => {
                test('correct props', () => {
                    const wrapper = getWrapper()
                    const groupElement = wrapper.find(HelLabeledCheckboxGroup)
                    const rules = ['atLeastOneMainCategory', 'atLeastOneSecondaryCategory']
                    expect(groupElement).toHaveLength(2)
                    expect(groupElement.at(0).prop('groupLabel')).toEqual(<FormattedMessage id='categories-header-content'/>)
                    expect(groupElement.at(1).prop('groupLabel')).toEqual(<FormattedMessage id='event-categories-type'/>)
                    groupElement.forEach((element, index) => {
                        expect(element.prop('selectedValues')).toBe(defaultProps.editor.values.keywords)
                        expect(element.prop('name')).toBe('keywords')
                        expect(element.prop('disabled')).toBe(defaultProps.disabled)
                        expect(element.prop('validationErrors')).toBe(filterValidations(defaultProps.editor.validationErrors, rules[index]))
                        expect(element.prop('itemClassName')).toBe('col-lg-6')
                        expect(element.prop('options')).toBe(undefined)
                        expect(element.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                        expect(element.prop('customOnChangeHandler')).toBeDefined()
                        expect(element.prop('currentLocale')).toBe(defaultProps.currentLocale)
                    })
                })
            })
            describe('HelSelect', () => {
                test('correct props', () => {
                    const wrapper = getWrapper()
                    const selectElement = wrapper.find(HelSelect)
                    expect(selectElement).toHaveLength(1)
                    expect(selectElement.prop('legend')).toBe(intl.formatMessage({id: 'event-keywords'}))
                    expect(selectElement.prop('name')).toBe('keywords')
                    expect(selectElement.prop('resource')).toBe('keyword')
                    expect(selectElement.prop('disabled')).toBe(defaultProps.disabled)
                    expect(selectElement.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                    expect(selectElement.prop('customOnChangeHandler')).toBeDefined()
                    expect(selectElement.prop('currentLocale')).toBe(defaultProps.currentLocale)
                    expect(selectElement.prop('placeholderId')).toBe('event-keywords-search')
                })
            })
            describe('SelectedKeywords', () => {
                test('correct props', () => {
                    const wrapper = getWrapper()
                    const selectedElement = wrapper.find(SelectedKeywords)
                    expect(selectedElement.prop('selectedKeywords')).toBe(defaultProps.editor.values.keywords)
                    expect(selectedElement.prop('onDelete')).toBeDefined()
                    expect(selectedElement.prop('locale')).toBe(defaultProps.currentLocale)
                    expect(selectedElement.prop('intl')).toBe(defaultProps.intl)
                })
            })
            describe('Buttons', () => {
                test('CopyToClipBoard', () => {
                    const wrapper = getWrapper()
                    const copyElement = wrapper.find(CopyToClipboard)
                    expect(copyElement.prop('tabIndex')).toBe('-1')
                    expect(copyElement.prop('aria-hidden')).toBe('true')
                    expect(copyElement.prop('text')).toBeDefined()
                })
                test('button', () => {
                    const wrapper = getWrapper()
                    const buttonElement = wrapper.find('button')
                    expect(buttonElement.prop('id')).toBe('keyword-clipboard')
                    expect(buttonElement.prop('type')).toBe('button')
                    expect(buttonElement.prop('className')).toBe('clipboard-copy-button btn btn-default')
                    expect(buttonElement.prop('aria-label')).toBe(intl.formatMessage({id: 'copy-keyword-to-clipboard'}))
                })
            })
        })

        describe('methods called on mount', () => {

            describe('render functions called', () => {

                let wrapper;
                beforeEach(() => {
                    wrapper = getWrapper()
                })

                afterEach(() => {
                    jest.clearAllMocks()
                })

                test('mapKeywordSetToForm called with correct params', () => {
                    expect(mapKeywordSetToForm).toHaveBeenCalledTimes(2)
                    expect(mapKeywordSetToForm).toHaveBeenNthCalledWith(1, defaultProps.editor.keywordSets, 'turku:topic_content', defaultProps.currentLocale)
                    expect(mapKeywordSetToForm).toHaveBeenNthCalledWith(2, defaultProps.editor.keywordSets, 'turku:topic_type', defaultProps.currentLocale)
                })
            })
        })
    })

    describe('functions used by HelkeywordSelector', () => {

        describe('handleKeywordChange', () => {
            test('called with checked', () => {
                const mockFn = jest.fn();
                const keywords = [{value:'first'},{value:'second'}];
                const checked = {value: 'third'}
                const results = {'keywords': [{value: 'first'}, {value: 'second'}, {value: 'third'}]}
                handleKeywordChange(checked ,keywords, defaultProps.editor.keywordSets, mockFn)
                expect(mockFn).toHaveBeenCalledWith(results)
            })
        })

        describe('handleKeywordDelete', () => {
            test('called with correct value', () => {
                const mockFn = jest.fn();
                const keywords = [{value:'first'},{value:'second'}];
                const deleteItem = keywords[0];
                handleKeywordDelete(deleteItem, keywords, mockFn);
                expect(mockFn).toHaveBeenCalledWith( {'keywords': [{'value': 'second'}]});
            })
        })

        describe('getKeywordIds', () => {
            test('returns ID correctly', () => {
                const keywordValue = [            {
                    value: 'https://api.hel.fi/linkedevents-test/v1/keyword/yso:p360/',
                    label: 'kulttuuritapahtumat',
                }]

                const getId = getKeywordIds(keywordValue)
                expect(getId).toEqual('yso:p360')
            })
        })

        describe('filterValidations', () => {
            const validationRules  = {
                atLeastOneMainCategory: 'atLeastOneMainCategory',
                atleastOneSecondaryCategory: 'atleastOneSecondaryCategory',

            }
            const validationErrors = {}
            const validationMain = {keywords: [validationRules.atLeastOneMainCategory]}
            const validationSecondary = {keywords: [validationRules.atLeastOneMainCategory, validationRules.atleastOneSecondaryCategory]}
            test('no errors = equals undefined', () => {
                const call = filterValidations(validationErrors, validationRules.atLeastOneMainCategory)
                expect(call).toEqual(undefined)
            })
            test('error main category = equals to atLeastOneMainCategory', () => {
                const call = filterValidations(validationMain, validationRules.atLeastOneMainCategory)
                expect(call).toEqual([validationRules.atLeastOneMainCategory])
            })
            test('error in both category = equals to atLeastOneMainCategory & atLeastoneSecondaryCategory', () => {
                const callFirst = filterValidations(validationSecondary, validationRules.atLeastOneMainCategory)
                const callSecond = filterValidations(validationSecondary, validationRules.atleastOneSecondaryCategory)

                expect(callFirst).toEqual([validationRules.atLeastOneMainCategory])
                expect(callSecond).toEqual([validationRules.atleastOneSecondaryCategory])
            })
        })
    })
})

