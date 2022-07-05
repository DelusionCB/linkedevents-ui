import './index.scss'

import PropTypes from 'prop-types';
import React from 'react'
import {FormattedMessage} from 'react-intl'
import CopyToClipboard from 'react-copy-to-clipboard'
import {
    MultiLanguageField,
    HelTextField,
    HelLabeledCheckboxGroup,
    HelLanguageSelect,
    LocationSelect,
    HelOffersField,
    NewEvent,
    HelKeywordSelector,
} from 'src/components/HelFormFields'
import RecurringEvent from 'src/components/RecurringEvent'
import {Button, Form, FormGroup, Collapse, UncontrolledCollapse} from 'reactstrap';
import {mapKeywordSetToForm, mapLanguagesSetToForm} from '../../utils/apiDataMapping'
import {setEventData, setData, clearValue} from '../../actions/editor'
import {get, isNull, pickBy} from 'lodash'
import API from '../../api'
import CONSTANTS from '../../constants'
import OrganizationSelector from '../HelFormFields/OrganizationSelector';
import UmbrellaSelector from '../HelFormFields/Selectors/UmbrellaSelector'
import TypeSelector from '../HelFormFields/Selectors/TypeSelector'
import moment from 'moment'
import HelVideoFields from '../HelFormFields/HelVideoFields/HelVideoFields'
import CustomDateTime from '../CustomFormFields/Dateinputs/CustomDateTime'
import EventMap from '../Map/EventMap';
import classNames from 'classnames';
import ImageGallery from '../ImageGallery/ImageGallery';
import CollapseButton from './CollapseButton/CollapseButton';
import SideField from './SideField/SideField';
import HelCheckbox from '../HelFormFields/HelCheckbox';
import LoginNotification from './LoginNotification/LoginNotification'
import {getEventLanguageType} from '../../utils/locale';
import ValidationNotification from '../ValidationNotification';

let FormText = ({type = 'h2', formatId, id}) => {
    const headerElement = (content) => React.createElement(type, {className: `col-sm-12 formText-${type}`, id: id}, content)
    return(<FormattedMessage id={formatId}>{txt => headerElement(txt)}</FormattedMessage>)
}
FormText.propTypes = {
    type: PropTypes.string,
    formatId: PropTypes.string,
    id: PropTypes.string,
}

