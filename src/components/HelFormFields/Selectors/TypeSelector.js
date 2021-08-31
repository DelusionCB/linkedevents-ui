import PropTypes from 'prop-types';
import React from 'react'
import {setData} from '../../../actions/editor'
import {injectIntl} from 'react-intl'
import {get} from 'lodash'
import SelectorRadio from './SelectorRadio';
import constants from '../../../constants'

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
        const {event:{type_id}} = this.props
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
            && editedEventTypeIsEvent) || (updatedIsCreateView && values.type_id === EVENT_TYPE.GENERAL)
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
            && editedEventTypeIsHobby) || (updatedIsCreateView && values.type_id === EVENT_TYPE.HOBBIES)
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
     * if value === 'event', set state.isUmbrellaEvent: true, state.hasUmbrellaEvent: false and set empty obj to state.selectedUmbrellaEvent.
     * finally dispatch setData(super_event_type: 'umbrella') and clearValue( 'super_event','sub_event_type')
     *
     * 'courses'
     * if value === 'has_umbrella', set state.hasUmbrellaEvent: true, state.isUmbrellaEvent: false
     * if event.super_event_type !== 'recurring', dispatch clearValue('sub_event_type')
     *
     * 'hobby'
     * if value === 'is_independent', set state.isUmbrellaEvent & state.hasUmbrellaEvent: false and set empty obj to state.selectedUmbrellaEvent
     * if event.super_event_type !== 'recurring', dispatch clearValue('super_event', 'sub_event_type')
     * else dispatch clearValue('super_event_type')
     * @param event Event
     */
    handleCheck = event => {
        const {value} = event.target
        let states = {}
        const typeId = {}
        if (value === 'event') {
            states = {type: 'event'};
            typeId.type_id = EVENT_TYPE.GENERAL
        }
        /*
        This section should be enabled when there is support for courses
        else if (value === 'courses') {
            states = {type: 'courses'};
            typeId.type_id = EVENT_TYPE.COURSE
        }
         */
        else if (value === 'hobby') {
            states = {type: 'hobby'};
            typeId.type_id = EVENT_TYPE.HOBBIES
        }
        this.context.dispatch(setData(typeId))
        this.setState(states);
    }


    render() {
        const {type, isCreateView} = this.state

        return (
            <div className="type-row row">
                <div className="col-sm-6">
                    <div className='custom-control-radio'>
                        <SelectorRadio
                            ariaLabel={this.context.intl.formatMessage({id: `event`})}
                            value='event'
                            checked={type === 'event'}
                            handleCheck={this.handleCheck}
                            messageID='event'
                            disabled={!isCreateView}
                            name='TypeGroup'
                        >

                        </SelectorRadio>
                        {/*
                        This section should be enabled when there is support for courses
                        <SelectorRadio
                            ariaLabel={this.context.intl.formatMessage({id: `courses`})}
                            value='courses'
                            checked={type === 'courses'}
                            disabled={!isCreateView}
                            handleCheck={this.handleCheck}
                            messageID='courses'
                            name='TypeGroup'
                        >
                        </SelectorRadio>
                        */}
                        <SelectorRadio
                            ariaLabel={this.context.intl.formatMessage({id: `hobby`})}
                            value='hobby'
                            checked={type === 'hobby'}
                            disabled={!isCreateView}
                            handleCheck={this.handleCheck}
                            messageID='hobby'
                            name='TypeGroup'
                        >
                        </SelectorRadio>
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
}

TypeSelector.contextTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
    store: PropTypes.object,
};
export {TypeSelector as UnconnectedTypeSelector}
export default injectIntl(TypeSelector)
