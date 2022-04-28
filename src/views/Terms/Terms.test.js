import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {Helmet} from 'react-helmet';
import {UnconnectedTerms} from './Terms';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    intl,
}

describe('Terms', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedTerms {...defaultProps} {...props} />, {context: {intl}});
    }

    describe('components', () => {

        describe('react-helmet', () => {
            const wrapper = getWrapper().find(Helmet);
            const pageTitle = wrapper.prop('title');
            test('react-helmet is defined and gets title prop', () => {
                expect(wrapper).toBeDefined();
                const expectedValue = `Linkedevents - ${defaultProps.intl.formatMessage({id: 'terms-page'})}`;
                expect(pageTitle).toBe(expectedValue);
            });
        });
    });
});
