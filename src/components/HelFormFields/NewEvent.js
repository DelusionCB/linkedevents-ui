import './NewEvent.scss'
import PropTypes from 'prop-types';
import React, {useRef} from 'react'
import CustomDateTime from '../CustomFormFields/Dateinputs/CustomDateTime';
import {connect} from 'react-redux'
import {deleteSubEvent as deleteSubEventAction} from 'src/actions/editor'
import {FormattedMessage, injectIntl} from 'react-intl';

const NewEvent = ({event, eventKey, errors, deleteSubEvent, intl, setInitialFocus, length, localeType}) => {
    return (
        <div className="new-sub-event row">
            <div className="col-auto">
                <FormattedMessage id="event-sub-count" values={{count: length}}>{txt => <h4>{txt}</h4>}</FormattedMessage>
            </div>
            <div className="new-sub-event--inputs col-12 order-last">
                <CustomDateTime
                    id={'start_time' + eventKey}
                    name="start_time"
                    labelDate={<FormattedMessage  id={`${localeType}-starting-datelabel`} />}
                    labelTime={<FormattedMessage  id="event-starting-timelabel" />}
                    defaultValue={event.start_time}
                    eventKey={eventKey}
                    validationErrors={errors['start_time']}
                    required={true}
                    setInitialFocus={setInitialFocus}
                />
                <CustomDateTime
                    disablePast
                    id={'end_time' + eventKey}
                    name="end_time"
                    labelDate={<FormattedMessage  id={`${localeType}-ending-datelabel`} />}
                    labelTime={<FormattedMessage  id="event-ending-timelabel" />}
                    defaultValue={event.end_time}
                    eventKey={eventKey}
                    validationErrors={errors['end_time']}
                />
            </div>
            <button
                className="new-sub-event--delete col-auto"
                onClick={() => deleteSubEvent(eventKey)}
                aria-label={intl.formatMessage({id: `event-delete-recurring`})}
            >
                <span id="sub-event-del-icon" className="glyphicon glyphicon-trash" aria-hidden="true"/>
            </button>
            <div className="w-100"/>
        </div>
    )

}

CustomDateTime.defaultProps = {
    setDirtyState: () => {},
}

NewEvent.propTypes = {
    event: PropTypes.object.isRequired,
    eventKey: PropTypes.string.isRequired,
    errors: PropTypes.object,
    deleteSubEvent: PropTypes.func,
    intl: PropTypes.object,
    setInitialFocus: PropTypes.bool,
    length: PropTypes.number,
    localeType: PropTypes.string,
}


const mapDispatchToProps = (dispatch) => ({
    deleteSubEvent: (eventKey) => dispatch(deleteSubEventAction(eventKey)),
})

export default connect(null, mapDispatchToProps)(injectIntl(NewEvent));
