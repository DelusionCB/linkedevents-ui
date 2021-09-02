import React from 'react';
import {shallow} from 'enzyme';
import LanguageSelector from './LanguageSelector';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const defaultProps = {
    languages: [
        {
            label: 'fi',
            value: 'fi',
        },
        {
            label: 'en',
            value: 'en',
        },
        {
            label: 'sv',
            value: 'sv',
        },
    ],
    userLocale: {
        locale: 'fi',
    },
    changeLanguage: jest.fn(),
};

describe('languageSelector', () => {
    function getWrapper(props) {
        return shallow(<LanguageSelector {...defaultProps} {...props} />, {context: {intl}});
    }
    describe('Testing locales shown', () => {
        test('is default locale', () => {
            const element = getWrapper().find('div');
            expect(element).toHaveLength(2);
            const sec = element.at(1).find('a');
            expect(sec.text()).toBe('FI');
        });

        test('activeLocale when en', () => {
            const element = getWrapper({userLocale: {locale: 'en'}})
                .find('div')
                .at(1)
                .find('a');
            expect(element.text()).toBe('EN');
        });

        test('activeLocale when sv', () => {
            const element = getWrapper({userLocale: {locale: 'sv'}})
                .find('div')
                .at(1)
                .find('a');
            expect(element.text()).toBe('SV');
        });
    });

    test('language change links are rendered with correct props', () => {
        const wrapper = getWrapper()
        const instance = wrapper.instance()
        const links = wrapper.find('#language-list').find('a')
        expect(links).toHaveLength(3)
        links.forEach((link, index) => {
            const language = defaultProps.languages[index].value
            expect(link.prop('role')).toBe('menuitem')
            expect(link.prop('lang')).toBe(language)
            expect(link.prop('aria-label')).toBe(instance.getButtonAriaText(language))
            expect(link.prop('href')).toBe('#')
            expect(link.prop('children')).toBe(defaultProps.languages[index].label)
            if(instance.isActiveLanguage(defaultProps.languages[index])) {
                expect(link.prop('aria-current')).toBe('true')
            }
            else {
                expect(link.prop('aria-current')).toBe(undefined)
            }
        });
    })

    describe('Function tests', () => {
        test('isOpen default state', () => {
            const element = getWrapper();
            expect(element.state('isOpen')).toBe(false);
        });
        test('<li> element gets correct props', () => {
            const element = getWrapper().find('li');
            expect(element).toHaveLength(3);
            const first = element.at(1);
            expect(first.prop('role')).toBe('presentation');
            expect(first.prop('onClick')).toBeDefined();
            expect(first.prop('className')).toBe('language-item');
        });
        test('click calls changeLanguage', () => {
            const wrapper = getWrapper();
            const spy = jest.spyOn(wrapper.instance().props,'changeLanguage');
            const liElement = wrapper.find('li').at(0);
            
            liElement.simulate('click', {preventDefault: () => {}});
            expect(spy).toHaveBeenCalled();
        });

        describe('getButtonAriaText', () => {
            const instance = getWrapper().instance()
            test('returns correct string when given language is fi', () => {
                expect(instance.getButtonAriaText('fi')).toBe('Valitse kieleksi Suomi')
            })

            test('returns correct string when given language is en', () => {
                expect(instance.getButtonAriaText('en')).toBe('Set language to English')
            })

            test('returns correct string when given language is sv', () => {
                expect(instance.getButtonAriaText('sv')).toBe('Byt språk till Svenska')
            })

            test('returns correct string when given language is not fi, sv or en', () => {
                expect(instance.getButtonAriaText('abc')).toBe('Valitse kieleksi Suomi')
            })
        })
    });
});
