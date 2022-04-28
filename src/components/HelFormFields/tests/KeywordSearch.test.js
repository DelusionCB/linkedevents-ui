import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import React from 'react'
import AsyncSelect from 'react-select/async'
import {UnconnectedKeywordSearch} from '../KeywordSearch/KeywordSearch';
import HelKeywordBoxes from '../KeywordSearch/HelKeywordBoxes';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

function createKeyword(label = 'something', props = {}) {
    // random number between 1000 - 99999
    const rndNum = Math.floor(Math.random() * (99999 - 1000) + 1000);
    const keyChar = label.charAt(label.length - 1);
    return {
        id: `yso:${keyChar}${rndNum}`,
        label: label,
        name: {
            en: label + 'ENG',
            fi: label + 'FI',
            sv: label + 'SV',
        },
        ontology_type: 'OntologyConcept',
        value: `server/v1/keyword/yso:${keyChar}${rndNum}`,
        '@id': `server/v1/keyword/yso:${keyChar}${rndNum}`,
        children: [],
        parents: [],
        ...props,
    };
}

const defaultProps = {
    intl,
    setData: jest.fn(),
    deleteValue: () => {},
    name: 'keyword',
    isClearable: true,
    isMultiselect: false,
    disabled: false,
    setDirtyState: () => {},
    resource: 'keyword',
    legend: 'event-keywords',
    validationErrors: [],
    selectedValue: {},
    placeholderId: 'event-keywords-search',
    ariaId: 'aria-id',
    customOnChangeHandler: () => {},
    optionalWrapperAttributes: {},
    currentLocale: 'fi',
    required: true,
    keywordData: [],
}

describe('HelSelect', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedKeywordSearch {...defaultProps} {...props} />);
    }
    describe('methods', () => {
        describe('onChange', () => {
            test('sets value to state.selectedValue if value is truthy and !reFetch', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()

                const testValue = createKeyword('selectedValue');
                testValue.parents = [createKeyword('parent1'), createKeyword('parent2')];
                testValue.children = [createKeyword('one child'), createKeyword('child two')];

                expect(wrapper.state('selectedValue')).toEqual({});
                instance.onChange(testValue, false)
                expect(wrapper.state('selectedValue')).toBe(testValue);
            })
            test('sets empty object to state.selectedValue if value is null', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()

                expect(wrapper.state('selectedValue')).toEqual({});
                instance.onChange(null, false)
                expect(wrapper.state('selectedValue')).toEqual({});
            })
            test('expect getKeywordOptions to be called when reFetch is true', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()

                const spy = jest.spyOn(instance,'getKeywordOptions');
                const testValue = createKeyword('selectedValue');
                testValue.parents = [createKeyword('parent1'), createKeyword('parent2')];
                testValue.children = [createKeyword('one child'), createKeyword('child two')];

                instance.onChange(testValue, true)
                expect(spy).toHaveBeenCalledTimes(1)
            })
        })

        describe('formatKeyword', () => {
            test('returns keyword in correct form', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()

                const testValue = createKeyword('selectedValue');
                const formatted = instance.formatKeyword(testValue, defaultProps.currentLocale, intl)
                expect(formatted).toEqual({
                    id: testValue.id,
                    label: testValue.name.fi,
                    name: testValue.name,
                    ontology_type: testValue.ontology_type,
                    value: testValue['@id'],
                })
            })
        })
        describe('getOptions', () => {
            test('calls getKeywordOptions when input length is more than 2', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const spy = jest.spyOn(instance,'getKeywordOptions')

                instance.getOptions('tes')
                expect(spy).toHaveBeenCalledTimes(1)
            })
            test('does not call getKeywordOptions when input length is not more than 2', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const spy = jest.spyOn(instance,'getKeywordOptions')

                instance.getOptions('te')
                expect(spy).toHaveBeenCalledTimes(0)
            })
        })
        describe('getDefaultValue', () => {
            test('returns null if selectedValue is falsy', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()

                wrapper.setState({selectedValue: undefined})
                const returnValue = instance.getDefaultValue()
                expect(wrapper.state('selectedValue')).toEqual(undefined)
                expect(returnValue).toBe(null)
            })
            test('returns null if selectedValue object is empty', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()

                wrapper.setState({selectedValue: {}})
                const returnValue = instance.getDefaultValue()
                expect(wrapper.state('selectedValue')).toEqual({})
                expect(returnValue).toBe(null)
            })
            test('returns label & value if selectedValue exists', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const testValue = createKeyword('selectedValue');

                expect(wrapper.state('selectedValue')).toEqual({})
                wrapper.setState({selectedValue: testValue})
                expect(wrapper.state('selectedValue')).toEqual(testValue)
                const returnValue = instance.getDefaultValue();
                expect(returnValue).toEqual({
                    label: testValue.name.fi,
                    value: testValue.value,
                })
            })
        })
        describe('formatOption', () => {
            test('returns items id', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()

                const testValue = createKeyword('selectedValue');
                const expectedValue = <React.Fragment>{testValue.label}</React.Fragment>
                const formatted = instance.formatOption(testValue)
                expect(formatted).toEqual(expectedValue)
            })
        })
    })
    describe('renders', () => {
        describe('components', () => {
            describe('AsyncSelect', () => {
                test('find AsyncSelect', () => {
                    const wrapper = getWrapper()
                    const Select = wrapper.find(AsyncSelect)
                    expect(Select).toHaveLength(1)
                })
            })

            describe('HelKeywordBoxes', () => {
                test('find HelKeywordBoxes', () => {
                    const wrapper = getWrapper()
                    const Boxes = wrapper.find(HelKeywordBoxes)
                    expect(Boxes).toHaveLength(1)
                })
            })
        })
    })
})
