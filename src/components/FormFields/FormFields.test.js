import React from 'react'
import {shallow} from 'enzyme';
import FormFields from './index'
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {
    MultiLanguageField,
    HelTextField,
    HelLabeledCheckboxGroup,
    HelLanguageSelect,
    LocationSelect,
    HelCheckbox,
    HelOffersField,
    HelKeywordSelector,
} from 'src/components/HelFormFields'
import RecurringEvent from 'src/components/RecurringEvent'
import {Button,Collapse} from 'reactstrap';
import {mapKeywordSetToForm, mapLanguagesSetToForm} from '../../utils/apiDataMapping'
import {setEventData, setData, clearValue} from '../../actions/editor'
import {merge} from 'lodash'
import API from '../../api'
import CONSTANTS from '../../constants'
import OrganizationSelector from '../HelFormFields/OrganizationSelector';
import UmbrellaSelector from '../HelFormFields/Selectors/UmbrellaSelector'
import HelVideoFields from '../HelFormFields/HelVideoFields/HelVideoFields'
import CustomDateTime from '../CustomFormFields/Dateinputs/CustomDateTime'
import EventMap from '../Map/EventMap';
import ImageGallery from '../ImageGallery/ImageGallery';
import {mockKeywordSets, mockLanguages, mockUser, mockUserEvents} from '__mocks__/mockData';
import CollapseButton from './CollapseButton/CollapseButton';
import {NewEvent} from '../HelFormFields';
import SideField from './SideField/SideField';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const mockEvent = mockUserEvents[0];
const {SUPER_EVENT_TYPE_RECURRING, SUPER_EVENT_TYPE_UMBRELLA, VALIDATION_RULES, USER_TYPE} = CONSTANTS
const dispatch = jest.fn()

jest.mock('../../actions/editor', () => {
    const actualStuff = jest.requireActual('../../actions/editor');
    return {
        __esModule: true,
        ...actualStuff,
        setData: jest.fn().mockImplementation((values) => {return values}),
        clearValue: jest.fn().mockImplementation((values) => { return values}),
        setEventData: jest.fn().mockImplementation((val ,key) => { return {val, key}}),
    }
});