class FormFields extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectEventType: '',
            showNewEvents: true,
            showRecurringEvent: false,
            mapContainer: null,
            openMapContainer: false,
            availableLocales: [],
            headerPrices: false,
            headerSocials: false,
            headerCategories: false,
            headerInlanguage: false,
            headerCourses: false,
            headerLocationDate: false,
            headerImage: false,
            displayEvents: true,
            createdRecurringEvents: false,
        }

        this.closeRecurringEventModal = this.closeRecurringEventModal.bind(this)
        this.handleOrganizationChange = this.handleOrganizationChange.bind(this)
        this.toggleHeader = this.toggleHeader.bind(this)
    }

    componentDidMount() {
        const {action, editor} = this.props;
        const availableLanguages = editor.languages;
        const availableLocales = availableLanguages.reduce((total, lang) => [...total, lang.id], []);
        // set default value for organization if user is creating new event
        if (action === 'create') {
            this.setDefaultOrganization()
        }

        this.setState({availableLocales: availableLocales});
    }

    /**
     * If event location was previously selected and then cleared/removed,
     * this toggles openMapContainer to false -> closes the Map component.
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.editor.values.location !== null && this.props.editor.values.location === null) {
            this.setState({openMapContainer: false});
        }
        if ((Object.keys(prevProps.editor.validationErrors).length === 0) && (Object.keys(this.props.editor.validationErrors).length > 0)) {
            this.setState({headerPrices: true, headerSocials: true, headerCategories: true, headerInlanguage: true, headerLocationDate: true, headerImage: true, headerCourses: true});
        }
        // if the last sub_event of a recurring event was deleted -> toggle to single.
        if (
            prevState.selectEventType === 'recurring' &&
            Object.keys(prevProps.editor.values.sub_events).length > 0 &&
            Object.keys(this.props.editor.values.sub_events).length === 0
        ) {
            this.toggleEventType({target: {value: 'single'}})
        }

        // if recurring was previously false and is true now -> reset back to false
        if(!prevState.createdRecurringEvents && this.state.createdRecurringEvents){
            this.setState({createdRecurringEvents: false})
        }

    }

    handleSetMapContainer = (mapContainer) => {
        this.setState({mapContainer});
    }

    UNSAFE_componentWillReceiveProps() {
        this.forceUpdate()
    }

    shouldComponentUpdate() {
        return true
    }

    showRecurringEventDialog() {
        this.setState({showRecurringEvent: !this.state.showRecurringEvent})
    }

    /**
     * Closes recurring event modal
     * @param {bool} createdRecurringEvents were new events created before closing.
     */
    closeRecurringEventModal(createdRecurringEvents = false) {
        this.setState({
            showRecurringEvent: false,
            createdRecurringEvents,
        })
    }

    // Replace with more proper functionality - preferably something that will hide the button if event length == 0.
    showEventList() {
        this.setState({displayEvents: !this.state.displayEvents})
    }

    showNewEventDialog() {
        this.setState({showNewEvents: !this.state.showNewEvents})
    }

    setDefaultOrganization = () => {
        const {user} = this.props;

        if (isNull(user)) {
            return
        }

        const userType = get(user, 'userType')
        const defaultOrganizationData = get(user, [`${userType}OrganizationData`, `${user.organization}`], {})

        this.context.dispatch(setData({organization: defaultOrganizationData.id}));
    }

    handleOrganizationChange(event){
        const {value} = event.target
        event.preventDefault()
        if(value){
            this.context.dispatch(setData({organization: value}))
        }
    }

    addNewEventDialog(recurring = false) {
        let subEventKeys = Object.keys(this.props.editor.values.sub_events)
        let key = subEventKeys.length > 0 ? Math.max.apply(null, subEventKeys) + 1 : 0
        const newEventObject = {[key]: {start_time: undefined}}
        this.context.dispatch(setEventData(newEventObject, key))
        if (recurring) {
            const newObj = {[key + 1]: {start_time: undefined}}
            this.context.dispatch(setEventData(newObj, key + 1))
        }
    }

    generateNewEventFields(events, localeType) {
        const {validationErrors} = this.props.editor;
        const {createdRecurringEvents} = this.state
        const subEventErrors = {...validationErrors.sub_events} || {}
        let newEvents = []
        const keys = Object.keys(events)
        // Focus moved to last if new events are added to a recurring event.
        const focusEvent = keys.length > 1 ? keys[keys.length - 1] : keys[0];

        for (const key in events) {
            if (events.hasOwnProperty(key)) {
                newEvents.push(
                    <NewEvent
                        length={newEvents.length + 1}
                        key={key}
                        eventKey={key}
                        event={events[key]}
                        errors={subEventErrors[key] || {}}
                        setInitialFocus={createdRecurringEvents ? false : key === focusEvent}
                        localeType={localeType}
                    />
                )
            }
        }

        return newEvents
    }

    /**
     * If event location has been selected then openMapContainer state is toggled true/false
     */
    toggleMapContainer() {
        if(this.props.editor.values.location) {
            this.setState({openMapContainer: !this.state.openMapContainer})
        }
    }

    toggleHeader(e) {
        if (e.target.id) {
            this.setState({[e.target.id]: !this.state[e.target.id]})
        }
    }

    /**
     *  Change event type between single & recurring ->
     *  Depending on @params event, determine do we show start_time & end_time
     *  or sub_event related values
     */
    toggleEventType = (event) => {
        const updatedState = {
            selectEventType: event.target.value === 'single' ? '' : event.target.value,
        };
        if (event.target.value === 'single') {
            this.context.dispatch(setData({sub_events: {}}));
        } else if (event.target.value === 'recurring' && !this.state.selectEventType) {
            this.context.dispatch(clearValue(['start_time', 'end_time']));
            updatedState['createdRecurringEvents'] = true;
            this.addNewEventDialog(true);
        }
        this.setState(updatedState);
    }

    /**
    * Check that sub_events has property 'start_time' & it's not undefined
    * @param sub_events value
    * @returns boolean
    */
    subEventsContainTime(sub_events) {
        let found = false;
        if (Object.keys(sub_events).length > 0) {
            for(const key in sub_events) {
                if (sub_events[key].hasOwnProperty('start_time') && sub_events[key].start_time !== undefined) {
                    found = true;
                }
            }
        }
        return found;
    }

    trimmedDescription() {
        let descriptions = Object.assign({}, this.props.editor.values['description'])
        for (const lang in descriptions) {
            if (descriptions[lang] !== null) {
                descriptions[lang] = descriptions[lang].replace(/<\/p><p>/gi, '\n\n').replace(/<br\s*[\/]?>/gi, '\n').replace(/<p>/g, '').replace(/<\/p>/g, '').replace(/&amp;/g, '&')
            }
        }
        return descriptions
    }

    render() {
        // Changed keywordSets to be compatible with Turku's backend.
        const currentLocale = this.state.availableLocales.includes(this.context.intl.locale) ? this.context.intl.locale : 'fi';
        const helTargetOptions = mapKeywordSetToForm(this.props.editor.keywordSets, 'turku:audience', currentLocale)
        const helEventLangOptions = mapLanguagesSetToForm(this.props.editor.languages, currentLocale)

        const {event, superEvent, user, editor, uiMode} = this.props
        const {values, validationErrors, contentLanguages} = editor
        const formType = this.props.action
        const isSuperEvent = values.super_event_type === CONSTANTS.SUPER_EVENT_TYPE_RECURRING
        const isSuperEventDisable = values.super_event_type === CONSTANTS.SUPER_EVENT_TYPE_UMBRELLA
        const {VALIDATION_RULES, USER_TYPE} = CONSTANTS
        const addedEvents = pickBy(values.sub_events, event => !event['@id'])
        const currentEventType = getEventLanguageType(values['type_id'])
        const newEvents = this.generateNewEventFields(addedEvents, currentEventType)
        const maxSubEventCount = CONSTANTS.GENERATE_LIMIT.EVENT_LENGTH
        const userType = get(user, 'userType')
        const isRegularUser = userType === USER_TYPE.REGULAR
        const organizationData = get(user, `${userType}OrganizationData`, {})
        const publisherOptions = Object.keys(organizationData)
            .map(id => ({label: organizationData[id].name, value: id}))
        const subTimeDisable = this.subEventsContainTime(values['sub_events'])
        const selectedPublisher = publisherOptions.find(option => option.value === values['organization']) || {};
        const position = this.props.editor.values.location ? this.props.editor.values.location.position : null;
        const headerTextId = formType === 'update'
            ? 'edit-events'
            : 'create-events';
        // This variable is used to disable inputs if user doesn't exist.
        const userDoesNotExist = !user;

        const ariaIds = {
            type: ['type-one'],
            languages: ['lang-one', 'lang-two'],
            namedescriptions: ['namedesc-one', 'namedesc-two'],
            location: ['location-one', 'location-two'],
            umbrella: ['umbrella-one', 'umbrella-two'],
            datetime: ['datetime-one', 'datetime-two'],
            audience: ['audience-one'],
            offers: ['offers-one', 'offers-two'],
            enrolment: ['enrolment-one'],
            attendee: ['attendee-one'],
            socials: ['social-one'],
            videos: ['video-one'],
        }
        const ariaTypes = (id) => ariaIds[id].join(' ');

        return (
            <div className='mainwrapper'>
                {!this.props.user &&
                <div className='row-loginwarning'>
                    <LoginNotification />
                </div>
                }
                <div className='row row-mainheader'>
                    <FormattedMessage id={headerTextId}>{txt => <h1>{txt}</h1>}</FormattedMessage>
                </div>
                <div className="row row-header">
                    <FormattedMessage id='editor-tip-required'>{txt => <p>{txt}</p>}</FormattedMessage>
                </div>
                <div role='group' aria-labelledby={ariaTypes('type')} className='row'>
                    <FormText formatId='event-type-select' id={ariaIds.type[0]}/>
                    <TypeSelector editor={this.props.editor} event={event} disabled={userDoesNotExist}/>
                </div>
                <div role='group' aria-labelledby={ariaTypes('languages')} className="row contentlanguage-row">
                    <FormText formatId='event-presented-in-languages' id={ariaIds.languages[0]}/>
                    <FormText formatId='event-presented-in-languages2' type='p' id={ariaIds.languages[1]}/>
                    <div className="col-sm-6 highlighted-block">
                        <HelLanguageSelect
                            options={API.eventInfoLanguages()}
                            checked={contentLanguages}
                            disabled={userDoesNotExist}
                        />
                    </div>
                </div>
                <div role='group' aria-labelledby={ariaTypes('namedescriptions')} className="row event-row">
                    <FormText formatId='event-name-descriptions' id={ariaIds.namedescriptions[0]}/>
                    <FormText formatId='event-name-descriptions-tip' type='p' id={ariaIds.namedescriptions[1]}/>
                    <div className="col-sm-6">
                        <MultiLanguageField
                            id='event-headline'
                            required={true}
                            multiLine={false}
                            label="event-headline"
                            ref='name'
                            name='name'
                            type='text'
                            validationErrors={validationErrors['name']}
                            validations={[VALIDATION_RULES.SHORT_STRING]}
                            defaultValue={values['name']}
                            languages={this.props.editor.contentLanguages}
                            setDirtyState={this.props.setDirtyState}
                            disabled={userDoesNotExist}
                            forceApplyToStore
                        />

                        <MultiLanguageField
                            id='event-short-description'
                            required={true} multiLine={true}
                            label="event-short-description"
                            ref="short_description"
                            name="short_description"
                            validationErrors={validationErrors['short_description']}
                            defaultValue={values['short_description']}
                            languages={this.props.editor.contentLanguages}
                            validations={[VALIDATION_RULES.SHORT_STRING]}
                            setDirtyState={this.props.setDirtyState}
                            forceApplyToStore
                            type='textarea'
                            disabled={userDoesNotExist}
                        />
                        <MultiLanguageField
                            id='event-description'
                            multiLine={true}
                            label="event-description"
                            ref="description"
                            name="description"
                            validationErrors={validationErrors['description']}
                            defaultValue={this.trimmedDescription()}
                            languages={this.props.editor.contentLanguages}
                            validations={[VALIDATION_RULES.LONG_STRING]}
                            setDirtyState={this.props.setDirtyState}
                            type='textarea'
                            disabled={userDoesNotExist}
                            forceApplyToStore
                        />
                        <OrganizationSelector
                            formType={formType}
                            options={publisherOptions}
                            selectedOption={selectedPublisher}
                            onChange={this.handleOrganizationChange}
                            labelOrg={`${currentEventType}-provider`}
                        />
                        <MultiLanguageField
                            id='event-provider-input'
                            required={false}
                            multiLine={false}
                            label={`${currentEventType}-provider-input`}
                            ref="provider"
                            name="provider"
                            validationErrors={validationErrors['provider']}
                            defaultValue={values['provider']}
                            validations={[VALIDATION_RULES.SHORT_STRING]}
                            languages={this.props.editor.contentLanguages}
                            setDirtyState={this.props.setDirtyState}
                            type='textarea'
                            disabled={userDoesNotExist}
                            forceApplyToStore
                        />
                    </div>
                </div>

                <div>
                    <h2>
                        <CollapseButton
                            id='headerLocationDate'
                            isOpen={this.state.headerLocationDate}
                            isRequired={true}
                            targetCollapseNameId='event-locationDate-form-header'
                            toggleHeader={this.toggleHeader}
                            validationErrorList={[
                                validationErrors['start_time'],
                                validationErrors['virtualevent_url'], validationErrors['end_time'],
                                validationErrors['location'], validationErrors['location_extra_info'],
                                validationErrors['sub_events']]}
                        />
                    </h2>
                    <Collapse isOpen={this.state.headerLocationDate}>
                        <div role='group' aria-labelledby={ariaTypes('location')} className="row location-row">
                            <FormText formatId='event-location-form-header' id={ariaIds.location[0]}/>
                            <SideField type='location' id={ariaIds.location[1]} />
                            <div className="col-sm-6 hel-select">
                                <div>
                                    <HelCheckbox
                                        name='is_virtualevent'
                                        label={<FormattedMessage id={`${currentEventType}-location-virtual`}/>}
                                        fieldID='is_virtual'
                                        defaultChecked={values['is_virtualevent']}
                                        disabled={userDoesNotExist}
                                    />
                                    <HelTextField
                                        validations={[VALIDATION_RULES.IS_URL]}
                                        id={`${currentEventType}-location-virtual-url`}
                                        ref={`${currentEventType}-location-virtual-url`}
                                        name="virtualevent_url"
                                        label={this.context.intl.formatMessage({id: `${currentEventType}-location-virtual-url`})}
                                        validationErrors={validationErrors['virtualevent_url']}
                                        defaultValue={values['virtualevent_url']}
                                        setDirtyState={this.props.setDirtyState}
                                        forceApplyToStore
                                        type='url'
                                        disabled={userDoesNotExist || !values.is_virtualevent}
                                    />
                                </div>
                                <LocationSelect
                                    legend={this.context.intl.formatMessage({id: 'event-location'})}
                                    selectedValue={values['location']}
                                    ref="location"
                                    name="location"
                                    resource="place"
                                    validationErrors={validationErrors['location']}
                                    setDirtyState={this.props.setDirtyState}
                                    optionalWrapperAttributes={{className: 'location-select'}}
                                    currentLocale={currentLocale}
                                    required={!values.is_virtualevent}
                                    disabled={userDoesNotExist}
                                />
                                <div className='map-button-container'>
                                    <Button
                                        title={position ? null : this.context.intl.formatMessage({id: 'event-location-button-tooltip'})}
                                        aria-pressed={this.state.openMapContainer}
                                        aria-disabled={!position}
                                        aria-hidden='true'
                                        id='map-button'
                                        className={classNames('btn btn-link', {disabled: !position})}
                                        onClick={() => this.toggleMapContainer()}
                                    >
                                        <FormattedMessage id={'event-location-button'}>{txt => txt}</FormattedMessage>
                                        <span className={classNames(
                                            'glyphicon',
                                            {'glyphicon-triangle-bottom': this.state.openMapContainer},
                                            {'glyphicon-triangle-top': !this.state.openMapContainer})}
                                        />
                                    </Button>
                                </div>
                                <div aria-expanded={this.state.openMapContainer} className={classNames('map-container', {open: this.state.openMapContainer})} ref={this.handleSetMapContainer}>
                                    {this.state.openMapContainer &&
                                    <EventMap position={position} mapContainer={this.state.mapContainer}/>
                                    }
                                </div>

                                <Form>
                                    <FormGroup className='place-id'>
                                        <label>{this.context.intl.formatMessage({id: 'event-location-id'})}
                                            <span className="form-control" value={values['location'] && values['location'].id ? values['location'].id : ''}>
                                                {values['location'] && values['location'].id ? values['location'].id : ''}
                                            </span>
                                        </label>
                                    </FormGroup>

                                </Form>


                                <CopyToClipboard text={values['location'] ? values['location'].id : ''}>
                                    <button type='button' className="clipboard-copy-button btn btn-default" aria-label={this.context.intl.formatMessage({id: 'copy-location-to-clipboard'})}>
                                        <div hidden>.</div>
                                        <span className="glyphicon glyphicon-duplicate" aria-hidden="true">
                                        </span>
                                    </button>
                                </CopyToClipboard>
                                <MultiLanguageField
                                    id='event-location-additional-info'
                                    multiLine={true}
                                    label="event-location-additional-info"
                                    ref="location_extra_info"
                                    name="location_extra_info"
                                    validationErrors={validationErrors['location_extra_info']}
                                    validations={[VALIDATION_RULES.SHORT_STRING]}
                                    defaultValue={values['location_extra_info']}
                                    languages={this.props.editor.contentLanguages}
                                    setDirtyState={this.props.setDirtyState}
                                    type='textarea'
                                    disabled={userDoesNotExist}
                                    forceApplyToStore
                                />
                            </div>
                        </div>
                        {formType === 'add' || !isRegularUser &&
                        <React.Fragment>
                            <div role='group' aria-labelledby={ariaTypes('umbrella')} className="row umbrella-row">
                                <FormText formatId='event-umbrella-header' id={ariaIds.umbrella[0]}/>
                                <SideField type='umbrella' id={ariaIds.umbrella[1]} />
                                <div className="col-sm-6">
                                    <UmbrellaSelector editor={this.props.editor} event={event} superEvent={superEvent} disabled={userDoesNotExist}/>
                                </div>
                            </div>
                        </React.Fragment>
                        }
                        <div role='group' aria-labelledby={ariaTypes('datetime')} className='row date-row'>
                            <FormText formatId={`${currentEventType}-datetime-form-header`} id={ariaIds.datetime[0]}/>
                            <SideField type='times' id={ariaIds.datetime[1]} />
                            <div className='col-sm-6'>
                                <div className='row radio-row'>
                                    <div className='custom-control custom-radio'>
                                        <input
                                            aria-describedby='event-recurring-type-disabled-tip-message'
                                            className='custom-control-input'
                                            id='single'
                                            name='radiogroup'
                                            type='radio'
                                            value='single'
                                            onChange={this.toggleEventType}
                                            checked={!this.state.selectEventType}
                                            disabled={
                                                userDoesNotExist ||
                                                formType === 'update' ||
                                                formType === 'add' ||
                                                isSuperEventDisable ||
                                                isSuperEvent ||
                                                subTimeDisable
                                            }
                                        />
                                        <label className='custom-control-label' htmlFor='single'>
                                            <FormattedMessage id={`${currentEventType}-type-single`}/>
                                        </label>
                                    </div>
                                    <div className='custom-control custom-radio'>
                                        <input
                                            aria-describedby='event-recurring-type-disabled-tip-message'
                                            className='custom-control-input'
                                            id='recurring'
                                            name='radiogroup'
                                            type='radio'
                                            value='recurring'
                                            checked={this.state.selectEventType}
                                            onChange={this.toggleEventType}
                                            disabled={
                                                userDoesNotExist ||
                                                formType === 'update' ||
                                                formType === 'add' ||
                                                isSuperEventDisable ||
                                                isSuperEvent ||
                                                values.start_time !== undefined
                                            }
                                        />
                                        <label className='custom-control-label' htmlFor='recurring'>
                                            <FormattedMessage id={`${currentEventType}-type-recurring`}/>
                                        </label>
                                    </div>
                                    { !['update', 'add'].includes(formType) && (subTimeDisable || values.start_time !== undefined) ?
                                        <div className='typetip' role='alert' id='event-recurring-type-disabled-tip-message'>
                                            <FormattedMessage id="editor-tip-eventtype-disable"/>
                                        </div>
                                        : null
                                    }
                                </div>
                                <div className='row'>
                                    <FormText formatId='event-datetime-form-header2' type='h3'/>
                                </div>
                                {!this.state.selectEventType
                                    ?
                                    <div className='col-xs-12 col-sm-12'>
                                        <CustomDateTime
                                            id="start_time"
                                            name="start_time"
                                            labelDate={<FormattedMessage  id={`${currentEventType}-starting-datelabel`}/>}
                                            labelTime={<FormattedMessage  id="event-starting-timelabel" />}
                                            defaultValue={values['start_time']}
                                            setDirtyState={this.props.setDirtyState}
                                            maxDate={values['end_time'] ? moment(values['end_time']) : undefined}
                                            required={true}
                                            disabled={userDoesNotExist || (formType === 'update' && isSuperEvent)}
                                            validationErrors={validationErrors['start_time']}
                                        />
                                        <CustomDateTime
                                            id="end_time"
                                            disablePast
                                            disabled={userDoesNotExist || (formType === 'update' && isSuperEvent)}
                                            validationErrors={validationErrors['end_time']}
                                            defaultValue={values['end_time']}
                                            name="end_time"
                                            labelDate={<FormattedMessage  id={`${currentEventType}-ending-datelabel`} />}
                                            labelTime={<FormattedMessage  id="event-ending-timelabel" />}
                                            setDirtyState={this.props.setDirtyState}
                                            minDate={values['start_time'] ? moment(values['start_time']) : undefined}
                                            required={true}
                                        />
                                    </div>
                                    :
                                    <React.Fragment>
                                        <div className={'new-events ' + (this.state.showNewEvents ? 'show' : 'hidden')}>
                                            <UncontrolledCollapse toggler='#events-list' defaultOpen>
                                                { newEvents }
                                            </UncontrolledCollapse>
                                        </div>
                                        <Button
                                            block
                                            className='btn'
                                            id='events-list'
                                            onClick={() => this.showEventList()}>
                                            {this.state.displayEvents
                                                ? <FormattedMessage id={`${currentEventType}-list-hide`}/>
                                                : <FormattedMessage id={`${currentEventType}-list-show`}/>
                                            }
                                        </Button>
                                        {this.state.showRecurringEvent &&
                                                <RecurringEvent
                                                    closeModal={this.closeRecurringEventModal}
                                                    toggle={() => this.showRecurringEventDialog()}
                                                    isOpen={this.state.showRecurringEvent}
                                                    validationErrors={validationErrors}
                                                    values={values}
                                                    formType={formType}
                                                    uiMode={uiMode}
                                                    localeType={currentEventType}
                                                />
                                        }
                                        <Button
                                            size='lg'block
                                            variant="contained"
                                            disabled={formType === 'update' ||
                                                    formType === 'add' ||
                                                    isSuperEventDisable ||
                                                    newEvents.length >= maxSubEventCount
                                            }
                                            onClick={() => this.addNewEventDialog()}>

                                            <span aria-hidden='true' className="glyphicon glyphicon-plus"/>
                                            <FormattedMessage id="event-add-new-occasion">{txt =>txt}</FormattedMessage>
                                        </Button>
                                        <ValidationNotification
                                            className='validation-notification'
                                            anchor={{}}
                                            validationErrors={validationErrors && validationErrors['sub_length']}
                                        />
                                        <Button
                                            size='lg' block
                                            variant="contained"
                                            disabled={formType === 'update' ||
                                                    formType === 'add' ||
                                                    isSuperEventDisable ||
                                                    newEvents.length >= maxSubEventCount
                                            }
                                            onClick={() => this.showRecurringEventDialog()}>

                                            <span aria-hidden='true' className="glyphicon glyphicon-refresh"/>
                                            <FormattedMessage id={`${currentEventType}-add-recurring`}>{txt =>txt}</FormattedMessage>
                                        </Button>

                                    </React.Fragment>
                                }
                            </div>
                        </div>
                    </Collapse>

                </div>
                <div>
                    <h2>
                        <CollapseButton
                            id='headerImage'
                            isOpen={this.state.headerImage}
                            isRequired={true}
                            targetCollapseNameId={`${currentEventType}-image-title`}
                            toggleHeader={this.toggleHeader}
                            validationErrorList={validationErrors['image']}
                        />
                    </h2>
                    <Collapse isOpen={this.state.headerImage}>
                        <div className='row'>
                            <ImageGallery uiMode={uiMode} validationErrors={validationErrors['image']} locale={currentLocale}/>
                        </div>
                    </Collapse>
                </div>
                <div>
                    <h2>
                        <CollapseButton
                            id='headerCategories'
                            isOpen={this.state.headerCategories}
                            isRequired={true}
                            targetCollapseNameId='event-category-form-header'
                            toggleHeader={this.toggleHeader}
                            validationErrorList={[validationErrors['keywords'], validationErrors['audience'],
                                validationErrors['audience_min_age'], validationErrors['audience_max_age']]}
                        />
                    </h2>
                    <Collapse isOpen={this.state.headerCategories}>
                        <div className="row keyword-row">
                            <HelKeywordSelector
                                editor={editor}
                                intl={this.context.intl}
                                setDirtyState={this.props.setDirtyState}
                                currentLocale={currentLocale}
                                disabled={userDoesNotExist}
                                localeType={currentEventType}
                            />
                        </div>
                        <div className="row audience-row">
                            <HelLabeledCheckboxGroup
                                groupLabel={this.context.intl.formatMessage({id: `${currentEventType}-target-groups-header`})}
                                selectedValues={values['audience']}
                                ref="audience"
                                name="audience"
                                validationErrors={validationErrors['audience']}
                                itemClassName="col-md-12 col-lg-6"
                                options={helTargetOptions}
                                setDirtyState={this.props.setDirtyState}
                                disabled={userDoesNotExist}
                            />
                        </div>
                        <div role='group' aria-labelledby={ariaTypes('audience')} className="row">
                            <FormText formatId='audience-age-restrictions' id={ariaIds.audience[0]}/>
                            <div className="col-sm-6">
                                <HelTextField
                                    id="audience_min_age"
                                    ref="audience_min_age"
                                    name="audience_min_age"
                                    label={<FormattedMessage id="audience-min-age"/>}
                                    validationErrors={validationErrors['audience_min_age']}
                                    validations={[VALIDATION_RULES.IS_INT, VALIDATION_RULES.IS_POSITIVE_INT, VALIDATION_RULES.IS_LESS_THAN_MAX_AGE_LIMIT]}
                                    defaultValue={values['audience_min_age']}
                                    setDirtyState={this.props.setDirtyState}
                                    forceApplyToStore
                                    type='number'
                                    max={150}
                                    min={0}
                                />

                                <HelTextField
                                    id="audience_max_age"
                                    ref="audience_max_age"
                                    name="audience_max_age"
                                    label={<FormattedMessage id="audience-max-age"/>}
                                    validationErrors={validationErrors['audience_max_age']}
                                    validations={[VALIDATION_RULES.IS_INT, VALIDATION_RULES.IS_POSITIVE_INT, VALIDATION_RULES.IS_LESS_THAN_MAX_AGE_LIMIT]}
                                    defaultValue={values['audience_max_age']}
                                    setDirtyState={this.props.setDirtyState}
                                    forceApplyToStore
                                    type='number'
                                    max={150}
                                    min={0}
                                />
                            </div>
                        </div>
                    </Collapse>
                </div>
                <div>
                    <h2>
                        <CollapseButton
                            id='headerPrices'
                            isOpen={this.state.headerPrices}
                            targetCollapseNameId='event-price-header'
                            toggleHeader={this.toggleHeader}
                            validationErrorList={[validationErrors['price'], validationErrors['offer_info_url']]}
                        />
                    </h2>
                    <Collapse isOpen={this.state.headerPrices}>
                        <div role='group' aria-labelledby={ariaTypes('offers')} className={classNames('row offers-row', {'has-offers': values['offers']})}>
                            <FormText formatId='event-price-fields-header' id={ariaIds.offers[0]}/>
                            {values['offers'] &&
                                <SideField type='offers' id={ariaIds.offers[1]} />
                            }
                            <div className="col-sm-6">
                                <HelOffersField
                                    editor={editor}
                                    ref="offers"
                                    name="offers"
                                    validationErrors={validationErrors}
                                    defaultValue={values['offers']}
                                    languages={this.props.editor.contentLanguages}
                                    setDirtyState={this.props.setDirtyState}
                                    disabled={userDoesNotExist}
                                />
                            </div>

                        </div>
                    </Collapse>
                </div>
                <div>
                    <h2>
                        <CollapseButton
                            id='headerCourses'
                            isOpen={this.state.headerCourses}
                            targetCollapseNameId={`${currentEventType}-form-header`}
                            toggleHeader={this.toggleHeader}
                            validationErrorList={[validationErrors['enrolment_url'],validationErrors['enrolment_start_time'], validationErrors['enrolment_end_time'],
                                validationErrors['minimum_attendee_capacity'], validationErrors['maximum_attendee_capacity']]}
                        />
                    </h2>
                    <Collapse isOpen={this.state.headerCourses}>
                        <div role='group' aria-labelledby={ariaTypes('enrolment')} className='row courses-row'>
                            <FormText formatId={`${currentEventType}-enrolment-header`} id={ariaIds.enrolment[0]}/>
                            <div className='col-xs-12 col-sm-6'>
                                <HelTextField
                                    validations={[VALIDATION_RULES.IS_URL]}
                                    id={`${currentEventType}-enrolment-url`}
                                    ref={`${currentEventType}-enrolment-url`}
                                    name="enrolment_url"
                                    label={<FormattedMessage id={`${currentEventType}-enrolment-url`} />}
                                    validationErrors={validationErrors['enrolment_url']}
                                    defaultValue={values['enrolment_url']}
                                    setDirtyState={this.props.setDirtyState}
                                    forceApplyToStore
                                    type='url'
                                    placeholder='https://...'
                                    disabled={userDoesNotExist}
                                />
                                <CustomDateTime
                                    id={`${currentEventType}-enrolment-start-time`}
                                    name="enrolment_start_time"
                                    labelDate={<FormattedMessage id={`${currentEventType}-enrolment-start-time`} />}
                                    labelTime={<FormattedMessage id="event-starting-timelabel" />}
                                    defaultValue={values['enrolment_start_time']}
                                    setDirtyState={this.props.setDirtyState}
                                    maxDate={values['enrolment_end_time'] ? moment(values['enrolment_end_time']) : undefined}
                                    disabled={formType === 'update' && isSuperEvent}
                                    validationErrors={validationErrors['enrolment_start_time']}
                                />
                                <CustomDateTime
                                    id={`${currentEventType}-enrolment-end-time`}
                                    disablePast
                                    disabled={formType === 'update' && isSuperEvent}
                                    validationErrors={validationErrors['enrolment_end_time']}
                                    defaultValue={values['enrolment_end_time']}
                                    name="enrolment_end_time"
                                    labelDate={<FormattedMessage  id={`${currentEventType}-enrolment-end-time`} />}
                                    labelTime={<FormattedMessage  id="event-ending-timelabel" />}
                                    setDirtyState={this.props.setDirtyState}
                                    minDate={values['enrolment_start_time'] ? moment(values['enrolment_start_time']) : undefined}
                                />
                            </div>
                        </div>

                        <div role='group' aria-labelledby={ariaTypes('attendee')} className="row">
                            <FormText formatId='attendee-capacity' id={ariaIds.attendee[0]}/>
                            <div className="col-xs-12 col-sm-6">
                                <HelTextField
                                    id="minimum_attendee_capacity"
                                    ref="minimum_attendee_capacity"
                                    name="minimum_attendee_capacity"
                                    label={<FormattedMessage id="minimum-attendee-capacity"/>}
                                    validationErrors={validationErrors['minimum_attendee_capacity']}
                                    validations={[VALIDATION_RULES.IS_INT, VALIDATION_RULES.IS_POSITIVE_INT]}
                                    defaultValue={values['minimum_attendee_capacity']}
                                    setDirtyState={this.props.setDirtyState}
                                    forceApplyToStore
                                    type='number'
                                    min={0}
                                    disabled={userDoesNotExist}
                                />
                                <HelTextField
                                    id="maximum_attendee_capacity"
                                    ref="maximum_attendee_capacity"
                                    name="maximum_attendee_capacity"
                                    label={<FormattedMessage id="maximum-attendee-capacity"/>}
                                    validationErrors={validationErrors['maximum_attendee_capacity']}
                                    validations={[VALIDATION_RULES.IS_INT, VALIDATION_RULES.IS_POSITIVE_INT]}
                                    defaultValue={values['maximum_attendee_capacity']}
                                    setDirtyState={this.props.setDirtyState}
                                    forceApplyToStore
                                    type='number'
                                    min={0}
                                    disabled={userDoesNotExist}
                                />
                            </div>
                        </div>
                    </Collapse>
                </div>

                <div>
                    <h2>
                        <CollapseButton
                            id='headerSocials'
                            isOpen={this.state.headerSocials}
                            targetCollapseNameId={`${currentEventType}-social-header`}
                            toggleHeader={this.toggleHeader}
                            validationErrorList={[validationErrors['info_url'], validationErrors['extlink_facebook'],
                                validationErrors['extlink_twitter'], validationErrors['extlink_instagram'], validationErrors['videos']]}
                        />
                    </h2>
                    <Collapse isOpen={this.state.headerSocials}>
                        <div role='group' aria-labelledby={ariaTypes('socials')} className="row social-media-row">
                            <FormText formatId='social-medias' id={ariaIds.socials[0]}/>
                            <div className="col-sm-6">
                                <MultiLanguageField
                                    id='event-info-url'
                                    required={false}
                                    multiLine={false}
                                    label={`${currentEventType}-info-url`}
                                    ref="info_url"
                                    name="info_url"
                                    validationErrors={validationErrors['info_url']}
                                    defaultValue={values['info_url']}
                                    languages={this.props.editor.contentLanguages}
                                    validations={[VALIDATION_RULES.IS_URL]}
                                    setDirtyState={this.props.setDirtyState}
                                    forceApplyToStore
                                    type='url'
                                    placeholder='https://...'
                                    disabled={userDoesNotExist}
                                />
                                <HelTextField
                                    validations={[VALIDATION_RULES.IS_URL]}
                                    id='extlink_facebook'
                                    ref="extlink_facebook"
                                    name="extlink_facebook"
                                    label='Facebook'
                                    validationErrors={validationErrors['extlink_facebook']}
                                    defaultValue={values['extlink_facebook']}
                                    setDirtyState={this.props.setDirtyState}
                                    forceApplyToStore
                                    type='url'
                                    placeholder='https://...'
                                    disabled={userDoesNotExist}
                                />
                                <i className='facebookIcon' />
                                <HelTextField
                                    validations={[VALIDATION_RULES.IS_URL]}
                                    id='extlink_twitter'
                                    ref="extlink_twitter"
                                    name="extlink_twitter"
                                    label='Twitter'
                                    validationErrors={validationErrors['extlink_twitter']}
                                    defaultValue={values['extlink_twitter']}
                                    setDirtyState={this.props.setDirtyState}
                                    forceApplyToStore
                                    type='url'
                                    placeholder='https://...'
                                    disabled={userDoesNotExist}
                                />
                                <HelTextField
                                    validations={[VALIDATION_RULES.IS_URL]}
                                    id='extlink_instagram'
                                    ref="extlink_instagram"
                                    name="extlink_instagram"
                                    label='Instagram'
                                    validationErrors={validationErrors['extlink_instagram']}
                                    defaultValue={values['extlink_instagram']}
                                    setDirtyState={this.props.setDirtyState}
                                    forceApplyToStore
                                    type='url'
                                    placeholder='https://...'
                                    disabled={userDoesNotExist}
                                />
                            </div>
                        </div>
                        <div role='group' aria-labelledby={ariaTypes('videos')} className='row videos-row'>
                            <FormText formatId={`${currentEventType}-video-header`} id={ariaIds.videos[0]}/>
                            <div className='col-sm-6'>
                                <HelVideoFields
                                    defaultValue={values['videos']}
                                    validationErrors={validationErrors}
                                    setDirtyState={this.props.setDirtyState}
                                    intl={this.context.intl}
                                    action={this.props.action}
                                    disabled={userDoesNotExist}
                                    localeType={currentEventType}
                                    languages={this.props.editor.contentLanguages}
                                />
                            </div>
                        </div>
                    </Collapse>
                </div>
                <div>
                    <h2>
                        <CollapseButton
                            id='headerInlanguage'
                            isOpen={this.state.headerInlanguage}
                            targetCollapseNameId={`${currentEventType}-languages-header`}
                            toggleHeader={this.toggleHeader}
                            validationErrorList={[validationErrors['in_language']]}
                        />
                    </h2>
                    <Collapse isOpen={this.state.headerInlanguage}>
                        <div className="row inlanguage-row">
                            <HelLabeledCheckboxGroup
                                groupLabel={this.context.intl.formatMessage({id: `${currentEventType}-languages-header2`})}
                                selectedValues={values['in_language']}
                                ref="in_language"
                                name="in_language"
                                validationErrors={validationErrors['in_language']}
                                itemClassName="col-md-12 col-lg-6"
                                options={helEventLangOptions}
                                setDirtyState={this.props.setDirtyState}
                                disabled={userDoesNotExist}
                            />
                        </div>
                    </Collapse>
                </div>
            </div>
        )
    }
}


FormFields.propTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
    showNewEvents: PropTypes.bool,
    showRecurringEvent: PropTypes.bool,
    editor: PropTypes.object,
    event: PropTypes.object,
    superEvent: PropTypes.object,
    user: PropTypes.object,
    setDirtyState: PropTypes.func,
    action: PropTypes.oneOf(['update', 'create', 'add']),
    loading: PropTypes.bool,
    uiMode: PropTypes.string,
}

FormFields.contextTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
    showNewEvents: PropTypes.bool,
    showRecurringEvent: PropTypes.bool,
};

export default FormFields
