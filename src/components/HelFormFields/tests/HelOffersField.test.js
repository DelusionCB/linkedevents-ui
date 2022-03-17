import React from 'react';
import {shallow} from 'enzyme';
import SelectorRadio from '../Selectors/SelectorRadio';
import {IntlProvider} from 'react-intl';
import NewOffer from '../NewOffer';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import HelOffersField from '../HelOffersField';
import {Button} from 'reactstrap';
import {addOffer, setFreeOffers} from 'src/actions/editor.js';

const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const dispatch = jest.fn()

const defaultProps = {
    defaultValue: undefined,
    languages: ['fi'],
    validationErrors: {},
    disabled: false,
    editor: {},
}
function createOffer(price = 10, languages = defaultProps.languages, additionalProps = {}) {
    // random number between 1000 - 99999
    const rndNum = Math.floor(Math.random() * (99999 - 1000) + 1000);
    const offer = {
        description: {},
        info_url: {},
        price: {},
        is_free: false,
        payment_methods: [],
    };
    languages.forEach((lang) => {
        offer.description[lang] = `${lang} description text ${rndNum}`;
        offer.price[lang] = price.toString();
        offer.info_url[lang] = `https://urlfortestingpurposes.test/${lang}`;
    });
    return {...offer, ...additionalProps};
}
describe('HelOffersField', () => {
    function getWrapper(props) {
        return shallow(<HelOffersField {...defaultProps} {...props} />, {context: {intl, dispatch}});
    }

    describe('render', () => {
        describe('getToggleRadios', () => {
            test('is called', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                const spy = jest.spyOn(instance, 'getToggleRadios');
                wrapper.setProps({});
                expect(spy).toHaveBeenCalledTimes(1);
            });
        });
        describe('SelectorRadio', () => {
            const selectorRadioElements = getWrapper().find(SelectorRadio);
            test('correct amount of SelectorRadio inputs', () => {
                expect(selectorRadioElements).toHaveLength(2);
            });
            test.each([
                {index: 0, value: 'is_free', checked: true},
                {index: 1, value: 'is_not_free', checked: false},
            ])('SelectorRadio at index %# with correct default props',(
                {index, value, checked}
            ) => {
                const currentElement = selectorRadioElements.at(index);
                expect(currentElement.prop('checked')).toBe(checked);
                expect(currentElement.prop('handleCheck')).toBeDefined();
                expect(currentElement.prop('value')).toBe(value);
                const messageID = value.replace(/_/gi,'-');
                expect(currentElement.prop('messageID')).toEqual(messageID);
                expect(currentElement.prop('disabled')).toEqual(defaultProps.disabled);
            })

            test('elements are disabled if props.disabled is true', () => {
                const disabledRadioElements = getWrapper({disabled: true}).find(SelectorRadio);
                expect(disabledRadioElements.at(0).prop('disabled')).toBe(true);
                expect(disabledRadioElements.at(1).prop('disabled')).toBe(true);
            })
        })
        describe('Button', () => {
            test('is not rendered when state.isFree', () => {
                const buttonElement = getWrapper().find(Button);
                expect(buttonElement).toHaveLength(0);
            });
            test('is rendered with correct props when !state.isFree', () => {
                const wrapper = getWrapper({defaultValue: [createOffer()]});
                const button = wrapper.find(Button);
                expect(button).toHaveLength(1);
                expect(button.prop('size')).toBe('lg');
                expect(button.prop('variant')).toBe('contained');
                expect(button.prop('disabled')).toBe(false);
                expect(button.prop('block')).toBe(true);
                expect(button.prop('onClick')).toBeDefined();
            });
        });
    });
    describe('lifecycle methods', () => {
        describe('constructor', () => {
            test('state.isFree is true when no props.defaultValue', () => {
                const wrapper = getWrapper();
                expect(wrapper.state('isFree')).toBe(true);
            });
            test('state.isFree is false when props.defaultValue exists', () => {
                const wrapper = getWrapper({defaultValue: [createOffer()]});
                expect(wrapper.state('isFree')).toBe(false);
            });
        });
        describe('componentDidUpdate', () => {
            let wrapper;
            let instance;
            beforeEach(() => {
                wrapper = getWrapper();
                instance = wrapper.instance();
            });
            const offers = [
                createOffer(1),
                createOffer(2),
            ];

            test('defaultValue prop changed from falsy to truthy -> isFree changes to false', () => {
                expect(instance.state.isFree).toBe(true);
                const originalValues = instance.props.defaultValue;
                wrapper.setProps({defaultValue: offers});
                expect(instance.state.isFree).toBe(false);
                expect(originalValues).not.toBe(instance.props.defaultValue);
            });
            test('defaultValue prop changed from truthy to falsy -> isFree change to true ', () => {
                wrapper.setProps({defaultValue: offers});
                expect(instance.state.isFree).toBe(false);
                wrapper.setProps({defaultValue: undefined});
                expect(instance.state.isFree).toBe(true);
            });
        })

    })
    describe('methods', () => {
        describe('togglePricing', () => {
            let wrapper;
            let instance;
            beforeEach(() => {
                wrapper = getWrapper();
                instance = wrapper.instance();
            });
            test('calls addNewOffer when defaultValue is falsy', () => {
                const spy = jest.spyOn(instance, 'addNewOffer');
                dispatch.mockClear();
                instance.togglePricing();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(dispatch).toHaveBeenCalledTimes(1);
                expect(dispatch).toHaveBeenCalledWith(addOffer({is_free: false}));
            });
            test('calls setFreeOffers when defaultValue is truthy', () => {
                wrapper.setProps({defaultValue: [createOffer()]});
                dispatch.mockClear();
                instance.togglePricing();
                expect(dispatch).toHaveBeenCalledTimes(1);
                expect(dispatch).toHaveBeenCalledWith(setFreeOffers());
            });
        });

        describe('addNewOffer', () => {
            test('calls addOffer with correct props', () => {
                const wrapper = getWrapper();
                wrapper.instance().addNewOffer();
                expect(dispatch).toHaveBeenCalledWith(addOffer({is_free: false}));
            });
        });

        describe('generateOffers', () => {
            test('expect NewOffer amount to be same as offers.length', () => {
                const offers = [createOffer(1), createOffer(2)];
                const OffersWrapper = getWrapper({defaultValue: offers});
                const offerDetails = OffersWrapper.instance().generateOffers();
                const offerWrapper = shallow(<div className="offers">{offerDetails}</div>);
                expect(offerWrapper).toHaveLength(1);
                expect(offerWrapper.find(NewOffer)).toHaveLength(offers.length);
            });

            const testOffers = [createOffer(5), createOffer(9)];
            const wrapper = getWrapper({defaultValue: testOffers});
            const generateOffersReturn = wrapper.instance().generateOffers(testOffers);
            const offerWrapper = shallow(<div>{generateOffersReturn}</div>);
            const offerElements = offerWrapper.find(NewOffer);
            test.each([
                {index: 0},
                {index: 1},
            ])('NewOffer at index %# has correct params', ({index}) => {
                const {
                    editor: expectedEditor,
                    defaultValue: expectedValue,
                    validationErrors: expectedErrors,
                    languages: expectedLanguages,
                    disabled: expectedDisabled,
                } = wrapper.instance().props;
                const element = offerElements.at(index);
                expect(element.prop('editor')).toEqual(expectedEditor);
                expect(element.prop('length')).toBe(index + 1);
                expect(element.prop('offerKey')).toBe(index.toString());
                expect(element.prop('defaultValue')).toEqual(expectedValue[index]);
                expect(element.prop('validationErrors')).toEqual(expectedErrors);
                expect(element.prop('languages')).toBe(expectedLanguages);
                expect(element.prop('isFree')).toBe(wrapper.state('isFree'));
                expect(element.prop('disabled')).toBe(expectedDisabled);
            });
        });


    })
})


