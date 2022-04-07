import React from 'react';
import {UnconnectedFooter} from './Footer';
import {shallow} from 'enzyme';
import {Link} from 'react-router-dom';
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';

const testMessages = mapValues(fiMessages, (value) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    intl,
};

describe('Footer', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedFooter {...props} {...defaultProps} />);
    }
    describe('renderer', () => {
        test('Formatted message length', () => {
            const wrapper = getWrapper().find(FormattedMessage);
            expect(wrapper).toHaveLength(6);
        });

        test('Correct props for Link', () => {
            const wrapper = getWrapper().find(Link);
            expect(wrapper).toHaveLength(1);
            expect(wrapper.prop('to')).toBe('/accessibility');
            expect(wrapper.prop('aria-label')).toBe(intl.formatMessage({id: 'footer-accessibility'}));
        });

        test('correct number', () => {
            const wrapper = getWrapper().find('a');
            expect(wrapper).toHaveLength(1);
        });

        test('Correct <a> element prop', () => {
            const wrapper = getWrapper().find('a').at(0);
            expect(wrapper.prop('href')).toBe(intl.formatMessage({id: 'footer-link'}));
        });
    });
});
