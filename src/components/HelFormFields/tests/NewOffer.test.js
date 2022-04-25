import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {UnconnectedNewOffer} from '../NewOffer';
import {mockPaymentMethods} from '../../../../__mocks__/mockData';
import {MultiLanguageField} from '../index';
import CONSTANTS from '../../../constants'
import {setOfferData, deleteOffer, setMethods} from '../../../actions/editor';
import {embedValuesToIDs} from '../../../utils/formDataMapping';

const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const dispatch = jest.fn()
const {VALIDATION_RULES} = CONSTANTS

const defaultProps = {
    languages: ['fi'],
    editor: {
        paymentMethods: mockPaymentMethods,
    },

    defaultValue: {
        is_free: false,
        description: {
            fi: '',
        },
        info_url: {
            fi: '',
        },
        price: {
            fi: '',
        },
        payment_methods: [
            {'@id': mockPaymentMethods[1]['@id']},
        ],
    },

    disabled: false,
    isFree: false,
    length: 1,
    offerKey: '0',
    setInitialFocus: true,
    validationErrors: {
        offers: [
            {
                description: {},
                price: {},
                info_url: {},
            },
        ],
    },
    intl,
}

describe('NewOffer', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedNewOffer {...defaultProps} {...props} />, {context: {dispatch}});
    }

    describe('components', () => {
        describe('div', () => {
            test('correct key', () => {
                const wrapper = getWrapper()
                const divElement = wrapper.find('div').at(0)
                expect(divElement.key()).toBe(defaultProps.offerKey)
                expect(divElement.prop('className')).toBe('new-offer row')
            })
        })
        describe('formatttedMessages', () => {
            test('correct amount', () => {
                const wrapper = getWrapper()
                const formattedElement = wrapper.find(FormattedMessage)
                expect(formattedElement).toHaveLength(2)
            })
        })
        describe('multilanguageFields', () => {
            const wrapper = getWrapper()
            const priceFields = wrapper.find(MultiLanguageField)
            test('amount of multilanguageFields', () => {
                expect(priceFields).toHaveLength(3)
            })
            test('default props for multilanguageFields', () => {

                const ids = ['event-price',
                    'event-price-info',
                    'event-purchase-link']
                const value = [defaultProps.defaultValue.price,
                    defaultProps.defaultValue.description,
                    defaultProps.defaultValue.info_url]
                const types = ['number', 'text', 'url']
                const minValue = [0, undefined, undefined]
                const nameRefs = ['price', undefined, undefined]
                const requiredFields = [true, undefined, undefined]
                const multilines = [undefined, true, undefined]
                const classNames = ['price-field', undefined, undefined]
                const validationErrors = [defaultProps.validationErrors.offers[0].price,
                    defaultProps.validationErrors.offers[0].description,
                    defaultProps.validationErrors.offers[0].info_url]
                const validations = [undefined, undefined, [VALIDATION_RULES.IS_URL]]
                const placeHolders = ['Esim. 4,99', 'Esim. Aikuiset', 'https://...']
                const intialFocus = [defaultProps.setInitialFocus, undefined, undefined]
                priceFields.forEach((element, index) => {
                    expect(element.prop('id')).toBe(ids[index] + defaultProps.offerKey)
                    expect(element.prop('type')).toBe(types[index])
                    expect(element.prop('min')).toBe(minValue[index])
                    expect(element.prop('defaultValue')).toBe(value[index])
                    expect(element.prop('disabled')).toBe(defaultProps.disabled || defaultProps.isFree)
                    expect(element.prop('nameRef')).toBe(nameRefs[index])
                    expect(element.prop('label')).toBe(ids[index])
                    expect(element.prop('languages')).toBe(defaultProps.languages)
                    expect(element.prop('onBlur')).toBeDefined()
                    expect(element.prop('validationErrors')).toBe(validationErrors[index])
                    expect(element.prop('index')).toBe(defaultProps.offerKey)
                    expect(element.prop('setInitialFocus')).toBe(intialFocus[index])
                    expect(element.prop('required')).toBe(requiredFields[index])
                    expect(element.prop('multiLine')).toBe(multilines[index])
                    expect(element.prop('placeholder')).toBe(placeHolders[index])
                    expect(element.prop('className')).toBe(classNames[index])
                    expect(element.prop('validations')).toEqual(validations[index])
                })
            })
        })
        describe('button', () => {
            test('correct props', () => {
                const wrapper = getWrapper()
                const buttonElement = wrapper.find('button')
                expect(buttonElement.prop('aria-label')).toBe('Poista Hintatiedot')
                expect(buttonElement.prop('className')).toBe('new-offer--delete col-auto')
                expect(buttonElement.prop('onClick')).toBeDefined()

            })
        })
    })

    describe('methods', () => {
        describe('componentDidUpdate', () => {
            test('onBlur is called', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const spy = jest.spyOn(instance, 'onBlur')
                const prevProps = {...instance.props, isFree: true}
                const prevState = {...instance.state}
                instance.componentDidUpdate(prevProps, prevState)
                expect(spy).toHaveBeenCalled()
                expect(spy).toHaveBeenCalledTimes(1)
            })
        })
        describe('onBlur', () => {
            beforeEach(() => {
                dispatch.mockClear()
            });
            test('setOfferData called with correct params', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const obj = {0: {is_free: false}}
                instance.onBlur()
                expect(dispatch.mock.calls.length).toBe(1);
                expect(dispatch.mock.calls[0][0]).toEqual(setOfferData(obj, defaultProps.offerKey));
            })
        })
        describe('deleteOffer', () => {
            beforeEach(() => {
                dispatch.mockClear()
            });
            test('called with correct offerKey', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                instance.deleteOffer()
                expect(dispatch.mock.calls.length).toBe(1);
                expect(dispatch.mock.calls[0][0]).toEqual(deleteOffer(defaultProps.offerKey));
            })
        })
        describe('buildObject', () => {
            test('returns is_free determined inside as default', () => {
                const instance = getWrapper().instance();
                expect(instance.buildObject()).toEqual({is_free: false})
            })
        })
        describe('isChecked', () => {
            test('return true if value is in defaultValues', () => {
                const instance = getWrapper().instance();
                expect(instance.isChecked(mockPaymentMethods[1]['@id'])).toBeTruthy()
            })
            test('return false if value is not in defaultValues', () => {
                const instance = getWrapper().instance();
                expect(instance.isChecked(mockPaymentMethods[2]['@id'])).toBeFalsy()
            })
        })
        describe('handlePaymentMethodChange', () => {
            beforeEach(() => {
                dispatch.mockClear()
            });
            test('new value with existing value in defaultProps.defaultValue', () => {
                const instance = getWrapper().instance();
                const checkedValue = mockPaymentMethods[2]['@id']
                const expectedValue = embedValuesToIDs(mockPaymentMethods[2]['@id'])
                instance.handlePaymentMethodChange({target: {value: checkedValue, checked: true}})
                expect(dispatch.mock.calls.length).toBe(1);
                expect(dispatch.mock.calls[0][0]).toEqual(setMethods({payment_methods: [...defaultProps.defaultValue.payment_methods, expectedValue]}, defaultProps.offerKey));
            })
        })
        
        describe('getCheckboxes', () => {
            test('correct inputs with props based on paymentMethods in editor', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const inputElements = wrapper.find('input')
                inputElements.forEach((element, index) => {
                    expect(element.prop('className')).toBe('custom-control-input')
                    expect(element.prop('type')).toBe('checkbox')
                    expect(element.prop('id')).toBe(`${mockPaymentMethods[index].name.fi} ${defaultProps.offerKey}`)
                    expect(element.prop('checked')).toBe(instance.isChecked(mockPaymentMethods[index]['@id']))
                    expect(element.prop('aria-checked')).toBe(instance.isChecked(mockPaymentMethods[index]['@id']))
                    expect(element.prop('value')).toBe(mockPaymentMethods[index]['@id'])
                    expect(element.prop('onChange')).toBeDefined()
                })
            })
        })
    })
})
