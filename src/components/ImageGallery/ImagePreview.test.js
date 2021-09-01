import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';

import {UnconnectedImagePreview as ImagePreview} from './ImagePreview';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    intl,
    image: undefined,
    locale: 'fi',
    validationErrors: undefined,
}

describe('ImagePreview', () => {
    function getWrapper(props) {
        return shallow(<ImagePreview {...defaultProps} {...props}/>, {context: {intl}});
    }

    describe('renders', () => {
        describe('wrapping div with correct props', () => {
            test('when prop image is undefined', () => {
                const div = getWrapper()
                expect(div).toHaveLength(1)
                expect(div.prop('className')).toBe('image-picker--preview')
                expect(div.prop('style')).toBe(undefined)
            })

            test('when prop image is undefined and there are validation errors', () => {
                const div = getWrapper({validationErrors: ['requiredImage']})
                expect(div).toHaveLength(1)
                expect(div.prop('className')).toBe('image-picker--preview validationError')
                expect(div.prop('style')).toBe(undefined)
            })

            test('when prop image is defined', () => {
                const image = {url: 'https://google.fi', name: {fi: 'Testinimi'}}
                const div = getWrapper({image})
                expect(div).toHaveLength(1)
                expect(div.prop('className')).toBe('image-picker--preview')
                expect(div.prop('style')).toStrictEqual({'backgroundImage': `url(${image.url})`})
            })
        })

        describe('span with correct props', () => {
            test('when image is undefined', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const span = wrapper.find('span')
                expect(span).toHaveLength(1)
                expect(span.prop('role')).toBe('status')
                expect(span.prop('aria-live')).toBe('polite')
                expect(span.prop('className')).toBe(undefined)
                expect(span.prop('children')).toBe(instance.state.currentText)
            })

            test('when image is defined', () => {
                const image = {url: 'https://google.fi', name: {fi: 'Testinimi'}}
                const wrapper = getWrapper({image})
                const instance = wrapper.instance()
                const span = wrapper.find('span')
                expect(span).toHaveLength(1)
                expect(span.prop('role')).toBe('status')
                expect(span.prop('aria-live')).toBe('polite')
                expect(span.prop('className')).toBe('sr-only')
                expect(span.prop('children')).toBe(instance.state.currentText)
            })
        })
    })

    describe('functions', () => {
        const imageA = {url: 'https://turku.fi', name: {fi: 'Nimi A'}}
        const imageB = {url: 'https://google.fi', name: {fi: 'Nimi B'}}

        describe('getDerivedStateFromProps', () => {
            test('returns correct obj when prop and state image are different', () => {
                const instance = getWrapper().instance()
                const props = {image: imageA}
                const state = {image: imageB}
                const result = instance.constructor.getDerivedStateFromProps(props, state)
                expect(result).toStrictEqual({currentText: ''})
            })

            test('returns null when prop and state image are the same image', () => {
                const instance = getWrapper().instance()
                const props = {image: imageA}
                const state = {image: imageA}
                const result = instance.constructor.getDerivedStateFromProps(props, state)
                expect(result).toStrictEqual(null)
            })

            test('returns null when prop and state image are both undefined', () => {
                const instance = getWrapper().instance()
                const props = {image: undefined}
                const state = {image: undefined}
                const result = instance.constructor.getDerivedStateFromProps(props, state)
                expect(result).toStrictEqual(null)
            })
        })

        describe('componentDidUpdate', () => {
            test('sets correct state when previous and current image prop are different', () => {
                const instance = getWrapper({image: imageA}).instance()
                const spy = jest.spyOn(instance, 'setState')
                const prevProps = {...defaultProps, image: imageB}
                instance.componentDidUpdate(prevProps)
                expect(spy).toHaveBeenCalledTimes(1)
                expect(spy).toHaveBeenCalledWith({
                    image: imageA,
                    currentText: instance.getCurrentText(),
                })
            })

            test('doesnt call setState when previous and current image prop are equal', () => {
                const instance = getWrapper({image: imageA}).instance()
                const spy = jest.spyOn(instance, 'setState')
                const prevProps = {...defaultProps, image: imageA}
                instance.componentDidUpdate(prevProps)
                expect(spy).toHaveBeenCalledTimes(0)
            })

            test('sets correct state when previous and current locale prop are different', () => {
                const instance = getWrapper({locale: 'fi'}).instance()
                const spy = jest.spyOn(instance, 'setState')
                const prevProps = {locale: 'en'}
                instance.componentDidUpdate(prevProps)
                expect(spy).toHaveBeenCalledTimes(1)
                expect(spy).toHaveBeenCalledWith({
                    currentText: instance.getCurrentText(),
                })
            })
        })

        describe('getCurrentText', () => {
            test('returns correct then when prop image is undefined', () =>  {
                const instance = getWrapper({image: undefined}).instance()
                const result = instance.getCurrentText()
                expect(result).toBe(intl.formatMessage({id: 'no-image'}))
            })

            test('returns correct then when prop image is defined', () =>  {
                const instance = getWrapper({image: imageA}).instance()
                const result = instance.getCurrentText()
                expect(result).toBe(intl.formatMessage({id: 'chosen-event-image'}, {name: imageA.name.fi}))
            })
        })
    })
})
