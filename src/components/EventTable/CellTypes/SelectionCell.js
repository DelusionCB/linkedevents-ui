import React from 'react';
import PropTypes from 'prop-types';

class SelectionCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isChecked: false,
        }
        this.handleRow = this.handleRow.bind(this);
    }

    handleRow() {
        const checked = !this.state.isChecked;
        this.props.handleRowSelect(checked, undefined, this.props.tableName, true);
        this.setState({isChecked: !this.state.isChecked});
    }

    render() {

        return (
            <th className='selection'>
                <div className='custom-control custom-checkbox'>
                    <input className='custom-control-input'
                        checked={this.state.isChecked}
                        type='checkbox'
                        id='allchecked'
                        onChange={this.handleRow}
                    />
                    <label className='custom-control-label' htmlFor='allchecked'>
                        <span>
                            {this.context.intl.formatMessage({id: 'table-events-checkbox-all'})}
                        </span>
                    </label>
                </div>
            </th>
        )
    }
}
SelectionCell.contextTypes = {
    intl: PropTypes.object,
};
SelectionCell.propTypes = {
    tableName: PropTypes.string,
    handleRowSelect: PropTypes.func,
};


export default SelectionCell
