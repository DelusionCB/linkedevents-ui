import PropTypes from 'prop-types';
import React from 'react'
import {clearValue, setData} from '../../../actions/editor'
import {FormattedMessage, injectIntl} from 'react-intl'
import {get} from 'lodash'
import SelectorRadio from './SelectorRadio';
import constants from '../../../constants'
import {confirmAction} from '../../../actions/app';

const {
    EVENT_TYPE,
} = constants

class TypeSelector extends React.Component {

    state = {
        isCreateView: false,
        type: '',
    }

    componentDidMount() {
        this.handleMount()
    }

    componentDidUpdate(prevProps, prevState) {
        this.handleUpdate(prevState)
    }


    handleMount = () => {
        const {event:{type_id},editor:{values}} = this.props
        const editedEventTypeIsEvent = type_id === EVENT_TYPE.GENERAL
        //const editedEventTypeIsCourse = type_id === 'Course'
        const editedEventTypeIsHobby = type_id === EVENT_TYPE.HOBBIES
        let type = ''
        if (editedEventTypeIsEvent) {
            type = 'event'
        }
        /*
        This section should be enabled when there is support for courses
        if (editedEventTypeIsCourse) {
            type = 'courses'
        }
         */
        if (editedEventTypeIsHobby) {
            type = 'hobby'
        }
        this.setState({type: type})
    }

    /**
     * Handles the updating of the state based on changes.
     * @param prevState Previous state
     */
    handleUpdate = (prevState = {}) => {
        const {type, isCreateView} = this.state
        const {router} = this.context.store.getState()
        const {editor:{values}, event} = this.props

        // object containing the updated states
        let stateToSet = {}

        // whether we are creating a new event. used to help determine the radio disabled state
        const updatedIsCreateView = get(router, ['location' ,'pathname'], '').includes('/event/create/new')
        const creatingNewSubEvent = get(router, ['location', 'pathname'], '').includes('/recurring/add/')
        const superEventIsNotNull = get(event, 'super_event_type') !== null
        const editedEventTypeIsEvent = get(event, 'type_id') === EVENT_TYPE.GENERAL
        //const editedEventTypeIsCourse = get(event, 'type_id') === EVENT_TYPE.COURSE
        const editedEventTypeIsHobby = get(event, 'type_id') === EVENT_TYPE.HOBBIES

        // update the isCreateView according to whether we're creating a new event or updating an existing one
        if (updatedIsCreateView !== isCreateView) {
            stateToSet.isCreateView = updatedIsCreateView
        }

        if(updatedIsCreateView && superEventIsNotNull && !values.type_id && type === '') {
            stateToSet.type = 'event'
            this.context.dispatch(setData({type_id: EVENT_TYPE.GENERAL}))
        }

        if ((!updatedIsCreateView
            && editedEventTypeIsEvent) || (updatedIsCreateView && values.type_id === EVENT_TYPE.GENERAL) ||
            (creatingNewSubEvent && values.type_id === EVENT_TYPE.GENERAL)
        ) {
            stateToSet.type = 'event'
        }
        /*
        This section should be enabled when there is support for courses
        if (!updatedIsCreateView
            && editedEventTypeIsCourse) {
            stateToSet.type = 'courses'
        }
         */
        if ((!updatedIsCreateView
            && editedEventTypeIsHobby) || (updatedIsCreateView && values.type_id === EVENT_TYPE.HOBBIES) ||
            (creatingNewSubEvent && values.type_id === EVENT_TYPE.HOBBIES)
        ) {
            stateToSet.type = 'hobby'
        }

        if (Object.keys(stateToSet).length > 0 && type === '') {
            this.setState({...prevState,...stateToSet})
        }
    }


    /**
     * Handles radio changes
     * 'event'
     * if value === 'event', set typeId.type_id to constants.EVENT_TYPE.GENERAL & set states.type to {@param event.target.value}
     *
     * 'hobby'
     * if value === 'hobby', set typeId.type_id to constants.EVENT_TYPE.HOBBIES & set states.type to {@param event.target.value}
     *
     * @param event Event
     */
    handleTypeChange = event => {
        const {value} = event.target
        const {editor:{values}} = this.props;

        let checkValues = [values.keywords, values.enrolment_url, values.enrolment_start_time,
            values.enrolment_end_time, values.minimum_attendee_capacity,
            values.maximum_attendee_capacity]
        // Falsy values are filtered
        checkValues = checkValues.filter(val => val);
        // Keys used for clearing values from editor.values
        const clearValueKeys = ['keywords' ,'enrolment_url', 'enrolment_start_time',
            'enrolment_end_time', 'minimum_attendee_capacity', 'maximum_attendee_capacity']

        const content = {}
        const valuesToClear = []
        let additionalMsg
        if (value === 'event') {
            content.type_id = EVENT_TYPE.GENERAL;
            content.type = value;
            // If checkValues has length more than 0, push keys to clear and strings for modal
            if (checkValues.length > 0) {
                valuesToClear.push(...clearValueKeys);
                additionalMsg = <FormattedMessage id='event-type-switch' />
            }
        }
        /*
        else if (value === 'courses') {
        typeId.type_id = EVENT_TYPE.COURSES
        states.type = value
        }
         */
        else if (value === 'hobby') {
            content.type_id = EVENT_TYPE.HOBBIES
            content.type = value
            // If checkValues includes values.keywords, push keys[0] to clear and strings for modal
            if (checkValues.includes(values.keywords)) {
                valuesToClear.push(clearValueKeys[0])
                additionalMsg = <FormattedMessage id='hobby-type-switch' />

            }
        }
        // If valuesToClear has length over 0, push confirmActionProps & values for action
        if (valuesToClear.length > 0) {
            this.context.dispatch(confirmAction('confirm-type-switch', 'warning', 'switch-type', {
                action: (e) => {
                    this.context.dispatch(setData({type_id: content.type_id}));
                    this.context.dispatch(clearValue(valuesToClear));
                    this.setState({type: content.type});
                },
                additionalMsg: additionalMsg,
                additionalMarkup: ' ',
            }));
            // Else proceed with dispatching data & setting state
        } else {
            this.context.dispatch(setData({type_id: content.type_id}));
            this.setState({type: content.type});
        }
    }

    getSelectors = (value = '') => {
        const {type, isCreateView} = this.state
        const {disabled} = this.props;
        return (
            <SelectorRadio
                ariaLabel={this.context.intl.formatMessage({id: value})}
                value={value}
                checked={type === value}
                handleCheck={this.handleTypeChange}
                messageID={value}
                disabled={disabled || !isCreateView}
                name='TypeGroup'
            >
            </SelectorRadio>
        )
    }


    render() {
        return (
            <div className="type-row row">
                <div className="col-sm-6">
                    <div className='custom-control-radio'>
                        {this.getSelectors('event')}
                        {this.getSelectors('hobby')}
                    </div>
                </div>
            </div>
        )
    }
}

TypeSelector.propTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
    store: PropTypes.object,
    editor: PropTypes.object,
    event: PropTypes.object,
    isCreateView: PropTypes.bool,
    isUmbrellaEvent: PropTypes.bool,
    hasUmbrellaEvent: PropTypes.bool,
    editedEventIsSubEvent: PropTypes.bool,
    disabled: PropTypes.bool,
}

TypeSelector.contextTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
    store: PropTypes.object,
};

export {TypeSelector as UnconnectedTypeSelector}
export default injectIntl(TypeSelector);