describe('FormField', () => {
    const defaultProps = {
        intl,
        selectedOption: {},
        action: 'create',
        user: mockUser,
        event: mockEvent,
        toggle: () => null,
        options: [],
        editor: {
            mockKeywordSets,
            values: {
                name: {},
                provider: {},
                short_description: {},
                description: {},
                location_extra_info: {},
                info_url: {},
                extlink_facebook: '',
                extlink_twitter: '',
                extlink_instagram: '',
                audience_min_age: 5,
                audience_max_age: 15,
                sub_events: {},
                audience: {},
                in_language: {},
                location: {
                    position: {},
                },
                virtualevent_url: '',
                offers: [],
                videos: [],
                start_time: '',
                end_time: '',
                super_event_type: [SUPER_EVENT_TYPE_RECURRING, SUPER_EVENT_TYPE_UMBRELLA],
                type_id: CONSTANTS.EVENT_TYPE.GENERAL,
                enrolment_url: '',
                minimum_attendee_capacity: '',
                maximum_attendee_capacity: '',
            },
            validationErrors: {
                sub_events: {},
                name: {},
                provider: {},
                short_description: {},
                location_extra_info: {},
                info_url: {},
                description: {},
                extlink_facebook: {},
                extlink_twitter: {},
                extlink_instagram: {},
                audience: {},
                in_language: {},
                location: {},
                start_time: {},
                end_time: {},
                virtualevent_url: {},
                image: {},
                enrolment_url: {},
                maximum_attendee_capacity: {},
                minimum_attendee_capacity: {},
                audience_min_age: {},
                audience_max_age: {},
            },
            contentLanguages: [
            ],
            languages: [
                mockLanguages,
            ],
        },
        setDirtyState: () => {},
    }


    function getWrapper(props) {
        return shallow(<FormFields {...defaultProps} {...props} />, {context: {intl, dispatch}});
    }

    describe('methods', () => {
        describe('toggleEventType', () => {
            let wrapper;
            let instance;
            beforeEach(() => {
                clearValue.mockClear()
                wrapper = getWrapper()
                instance = wrapper.instance()
                dispatch.mockClear();
            })

            test('when toggleEventType is recurring', () => {
                instance.toggleEventType({target: {value: 'single'}})
                clearValue.mockClear()
                expect(wrapper.state().selectEventType).toBe('')
                setEventData.mockClear();
                instance.toggleEventType({target: {value: 'recurring'}})
                expect(wrapper.state().selectEventType).toBe('recurring') // FAIL
                expect(clearValue).toHaveBeenCalledWith(['start_time', 'end_time'])
                expect(setEventData).toHaveBeenNthCalledWith(1, {'0':{'start_time' : undefined}}, 0);
                expect(setEventData).toHaveBeenNthCalledWith(2, {'1':{'start_time' : undefined}}, 1);
            })
            test('when toggleEventType is single', () => {
                const expectedValue = {sub_events: {}}
                instance.toggleEventType({target: {value: 'recurring'}})
                setData.mockClear()

                expect(wrapper.state().selectEventType).toBe('recurring')
                instance.toggleEventType({target: {value: 'single'}})
                expect(setData).toHaveBeenCalledWith(expectedValue)
                expect(wrapper.state().selectEventType).toBe('')
            })
        })
        describe('addNewEventDialog', () => {
            let wrapper;
            let instance;
            let subEventKeys = Object.keys(defaultProps.editor.values.sub_events)
            let key = subEventKeys.length > 0 ? Math.max.apply(null, subEventKeys) + 1 : 0
            const newEventObject = {[key]: {start_time: undefined}}
            beforeEach(() => {
                setEventData.mockClear()
                wrapper = getWrapper()
                instance = wrapper.instance()
            })
            test('called while recurring is false', () => {
                instance.addNewEventDialog()
                expect(setEventData).toHaveBeenCalledTimes(1)
                expect(setEventData).toHaveBeenCalledWith(newEventObject, key)
            })
            test('called while recurring is true', () => {
                instance.addNewEventDialog(true)
                expect(setEventData).toHaveBeenCalledTimes(2)
                expect(setEventData).toHaveBeenCalledWith(newEventObject, key)
            })
        })

        describe('componentDidUpdate', () => {
            test('calls setState with correct params when createdRecurringEvents was previously false and is true now', () => {
                const instance = getWrapper().instance()
                const spy = jest.spyOn(instance, 'setState')
                instance.state.createdRecurringEvents = true
                const prevProps = {...instance.props}
                const prevState = {...instance.state, createdRecurringEvents: false}
                instance.componentDidUpdate(prevProps, prevState)
                expect(spy).toHaveBeenCalledWith({createdRecurringEvents: false})
            })
        })

        describe('closeRecurringEventModal', () => {
            test('calls setState with correct params when given createdRecurringEvents is false',  () => {
                const instance = getWrapper().instance()
                const spy = jest.spyOn(instance, 'setState')
                instance.closeRecurringEventModal(false)
                expect(spy).toHaveBeenCalledWith({
                    showRecurringEvent: false,
                    createdRecurringEvents: false,
                })
            })

            test('calls setState with correct params when given createdRecurringEvents is true',  () => {
                const instance = getWrapper().instance()
                const spy = jest.spyOn(instance, 'setState')
                instance.closeRecurringEventModal(true)
                expect(spy).toHaveBeenCalledWith({
                    showRecurringEvent: false,
                    createdRecurringEvents: true,
                })
            })
        })

        describe('generateNewEventFields', () => {
            const instance = getWrapper().instance()
            const events = {0: {start_time: undefined}, 1: {start_time: undefined}}
            const localeType = 'event'

            function getEvent(key = 0, focus = false) {
                return (
                    <NewEvent
                        length={key + 1}
                        key={key}
                        eventKey={key.toString()}
                        event={events[key]}
                        errors={{}}
                        setInitialFocus={focus}
                        localeType='event'
                    />
                )
            }
            test('returns correct array of NewEvent components', () => {
                const fields = instance.generateNewEventFields(events, localeType)
                const expectedFields = [getEvent(0, false), getEvent(1, true)];
                expect(fields).toStrictEqual(expectedFields);
            })

            test('returns correct array of NewEvent components when createdRecurringEvents is true', () => {
                instance.state.createdRecurringEvents = true
                const fields = instance.generateNewEventFields(events, localeType)
                const expectedFields = [getEvent(0, false), getEvent(1, false)]
                expect(fields).toStrictEqual(expectedFields);
            })
        })
    })

    describe('render', () => {

        describe('components', () => {

            describe('FormattedMessage', () => {
                test('Correct amount of FormattedMessage components rendered', () => {
                    const wrapper = getWrapper()
                    const messages = wrapper.find(FormattedMessage)
                    expect(messages).toHaveLength(16)
                })
                const expectedMessages = [
                    'create-events', 'editor-tip-required',
                    'event-editor-tip-location-multi', 'event-editor-tip-location-internet',
                    'event-editor-tip-location-not-found', 'event-location-button',
                    'editor-tip-event-umbrella-selection', 'editor-tip-event-umbrella-selection1',
                    'editor-tip-event-time-start', 'editor-tip-event-time-start-end',
                    'editor-tip-event-time-type', 'editor-tip-event-time-end',
                    'event-type-single', 'event-type-recurring',
                    'editor-tip-eventtype-disable', 'editor-tip-offers-payment-method',
                ]
                test.each(expectedMessages) (
                    'FormattedMessage id: "%s" exists and has correct props',
                    (message) => {
                        const wrapper = getWrapper()
                        const element = wrapper.findWhere((FormattedMessage) => FormattedMessage.prop('id') === message );
                        expect(element).toHaveLength(1);
                        expect(element.prop('id')).toBe(message);
                    }
                )
            })

            describe('SideField', () => {
                const wrapper = getWrapper()
                const Sidefields = wrapper.find(SideField)
                test('amount of SideField components is 4', () => {
                    expect(Sidefields).toHaveLength(4)
                })
                test.each([
                    'editor-tip-location','editor-tip-umbrella',
                    'event-editor-tip-times', 'editor-tip-offers-sidefield',
                ])('SideField with id: "%s" exists and has at least 1 FormattedMessage as a child.', (type) => {
                    const element = wrapper.findWhere((SideField) => SideField.prop('id') === type);
                    expect(element).toHaveLength(1);
                    expect(element.prop('id')).toBe(type);
                    expect(element.find(FormattedMessage).length).toBeGreaterThan(0);
                })

                test('first sidefield with correct amount of children',() => {
                    const fields = Sidefields.at(0).children();
                    expect(fields.find(FormattedMessage).length).toEqual(3)
                })
                test('first sidefield with correct children ids', () => {
                    const fields = Sidefields.at(0).children();
                    expect(fields.at(0).prop('id')).toEqual('event-editor-tip-location-multi')
                    expect(fields.at(1).prop('id')).toEqual('event-editor-tip-location-internet')
                    expect(fields.at(2).prop('id')).toEqual('event-editor-tip-location-not-found')
                })
            })
            describe('MultiLanguageField', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const multifields = wrapper.find(MultiLanguageField)
                test('correct amount of MultiLanguageField components', () => {
                    expect(multifields).toHaveLength(6)
                })
                test('default props for multilanguagefields', () => {
                    multifields.forEach((element) => {
                        expect(element.prop('languages')).toBe(defaultProps.editor.contentLanguages)
                        expect(element.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                        expect(element.prop('disabled')).toBe(false)
                    })
                })
                test('correct props for event headline', () => {
                    const headlineMulti = multifields.at(0)
                    expect(headlineMulti.prop('label')).toBe('event-headline')
                    expect(headlineMulti.prop('id')).toBe('event-headline')
                    expect(headlineMulti.prop('name')).toBe('name')
                    expect(headlineMulti.prop('required')).toBe(true)
                    expect(headlineMulti.prop('multiLine')).toBe(false)
                    expect(headlineMulti.prop('validationErrors')).toEqual(defaultProps.editor.validationErrors.name, defaultProps.editor.validationErrors.short_description)
                    expect(headlineMulti.prop('validations')).toEqual([VALIDATION_RULES.SHORT_STRING])
                    expect(headlineMulti.prop('defaultValue')).toBe(defaultProps.editor.values.name)
                })
                test('correct props for event short description', () => {
                    const shortMulti = multifields.at(1)
                    expect(shortMulti.prop('label')).toBe('event-short-description')
                    expect(shortMulti.prop('id')).toBe('event-short-description')
                    expect(shortMulti.prop('name')).toBe('short_description')
                    expect(shortMulti.prop('required')).toBe(true)
                    expect(shortMulti.prop('multiLine')).toBe(true)
                    expect(shortMulti.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.short_description)
                    expect(shortMulti.prop('validations')).toEqual([VALIDATION_RULES.SHORT_STRING])
                    expect(shortMulti.prop('defaultValue')).toBe(defaultProps.editor.values.short_description)
                    expect(shortMulti.prop('type')).toBe('textarea')
                    expect(shortMulti.prop('forceApplyToStore')).toBe(true)
                })
                test('correct props for event long description', () => {
                    const longMulti = multifields.at(2)
                    expect(longMulti.prop('label')).toBe('event-description')
                    expect(longMulti.prop('id')).toBe('event-description')
                    expect(longMulti.prop('name')).toBe('description')
                    expect(longMulti.prop('multiLine')).toBe(true)
                    expect(longMulti.prop('type')).toBe('textarea')
                    expect(longMulti.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.description)
                    expect(longMulti.prop('validations')).toEqual([VALIDATION_RULES.LONG_STRING])
                    expect(longMulti.prop('defaultValue')).toEqual(defaultProps.editor.values.description)
                })
                test('correct props for event provider', () => {
                    const providerMulti = multifields.at(3)
                    expect(providerMulti.prop('label')).toBe('event-provider-input')
                    expect(providerMulti.prop('id')).toBe('event-provider-input')
                    expect(providerMulti.prop('name')).toBe('provider')
                    expect(providerMulti.prop('required')).toBe(false)
                    expect(providerMulti.prop('multiLine')).toBe(false)
                    expect(providerMulti.prop('type')).toBe('textarea')
                    expect(providerMulti.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.provider)
                    expect(providerMulti.prop('validations')).toEqual([VALIDATION_RULES.SHORT_STRING])
                    expect(providerMulti.prop('defaultValue')).toEqual(defaultProps.editor.values.provider)
                })
                test('correct props for event location extra', () => {
                    const locationMulti = multifields.at(4)
                    expect(locationMulti.prop('label')).toBe('event-location-additional-info')
                    expect(locationMulti.prop('id')).toBe('event-location-additional-info')
                    expect(locationMulti.prop('name')).toBe('location_extra_info')
                    expect(locationMulti.prop('multiLine')).toBe(true)
                    expect(locationMulti.prop('type')).toBe('textarea')
                    expect(locationMulti.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.location_extra_info)
                    expect(locationMulti.prop('validations')).toEqual([VALIDATION_RULES.SHORT_STRING])
                    expect(locationMulti.prop('defaultValue')).toBe(defaultProps.editor.values.location_extra_info)
                })
                test('correct props for event info-url', () => {
                    const infoUrlMulti = multifields.at(5)
                    expect(infoUrlMulti.prop('label')).toBe('event-info-url')
                    expect(infoUrlMulti.prop('id')).toBe('event-info-url')
                    expect(infoUrlMulti.prop('name')).toBe('info_url')
                    expect(infoUrlMulti.prop('required')).toBe(false)
                    expect(infoUrlMulti.prop('multiLine')).toBe(false)
                    expect(infoUrlMulti.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.info_url)
                    expect(infoUrlMulti.prop('validations')).toEqual([VALIDATION_RULES.IS_URL])
                    expect(infoUrlMulti.prop('defaultValue')).toBe(defaultProps.editor.values.info_url)
                    expect(infoUrlMulti.prop('type')).toBe('url')
                    expect(infoUrlMulti.prop('forceApplyToStore')).toBe(true)
                })
            })
            describe('HelCheckbox', () => {
                const wrapper = getWrapper()
                const helcheckbox = wrapper.find(HelCheckbox)
                test('correct props for is_virtualevent checkbox', () => {
                    expect(helcheckbox.prop('name')).toBe('is_virtualevent')
                    expect(helcheckbox.prop('label')).toEqual(<FormattedMessage id='event-location-virtual'/>)
                    expect(helcheckbox.prop('fieldID')).toBe('is_virtual')
                    expect(helcheckbox.prop('disabled')).toBe(false)
                })
            })
            describe('HelTextField', () => {
                const wrapper = getWrapper()
                const textFieldElements = wrapper.find(HelTextField)
                test('amount of heltextfields', () => {
                    expect(textFieldElements).toHaveLength(9)
                })
                const expectedTextFields = [
                    {index: 0,type: 'url', id: 'event-location-virtual-url', name: 'virtualevent_url', hasValidation: true},
                    {index: 1, type: 'number', id: 'audience_min_age', name: 'audience_min_age', hasValidation: false},
                    {index: 2, type: 'number', id: 'audience_max_age', name: 'audience_max_age', hasValidation: false},
                    {index: 3, type: 'url', id: 'event-enrolment-url', name: 'enrolment_url', hasValidation: true},
                    {index: 4, type: 'number', id: 'minimum_attendee_capacity', name: 'minimum_attendee_capacity', hasValidation: true},
                    {index: 5, type: 'number', id: 'maximum_attendee_capacity', name: 'maximum_attendee_capacity', hasValidation: true},
                    {index: 6, type: 'url', id: 'extlink_facebook', name: 'extlink_facebook', label: 'Facebook', hasValidation: true},
                    {index: 7, type: 'url', id: 'extlink_twitter', name: 'extlink_twitter', label: 'Twitter', hasValidation: true},
                    {index: 8, type: 'url', id: 'extlink_instagram', name: 'extlink_instagram', label: 'Instagram', hasValidation: true},
                ];
                test.each(expectedTextFields)('correct props for HelTextField at index %#', (
                    {index, type, id, name, label, hasValidation}
                ) => {
                    const element = textFieldElements.at(index);
                    expect(element.prop('id')).toBe(id);
                    expect(element.prop('type')).toBe(type);
                    const fixedID = id.replace(/_/gi,'-');
                    // for some reason only virtualevent_url textfield uses the intl.formatMessage to get the correct label
                    const expectedMessage = index !== 0 ? <FormattedMessage id={fixedID}/> : defaultProps.intl.formatMessage({id: fixedID});

                    // virtualevent_url HelTextField specific tests
                    if (index === 0) {
                        expect(element.prop('label')).toBe(expectedMessage);
                        expect(element.prop('name')).toBe(name);
                    } else if ([6,7,8].includes(index)) {
                        // facebook/twitter/instagram HelTextField specific tests
                        expect(element.prop('label')).toBe(label);
                        expect(element.prop('name')).toBe(name);
                    }
                    else {
                        expect(element.prop('label')).toEqual(expectedMessage);
                        expect(element.prop('name')).toBe(name);
                    }
                    expect(element.prop('validationErrors')).toBe(defaultProps.editor.validationErrors[name])

                    expect(element.prop('defaultValue')).toBe(defaultProps.editor.values[name])
                    if (hasValidation) {
                        const correctValidations = type === 'url' ? [VALIDATION_RULES.IS_URL] : [VALIDATION_RULES.IS_INT, VALIDATION_RULES.IS_POSITIVE_INT];
                        expect(element.prop('validations')).toEqual(correctValidations)
                    }
                })
                test('correct props for virtualevent_url field', () => {
                    const virtualHelText = textFieldElements.at(0)
                    expect(virtualHelText.prop('validations')).toEqual([VALIDATION_RULES.IS_URL])
                    expect(virtualHelText.prop('id')).toBe('event-location-virtual-url')
                    expect(virtualHelText.prop('name')).toBe('virtualevent_url')
                    expect(virtualHelText.prop('label')).toBe(defaultProps.intl.formatMessage({id: 'event-location-virtual-url'}))
                    expect(virtualHelText.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.virtualevent_url)
                    expect(virtualHelText.prop('defaultValue')).toBe(defaultProps.editor.values.virtualevent_url)
                    expect(virtualHelText.prop('disabled')).toBe(true)
                })
                test('correct props for enrolment min age field', () => {
                    const enrolmentHelText = textFieldElements.at(1)
                    expect(enrolmentHelText.prop('id')).toBe('audience_min_age')
                    expect(enrolmentHelText.prop('name')).toBe('audience_min_age')
                    expect(enrolmentHelText.prop('label')).toEqual(<FormattedMessage id="audience-min-age"/>)
                    expect(enrolmentHelText.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.audience_min_age)
                    expect(enrolmentHelText.prop('defaultValue')).toBe(defaultProps.editor.values.audience_min_age)
                })
                test('correct props for enrolment max age field', () => {
                    const enrolmentHelText = textFieldElements.at(2)
                    expect(enrolmentHelText.prop('id')).toBe('audience_max_age')
                    expect(enrolmentHelText.prop('name')).toBe('audience_max_age')
                    expect(enrolmentHelText.prop('label')).toEqual(<FormattedMessage id="audience-max-age"/>)
                    expect(enrolmentHelText.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.audience_max_age)
                    expect(enrolmentHelText.prop('defaultValue')).toBe(defaultProps.editor.values.audience_max_age)
                })
                test('correct props for event facebook field', () => {
                    const faceHelText = textFieldElements.at(6)
                    expect(faceHelText.prop('validations')).toEqual([VALIDATION_RULES.IS_URL])
                    expect(faceHelText.prop('id')).toBe('extlink_facebook')
                    expect(faceHelText.prop('name')).toBe('extlink_facebook')
                    expect(faceHelText.prop('label')).toBe('Facebook')
                    expect(faceHelText.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.extlink_facebook)
                    expect(faceHelText.prop('defaultValue')).toBe(defaultProps.editor.values.extlink_facebook)
                    expect(faceHelText.prop('disabled')).toBe(false)
                })
                test('correct props for event twitter field', () => {
                    const twitterHelText = textFieldElements.at(7)
                    expect(twitterHelText.prop('validations')).toEqual([VALIDATION_RULES.IS_URL])
                    expect(twitterHelText.prop('id')).toBe('extlink_twitter')
                    expect(twitterHelText.prop('name')).toBe('extlink_twitter')
                    expect(twitterHelText.prop('label')).toBe('Twitter')
                    expect(twitterHelText.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.extlink_twitter)
                    expect(twitterHelText.prop('defaultValue')).toBe(defaultProps.editor.values.extlink_twitter)
                    expect(twitterHelText.prop('disabled')).toBe(false)
                })
                test('correct props for event instagram field', () => {
                    const instaHelText = textFieldElements.at(8)
                    expect(instaHelText.prop('validations')).toEqual([VALIDATION_RULES.IS_URL])
                    expect(instaHelText.prop('id')).toBe('extlink_instagram')
                    expect(instaHelText.prop('name')).toBe('extlink_instagram')
                    expect(instaHelText.prop('label')).toBe('Instagram')
                    expect(instaHelText.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.extlink_instagram)
                    expect(instaHelText.prop('defaultValue')).toBe(defaultProps.editor.values.extlink_instagram)
                    expect(instaHelText.prop('disabled')).toBe(false)
                })
            })
            describe('hobbyfields', () => {
                let wrapper;
                let instance;
                const editor = {editor: {values: {type_id: CONSTANTS.EVENT_TYPE.HOBBIES}}}
                beforeEach(() => {
                    wrapper = getWrapper();
                    instance = wrapper.instance();
                    wrapper.setProps(merge(defaultProps, editor))
                })
                afterEach(() => {
                    wrapper.unmount();
                })

                describe('collapsebutton', () => {
                    test('correct props', () => {
                        const enrolmentCollapse = wrapper.find(CollapseButton).at(4)
                        expect(enrolmentCollapse.prop('toggleHeader')).toBe(instance.toggleHeader)
                        expect(enrolmentCollapse.prop('id')).toBe('headerCourses')
                    })
                })
                describe('customdatetime', () => {
                    test('default props for CustomDateTime', () => {
                        const datetime = wrapper.find(CustomDateTime)
                        datetime.forEach((element)=> {
                            expect(element.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                            expect(element.prop('disabled')).toBe(false)
                        })
                    })
                    test('enrolment_start_time', () => {
                        const enrolmentStart = wrapper.find(CustomDateTime).at(2)
                        expect(enrolmentStart.prop('id')).toBe('hobby-enrolment-start-time')
                        expect(enrolmentStart.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.enrolment_start_time)
                        expect(enrolmentStart.prop('defaultValue')).toBe(defaultProps.editor.values.enrolment_start_time)
                        expect(enrolmentStart.prop('name')).toBe('enrolment_start_time')
                        expect(enrolmentStart.prop('labelDate')).toEqual(<FormattedMessage  id="hobby-enrolment-start-time" />)
                        expect(enrolmentStart.prop('labelTime')).toEqual(<FormattedMessage  id="event-starting-timelabel" />)
                        expect(enrolmentStart.prop('maxDate')).toBe()
                    })
                    test('enrolment_end_time', () => {
                        const enrolmentEnd = wrapper.find(CustomDateTime).at(3)
                        expect(enrolmentEnd.prop('id')).toBe('hobby-enrolment-end-time')
                        expect(enrolmentEnd.prop('disablePast')).toBe(true)
                        expect(enrolmentEnd.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.enrolment_end_time)
                        expect(enrolmentEnd.prop('defaultValue')).toBe(defaultProps.editor.values.enrolment_end_time)
                        expect(enrolmentEnd.prop('name')).toBe('enrolment_end_time')
                        expect(enrolmentEnd.prop('labelDate')).toEqual(<FormattedMessage  id="hobby-enrolment-end-time" />)
                        expect(enrolmentEnd.prop('labelTime')).toEqual(<FormattedMessage  id="event-ending-timelabel" />)
                        expect(enrolmentEnd.prop('minDate')).toBe()
                    })
                })
                describe('heltextfields', () => {
                    test('enrolment_url', () => {
                        const enrolmentUrl = wrapper.find(HelTextField).at(3)
                        expect(enrolmentUrl.prop('id')).toBe('hobby-enrolment-url')
                        expect(enrolmentUrl.prop('validations')).toEqual([VALIDATION_RULES.IS_URL])
                        expect(enrolmentUrl.prop('name')).toBe('enrolment_url')
                        expect(enrolmentUrl.prop('label')).toEqual(<FormattedMessage id="hobby-enrolment-url"/>)
                        expect(enrolmentUrl.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.enrolment_url)
                        expect(enrolmentUrl.prop('defaultValue')).toBe(defaultProps.editor.values.enrolment_url)
                    })
                    test('minimum_attendee_capacity', () => {
                        const minimumAttendee = wrapper.find(HelTextField).at(4)
                        expect(minimumAttendee.prop('id')).toBe('minimum_attendee_capacity')
                        expect(minimumAttendee.prop('validations')).toEqual([VALIDATION_RULES.IS_INT, VALIDATION_RULES.IS_POSITIVE_INT])
                        expect(minimumAttendee.prop('name')).toBe('minimum_attendee_capacity')
                        expect(minimumAttendee.prop('label')).toEqual(<FormattedMessage id="minimum-attendee-capacity"/>)
                        expect(minimumAttendee.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.minimum_attendee_capacity)
                        expect(minimumAttendee.prop('defaultValue')).toBe(defaultProps.editor.values.minimum_attendee_capacity)
                    })
                    test('maximum_attendee_capacity', () => {
                        const maximumAttendee = wrapper.find(HelTextField).at(5)
                        expect(maximumAttendee.prop('id')).toBe('maximum_attendee_capacity')
                        expect(maximumAttendee.prop('validations')).toEqual([VALIDATION_RULES.IS_INT, VALIDATION_RULES.IS_POSITIVE_INT])
                        expect(maximumAttendee.prop('name')).toBe('maximum_attendee_capacity')
                        expect(maximumAttendee.prop('label')).toEqual(<FormattedMessage id="maximum-attendee-capacity"/>)
                        expect(maximumAttendee.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.maximum_attendee_capacity)
                        expect(maximumAttendee.prop('defaultValue')).toBe(defaultProps.editor.values.maximum_attendee_capacity)
                    })
                })

            })
            describe('HelLabeledCheckboxGroup', () => {
                const wrapper = getWrapper()
                const helgroupboxes = wrapper.find(HelLabeledCheckboxGroup)
                test('amount of HelLabeledCheckboxGroups', () => {
                    expect(helgroupboxes).toHaveLength(2)
                })
                test('default props for HelLabeledCheckboxGroup', () => {
                    helgroupboxes.forEach((element)=> {
                        expect(element.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                        expect(element.prop('itemClassName')).toBe('col-md-12 col-lg-6')
                        expect(element.prop('disabled')).toBe(false)
                    })
                })
                test('correct props for audience checkboxgroup', () => {
                    const audiencegroup = helgroupboxes.at(0)
                    expect(audiencegroup.prop('groupLabel')).toEqual(<FormattedMessage id='event-target-groups-header' />)
                    expect(audiencegroup.prop('selectedValues')).toBe(defaultProps.editor.values.audience)
                    expect(audiencegroup.prop('name')).toBe('audience')
                    expect(audiencegroup.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.audience)
                    expect(audiencegroup.prop('options')).toEqual(mapKeywordSetToForm(defaultProps.editor.mockKeywordSets))
                })
                test('correct props for in_language checkboxgroup', () => {
                    const languagegroup = helgroupboxes.at(1)
                    expect(languagegroup.prop('groupLabel')).toEqual(<FormattedMessage id="event-languages-header2"/>)
                    expect(languagegroup.prop('selectedValues')).toBe(defaultProps.editor.values.in_language)
                    expect(languagegroup.prop('name')).toBe('in_language')
                    expect(languagegroup.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.in_language)
                    expect(languagegroup.prop('options')).toEqual(mapLanguagesSetToForm(defaultProps.editor.languages))
                })
            })
            describe('HelLanguageSelect', () => {
                const wrapper = getWrapper()
                const hellangselect = wrapper.find(HelLanguageSelect)
                test('correct props for HelLanguageSelect ', () => {
                    expect(hellangselect.prop('options')).toEqual(API.eventInfoLanguages())
                    expect(hellangselect.prop('checked')).toBe(defaultProps.editor.contentLanguages)
                    expect(hellangselect.prop('disabled')).toBe(false)
                })
            })
            describe('LocationSelect', () => {
                const wrapper = getWrapper()
                const locationSelect = wrapper.find(LocationSelect)
                test('correct props for HelSelect ', () => {
                    expect(locationSelect.prop('selectedValue')).toBe(defaultProps.editor.values.location)
                    expect(locationSelect.prop('name')).toBe('location')
                    expect(locationSelect.prop('resource')).toBe('place')
                    expect(locationSelect.prop('validationErrors')).toEqual(defaultProps.editor.validationErrors.location)
                    expect(locationSelect.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                    expect(locationSelect.prop('optionalWrapperAttributes')).toEqual({className: 'location-select'})
                    expect(locationSelect.prop('currentLocale')).toBe(intl.locale)
                    expect(locationSelect.prop('required')).toBe(true)
                    expect(locationSelect.prop('disabled')).toBe(false)
                })
            })
            describe('HelOffersField', () => {
                const wrapper = getWrapper()
                const heloffers = wrapper.find(HelOffersField)
                test('correct props for HelOffersField', () => {
                    expect(heloffers.prop('name')).toBe('offers')
                    expect(heloffers.prop('validationErrors')).toBe(defaultProps.editor.validationErrors)
                    expect(heloffers.prop('defaultValue')).toBe(defaultProps.editor.values.offers)
                    expect(heloffers.prop('languages')).toBe(defaultProps.editor.contentLanguages)
                    expect(heloffers.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                    expect(heloffers.prop('disabled')).toBe(false)
                })
            })

            describe('HelKeywordSelector', () => {
                const wrapper = getWrapper()
                const helkeywords = wrapper.find(HelKeywordSelector)
                test('correct props for HelKeywordSelector', () => {
                    expect(helkeywords.prop('editor')).toBe(defaultProps.editor)
                    expect(helkeywords.prop('intl')).toBe(intl)
                    expect(helkeywords.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                    expect(helkeywords.prop('currentLocale')).toBe(intl.locale)
                    expect(helkeywords.prop('disabled')).toBe(false)
                })
            })

            describe('RecurringEvent', () => {
                const wrapper = getWrapper()
                wrapper.setState({showRecurringEvent: true, selectEventType: 'recurring'})
                const instance = wrapper.instance();
                const recurring = wrapper.find(RecurringEvent)
                test('correct props for RecurringEvent', () => {
                    expect(recurring.prop('closeModal')).toBe(instance.closeRecurringEventModal)
                    expect(recurring.prop('toggle')).toBeDefined()
                    expect(recurring.prop('isOpen')).toBe(instance.state.showRecurringEvent)
                    expect(recurring.prop('validationErrors')).toBe(defaultProps.editor.validationErrors)
                    expect(recurring.prop('values')).toBe(defaultProps.editor.values)
                    expect(recurring.prop('formType')).toBe(defaultProps.action)
                })
            })

            describe('OrganizationSelector', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const publisherOptions = Object.keys(defaultProps.user.adminOrganizationData)
                    .map(id => ({label: defaultProps.user.adminOrganizationData[id].name, value: id}))
                const organization = wrapper.find(OrganizationSelector)
                test('correct props for OrganizationSelector', () => {
                    expect(organization.prop('formType')).toBe(defaultProps.action)
                    expect(organization.prop('options')).toEqual(publisherOptions)
                    expect(organization.prop('selectedOption')).toEqual(defaultProps.selectedOption)
                    expect(organization.prop('onChange')).toBe(instance.handleOrganizationChange)
                })
            })
            describe('UmbrellaSelector', () => {
                const wrapper = getWrapper()
                const umbrella = wrapper.find(UmbrellaSelector)
                test('correct props for UmbrellaSelector', () => {
                    expect(umbrella.prop('editor')).toBe(defaultProps.editor)
                    expect(umbrella.prop('event')).toBe(defaultProps.event)
                    expect(umbrella.prop('superEvent')).toBe(defaultProps.editor.super_event_type)
                    expect(umbrella.prop('disabled')).toBe(false)
                })
            })
            describe('HelVideoFields', () => {
                const wrapper = getWrapper()
                const videofields = wrapper.find(HelVideoFields)
                test('correct props for HelVideoFields', () => {
                    expect(videofields.prop('defaultValues')).toBe(defaultProps.editor.values.videos)
                    expect(videofields.prop('validationErrors')).toBe(defaultProps.editor.validationErrors)
                    expect(videofields.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                    expect(videofields.prop('intl')).toBe(intl)
                    expect(videofields.prop('action')).toBe(defaultProps.action)
                    expect(videofields.prop('disabled')).toBe(false)
                })
            })
            describe('CustomDateTime', () => {
                const wrapper = getWrapper()
                const dateTimeElements = wrapper.find(CustomDateTime)
                test('amount of CustomDateTimes', () => {
                    expect(dateTimeElements).toHaveLength(4)
                })
                const expectedCustomComponents = [
                    {index: 0, id: 'start_time', name: 'start_time', labelD: 'event-starting-datelabel', required: true, minDate: false},
                    {index: 1, id: 'end_time', name: 'end_time', labelD: 'event-ending-datelabel', required: true, minDate: true},
                    {index: 2, id: 'event-enrolment-start-time', name: 'enrolment_start_time', labelD: 'event-enrolment-start-time', required: false, minDate: false},
                    {index: 3, id: 'event-enrolment-end-time', name: 'enrolment_end_time', labelD: 'event-enrolment-end-time', required: false, minDate: true},
                ];
                test.each(expectedCustomComponents)('correct props for CustomDateTime at index %#', (
                    {index, id, name, labelD, required, minDate}
                ) => {
                    const correctLabelTime = name.includes('end_time') ? 'event-ending-timelabel' : 'event-starting-timelabel';
                    const element = dateTimeElements.at(index);
                    expect(element.prop('id')).toBe(id);
                    expect(element.prop('name')).toBe(name);
                    expect(element.prop('labelDate')).toEqual(<FormattedMessage id={labelD} />);
                    expect(element.prop('labelTime')).toEqual(<FormattedMessage id={correctLabelTime} />);
                    expect(element.prop('disabled')).toBe(false);
                    expect(element.prop('setDirtyState')).toBe(defaultProps.setDirtyState);
                    expect(element.prop('defaultValue')).toBe(defaultProps.editor.values[id]);
                    expect(element.prop('validationErrors')).toBe(defaultProps.editor.validationErrors[id]);
                    if (minDate){
                        expect(element.prop('minDate')).toBeUndefined();
                    } else {
                        expect(element.prop('maxDate')).toBeUndefined();
                    }
                    if (required){
                        expect(element.prop('required')).toBe(required);
                    }
                });
                test('default props for CustomDateTime', () => {
                    dateTimeElements.forEach((element)=> {
                        expect(element.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                        expect(element.prop('disabled')).toBe(false)
                    })
                })
                test('correct props for starting time CustomDateTime', () => {
                    const startdatetime = dateTimeElements.at(0)
                    expect(startdatetime.prop('id')).toBe('start_time')
                    expect(startdatetime.prop('name')).toBe('start_time')
                    expect(startdatetime.prop('labelDate')).toEqual(<FormattedMessage  id="event-starting-datelabel" />)
                    expect(startdatetime.prop('labelTime')).toEqual(<FormattedMessage  id="event-starting-timelabel" />)
                    expect(startdatetime.prop('defaultValue')).toBe(defaultProps.editor.values.start_time)
                    expect(startdatetime.prop('maxDate')).toBe()
                    expect(startdatetime.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.start_time)
                })
                test('correct props for ending time CustomDateTime', () => {
                    const endingdatetime = dateTimeElements.at(1)
                    expect(endingdatetime.prop('id')).toBe('end_time')
                    expect(endingdatetime.prop('disablePast')).toBe(true)
                    expect(endingdatetime.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.end_time)
                    expect(endingdatetime.prop('defaultValue')).toBe(defaultProps.editor.values.end_time)
                    expect(endingdatetime.prop('name')).toBe('end_time')
                    expect(endingdatetime.prop('labelDate')).toEqual(<FormattedMessage  id="event-ending-datelabel" />)
                    expect(endingdatetime.prop('labelTime')).toEqual(<FormattedMessage  id="event-ending-timelabel" />)
                    expect(endingdatetime.prop('minDate')).toBe()
                })
            })
            describe('EventMap', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                wrapper.setState({openMapContainer: true})
                const eventmap = wrapper.find(EventMap)
                test('correct props for EventMap', () => {
                    expect(eventmap.prop('position')).toBe(defaultProps.editor.values.location.position)
                    expect(eventmap.prop('mapContainer')).toBe(instance.state.mapContainer)
                })
            })

            describe('event map button', () => {
                test('container div', () => {
                    const container = getWrapper().find('div.map-button-container')
                    expect(container).toHaveLength(1)
                })

                test('button with correct default props', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance()
                    const button = wrapper.find('div.map-button-container').find(Button)
                    expect(button).toHaveLength(1)
                    expect(button.prop('title')).toBe(null)
                    expect(button.prop('aria-pressed')).toBe(instance.state.openMapContainer)
                    expect(button.prop('aria-disabled')).toBe(!defaultProps.editor.values.location.position)
                    expect(button.prop('id')).toBe('map-button')
                    expect(button.prop('className')).toBe('btn btn-link')
                    expect(button.prop('onClick')).toBeDefined()
                })

                test('button aria-disabled and title props when position is defined', () => {
                    const wrapper = getWrapper()
                    const editor = {editor: {values: {location: {position: {type: 'Point'}}}}}
                    wrapper.setProps(merge(defaultProps, editor))
                    const button = wrapper.find('div.map-button-container').find(Button)
                    expect(button).toHaveLength(1)
                    expect(button.prop('aria-disabled')).toBe(false)
                    expect(button.prop('title')).toBe(null)
                })

                test('button aria-disabled and title props when position is not defined', () => {
                    const wrapper = getWrapper()
                    const editor = {editor:{values: {location: 'null'}}}
                    wrapper.setProps(merge(defaultProps, editor))
                    const button = wrapper.find('div.map-button-container').find(Button)
                    expect(button).toHaveLength(1)
                    expect(button.prop('aria-disabled')).toBe(true)
                    expect(button.prop('title')).toBe(defaultProps.intl.formatMessage({id: 'event-location-button-tooltip'}))
                })

                test('FormattedMessage', () => {
                    const message = getWrapper().find('#event-location-button')
                    expect(message).toHaveLength(1)
                })

                test('button icon when state.openMapContainer is true', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance()
                    instance.setState({openMapContainer: true})
                    const icon = wrapper.find('div.map-button-container').find(Button).find('span')
                    expect(icon).toHaveLength(1)
                    expect(icon.prop('className')).toBe('glyphicon glyphicon-triangle-bottom')
                })

                test('button icon when state.openMapContainer is false', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance()
                    instance.setState({openMapContainer: false})
                    const icon = wrapper.find('div.map-button-container').find(Button).find('span')
                    expect(icon).toHaveLength(1)
                    expect(icon.prop('className')).toBe('glyphicon glyphicon-triangle-top')
                })
            })

            describe('ImageGallery', () => {
                const wrapper = getWrapper()
                const imagegallery = wrapper.find(ImageGallery)
                test('correct props for ImageGallery', () => {
                    expect(imagegallery.prop('locale')).toBe(intl.locale)
                    expect(imagegallery.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.image)
                })
            })
            describe('Collapse', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const collapse = wrapper.find(Collapse)
                test('correct amount of Collapses', () => {
                    expect(collapse).toHaveLength(7)
                })
                test('correct states for Collapses', () => {
                    expect(collapse.at(0).prop('isOpen')).toBe(instance.state.headerLocationDate)
                    expect(collapse.at(1).prop('isOpen')).toBe(instance.state.headerImage)
                    expect(collapse.at(2).prop('isOpen')).toBe(instance.state.headerCategories)
                    expect(collapse.at(3).prop('isOpen')).toBe(instance.state.headerPrices)
                    expect(collapse.at(4).prop('isOpen')).toBe(instance.state.headerSocials)
                    expect(collapse.at(5).prop('isOpen')).toBe(instance.state.headerInlanguage)
                })
            })
            describe('CollapseButtons', () => { // päivitä
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const buttons = wrapper.find(CollapseButton)
                test('amount of collapse buttons', () => {
                    expect(buttons).toHaveLength(7)
                })
                test('default props for collapse Buttons', () => {
                    buttons.forEach((button) => {
                        expect(button.prop('toggleHeader')).toBe(instance.toggleHeader)
                    })
                })
                test('correct ids for Buttons', () => {
                    expect(buttons.at(0).prop('id')).toBe('headerLocationDate')
                    expect(buttons.at(1).prop('id')).toBe('headerImage')
                    expect(buttons.at(2).prop('id')).toBe('headerCategories')
                    expect(buttons.at(3).prop('id')).toBe('headerPrices')
                    expect(buttons.at(4).prop('id')).toBe('headerCourses')
                    expect(buttons.at(5).prop('id')).toBe('headerSocials')
                    expect(buttons.at(6).prop('id')).toBe('headerInlanguage')
                })
            })
            describe('event type radios', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const radios = wrapper.find('input')
                test('correct amount of radios', () => {
                    expect(radios).toHaveLength(2)
                })
                test('default prop for radio buttons', () => {
                    radios.forEach((radio) => {
                        expect(radio.prop('aria-describedby')).toBe('event-recurring-type-disabled-tip-message')
                        expect(radio.prop('onChange')).toBe(instance.toggleEventType)
                        expect(radio.prop('name')).toBe('radiogroup')
                        expect(radio.prop('type')).toBe('radio')
                        expect(radio.prop('className')).toBe('custom-control-input')
                    })
                })
                test('default props for radio buttons', () => {
                    expect(radios.at(0).prop('id')).toBe('single')
                    expect(radios.at(1).prop('id')).toBe('recurring')
                    expect(radios.at(0).prop('value')).toBe('single')
                    expect(radios.at(1).prop('value')).toBe('recurring')
                    expect(radios.at(0).prop('checked')).toBe(true)
                })
            })
        })
    })
})
