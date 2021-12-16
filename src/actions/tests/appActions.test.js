import constants from '../../constants.js'
import {setFlashMsg,
    clearFlashMsg, confirmAction,
    doAction, cancelAction} from '../app';

const {APP_SET_FLASHMSG, APP_CLEAR_FLASHMSG,
    APP_CONFIRM_ACTION, APP_DO_ACTION,
    APP_CANCEL_ACTION} = constants

describe('actions/app', () => {
    describe('setFlashMsg', () => {
        test('returns object according to params', () => {
            const params = {
                msg: 'Flashing Message',
                style: 'message',
                data: {
                    sticky: false,
                    other: 'this is some additional stuff',
                },
            };
            const {msg, style, data} = params;
            const result = setFlashMsg(msg,style,data);
            const expectedResult = {...params, type: APP_SET_FLASHMSG, sticky: data.sticky};
            expect(result).toEqual(expectedResult);
        });
    });
    describe('clearFlashMsg', () => {
        test('returns object with correct type', () => {
            const expectedResult = {type: APP_CLEAR_FLASHMSG};
            const result = clearFlashMsg();
            expect(result).toEqual(expectedResult);
        });
    });
    describe('confirmAction', () => {
        test('returns object according to params', () => {
            const params = {
                msg: 'example text',
                style: 'warning',
                actionButtonLabel: 'buttonLabel',
                data: {value:'extra test data'},
            };
            const {msg, style, actionButtonLabel, data} = params;
            const expectedResult = {...params, type: APP_CONFIRM_ACTION};
            const result = confirmAction(msg, style, actionButtonLabel, data);
            expect(result).toEqual(expectedResult);
        });
    });
    describe('doAction', () => {
        test('calls data.action if it exists and is a function', () => {
            const data = {
                action: jest.fn(),
            };
            const expectedResult = {type: APP_DO_ACTION};
            const result = doAction(data);
            expect(result).toEqual(expectedResult);
            expect(data.action).toHaveBeenCalled();
        });
        test('returns object with correct type', () => {
            const expectedResult = {type: APP_DO_ACTION};
            const result = doAction();
            expect(result).toEqual(expectedResult);
        });
    });
    describe('cancelAction', () => {
        test('returns object with correct type', () => {
            const expectedResult = {type: APP_CANCEL_ACTION};
            const result = cancelAction();
            expect(result).toEqual(expectedResult);
        });
    });
});
