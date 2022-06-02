import React from 'react';
import HeaderCell from '../HeaderCell';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';

import fiMessages from 'src/i18n/fi.json';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const defaultProps = {
    handleSortChange: jest.fn(),
    name: 'checkbox',
    sortDirection: '',
    active: false,
    children: undefined,
    tableName: 'pöytäNimi',
};

describe('HeaderCell', () => {
    function getWrapper(props) {
        return shallow(<HeaderCell {...defaultProps} {...props}/>, {context: {intl}});
    }

    describe('components', () => {
        describe('button', () => {
            test('correct props', () => {
                const wrapper = getWrapper({name: 'publisher'})
                const instance = wrapper.instance()
                const buttonElement = wrapper.find('button')
                expect(buttonElement).toHaveLength(1)
                expect(buttonElement.prop('aria-sort')).toBe(defaultProps.sortDirection)
                expect(buttonElement.prop('onClick')).toBe(instance.handleSort)
            })
        })
        describe('other element', () => {
            const childElement = React.createElement('p',null,'Julkaisija');

            test('renders', () => {
                const element = getWrapper({children: childElement, name: 'publisher'});
                expect(element.find('button').prop('onClick')).toBeDefined();
                expect(element.find('p')).toHaveLength(1);
                expect(element.find('p').text()).toBe('Julkaisija');
            });

            test('renders span element(arrow icons) according to sortDirection', () => {
                let element = getWrapper({children: childElement, name: 'publisher', active: true, sortDirection: 'asc'});
                expect(element.find('span.glyphicon-arrow-up')).toHaveLength(1);
                element = getWrapper({children: childElement, name: 'publisher', active: true, sortDirection: 'desc'});
                expect(element.find('span.glyphicon-arrow-down')).toHaveLength(1);
            });
        })
        describe('th', () => {
            test('correct className', () => {
                const wrapper = getWrapper()
                const thElement = wrapper.find('th')
                expect(thElement).toHaveLength(1)
                expect(thElement.prop('className')).toBe('table-header')
            })
            test('correct className based on name-prop being context', () => {
                const wrapper = getWrapper({name: 'context'})
                const thElement = wrapper.find('th')
                expect(thElement).toHaveLength(1)
                expect(thElement.prop('className')).toBe('table-header context-header')
            })
            test('correct className based on name-prop being validation', () => {
                const wrapper = getWrapper({name: 'validation'})
                const thElement = wrapper.find('th')
                expect(thElement).toHaveLength(1)
                expect(thElement.prop('className')).toBe('table-header validation-header')
            })
        })
    })
    describe('methods', () => {
        describe('handleSort', () => {
            test('called with right params', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                const spy = jest.spyOn(wrapper.instance().props, 'handleSortChange')

                jest.clearAllMocks()
                instance.handleSort()

                expect(spy).toHaveBeenCalledTimes(1)
                expect(spy).toHaveBeenCalledWith(defaultProps.name, defaultProps.tableName)
            })
            test('changes state correctly', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                expect(wrapper.state('isActive')).toBe(false)
                instance.handleSort()
                expect(wrapper.state('isActive')).toBe(true)
            })
        })
    })
})
