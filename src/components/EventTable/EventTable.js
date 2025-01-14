import './EventTable.scss';
import React from 'react';
import PropTypes from 'prop-types';
import CustomTablePagination from './CustomTablePagination'
import {FormattedMessage, injectIntl} from 'react-intl';
import EventRow from './EventRow';
import TableHeaderCell from './CellTypes/TableHeaderCell';
import SelectionCell from './CellTypes/SelectionCell';
import constants from 'src/constants';

import Spinner from 'react-bootstrap/Spinner';
import {Table} from 'react-bootstrap';

const {TABLE_COLUMNS} = constants

const EventTable = ({
    intl,
    events,
    tableName,
    tableColumns,
    count,
    selectedRows,
    invalidRows,
    handleRowSelect,
    handleInvalidRows,
    handleSortChange,
    handlePageChange,
    handlePageSizeChange,
    paginationPage,
    sortBy,
    sortDirection,
    pageSize,
    pageSizeOptions,
    fetchComplete,
    tableCaption,
}) => {
    const hasResults = events.length > 0 || fetchComplete === false

    if (!hasResults) {
        return (<strong><FormattedMessage id="no-events"/></strong>)
    }

    const rows = events.map(event => (
        <EventRow
            key={event['@id']}
            event={event}
            tableName={tableName}
            tableColumns={tableColumns}
            selectedRows={selectedRows}
            invalidRows={invalidRows}
            handleRowSelect={handleRowSelect}
            handleInvalidRows={handleInvalidRows}
        />
    ))

    const isActive = name => sortBy === name
    // only show page size options dropdown if there are more events than the smallest option available
    const showPageSizeOptions = pageSizeOptions.length && pageSizeOptions[0] <= events.length
    const tableId = tableName ? tableName + '-id' : 'events-table-id'
    return (
        <Table className="event-table" responsive='md' id={tableId}>
            <caption className='visually-hidden'>
                <FormattedMessage id={tableCaption}>{txt => <p>{txt}</p>}</FormattedMessage>
                <FormattedMessage id='table-sortable-headers'>{txt => <p>{txt}</p>}</FormattedMessage>
            </caption>
            {tableName === 'draft' &&
                    <thead className='selection-head'>
                        <tr className='selection-row'>
                            <SelectionCell
                                tableName={tableName}
                                handleRowSelect={handleRowSelect}
                            />
                        </tr>
                    </thead>
            }
            <thead>
                <tr>
                    {tableColumns.map(item => (
                        <TableHeaderCell
                            key={item}
                            name={item}
                            tableName={tableName}
                            events={events}
                            isActive={isActive}
                            sortDirection={sortDirection}
                            invalidRows={invalidRows}
                            selectedRows={selectedRows}
                            handleRowSelect={handleRowSelect}
                            handleSortChange={handleSortChange}
                            fetchComplete={fetchComplete}
                            sortBy={sortBy}
                        >
                            {item !== 'checkbox' || item !== 'validation' || item !== 'context'
                                ? <FormattedMessage id={`event-sort-${item}`}/>
                                : <React.Fragment />
                            }
                        </TableHeaderCell>
                    ))}
                </tr>
            </thead>
            {/*
                since event will contain sub events, using multiple body helps break down
                the whole table into smaller sub sections with consistent styles
            */}
            {fetchComplete === true &&
                <tbody>
                    {rows.map((row, index) => (
                        <React.Fragment key={events[index].id}>
                            {row}
                        </React.Fragment>
                    ))}
                </tbody>
            }
            {fetchComplete === false &&
                <tbody>
                    <tr>
                        <td>
                            <Spinner animation="border" role="status">
                                <span className="sr-only">Loading...</span>
                            </Spinner>
                        </td>
                    </tr>
                </tbody>
            }
            <tfoot>
                <tr>
                    <CustomTablePagination
                        count={count !== null ? count : 0}
                        rowsPerPage={parseInt(pageSize)}
                        rowsPerPageOptions = {showPageSizeOptions ? pageSizeOptions : []}
                        page={paginationPage}
                        onChangePage={(event, newPage) => handlePageChange(event, newPage, tableName)}
                        onChangeRowsPerPage={(event) => handlePageSizeChange(event, tableName)}
                        labelDisplayedRows={({from, to, count}) => `${from}-${to} / ${count}`}
                        labelRowsPerPage={intl.formatMessage({id: 'table-events-per-page'})}
                        shortcutElementId={tableId}
                    />
                </tr>
            </tfoot>
        </Table>
    )
}

EventTable.defaultProps = {
    events: [],
    tableName: '',
    tableColumns: ['name', 'context', 'start_time', 'end_time', 'last_modified_time'],
    selectedRows: [],
    invalidRows: [],
    paginationPage: 0,
    sortBy: 'name',
    sortDirection: 'asc',
    pageSize: 100,
    pageSizeOptions: [10, 25, 50, 100],
    handleInvalidRows: () => {},
}

EventTable.propTypes = {
    intl: PropTypes.object,
    events: PropTypes.array,
    tableName: PropTypes.string,
    tableColumns: PropTypes.arrayOf(PropTypes.oneOf(TABLE_COLUMNS)),
    count: PropTypes.number,
    selectedRows: PropTypes.array,
    invalidRows: PropTypes.array,
    handleRowSelect: PropTypes.func,
    handleInvalidRows: PropTypes.func,
    handleSortChange: PropTypes.func,
    handlePageChange: PropTypes.func,
    handlePageSizeChange: PropTypes.func,
    paginationPage: PropTypes.number,
    sortBy: PropTypes.string,
    sortDirection: PropTypes.string,
    pageSize: PropTypes.number,
    pageSizeOptions: PropTypes.array,
    fetchComplete: PropTypes.bool,
    tableCaption: PropTypes.string,
}
export {EventTable as UnconnectedEventTable}
export default injectIntl(EventTable)
