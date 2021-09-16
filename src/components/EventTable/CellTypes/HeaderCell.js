import React from 'react';
import PropTypes from 'prop-types';
import constants from 'src/constants';
import classNames from 'classnames';
const {TABLE_COLUMNS} = constants;

class HeaderCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
        }
        this.handleSort = this.handleSort.bind(this);
    }

    handleSort() {
        this.props.handleSortChange(this.props.name, this.props.tableName);
        this.setState({isActive: !this.state.isActive});
    }

    render() {
        const {name, sortDirection, active, children} = this.props;
        const cellClassNames = classNames(
            'table-header', {
                'validation-header': name === 'validation',
                'context-header': name === 'context',
            });

        return(
            <React.Fragment>
                {(name === 'context' || name === 'validation' || name === 'checkbox') &&
                <th className={cellClassNames}>
                    {children}
                </th>
                }
                {name !== 'checkbox' && name !== 'validation' && name !== 'context' &&
                <th className={cellClassNames}>
                    <div aria-sort={sortDirection} onClick={this.handleSort}>
                        {children}
                        {active && sortDirection === 'asc' &&
                            <span className='glyphicon glyphicon-arrow-up' />
                        }
                        {active && sortDirection === 'desc' &&
                            <span className='glyphicon glyphicon-arrow-down' />
                        }
                    </div>
                </th>
                }
            </React.Fragment>
        )
    }
}

HeaderCell.contextTypes = {
    intl: PropTypes.object,
};
HeaderCell.propTypes = {
    fetchComplete: PropTypes.bool,
    children: PropTypes.element,
    isActive: PropTypes.func,
    sortDirection: PropTypes.string,
    name: PropTypes.oneOf(TABLE_COLUMNS),
    tableName: PropTypes.string,
    events: PropTypes.array,
    invalidRows: PropTypes.array,
    selectedRows: PropTypes.array,
    handleSortChange: PropTypes.func,
    direction: PropTypes.string,
    active: PropTypes.bool,
};
HeaderCell.defaultProps = {
    events: [],
    invalidRows: [],
    selectedRows: [],
};

export default HeaderCell
