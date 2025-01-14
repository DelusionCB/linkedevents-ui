import React, {Fragment} from 'react'
import {connect} from 'react-redux'
import EventDetails from 'src/components/EventDetails'
import moment from 'moment'
import PropTypes from 'prop-types'
import {FormattedMessage, injectIntl, intlShape} from 'react-intl'
import {Button} from 'reactstrap';
import {Helmet} from 'react-helmet';
import Spinner from 'react-bootstrap/Spinner'
import {push} from 'connected-react-router'
import {replaceData as replaceDataAction} from 'src/actions/editor.js'
import {confirmAction, setFlashMsg as setFlashMsgAction} from 'src/actions/app.js'
import {getStringWithLocale} from 'src/utils/locale'
import {mapAPIDataToUIFormat} from 'src/utils/formDataMapping.js'
import client from '../../api/client'
import constants from 'src/constants'
import {get} from 'lodash'
import {EventQueryParams, fetchEvent} from '../../utils/events'
import {getBadge, scrollToTop} from '../../utils/helpers'

import './index.scss'
import EventActionButton from '../../components/EventActionButton/EventActionButton'
import {getOrganizationAncestors, hasOrganizationWithRegularUsers} from '../../utils/user'
import CONSTANTS from '../../constants'

const {
    USER_TYPE,
    PUBLICATION_STATUS,
    EVENT_STATUS,
    SUPER_EVENT_TYPE_UMBRELLA,
    SUPER_EVENT_TYPE_RECURRING,
    EVENT_TYPE,
} = constants

class EventPage extends React.Component {

    state = {
        event: {},
        superEvent: {},
        subEvents: [],
        // loading is true initially because we always fetch event data when the component is mounted
        loading: true,
        publisher: null,
    }

