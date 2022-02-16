// Validator actor which listens to validation changes and sets flash message if validation errors are cleared.
// Subscribes for store changes in src/index.js

import {setFlashMsg, clearFlashMsg} from 'src/actions/app'
import constants from 'src/constants'

let wasErrors = false

/**
 * Locates the notification element, scrolls document to notification element
 * and finally calls findElement with notification element.
 */
export function actionFunc() {
    const top = (window.scrollY || window.pageYOffset);
    // The first element with classname .validation-notification
    const notificationElement = document.querySelector('.validation-notification');
    // This scrolls the document so that the focused input is in the middle of the screen.
    window.scrollTo(
        0,
        top +
        notificationElement.getBoundingClientRect().top -
        (window.innerHeight / 2)
    );
    // Call findElement function that locates the correct element to focus.
    findElement(notificationElement);
}

/**
 * Locates the correct element to focus.
 * @example
 * if notificationElement is also interactive -> move focus to it
 * if notificationElements previous sibling is interactive -> move focus
 * else find first interactive element in parentElement.children -> move focus
 * @param {Element|HTMLElement} notificationElement
 */
export function findElement(notificationElement){
    // Tag names of interactive elements.
    const INTERACTIVE_ELEMENTS = ['BUTTON','INPUT','TEXTAREA'];
    if(INTERACTIVE_ELEMENTS.includes(notificationElement.tagName)) {
        // if notificationElement is also the interactive element.
        notificationElement.focus();
    } else if(
        notificationElement.previousElementSibling &&
        INTERACTIVE_ELEMENTS.includes(notificationElement.previousElementSibling.tagName)
    ) {
        // if the element immediately prior to notificationElement in parent's children list is focusable.
        notificationElement.previousElementSibling.focus();
    } else {
        // Array created from parentElement.children HTMLCollection.
        const children = Array.from(notificationElement.parentElement.children);
        // first element that has a tag that is focusable.
        const target = children.find(element => INTERACTIVE_ELEMENTS.includes(element.tagName));
        if(target) {target.focus();}
    }
}

export default (store) => {

    const {editor, router, userLocale: {locale}} = store.getState()
    const dispatch = store.dispatch

    let errorCount = _.keys(editor.validationErrors).length;

    if(errorCount > 0 && wasErrors === false) {
        wasErrors = true
        let action = {
            labelId: 'validation-error-goto-error',
            fn: actionFunc,
        };
        dispatch(setFlashMsg('validation-error', 'error', {sticky: true, action: action}))
    }

    if(wasErrors === true) {
        if(errorCount === 0) {
            wasErrors = false
            if((router.location.pathname.indexOf('/event/create/') > -1 || router.location.pathname.indexOf('/event/update/') > -1)
                && editor.validationStatus === constants.VALIDATION_STATUS.RESOLVE) {
                dispatch(setFlashMsg('no-validation-errors', 'success'))
            } else {
                dispatch(clearFlashMsg())
            }
        }
    }
}
