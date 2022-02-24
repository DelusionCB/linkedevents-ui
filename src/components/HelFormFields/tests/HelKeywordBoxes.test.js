import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import HelKeywordBoxes from '../KeywordSearch/HelKeywordBoxes';
import HelCheckbox from '../HelCheckbox';

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
        children: [],
        parents: [],
        ...props,
    };
}
const defaultProps = {
    onChange: jest.fn(),
    deleteValue: jest.fn(),
    onValueChange: jest.fn(),
    value: {},
    currentLocale: 'fi',
    keywords: [],
};
describe('HelKeywordBoxes', () => {
    function getWrapper(props) {
        return shallow(<HelKeywordBoxes {...defaultProps} {...props} />, {context: {intl}});
    }
    describe('methods', () => {
        describe('onChange', () => {
            test('calls props.onChange with val', () => {
                defaultProps.onChange.mockClear();
                const wrapper = getWrapper();
                const expectedValue = 'value';

                wrapper.instance().onChange(expectedValue);
                expect(defaultProps.onChange).toHaveBeenCalledWith(expectedValue);
            });
        });
        describe('valueChanged', () => {
            let wrapper;
            const expectedValue = 'A value that has changed.';
            beforeEach(() => {
                wrapper = getWrapper();
            });
            afterEach(() => {
                defaultProps.onValueChange.mockClear();
                defaultProps.deleteValue.mockClear();
            })
            // valueChanged makes the correct calls depending on checked
            test.each([
                {event: {target: {checked: true}}, calledFunction: defaultProps.onValueChange},
                {event: {target: {checked: false}}, calledFunction: defaultProps.deleteValue},
            ])('calls the correct props.function according to boolean checked %#', ({event, calledFunction}) => {
                // pass each event along with expectedValue
                wrapper.instance().valueChanged(event, expectedValue);
                // expect calledFunction(correct props.function) to have been called
                expect(calledFunction).toHaveBeenCalledWith(expectedValue);
            });
        });
        describe('checkValue', () => {
            const testValue = createKeyword('exists');
            // test that checkValue returns correct boolean
            test.each([
                {val: testValue, keywords: [testValue, createKeyword('one'), createKeyword('two')], bool: true},
                {val: createKeyword(), keywords: [createKeyword('three'), createKeyword('four')], bool: false},
            ])('returns boolean %# depending on if val is in keywords',({val, keywords, bool}) => {
                const wrapper = getWrapper({keywords: keywords});

                expect(wrapper.instance().checkValue(val)).toBe(bool);
            });
        });
        describe('getParentElements', () => {
            describe('when value with 2 parents and children', () => {
                // setup test data, wrapper and instance
                const testValue = createKeyword('selectedValue');
                const parentValues = [createKeyword('parent1'), createKeyword('parent2')];
                testValue.parents = parentValues;
                const childValues = [createKeyword('one child'), createKeyword('child two')];
                testValue.children = childValues;
                const wrapper = getWrapper({value: testValue});
                const instance = wrapper.instance();

                // setup spies
                const getButtonSpy = jest.spyOn(instance, 'getButtonElement');
                const getCheckboxSpy = jest.spyOn(instance, 'getCheckboxElement');
                const getOptionSpy = jest.spyOn(instance, 'getOptionElement');

                // mount return values form getParentElements
                const keywordListing = instance.getParentElements();
                const keywordWrapper = shallow(keywordListing);

                // test parent elements
                const parentWrapper = keywordWrapper.find('ul.keyword-listing');
                test('parent elements are rendered correctly', () => {
                    expect(parentWrapper).toHaveLength(1);
                    expect(parentWrapper.children()).toHaveLength(2);
                    expect(parentWrapper.find('li.keyword-parent')).toHaveLength(2);

                    const parentElements = parentWrapper.find('div.parent-wrapper');
                    // individual parent elements contain HelCheckbox and button
                    parentElements.forEach((element, index) => {
                        expect(element.find(HelCheckbox)).toHaveLength(1);
                        const toggleButton = element.find('button');
                        expect(toggleButton.prop('aria-label')).toBe(
                            intl.formatMessage(
                                {id: 'editor-show-broader-concepts'},
                                {value: parentValues[index].name[defaultProps.currentLocale]}
                            )
                        );
                        expect(toggleButton.find('span').prop('className'))
                            .toBe('glyphicon glyphicon-arrow-up');
                    });
                });

                // test selected value / option
                const selectedValueWrapper = parentWrapper.find('#last-parent');
                test('last parent has ul containing value', () => {
                    expect(selectedValueWrapper.children()).toHaveLength(1);
                    expect(selectedValueWrapper.find('li.keyword-option')).toHaveLength(1);
                });

                const selectedValue = selectedValueWrapper.find('li.keyword-option');
                test('value is rendered with correct elements', () => {
                    // this expects 3 as it also counts the child elements HelCheckboxes
                    expect(selectedValue.find(HelCheckbox)).toHaveLength(3);
                    expect(selectedValue.children()).toHaveLength(2);
                    expect(selectedValue.find('.keyword-listing-nested')).toHaveLength(1);
                });

                // test selected value/option children
                const childWrapper = selectedValue.find('ul.keyword-listing-nested');

                test('child elements are rendered correctly', () => {
                    expect(childWrapper.children()).toHaveLength(2);
                    expect(childWrapper.find('li.keyword-child')).toHaveLength(2);
                    const childElements = childWrapper.find('li.keyword-child');
                    childElements.forEach((element) => {
                        expect(element.find(HelCheckbox)).toHaveLength(1);
                    });
                });

                // test various button calls

                test('getButtonElement method has been called 4 times', () => {
                    expect(getButtonSpy).toHaveBeenCalledTimes(4);
                });
                // each getButtonElement call happened with the correct args
                test.each([
                    {index: 1, value: parentValues[0], parent: true}, // first parent
                    {index: 2, value: parentValues[1], parent: true}, // second parent
                    {index: 3, value: childValues[0], parent: false}, // first child
                    {index: 4, value: childValues[1], parent: false}, // second child
                ])('getButtonElement call number %# was correct',({index, value, parent}) => {
                    expect(getButtonSpy).toHaveBeenNthCalledWith(index, value, parent);
                })

                test('getCheckboxElement method has been called 5 times with correct args', () => {
                    // all elements have a checkbox so each parent,value and child should have called this.
                    const allValues = [...testValue.parents, testValue, ...testValue.children];
                    expect(getCheckboxSpy).toHaveBeenCalledTimes(5);
                    allValues.forEach((value, index) => {
                        expect(getCheckboxSpy).toHaveBeenNthCalledWith(index + 1, value);
                    });
                });

                test('getOptionElement method has been called correctly', () => {
                    expect(getOptionSpy).toHaveBeenCalledTimes(1);
                });
            });
            describe('when value with no parents', () => {
                const testValue = createKeyword('value');
                const childValues = [createKeyword('child1'), createKeyword('child2')];
                testValue.children = childValues;
                testValue.parents = [];
                const wrapper = getWrapper({value: testValue});
                const instance = wrapper.instance();

                // setup spies
                const getButtonSpy = jest.spyOn(instance, 'getButtonElement');
                const getCheckboxSpy = jest.spyOn(instance, 'getCheckboxElement');
                const getOptionSpy = jest.spyOn(instance, 'getOptionElement');

                // test that first element is actually option
                const parentElements = instance.getParentElements();
                const parentWrapper = shallow(parentElements);
                test('returns listing starting with value', () => {
                    expect(parentWrapper.children()).toHaveLength(1);
                    expect(parentWrapper.find('li.keyword-option')).toHaveLength(1);
                });

                // value tests
                const valueWrapper = parentWrapper.find('li.keyword-option');
                test('value is rendered correctly', () => {
                    expect(valueWrapper.children()).toHaveLength(2);
                    expect(valueWrapper.find('ul.keyword-listing-nested')).toHaveLength(1);
                });

                // test children of value
                const childWrapper = valueWrapper.find('ul.keyword-listing-nested');
                test('children are rendered correctly', () => {
                    expect(childWrapper.children()).toHaveLength(2);

                    const childElements = childWrapper.find('li.keyword-child');
                    childElements.forEach((element, index) => {
                        expect(element.children()).toHaveLength(2);
                        const toggleButton = element.find('button');
                        expect(toggleButton.prop('aria-label')).toBe(
                            intl.formatMessage(
                                {id: 'editor-show-narrower-concepts'},
                                {value: childValues[index].name[defaultProps.currentLocale]}
                            )
                        );
                        expect(toggleButton.find('span').prop('className'))
                            .toBe('glyphicon glyphicon-arrow-down');
                    });
                });

                test('getButtonElement method has been called 2 times with correct args', () => {
                    // only parent and child elements call this so only 2 calls
                    expect(getButtonSpy).toHaveBeenCalledTimes(2);
                    childValues.forEach((element, index) => {
                        expect(getButtonSpy).toHaveBeenNthCalledWith(index + 1, element, false);
                    });
                });
                test('getCheckboxElement has been called 3 times with correct args', () => {
                    const allValues = [testValue, ...testValue.children];
                    expect(getCheckboxSpy).toHaveBeenCalledTimes(allValues.length);
                    allValues.forEach((element, index) => {
                        expect(getCheckboxSpy).toHaveBeenNthCalledWith(index + 1, element);
                    });
                });
                test('getOptionElement has been called once', () => {
                    expect(getOptionSpy).toHaveBeenCalledTimes(1);
                });
            });
        });
        describe('getOptionElement', () => {
            let testValue;
            let getCheckboxSpy;
            let getButtonSpy;
            beforeEach(() => {
                testValue = createKeyword('value');
                getCheckboxSpy = null;
                getButtonSpy = null;
            });
            test('returns li element with empty ul when no children', () => {
                const wrapper = getWrapper({value: testValue});
                const instance = wrapper.instance();
                getCheckboxSpy = jest.spyOn(instance, 'getCheckboxElement');
                getButtonSpy = jest.spyOn(instance, 'getButtonElement');
                const optionElementReturn = instance.getOptionElement();
                const optionWrapper = shallow(optionElementReturn);

                expect(optionWrapper.find('li.keyword-option')).toHaveLength(1);
                const optionLiElement = optionWrapper.find('li.keyword-option');
                expect(optionLiElement.children()).toHaveLength(2);
                expect(optionLiElement.find('ul').children()).toHaveLength(0);

                // test that the correct functions have/haven't been called
                expect(getCheckboxSpy).toHaveBeenNthCalledWith(1, testValue);
                expect(getButtonSpy).not.toHaveBeenCalled();
            });
            test('returns li element with ul filled with child values', () => {
                const childValues = [createKeyword('child1'), createKeyword('child2')];
                testValue.children = childValues;
                const wrapper = getWrapper({value: testValue});
                const instance = wrapper.instance();
                const optionElementReturn = instance.getOptionElement();
                const optionWrapper = shallow(optionElementReturn);
                const optionLiElement = optionWrapper.find('li.keyword-option');
                // option li element
                expect(optionLiElement.children()).toHaveLength(2);
                expect(optionLiElement.find('ul').children()).toHaveLength(2);

                // child values of option
                const childElements = optionLiElement.find('ul').find('li');
                childElements.forEach((element, index) => {
                    expect(element.children()).toHaveLength(2);
                    const toggleButton = element.find('button');
                    expect(toggleButton.prop('aria-label')).toBe(
                        intl.formatMessage(
                            {id: 'editor-show-narrower-concepts'},
                            {value: childValues[index].name[defaultProps.currentLocale]}
                        )
                    );
                    expect(toggleButton.find('span').prop('className'))
                        .toBe('glyphicon glyphicon-arrow-down');
                });
            });
        });
        describe('getCheckboxElement', () => {
            test('returns a HelCheckbox with attrs from item', () => {
                const item = createKeyword();
                const instance = getWrapper().instance();
                const spy = jest.spyOn(instance, 'valueChanged');
                const returnCheckbox = instance.getCheckboxElement(item);
                const wrapper = shallow(<div>{returnCheckbox}</div>);
                const checkboxElement = wrapper.find(HelCheckbox);

                expect(checkboxElement.prop('disabled')).toBe(item.ontology_type === 'OntologyHierarchy');
                expect(checkboxElement.prop('label')).toBe(item.name[defaultProps.currentLocale]);
                expect(checkboxElement.prop('fieldID')).toBe(item.label);
                expect(checkboxElement.prop('defaultChecked')).toBe(false);
                expect(checkboxElement.prop('onChangeValue')).toBeDefined();
                // simulate onclick to test that onClick gets called
                checkboxElement.props().onChangeValue({target:{checked: true}});
                expect(spy).toHaveBeenCalled();
            });
        });
        describe('getButtonElement', () => {
            const instance = getWrapper().instance();
            test.each([
                {item: createKeyword(), parent: true},
                {item: createKeyword('name',{name:undefined}),parent: false},
            ])('returns button with span when boolean parent %# ',({item, parent}) => {
                const buttonReturn = instance.getButtonElement(item, parent);
                const tempWrapper = shallow(buttonReturn);
                const spy = jest.spyOn(instance, 'onChange');
                const buttonElement = tempWrapper.find('button');

                expect(buttonElement.prop('aria-label')).toBe(
                    intl.formatMessage(
                        {id: `editor-show-${parent ? 'broader' : 'narrower'}-concepts`},
                        {value: item.name ? item.name[defaultProps.currentLocale] : item.label}
                    ));
                // simulate onclick to test that onClick gets called
                buttonElement.simulate('click');
                expect(spy).toHaveBeenCalled();
                expect(buttonElement.find('span').prop('className')).toBe(
                    `glyphicon glyphicon-arrow-${parent ? 'up' : 'down'}`
                );
            });
        });
    });
    describe('render', () => {
        test('empty div when no value', () => {
            const wrapper = getWrapper();

            expect(wrapper.children()).toHaveLength(0);
            expect(wrapper.find('div.keywordBoxes')).toHaveLength(1);
            expect(wrapper.find('div.keywordBoxes').children()).toHaveLength(0);
        });
        test('div containing content when value exists', () => {
            const testValue = createKeyword();
            testValue.children = [createKeyword('one'), createKeyword('two')];
            const wrapper = getWrapper({value: testValue});

            expect(wrapper.find('div.keywordBoxes')).toHaveLength(1);
            expect(wrapper.find('div.keywordBoxes').children()).not.toHaveLength(0);
        })
    })
});
