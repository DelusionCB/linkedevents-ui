import React from 'react';
import SelectionCell from '../SelectionCell';
import {mockUserEvents} from '__mocks__/mockData';
import {shallow} from 'enzyme';
import {Link} from 'react-router-dom';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';


const mockEvent = mockUserEvents[0];
mockEvent.id = 'uniqueEventId';
const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    intl,
    handleRowSelect: jest.fn(),
    tableName: 'pöytäNimi',
}

describe('SelectionCell', () => {
    function getWrapper(props) {
        return shallow(<SelectionCell {...defaultProps} {...props} />, {context: {intl}})
    }


    describe('components', () => {
        describe('input', () => {
            test('with correct props', () => {
                const wrapper = getWrapper();
                const element = wrapper.find('input');
                const instance = wrapper.instance();
                expect(element).toHaveLength(1);
                expect(element.prop('className')).toBe('custom-control-input')
                expect(element.prop('checked')).toBe(wrapper.state('isChecked'))
                expect(element.prop('type')).toBe('checkbox')
                expect(element.prop('id')).toBe('allchecked')
                expect(element.prop('onChange')).toBe(instance.handleRow)
            });
        })
        describe('label', () => {
            test('with correct props', () => {
                const wrapper = getWrapper();
                const element = wrapper.find('label');
                expect(element).toHaveLength(1);
                expect(element.prop('className')).toBe('custom-control-label')
                expect(element.prop('htmlFor')).toBe('allchecked')
            })
        })
    });
    describe('methods', () => {
        describe('isChecked-state', () => {
            test('changes correctly', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                expect(wrapper.state('isChecked')).toBe(false)
                instance.handleRow()
                expect(wrapper.state('isChecked')).toBe(true)
            })
        })
        describe('handleRow', () => {
            test('called with right params', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                const spy = jest.spyOn(wrapper.instance().props, 'handleRowSelect')

                jest.clearAllMocks()
                instance.handleRow()

                expect(spy).toHaveBeenCalledTimes(1)
                expect(spy).toHaveBeenCalledWith(wrapper.state('isChecked'), undefined, defaultProps.tableName, true)
            })
        })
    })
})
