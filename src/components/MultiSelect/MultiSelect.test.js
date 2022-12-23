import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {MultiSelect} from './MultiSelect';
import Select from 'react-select'

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    data: [
        {label: 'Konsernihallinto ja palvelukeskukset', value: 'turku:04'},
        {label: 'Työllisyyspalvelukeskus', value: 'turku:0720'},
    ],
    placeholder: 'Select organization',
    handleChange: jest.fn(),
}

describe('MultiSelect', () => {

    function getWrapper(props) {
        return shallow(<MultiSelect {...defaultProps} {...props} />, {context: {intl}});
    }
    describe('renders', () => {
        describe('components', () => {
            const wrapper = getWrapper();
            const selectElement = wrapper.find(Select);
            test('correct amount', () => {
                expect(selectElement).toHaveLength(1);
            });

            test('with correct props', () => {
                expect(selectElement.prop('options')).toEqual(defaultProps.data);
            });
        });
    });
});
