import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {MultiLevelSelect} from './MultiLevelSelect';
import DropdownTreeSelect from 'react-dropdown-tree-select'

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    data: [],
    placeholder: 'Select organization',
    handleChange: jest.fn(),
}

describe('MultiLevelSelect', () => {

    function getWrapper(props) {
        return shallow(<MultiLevelSelect {...defaultProps} {...props} />, {context: {intl}});
    }
    describe('renders', () => {
        describe('components', () => {
            const wrapper = getWrapper();
            const dropDownTreeSelect = wrapper.find(DropdownTreeSelect);
            test('correct amount', () => {
                expect(dropDownTreeSelect).toHaveLength(1);
            });

            test('with correct props', () => {
                expect(dropDownTreeSelect.prop('data')).toEqual([]);
            });
        });
    });
});
