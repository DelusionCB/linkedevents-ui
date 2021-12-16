import constants from '../../constants.js'
import {setLocale, resetLocale} from '../userLocale';

const {LOCALE_ACTIONS} = constants

describe('actions/userLocale', () => {
    describe('setLocale', () => {
        test('returns object with correct type and locale', () => {
            const expectedResult = {type: LOCALE_ACTIONS.LOCALE_SET, locale: ['fi']};
            const result = setLocale(['fi']);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('resetLocale', () => {
        test('returns object with correct type', () => {
            const expectedResult = {type: LOCALE_ACTIONS.LOCALE_RESET};
            const result = resetLocale();
            expect(result).toEqual(expectedResult);
        });
    });
});