    componentDidMount() {
        // oidc isn't currently loading a user.
        if (!this.props.auth.isLoadingUser) {
            this.fetchEventData()
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {event} = this.state
        const {auth, isFetchingUser, user, match} = this.props;

        const publisherId = get(event, 'publisher')
        const oldPublisherId = get(prevState, ['event', 'publisher'])
        const eventId = get(match, ['params', 'eventId'])
        const oldEventId = get(prevProps, ['match', 'params', 'eventId'])

        if (eventId !== oldEventId && !isFetchingUser) {
            this.fetchEventData()
        }

        // refresh event data when user changes to handle data behind permissions
        if (prevProps.isFetchingUser && !isFetchingUser && prevProps.user !== user){
            this.fetchEventData()
        }
        // previously oidc was loading the user but is no longer loading, no oidc user exists, and we aren't fetching one from the backend.
        if (prevProps.auth.isLoadingUser && !auth.isLoadingUser && !auth.user && !isFetchingUser) {
            this.fetchEventData()
        }

        if (publisherId && publisherId !== oldPublisherId) {
            client.get(`organization/${publisherId}`)
                .then(response => this.setState({publisher: response.data}))
            getOrganizationAncestors(publisherId)
                .then(response => this.setState(state => ({
                    ...state,
                    event: {...state.event, publisherAncestors: response.data.data},
                })))
        }
    }

    /**
     * Fetches the event, sub event and super event data
     */
    fetchEventData = async () => {
        const eventId = get(this.props, ['match', 'params', 'eventId'])

        if (!eventId) {
            return
        }

        this.setState({loading: true})

        const queryParams = new EventQueryParams()
        queryParams.include = 'keywords,location,audience,in_language,external_links,sub_events,offers'

        try {
            try {
                const eventData = await fetchEvent(eventId, queryParams, true)
                const [event, subEvents, superEvent] = eventData

                this.setState({event, subEvents, superEvent})
            } finally {
                this.setState({loading: false})
            }
        } catch (error) {
            this.props.routerPush('/404')
            scrollToTop()
        }
    }

    /**
     * Opens the editor with the event data in given mode
     * @param mode  Whether event is copied as a template or being updated. Can be 'copy', 'update' or 'add'
     */
    openEventInEditor = (mode = 'update') => {
        const {replaceData, routerPush} = this.props
        const {event} = this.state
        let route;
        if (mode === 'addRecurring') {
            route = `${event.id}/recurring/add/`

        } else if (mode === 'copy') {
            route =  'create/new'
        } else {
            route = `update/${event.id}`
        }
        if (mode === 'addRecurring') {
            replaceData(event, true)
        } else {
            replaceData(event)
        }
        routerPush(`/event/${route}`)
        scrollToTop()
    }

    /**
     * Returns the publisher & creator info text
     * @returns {null|*}
     */
    getPublishedText = () => {
        const {event, publisher} = this.state

        if (!publisher) {
            return null
        }

        const createdBy = get(event, 'created_by')
        const publishedAt = moment(event.last_modified_time).format('D.M.YYYY HH:mm')
        let creator, email

        if (createdBy) {
            [creator, email] = createdBy.split(' - ')
        }

        return (
            <span>
                <FormattedMessage id="event-publisher-info" values={{publisher: publisher.name}}/>
                {creator && email &&
                <React.Fragment>
                    <span> | {creator} | </span>
                    <a href={`mailto:${email}`}>{email}</a>
                </React.Fragment>
                }
                <span> | {publishedAt}</span>
            </span>
        )
    }

    /**
     * Returns a div containing all the action buttons for the view
     * @param {string} idPrefix - optional string that is used as a prefix for the buttons id
     * @returns {*}
     */
    getEventActions = (idPrefix) => {
        const {user} = this.props
        const {event, loading} = this.state
        const userType = get(user, 'userType')
        const isDraft = event.publication_status === PUBLICATION_STATUS.DRAFT
        const isAdmin = [USER_TYPE.ADMIN, USER_TYPE.SUPERADMIN].includes(userType)
        const isRegularUser = userType === USER_TYPE.REGULAR
        const isRecurring = event.super_event_type === SUPER_EVENT_TYPE_RECURRING
        const editEventButton = this.getActionButton('edit', idPrefix,this.openEventInEditor, false)
        const addRecurringButton = this.getActionButton('add',idPrefix, () => this.openEventInEditor('addRecurring'), false)
        const publishEventButton = this.getActionButton('publish', idPrefix)
        const postponeEventButton = this.getActionButton('postpone', idPrefix)
        const cancelEventButton = this.getActionButton('cancel',idPrefix)
        const deleteEventButton = this.getActionButton('delete', idPrefix)

        if (loading) {
            return <div />
        }
        return <div className="event-actions">
            <div className="cancel-delete-btn">
                {postponeEventButton}
                {cancelEventButton}
                {deleteEventButton}
            </div>
            <div className="edit-copy-btn">
                {(isAdmin || isRegularUser) && isDraft && publishEventButton}
                {editEventButton}
                {isRecurring && addRecurringButton}
                <Button
                    variant="contained"
                    disabled={loading || !user}
                    onClick={() => this.openEventInEditor('copy')}
                >
                    {user
                        ? <FormattedMessage id="copy-event-to-draft">{txt =>txt}</FormattedMessage>
                        : <FormattedMessage id='user-no-rights-copy'>{txt => txt}</FormattedMessage>
                    }
                </Button>
            </div>
        </div>
    }

    /**
     * Returns a button for the given action
     * @param {string} action        Action to run
     * @param {string} [idPrefix] optional string that is used as a prefix for the buttons id
     * @param {function} [customAction]  Custom action that should be run instead of the default one
     * @param {boolean} [confirm]       Whether confirmation modal should be shown before running action
     * @returns {*}
     */
    getActionButton = (action, idPrefix, customAction, confirm = true,) => {
        const {event, subEvents, superEvent, loading} = this.state
        const {intl} = this.props;

        return <EventActionButton
            action={action}
            confirmAction={confirm}
            customAction={customAction}
            event={event}
            loading={loading}
            runAfterAction={this.handleConfirmedAction}
            subEvents={subEvents}
            superEvent={superEvent}
            intl={intl}
            idPrefix={idPrefix}
        />
    }

    handleConfirmedAction = (action, event) => {
        const {routerPush, user, setFlashMsg} = this.props;
        const isDraft = event.publication_status === PUBLICATION_STATUS.DRAFT
        const EVENT_CREATION = CONSTANTS.EVENT_CREATION

        // navigate to moderation if an admin deleted a draft event, otherwise navigate to event listing
        if (action === 'delete') {
            setFlashMsg(EVENT_CREATION.DELETE_SUCCESS, 'success', {sticky: false})

            if (isDraft && hasOrganizationWithRegularUsers(user)) {
                routerPush('/moderation')
            } else {
                routerPush('/')
            }
        }
        // re-fetch event data after cancel, postpone or publish action
        if (action === 'cancel' || action === 'publish' ||  action === 'postpone' ) {
            if(action === 'cancel'){
                setFlashMsg(EVENT_CREATION.CANCEL_SUCCESS, 'success', {sticky: false})
            }
            else if(action === 'publish'){
                setFlashMsg(EVENT_CREATION.PUBLISH_SUCCESS, 'success', {sticky: false})
            }
            else if(action === 'postpone'){
                setFlashMsg(EVENT_CREATION.UPDATE_SUCCESS, 'success', {sticky: false})
            }
            this.fetchEventData()
        }
    }

    render() {
        const {event, superEvent, loading, publisher} = this.state
        const {editor, intl, userLocale} = this.props
        const formattedEvent = mapAPIDataToUIFormat(this.state.event)
        const isUmbrellaEvent = event.super_event_type === SUPER_EVENT_TYPE_UMBRELLA
        const isRecurringEvent = event.super_event_type === SUPER_EVENT_TYPE_RECURRING
        const isDraft = event.publication_status === PUBLICATION_STATUS.DRAFT
        const isCancelled = event.event_status === EVENT_STATUS.CANCELLED
        const isPostponed = event.event_status === EVENT_STATUS.POSTPONED
        const isEvent = event.type_id === EVENT_TYPE.GENERAL
        const isCourses = event.type_id === EVENT_TYPE.COURSE
        const isHobby = event.type_id === EVENT_TYPE.HOBBIES
        const publishedText = this.getPublishedText();
        const eventName = getStringWithLocale(event, 'name', userLocale.locale)
        const title = eventName ? eventName : intl.formatMessage({id: 'event-page-default-title'})
        const pageTitle = `Linkedevents - ${title}`

        return (
            <Fragment>
                <div className="event-page container">
                    <Helmet title={pageTitle}/>
                    <header>
                        <h1>
                            {loading
                                ? <Spinner animation="border" role="status">
                                    <span className="sr-only">Loading...</span>
                                </Spinner>
                                : getStringWithLocale(event, 'name')
                            }
                        </h1>
                        {!loading &&
                        <h2 className='event-info'>
                            {isPostponed && getBadge('postponed', 'medium')}
                            {isCancelled && getBadge('cancelled', 'medium')}
                            {isDraft && getBadge('draft', 'medium')}
                            {isUmbrellaEvent && getBadge('umbrella', 'medium')}
                            {isRecurringEvent && getBadge('series', 'medium')}
                            {isEvent && getBadge('event', 'medium')}
                            {isCourses && getBadge('courses', 'medium')}
                            {isHobby && getBadge('hobby', 'medium')}
                            <hr aria-hidden />
                        </h2>
                        }
                    </header>
                    {this.getEventActions('top')}
                    <div className="published-information">
                        {publishedText}
                    </div>
                    {!loading &&
                        <EventDetails
                            values={formattedEvent}
                            superEvent={superEvent}
                            rawData={event}
                            publisher={publisher}
                            editor={editor}
                        />
                    }
                </div>
                <div className='event-action-buttons'>
                    {this.getEventActions('bottom')}
                </div>
            </Fragment>
        )
    }
}

EventPage.propTypes = {
    intl: intlShape.isRequired,
    editor: PropTypes.object,
    user: PropTypes.object,
    match: PropTypes.object,
    events: PropTypes.object,
    setFlashMsg: PropTypes.func,
    superEvent: PropTypes.object,
    subEvents: PropTypes.object,
    loading: PropTypes.bool,
    replaceData: PropTypes.func,
    routerPush: PropTypes.func,
    confirm: PropTypes.func,
    userLocale: PropTypes.object,
    auth: PropTypes.object,
    isFetchingUser: PropTypes.bool,
}

const mapStateToProps = (state) => ({
    user: state.user.data,
    editor: state.editor,
    userLocale: state.userLocale,
    auth: state.auth,
    isFetchingUser: state.user.isFetchingUser,
})

const mapDispatchToProps = (dispatch) => ({
    replaceData: (event, recurring) => dispatch(replaceDataAction(event, recurring)),
    routerPush: (url) => dispatch(push(url)),
    confirm: (msg, style, actionButtonLabel, data) => dispatch(confirmAction(msg, style, actionButtonLabel, data)),
    setFlashMsg: (id, status, data) => dispatch(setFlashMsgAction(id, status, data)),
})

export {EventPage as UnconnectedEventPage}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(EventPage))
