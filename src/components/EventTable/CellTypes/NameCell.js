import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {getEventName} from 'src/utils/events';
import constants from '../../../constants';
class NameCell extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        const {
            event,
            nestLevel,
            isSuperEvent,
            hasSubEvents,
            showSubEvents,
            toggleSubEvent,
        } = this.props;
        const locale = this.context.intl.locale;
        const name = getEventName(event, locale);

        const indentationStyle = {
            paddingLeft: `${nestLevel * 24}px`,
            fontWeight: nestLevel === 1 && isSuperEvent ? 'bold' : 'normal',
        };
        const expandArrow = showSubEvents ? 'glyphicon glyphicon-chevron-down' : 'glyphicon glyphicon-chevron-right'
        const expandAriaLabel = showSubEvents ? 'eventtable-close' : 'eventtable-expand'

        return (
            <td style={indentationStyle}>
                <div className='nameCell'>
                    <Link to={`/event/${event.id}`}>{name}</Link>

                    {isSuperEvent && hasSubEvents &&
                    <button
                        aria-label={this.context.intl.formatMessage({id: expandAriaLabel})}
                        className='sub-event-toggle tag-space'
                        onClick={toggleSubEvent}
                        aria-expanded={showSubEvents}
                    >
                        <span className={expandArrow} />
                    </button>
                    }
                </div>
            </td>
        );
    }
}

NameCell.propTypes = {
    event: PropTypes.object,
    nestLevel: PropTypes.number,
    isSuperEvent: PropTypes.bool,
    superEventType: PropTypes.oneOf([
        constants.SUPER_EVENT_TYPE_RECURRING,
        constants.SUPER_EVENT_TYPE_UMBRELLA,
    ]),
    hasSubEvents: PropTypes.bool,
    showSubEvents: PropTypes.bool,
    toggleSubEvent: PropTypes.func,
};
NameCell.contextTypes = {
    intl: PropTypes.object,
}

export default NameCell;
