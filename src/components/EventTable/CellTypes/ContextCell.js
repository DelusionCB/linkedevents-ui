import React from 'react';
import PropTypes from 'prop-types';
import {getBadge} from 'src/utils/helpers';
import constants from '../../../constants';
import getContentLanguages from 'src/utils/language'
import {Badge} from 'reactstrap';

class ContextCell extends React.Component {
    constructor(props) {
        super(props);
    }

    /**
     * Returns object containing event status
     * @returns {{umbrella: boolean, series: boolean, draft: boolean, cancelled: boolean, postponed: boolean}}
     */
    getEventStatus() {
        const {event, isSuperEvent, superEventType} = this.props;

        return {
            draft: event.publication_status === constants.PUBLICATION_STATUS.DRAFT,
            cancelled: event.event_status === constants.EVENT_STATUS.CANCELLED,
            postponed: event.event_status === constants.EVENT_STATUS.POSTPONED,
            umbrella: isSuperEvent  && superEventType === constants.SUPER_EVENT_TYPE_UMBRELLA,
            series: isSuperEvent && superEventType === constants.SUPER_EVENT_TYPE_RECURRING,
        };
    }

    /**
     * Returns object containing event type
     * @returns {{isCourses: boolean, isHobby: boolean, isEvent: boolean}}
     */
    getEventType() {
        const {event} = this.props;
        return {
            isEvent: event.type_id === 1,
            isCourse: event.type_id === 2,
            isHobby: event.type_id === 4,
        }}

    render() {
        const {
            event,
        } = this.props;
        const eventStatus = this.getEventStatus();
        const eventType = this.getEventType();
        const inLanguages = getContentLanguages(event);
        const eventLanguages = inLanguages.map((in_languages, index) => {
            return(
                <Badge className='languageBadge' role='img' aria-label={this.context.intl.formatMessage({id: `language-label.${in_languages}`})} key={index}>
                    {in_languages}
                </Badge>)});

        return (
            <td >
                <div className='contextCell'>
                    {eventStatus.postponed && getBadge('postponed')}
                    {eventStatus.cancelled && getBadge('cancelled')}
                    {eventStatus.draft && getBadge('draft')}
                    {eventStatus.umbrella && getBadge('umbrella')}
                    {eventStatus.series && getBadge('series')}
                    {eventType.isEvent && getBadge('event', 'medium')}
                    {eventType.isCourse && getBadge('courses', 'medium')}
                    {eventType.isHobby && getBadge('hobby', 'medium')}
                    {eventLanguages}
                </div>
            </td>
        );
    }
}

ContextCell.propTypes = {
    event: PropTypes.object,
    isSuperEvent: PropTypes.bool,
    superEventType: PropTypes.oneOf([
        constants.SUPER_EVENT_TYPE_RECURRING,
        constants.SUPER_EVENT_TYPE_UMBRELLA,
    ]),
};
ContextCell.contextTypes = {
    intl: PropTypes.object,
}

export default ContextCell;
