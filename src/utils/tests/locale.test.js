import * as helpers from '../locale'
import constants from '../../constants'
import {mockUserEvents} from '../../../__mocks__/mockData';

const {EVENT_TYPE, LOCALE_TYPE} = constants


describe('utils/locale', () => {

    describe('getStringWithLocale', () => {
        test('get name string for locale fi', () => {
            const getString = helpers.getStringWithLocale(mockUserEvents[1], 'name', 'fi')
            expect(getString).toBe('Pomppu')
        })
    })

    describe('getEventLanguageType', () => {
        const cases = [
            {value: EVENT_TYPE.GENERAL, expected: LOCALE_TYPE.EVENT},
            {value: EVENT_TYPE.COURSE, expected: LOCALE_TYPE.COURSE},
            {value: EVENT_TYPE.HOBBIES, expected: LOCALE_TYPE.HOBBY},
        ]
        test.each(cases) (
            'return correct locale for value %o',
            ({value, expected}) => {
                const getLanguage = helpers.getEventLanguageType(value)
                expect(getLanguage).toBe(expected)
            }
        )
    })
    describe('saveLocaleToLocalStorage', () => {

        const locales = [
            {locale: 'fi', expected: ['userLocale', 'fi']},
            {locale: 'sv', expected: ['userLocale', 'sv']},
            {locale: 'en', expected: ['userLocale', 'en']},
            {locale: {test: 'test'}, expected: undefined},
            {locale: {}, expected: undefined},
        ]

        test.each(locales) (
            'set & return correct call %o',
            ({locale, expected}) => {
                const originalWindow = {...window};
                jest.spyOn(window.localStorage.__proto__, 'setItem');
                window.localStorage.__proto__.setItem = jest.fn();
                helpers.saveLocaleToLocalStorage(locale)
                if (typeof locale === 'string') {
                    expect(localStorage.setItem).toHaveBeenCalledWith(...expected);
                } else {
                    const mockFunc = jest.fn().mockImplementation(helpers.saveLocaleToLocalStorage(locale))
                    mockFunc()
                    expect(localStorage.setItem).toHaveBeenCalledTimes(0)
                    expect(mockFunc).toHaveReturnedWith(expected)
                }
                window.localStorage = originalWindow.localStorage
            }
        )
    })
    describe('loadLocaleFromLocalStorage', () => {
        test('call localStorage.getItem', () => {
            const originalWindow = {...window};
            jest.spyOn(window.localStorage.__proto__, 'getItem');
            window.localStorage.__proto__.getItem = jest.fn();
            helpers.loadLocaleFromLocalStorage()
            expect(localStorage.getItem).toHaveBeenCalledTimes(1)
            expect(localStorage.getItem).toHaveBeenCalledWith('userLocale')
            window.localStorage = originalWindow.localStorage
        })
    })
})
