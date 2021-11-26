import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import PageNotFound from './index';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {Link} from 'react-router-dom'
import {Helmet} from 'react-helmet';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();


describe('PageNotFound', () => {
    function getWrapper(props) {
        return shallow(<PageNotFound {...props}/>, {context: {intl}});
    }


    describe('elements', () => {
        describe('span', () => {
            test('find element with correct props', () => {
                const wrapper = getWrapper();
                const element = wrapper.find('span')
                expect(element).toHaveLength(1);
                expect(element.prop('aria-hidden')).toBe(true);
                expect(element.prop('className')).toBe('glyphicon glyphicon-search');
            });
        })
        describe('FormattedMessage', () => {
            test('correct amount of formattedMessages', () => {
                const wrapper = getWrapper();
                const message = wrapper.find(FormattedMessage)
                expect(message).toHaveLength(3)
            })
        })
        describe('Link', () => {
            test('correct prop "to"', () => {
                const wrapper = getWrapper();
                const linkElement = wrapper.find(Link)
                expect(linkElement).toHaveLength(1)
                expect(linkElement.prop('to')).toBe('/')
            })
        })
        describe('Helmet', () => {
            test('correct prop "title"', () => {
                const wrapper = getWrapper().find(Helmet);
                const pageTitle = wrapper.prop('title');
                expect(wrapper).toBeDefined();
                expect(pageTitle).toBe('Linkedevents - 404 Sivua ei löydy');
            })
        })
    })
})
