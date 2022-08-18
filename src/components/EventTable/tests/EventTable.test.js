import React from 'react';
import {UnconnectedEventTable} from '../EventTable';
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import Spinner from 'react-bootstrap/Spinner';
import {Table} from 'react-bootstrap'
import CustomTablePagination from '../CustomTablePagination';
import fiMessages from 'src/i18n/fi.json';

import SelectionCell from '../CellTypes/SelectionCell';
import TableHeaderCell from '../CellTypes/TableHeaderCell';
import EventRow from '../EventRow';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
import {mockUserEvents, mockUser} from '../../../../__mocks__/mockData';

const defaultProps = {
    tableCaption: 'table-event-moderation',
    user: mockUser,
    count: 2,
    fetchComplete: true,
    events: mockUserEvents,
    tableName: 'draft',
    tableColumns: ['checkbox', 'name', 'context', 'publisher', 'event_time', 'last_modified_time', 'validation'],
    selectedRows: [],
    invalidRows: [],
    paginationPage: 0,
    sortBy: 'name',
    sortDirection: 'asc',
    pageSize: 100,
    pageSizeOptions: [10, 25, 50, 100],
    handleInvalidRows: () => {},
    handlePageChange: () => {},
    handlePageSizeChange: () => {},
    handleRowSelect: () => {},
    handleSortChange: () => {},
    intl,
};

describe('EventTable', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedEventTable {...defaultProps} {...props}/>, {context: {intl}});
    }

    describe('components', () => {

        describe('table', () => {
            test('correct length', () => {
                const wrapper = getWrapper()
                const tableElement = wrapper.find(Table)
                expect(tableElement).toHaveLength(1)
            })
            test('correct props', () => {
                const wrapper = getWrapper()
                const tableElement = wrapper.find(Table)
                expect(tableElement.prop('className')).toBe('event-table')
                expect(tableElement.prop('responsive')).toBe('md')
                expect(tableElement.prop('id')).toBe('draft-id')
            })
        })

        describe('formattedMessage', () => {
            test('correct amount', () => {
                const wrapper = getWrapper()
                const formattedElement = wrapper.find(FormattedMessage)
                expect(formattedElement).toHaveLength( 9)
            })
            test('first being captions id', () => {
                const wrapper = getWrapper()
                const formattedElement = wrapper.find(FormattedMessage)
                expect(formattedElement.at(0).prop('id')).toBe('table-event-moderation')
            })
            test('when no events found', () => {
                const wrapper = getWrapper({events: []})
                const formattedElement = wrapper.find(FormattedMessage)
                expect(formattedElement.at(0).prop('id')).toBe('no-events')
            })
        })

        describe('loading spinner', () => {
            test('not found when fetch is complete', () => {
                const wrapper = getWrapper()
                const spinnerElement = wrapper.find(Spinner)
                expect(spinnerElement).toHaveLength(0)
            })
            test('found when fetch is not complete', () => {
                const wrapper = getWrapper({fetchComplete: false})
                const spinnerElement = wrapper.find(Spinner)
                expect(spinnerElement).toHaveLength(1)
            })
            test('correct props', () => {
                const wrapper = getWrapper({fetchComplete: false})
                const spinnerElement = wrapper.find(Spinner)
                expect(spinnerElement.prop('animation')).toBe('border')
                expect(spinnerElement.prop('role')).toBe('status')
            })
        })

        describe('customtablepagination', () => {
            test('correct amount', () => {
                const wrapper = getWrapper()
                const pagination = wrapper.find(CustomTablePagination)
                expect(pagination).toHaveLength(1)
            })
            test('correct props', () => {
                const wrapper = getWrapper()
                const pagination = wrapper.find(CustomTablePagination)
                expect(pagination.prop('count')).toBe(defaultProps.count)
                expect(pagination.prop('rowsPerPage')).toBe(defaultProps.pageSize)
                expect(pagination.prop('rowsPerPageOptions')).toEqual([])
                expect(pagination.prop('page')).toBe(defaultProps.paginationPage)
                expect(pagination.prop('onChangePage')).toBeDefined()
                expect(pagination.prop('onChangeRowsPerPage')).toBeDefined()
                expect(pagination.prop('labelDisplayedRows')).toBeDefined()
                expect(pagination.prop('labelRowsPerPage')).toBe('Sisältöjä per sivu')
                expect(pagination.prop('shortcutElementId')).toBe(defaultProps.tableName + '-id')
            })
        })
    })

    describe('cells', () => {

        describe('selectioncell', () => {
            test('correct amount', () => {
                const wrapper = getWrapper();
                const selection = wrapper.find(SelectionCell)
                expect(selection).toHaveLength(1)
            })
            test('correct props', () => {
                const wrapper = getWrapper();
                const selection = wrapper.find(SelectionCell)
                expect(selection.prop('tableName')).toBe(defaultProps.tableName)
                expect(selection.prop('handleRowSelect')).toBe(defaultProps.handleRowSelect)
            })
        })

        describe('tableheadercell', () => {
            test('correct amount based on tableColumns', () => {
                const wrapper = getWrapper();
                const headerCell = wrapper.find(TableHeaderCell)
                expect(headerCell).toHaveLength(7)
            })
            test('correct props', () => {
                const wrapper = getWrapper();
                const headerCell = wrapper.find(TableHeaderCell)
                headerCell.forEach((element, index) => {
                    expect(element.prop('name')).toEqual(defaultProps.tableColumns[index])
                    expect(element.prop('tableName')).toEqual(defaultProps.tableName)
                    expect(element.prop('events')).toEqual(defaultProps.events)
                    expect(element.prop('isActive')).toBeDefined()
                    expect(element.prop('sortDirection')).toEqual(defaultProps.sortDirection)
                    expect(element.prop('invalidRows')).toEqual(defaultProps.invalidRows)
                    expect(element.prop('selectedRows')).toEqual(defaultProps.selectedRows)
                    expect(element.prop('handleRowSelect')).toEqual(defaultProps.handleRowSelect)
                    expect(element.prop('handleSortChange')).toEqual(defaultProps.handleSortChange)
                    expect(element.prop('fetchComplete')).toEqual(defaultProps.fetchComplete)
                    expect(element.prop('sortBy')).toEqual(defaultProps.sortBy)
                })
            })
        })
        describe('eventrow', () => {
            test('correct amount', () => {
                const wrapper = getWrapper();
                const rowElement = wrapper.find(EventRow)
                expect(rowElement).toHaveLength(3)
            })
            test('correct props', () => {
                const wrapper = getWrapper();
                const rowElement = wrapper.find(EventRow)
                rowElement.forEach((element, index) => {
                    expect(element.prop('event')).toBe(defaultProps.events[index])
                    expect(element.prop('tableName')).toBe(defaultProps.tableName)
                    expect(element.prop('tableColumns')).toBe(defaultProps.tableColumns)
                    expect(element.prop('selectedRows')).toBe(defaultProps.selectedRows)
                    expect(element.prop('invalidRows')).toBe(defaultProps.invalidRows)
                    expect(element.prop('handleRowSelect')).toBe(defaultProps.handleRowSelect)
                    expect(element.prop('handleInvalidRows')).toBe(defaultProps.handleInvalidRows)
                })
            })
        })
    })
})
