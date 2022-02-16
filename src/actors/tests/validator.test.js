import Validator, {actionFunc, findElement} from '../validator';
import {setFlashMsg, clearFlashMsg} from '../../actions/app';

const initialStore = {
    user: {
        id: 'testuser',
        username: 'fooUser',
        provider: 'helsinki',
    },
    app: {
        flashMsg: null,
        confirmAction: null,
    },
    editor: {
        validationErrors: {0:{}},
    },
    router: {},
    userLocale: {
        locale: 'fi',
    },
};

const ERROR_HTML =
    '<div>' +
    '<input />' +
    '<div></div>' +
    '<div class="validation-notification"></div>' +
    '</div>';

describe('validation/validator', () => {
    describe('default validator', () => {
        test('validationErrors exist -> calls dispatch once with correct params', () => {
            const mockDispatch = jest.fn();
            const mockStore = {
                getState: () => initialStore,
                dispatch: mockDispatch,
            };
            Validator(mockStore);
            const expectedValue = setFlashMsg(
                'validation-error','error',
                {
                    sticky: true,
                    action: {
                        labelId: 'validation-error-goto-error', fn: actionFunc,
                    },
                });
            expect(mockDispatch).toHaveBeenCalledWith(expectedValue);
        });
        describe('dispatches after previous error has been fixed and no other errors remain', () => {
            let mockStore;
            const erroneousEditor = {
                editor: {
                    validationErrors: {},
                    validationStatus: 'resolve',
                },
            };
            // returns erroneous editor with updated router.location.pathname
            function pathUpdated(pathname) {
                return {
                    ...erroneousEditor,
                    router: {
                        location: {
                            pathname: `validator.test.js/event/${pathname}/`,
                        },
                    },
                };
            }
            beforeEach(() => {
                mockStore = {
                    getState: () => initialStore,
                    dispatch: jest.fn(),
                }
            });
            test('when pathname includes "/event/create/" and validationStatus=resolve', () => {
                Validator(mockStore);
                const updatedMockStore = {...initialStore, ...pathUpdated('create')};
                mockStore = {
                    getState: () => updatedMockStore,
                    dispatch: jest.fn(),
                };
                Validator(mockStore);
                expect(mockStore.dispatch).toHaveBeenCalledWith(setFlashMsg('no-validation-errors','success'));
            });
            test('when pathname includes "/event/update/" and validationStatus=resolve', () => {
                Validator(mockStore);
                const updatedMockStore = {...initialStore, ...pathUpdated('update')};
                mockStore = {
                    getState: () => updatedMockStore,
                    dispatch: jest.fn(),
                };
                Validator(mockStore);
                expect(mockStore.dispatch).toHaveBeenCalledWith(setFlashMsg('no-validation-errors','success'));
            });
            test('when pathname doesnt include either of the previous', () => {
                Validator(mockStore);
                const updatedMockStore = {...initialStore, ...pathUpdated('erroneous/url')};
                mockStore = {
                    getState: () => updatedMockStore,
                    dispatch: jest.fn(),
                };
                Validator(mockStore);
                expect(mockStore.dispatch).toHaveBeenCalledWith(clearFlashMsg());
            });
        });
    });
    describe('actionFunc', () => {
        const originalWindow = {...window};
        const originalInnerHTML = document.body.innerHTML;
        let mockScrollTo, mockInnerHeight, mockScrollY;
        beforeEach(() => {
            mockScrollTo = jest.fn();
            mockInnerHeight = 768;
            mockScrollY = 150;
            window.scrollTo = mockScrollTo;
            window.innerHeight = mockInnerHeight;
            window.scrollY = mockScrollY;
            document.body.innerHTML = ERROR_HTML;
        });
        afterEach(() => {
            window.scrollTo = originalWindow.scrollTo;
            window.innerHeight = originalWindow.innerHeight;
            window.scrollY = originalWindow.scrollY;
            document.body.innerHTML = originalInnerHTML;
        })
        test('calls window.scrollTo with correct param types', () => {
            actionFunc();
            const expectedValue = window.scrollY - (window.innerHeight / 2);
            expect(mockScrollTo).toHaveBeenCalledWith(0, expectedValue);

        });

    });
    describe('findElement', () => {
        const INTERACTIVE_ELEMENTS = ['button','input','textarea'];
        // Returns correct HTMLElement according to type.
        function getElement(type) {
            switch(type) {
                case 'textarea':
                    return '<textarea></textarea>';
                case 'button':
                    return '<button></button>';
                default:
                    return '<input />';
            }
        }
        // Returns HTML for cases where notification element is also focusable.
        function getHTMLSameElement(type) {
            let element;
            if(type === 'textarea') {element = '<textarea class="validation-notification"></textarea>';}
            else if(type === 'button') {element = '<button class="validation-notification"></button>';}
            else {element = '<input class="validation-notification"/>';}
            return ('<div>' +
                '<div></div>' +
                '<span></span>' +
                element +
                '</div>');
        }
        // Returns HTML for cases where notification element has a sibling element that is focusable.
        function getHTMLPreviousElement(type) {
            const element = getElement(type);
            return ('<div>' +
                '<div></div>' +
                element +
                '<div class="validation-notification"></div>' +
                '</div>');
        }
        // Returns HTML for cases where focus is moved to the first focusable element in parent elements children.
        function getHTMLFirstElement(type) {
            const element = getElement(type);
            return ('<div>' +
                '<div></div>' +
                element +
                '<div></div>' +
                '<div class="validation-notification"></div>' +
                '</div>');
        }

        const originalInnerHTML = document.body.innerHTML;
        test('moves focus to notificationElement if it is an interactive element', () => {

            INTERACTIVE_ELEMENTS.forEach((element) => {
                document.body.innerHTML = getHTMLSameElement(element);
                const notificationElement = document.querySelector('.validation-notification');
                const spy = jest.spyOn(notificationElement, 'focus');

                findElement(notificationElement);
                expect(spy).toHaveBeenCalled();
                document.body.innerHTML = originalInnerHTML;
            })
        });
        test('moves focus to previous sibling element if it is an interactive element', () => {
            INTERACTIVE_ELEMENTS.forEach((element) => {
                document.body.innerHTML = getHTMLPreviousElement(element);
                const notificationElement = document.querySelector('.validation-notification');
                const spy = jest.spyOn(notificationElement.previousElementSibling, 'focus');

                findElement(notificationElement);
                expect(spy).toHaveBeenCalled();
                document.body.innerHTML = originalInnerHTML;
            });
        });
        test('otherwise moves focus to first interactive element under the same parent element', () => {
            INTERACTIVE_ELEMENTS.forEach((element) => {
                document.body.innerHTML = getHTMLFirstElement(element);
                const notificationElement = document.querySelector('.validation-notification');
                const children = Array.from(notificationElement.parentElement.children);
                // first element that has a tag that is focusable.
                const targetIndex = children.findIndex(child => INTERACTIVE_ELEMENTS.includes(child.tagName.toLowerCase()));
                const spy = jest.spyOn(notificationElement.parentElement.children[targetIndex], 'focus');

                findElement(notificationElement);
                expect(spy).toHaveBeenCalled();
                document.body.innerHTML = originalInnerHTML;
            });
        });
    });
});
