import React from 'react';
import {TextValue, removeScriptElements} from './index';
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

describe('TextValue', () => {
    const defaultProps = {
        value: 'this is content.',
        labelKey: 'event-text',
    };
    function getWrapper(props) {
        return shallow(<TextValue {...defaultProps} {...props} />, {context: {intl}});
    }
    describe('return when', () => {
        test('value exists, shared elements', () => {
            // These elements are always returned with the values from props
            // so they won't be included in the specific labelKey tests
            const wrapper = getWrapper();
            expect(wrapper.find('.single-value-field')).toHaveLength(1);
            const labelElement = wrapper.find('label');
            expect(labelElement).toHaveLength(1);
            expect(labelElement.prop('htmlFor')).toEqual(defaultProps.labelKey);
            const messageElement = labelElement.find(FormattedMessage);
            expect(messageElement).toHaveLength(1);
            expect(messageElement.prop('id')).toEqual(defaultProps.labelKey);
            const inputElement = wrapper.find('input');
            expect(inputElement.prop('type')).toBe('hidden');
            expect(inputElement.prop('id')).toEqual(defaultProps.labelKey);
        })
        test('value exists and labelKey does not include -url ', () => {
            // The span element is the only element that has different parameters according
            // to if labelKey includes '-url'
            const wrapper = getWrapper();
            const spanElement = wrapper.find('span');
            expect(spanElement).toHaveLength(1);
            expect(spanElement.prop('role')).toBeUndefined();
            expect(spanElement.text()).toEqual(defaultProps.value);
        });
        test('value exists and labelKey includes -url', () => {
            const urlProps = {labelKey: 'website-url', value: 'address.ofaweb.site'};
            const wrapper = getWrapper(urlProps);
            expect(wrapper).toHaveLength(1);
            const spanElement = wrapper.find('span');
            expect(spanElement).toHaveLength(1);
            expect(spanElement.prop('role')).toBeDefined();
            expect(spanElement.prop('role')).toBe('address');
        });
    });
});
describe('removeScriptElements', () => {
    test('does nothing to value if it does not contain script elements', () => {
        const value = 'This is a string that doesnt contain any script elements';
        expect(removeScriptElements(value)).toBe(value);
    });
    test('replaces a potentially malicious script element from a string with an empty string', () => {
        const value = 'This <script>alert("is potentially");</script> malicious';
        const expectedValue = 'This alert("is potentially"); malicious';
        expect(removeScriptElements(value)).toBe(expectedValue);
    });
    test('returns value if value is not a string', () => {
        const value = 7;
        expect(removeScriptElements(value)).toEqual(value);
    });
});
