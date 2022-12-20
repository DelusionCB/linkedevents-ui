import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import Pagination from '../Pagination';


const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    clickedPage: jest.fn(),
    intl,
    pageSize: 50,
    data: {
        count: 100,
        currentPage: 1,
        next: '',
        previous: null,
    },
}


describe('Pagination', () => {
    function getWrapper(props) {
        return shallow(<Pagination {...defaultProps} {...props}/>, {intl});
    }

    describe('components', () => {
        describe('li-elements for page change', () => {
            const mockData = {
                data: {
                    count: 800,
                    currentPage: 1,
                    next: '',
                    previous: null,
                },
            }
            const wrapper = getWrapper(mockData)
            const elements = wrapper.find('li')
            test('correct amount based on pageSize & count', () => {
                expect(elements).toHaveLength(Math.ceil(parseInt(mockData.data.count) / defaultProps.pageSize));
            })
            test('correct props for each element', () => {
                elements.forEach((element, index) => {
                    if (index === mockData.data.currentPage - 1) {
                        expect(element.prop('className')).toBe('page-item active');
                    } else {
                        expect(element.prop('className')).toBe('page-item');
                    }
                })
            })
        })
        describe('a-elements inside li-elements', () => {
            const mockData = {
                data: {
                    count: 800,
                    currentPage: 1,
                    next: '',
                    previous: null,
                },
            }
            const wrapper = getWrapper(mockData)
            const elements = wrapper.find('a')
            test('correct amount based on pageSize & count', () => {
                expect(elements).toHaveLength(Math.ceil(parseInt(mockData.data.count) / defaultProps.pageSize));
            })
            test('correct props for each element', () => {
                elements.forEach((element, index) => {
                    expect(element.prop('className')).toBe('page-link');
                    expect(element.prop('aria-label')).toBe('Sivu' + ' ' + `${index + 1}`);
                    expect(element.prop('href')).toBe('#');
                    expect(element.prop('onClick')).toBeDefined();
                    expect(element.text()).toBe((index + 1).toString());
                })
            })
        })
    });
    describe('methods', () => {
        describe('clickedPage', () => {
            test('called with correct param', () => {
                const wrapper = getWrapper()
                const prevent = {preventDefault: jest.fn()}
                const element = wrapper.find('a').at(1)
                element.simulate('click', prevent)
                expect(defaultProps.clickedPage).toHaveBeenCalledWith(2, prevent)
            });
            test('is called with correct parameter from each link', () => {
                const mockData = {
                    data: {
                        count: 800,
                        currentPage: 1,
                        next: '',
                        previous: null,
                    },
                }
                const wrapper = getWrapper(mockData);
                const prevent = {preventDefault: jest.fn()}
                const elements = wrapper.find('a');
                elements.forEach((element, index) => {
                    element.simulate('click', prevent);
                    expect(defaultProps.clickedPage).toHaveBeenLastCalledWith(index + 1, prevent);
                })
            })
        })
        describe('data', () => {
            test('if undefined = return empty object', () => {
                const wrapper = getWrapper({data: undefined})
                expect(wrapper.props('data')).toEqual({})
                expect(wrapper).toEqual({})
            })
        })
    });
})
