import constants from '../../constants';
import update from '../app';

const {APP_SET_FLASHMSG,
    APP_CLEAR_FLASHMSG,
    APP_CONFIRM_ACTION,
    APP_DO_ACTION,
    APP_CANCEL_ACTION} = constants

const INITIAL_STATE = {
    flashMsg: null,
    confirmAction: null,
};
describe('reducers/app', () => {
    test('returns state if no action', () => {
        const state = {default:'this is a dummy object'};
        expect(update(state, {})).toEqual(state);
    });

    describe('actions', () => {
        describe('APP_SET_FLASHMSG', () => {
            let testMsg = {};
            beforeEach(() => {
                testMsg = {
                    msg: '',
                    style: 'warning',
                    data: {
                        action: jest.fn(),
                    },
                    sticky: true,
                }
            })
            test('returns state with flashMsg if msg exists', () => {
                testMsg.msg = 'test';
                const nextState = update(INITIAL_STATE,
                    {...testMsg,type: APP_SET_FLASHMSG});
                const expectedState = {...INITIAL_STATE, flashMsg: {...testMsg, action: testMsg.data.action}}
                expect(nextState).toEqual(expectedState);
            });
            test('returns state with flashMsg being null if no msg', () => {
                const nextState = update(INITIAL_STATE,
                    {...testMsg,type: APP_SET_FLASHMSG});
                const expectedState = {...INITIAL_STATE, flashMsg: null};
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('APP_CLEAR_FLASHMSG', () => {
            test('returns state with flashMsg set to null', () => {
                const stateWithFlashMsg = {...INITIAL_STATE, flashMsg: 'truthy'};
                const nextState = update(stateWithFlashMsg, {type: APP_CLEAR_FLASHMSG});
                const expectedState = {...INITIAL_STATE, flashMsg: null}
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('APP_CONFIRM_ACTION', () => {
            let testMsg = {};
            beforeEach(() => {
                testMsg = {
                    msg: '',
                    style: 'warning',
                    actionButtonLabel: 'test-label',
                    data: {
                        action: jest.fn(),
                    },
                }
            })
            test('returns state with confirmAction being set if msg exists', () => {
                testMsg.msg = 'test';
                const nextState = update(INITIAL_STATE,
                    {...testMsg, type: APP_CONFIRM_ACTION});
                const expectedState = {...INITIAL_STATE, confirmAction: {...testMsg}};
                expect(nextState).toEqual(expectedState);
            });
            test('returns state with confirmAction null when action does not have msg', () => {
                const stateWithConfirmAction = {...INITIAL_STATE, confirmAction: 'truthy'};
                const nextState = update(stateWithConfirmAction, {type: APP_CONFIRM_ACTION});
                const expectedState = {...INITIAL_STATE, confirmAction: null};
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('APP_DO_ACTION', () => {
            test('returns state with confirmAction set to null', () => {
                const stateWithConfirmAction = {...INITIAL_STATE, confirmAction: 'truthy'};
                const nextState = update(stateWithConfirmAction, {type: APP_DO_ACTION});
                const expectedState = {...INITIAL_STATE, confirmAction: null};
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('APP_CANCEL_ACTION', () => {
            test('returns returns state with confirmAction set to null', () => {
                const stateWithConfirmAction = {...INITIAL_STATE, confirmAction: 'truthy'};
                const nextState = update(stateWithConfirmAction, {type: APP_CANCEL_ACTION});
                const expectedState = {...INITIAL_STATE, confirmAction: null};
                expect(nextState).toEqual(expectedState);
            });
        });
    });
});
