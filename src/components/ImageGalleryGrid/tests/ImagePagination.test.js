import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import ImagePagination from '../ImagePagination';


const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    clickedPage: jest.fn(),
    intl,
    pageSize: 50,
    responseMetadata: {
        count: 100,
        currentPage: 1,
        next: '',
        previous: null,
    },
}


describe('ImagePagination', () => {
    function getWrapper(props) {
        return shallow(<ImagePagination {...defaultProps} {...props}/>, {intl});
    }

    describe('components', () => {
        describe('li-elements for page change', () => {
            const mockData = {
                responseMetadata: {
                    count: 800,
                    currentPage: 1,
                    next: '',
                    previous: null,
                },
            }
            const wrapper = getWrapper(mockData)
            const elements = wrapper.find('li')
            test('correct amount based on pageSize & count', () => {
                expect(elements).toHaveLength(Math.ceil(parseInt(mockData.responseMetadata.count) / defaultProps.pageSize));
            })
            test('correct props for each element', () => {
                elements.forEach((element, index) => {
                    if (index === mockData.responseMetadata.currentPage - 1) {
                        expect(element.prop('className')).toBe('page-item active');
                    } else {
                        expect(element.prop('className')).toBe('page-item');
                    }
                })
            })
        })
        describe('a-elements inside li-elements', () => {
            const mockData = {
                responseMetadata: {
                    count: 800,
                    currentPage: 1,
                    next: '',
                    previous: null,
                },
            }
            const wrapper = getWrapper(mockData)
            const elements = wrapper.find('a')
            test('correct amount based on pageSize & count', () => {
                expect(elements).toHaveLength(Math.ceil(parseInt(mockData.responseMetadata.count) / defaultProps.pageSize));
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
                    responseMetadata: {
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
        describe('responseMetadata', () => {
            test('if undefined = return empty object', () => {
                const wrapper = getWrapper({responseMetadata: undefined})
                expect(wrapper.props('responseMetadata')).toEqual({})
                expect(wrapper).toEqual({})
            })
        })
    });
})
