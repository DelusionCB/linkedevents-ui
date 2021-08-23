import React from 'react';
import PropTypes from 'prop-types';
import {getEventName} from 'src/utils/events';

class CheckBoxCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isChecked: false,
        }
        this.handleRowSelection = this.handleRowSelection.bind(this);
    }

    handleRowSelection() {
        const {event, tableName} = this.props;
        const notStateCheck = !this.state.isChecked;
        this.props.onChange(notStateCheck, event.id, tableName);
        this.setState({isChecked : !this.state.isChecked});
    }

    render() {
        const {checked, disabled, event, isInvalid, subNumber} = this.props;
        const locale = this.context.intl.locale;
        const invalidEvent = isInvalid ? 'table-events-checkbox-invalid' : 'table-events-checkbox'
        const superStyling = event.super_event ? {'display':'none'} : {};
        return (
            <td className='checkbox'>
                <div className='custom-control custom-checkbox' style={superStyling}>
                    <input
                        className='custom-control-input'
                        id={event.id}
                        checked={checked}
                        type='checkbox'
                        disabled={disabled}
                        onChange={this.handleRowSelection}
                    />
                    <label className='custom-control-label' htmlFor={event.id}>
                        <span className='visually-hidden'>
                            {this.context.intl.formatMessage({id: invalidEvent}, {name: getEventName(event, locale)})}
                        </span>
                    </label>
                </div>
                {event.super_event &&
                <div style={{textAlign: 'center'}}>{`${subNumber + 1 }`}</div>
                }
            </td>
        );
    }
}
CheckBoxCell.contextTypes = {
    intl: PropTypes.object,
};

CheckBoxCell.propTypes = {
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    event: PropTypes.object,
    tableName: PropTypes.string,
    isInvalid: PropTypes.bool,
    subNumber: PropTypes.number,
};

export default CheckBoxCell
