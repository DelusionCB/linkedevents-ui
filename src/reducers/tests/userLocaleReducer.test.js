import constants from '../../constants';
import userLocale from '../userLocale';

const {LOCALE_ACTIONS} = constants

const INITIAL_STATE = {
    locale: 'en',
};

describe('reducers/userLocale', () => {
    test('return state if no action', () => {
        expect(userLocale(INITIAL_STATE, {})).toEqual(INITIAL_STATE);
    });

    describe('actions', () => {
        describe('LOCALE_SET', () => {
            test('returns state with correct locale', () => {
                const newLocale = {locale: 'sv'};
                const nextState = userLocale(INITIAL_STATE, {type: LOCALE_ACTIONS.LOCALE_SET, ...newLocale});
                expect(nextState).toEqual(newLocale);
            });
        });

        describe('LOCALE_RESET', () => {
            test('resets locale to initial locale', () => {
                const stateLocaleSet = userLocale(
                    INITIAL_STATE,
                    {type: LOCALE_ACTIONS.LOCALE_SET, locale: 'sv'}
                );
                const nextState = userLocale(stateLocaleSet, {type: LOCALE_ACTIONS.LOCALE_RESET});
                expect(nextState).toEqual(INITIAL_STATE);
            });
        });
    });
});
