import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider,FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import {Button} from 'reactstrap';
import {Link} from 'react-router-dom';
import classNames from 'classnames';
import fiMessages from 'src/i18n/fi.json';
import {UnconnectedEventActionButton} from '../EventActionButton'
import constants from '../../../constants';

const {PUBLICATION_STATUS, USER_TYPE, EVENT_STATUS} = constants;
const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

describe('EventActionButton', () => {
    const defaultProps = {
        intl,
        editor: {
            validationErrors: {},
        },
        user: {},
        confirm: () => {},
        action: 'update',
        confirmAction: true,
        customAction: () => {},
        event: {},
        eventIsPublished: false,
        loading: false,
        runAfterAction: () => {},
        subEvents: [],
        superEvent: {},
        idPrefix: 'prefix',
    }

    function getWrapper(props) {
        return shallow(<UnconnectedEventActionButton {...defaultProps} {...props}/>, {context: {intl}});
    }

    describe('terms checkbox', () => {
        const user = {userType: USER_TYPE.REGULAR}
        const event = {publication_status: PUBLICATION_STATUS.PUBLIC}
        const action = 'update'
        describe('when user is regular user, button is save button and event isnt draft', () => {
            test('renders div', () => {
                const div = getWrapper({user, event, action}).find('div')
                expect(div).toHaveLength(1)
                expect(div.prop('className')).toBe('custom-control custom-checkbox')
            })

            test('renders Input', () => {
                const wrapper = getWrapper({user, event, action})
                const instance = wrapper.instance()
                const input = wrapper.find('input')
                expect(input).toHaveLength(1)
                expect(input.prop('type')).toBe('checkbox')
                expect(input.prop('checked')).toBe(instance.state.agreedToTerms)
                expect(input.prop('onChange')).toBe(instance.handleChange)
                expect(input.prop('id')).toBe('terms-agree')
            })

            test('renders label', () => {
                const label = getWrapper({user, event, action}).find('label')
                expect(label).toHaveLength(1)
                expect(label.prop('htmlFor')).toBe('terms-agree')
            })

            test('renders first FormattedMessage', () => {
                const formattedMessages = getWrapper({user, event, action}).find('label').find(FormattedMessage)
                expect(formattedMessages).toHaveLength(2)
                const formattedMessage = formattedMessages.first()
                expect(formattedMessage.prop('id')).toBe('terms-agree-text')
            })

            test('renders Link', () => {
                const link = getWrapper({user, event, action}).find(Link)
                expect(link).toHaveLength(1)
                expect(link.prop('to')).toBe('/terms')
                expect(link.prop('target')).toBe('_black')
            })

            test('renders second FormattedMessage', () => {
                const formattedMessage = getWrapper({user, event, action}).find(Link).find(FormattedMessage)
                expect(formattedMessage).toHaveLength(1)
                expect(formattedMessage.prop('id')).toBe('terms-agree-link')
            })
        })

        describe('when terms checkbox is not shown', () => {
            test('checkbox elements are not rendered', () => {
                const wrapper = getWrapper().find('terms-checkbox')
                expect(wrapper).toHaveLength(0)
            })
        })
    })

    describe('Button', () => {
        test('is rendered', () => {
            const button = getWrapper().find(Button)
            const expectedAriaLabeltext = 'Julkaise tapahtuma. Sinulla ei ole oikeuksia muokata tätä tapahtumaa.'
            expect(button).toHaveLength(1)
            expect(button.prop('aria-disabled')).toBe(true)
            expect(button.prop('aria-label')).toBe(expectedAriaLabeltext)
            expect(button.prop('id')).toBe(defaultProps.idPrefix + defaultProps.action)
            expect(button.prop('color')).toBe('secondary')
            expect(button.prop('className')).toBe(classNames(`editor-${defaultProps.action}-button`,{'disabled': true}))
            expect(button.prop('onClick')).toBeDefined()
            expect(button.prop('style')).toEqual({'cursor': 'not-allowed'})
        })
    })

    describe('functions', () => {
        describe('isSaveButton', () => {
            test('returns true when action is publish, update or update-draft', () => {
                const instance = getWrapper().instance()
                const saveActions = ['publish','update','update-draft']
                saveActions.forEach(action => {
                    expect(instance.isSaveButton(action)).toBe(true)
                });
            })

            test('returns false when action is not publish, update or update-draft', () => {
                const instance = getWrapper().instance()
                expect(instance.isSaveButton('test-action')).toBe(false)
            })
        })

        describe('handleChange', () => {
            test('sets state agreedToTerms to and false', () => {
                const instance = getWrapper().instance()
                instance.state.agreedToTerms = false
                const event = {target: {checked: true}}
                instance.handleChange(event)
                expect(instance.state.agreedToTerms).toBe(true)
                event.target.checked = false
                instance.handleChange(event)
                expect(instance.state.agreedToTerms).toBe(false)
            })
        })

        describe('actions & disabled control', () => {
            const admin = {userType: USER_TYPE.ADMIN}
            const regular = {userType: USER_TYPE.REGULAR}
            function getEvents(count = 0, type = constants.SUPER_EVENT_TYPE_RECURRING) {
                const sub_events = [];
                for(let i = 0; i < count; i++) {
                    sub_events.push({test: `random value ${i}`});
                }
                return {
                    sub_events: sub_events,
                    super_event_type: type,
                }
            }
            describe('sub_event limitations & action === delete', () => {
                const event = {publication_status: PUBLICATION_STATUS.PUBLIC}
                const action = 'delete'

                test('is disabled when action is delete & superEvent only has 2 subs', () => {
                    const wrapper = getWrapper({user: admin, event, action, superEvent: getEvents(2)})
                    const button = wrapper.find(Button)
                    expect(button.prop('aria-disabled')).toBe(true)
                    expect(button.prop('aria-label')).toBe(
                        `${intl.formatMessage({id: 'delete-events'})}. ${intl.formatMessage({id: 'not-enough-sub-events'})}`)
                })
                test('is not disabled when action is delete & superEvent has more than 2 subs', () => {
                    const wrapper = getWrapper({user: admin, event, action, superEvent: getEvents(3)})
                    const button = wrapper.find(Button)
                    expect(button.prop('aria-disabled')).toBe(false)
                })
                test('is not disabled when super event is umbrella', () => {
                    const wrapper = getWrapper({user: admin, event, action, superEvent: getEvents(2, constants.SUPER_EVENT_TYPE_UMBRELLA)})
                    const button = wrapper.find(Button)
                    expect(button.prop('aria-disabled')).toBe(false)
                })
            })
            describe('action === update', () => {
                const event = {publication_status: PUBLICATION_STATUS.DRAFT, super_event: {
                    '@id': 'https://test-api.test/v1/event/985484/',
                }}
                const action = 'update'
                test('is draft, sub_event & regular user', () => {
                    const wrapper = getWrapper({user: admin, event, action})
                    const button = wrapper.find(Button)
                    expect(button.prop('aria-disabled')).toBe(true)
                    expect(button.prop('aria-label')).toBe(
                        `${intl.formatMessage({id: 'event-action-save-new'})}. ${intl.formatMessage({id: 'draft-publish-subevent'})}`)
                })
            })
            describe('action === postpone', () => {
                const event = [
                    {event: {super_event_type: constants.SUPER_EVENT_TYPE_RECURRING}, message: 'series-invalid-postpone'},
                    {event: {publication_status: PUBLICATION_STATUS.DRAFT}, message: 'draft-invalid-postpone'},
                    {event: {event_status: EVENT_STATUS.POSTPONED}, message: 'event-invalid-postpone'},
                ]
                const action = 'postpone'
                test.each(event) (
                    'if %o, aria-disabled should be true',
                    ({event, message}) => {
                        const wrapper = getWrapper({user: admin, event: event, action})
                        const button = wrapper.find(Button)
                        expect(button.prop('aria-disabled')).toBe(true)
                        expect(button.prop('aria-label')).toBe(
                            `${intl.formatMessage({id: 'postpone-events'})}. ${intl.formatMessage({id: message})}`)
                    }
                )
            })
            describe('action === delete', () => {
                const action = 'delete'
                test('regular user & is published', () => {
                    const event = {publication_status: PUBLICATION_STATUS.PUBLIC}
                    const wrapper = getWrapper({user: regular, event, action})
                    const button = wrapper.find(Button)
                    expect(button.prop('aria-disabled')).toBe(true)
                    expect(button.prop('aria-label')).toBe(
                        `${intl.formatMessage({id: 'delete-events'})}. ${intl.formatMessage({id: 'user-no-rights-edit'})}`)
                })
                test('regular user & is umbrella', () => {
                    const event = {super_event_type: constants.SUPER_EVENT_TYPE_UMBRELLA}
                    const wrapper = getWrapper({user: regular, event, action})
                    const button = wrapper.find(Button)
                    expect(button.prop('aria-disabled')).toBe(true)
                    expect(button.prop('aria-label')).toBe(
                        `${intl.formatMessage({id: 'delete-events'})}. ${intl.formatMessage({id: 'user-no-rights-edit'})}`)
                })
            })
            describe('action === cancel', () => {
                const action = 'cancel'
                test('is draft', () => {
                    const event = {publication_status: PUBLICATION_STATUS.DRAFT}
                    const wrapper = getWrapper({user: admin, event, action})
                    const button = wrapper.find(Button)
                    expect(button.prop('aria-disabled')).toBe(true)
                    expect(button.prop('aria-label')).toBe(
                        `${intl.formatMessage({id: 'cancel-events'})}. ${intl.formatMessage({id: 'draft-cancel'})}`)
                })
                test('is regular user & published event', () => {
                    const event = {publication_status: PUBLICATION_STATUS.PUBLIC}
                    const wrapper = getWrapper({user: regular, event, action})
                    const button = wrapper.find(Button)
                    expect(button.prop('aria-disabled')).toBe(true)
                    expect(button.prop('aria-label')).toBe(
                        `${intl.formatMessage({id: 'cancel-events'})}. ${intl.formatMessage({id: 'user-no-rights-edit'})}`)
                })
            })
            describe('action === edit || update', () => {
                const action = 'edit' || 'update'
                test('regular and umbrella', () => {
                    const event = {super_event_type: constants.SUPER_EVENT_TYPE_UMBRELLA}
                    const wrapper = getWrapper({user: regular, event, action})
                    const button = wrapper.find(Button)
                    expect(button.prop('aria-disabled')).toBe(true)
                    expect(button.prop('aria-label')).toBe(
                        `${intl.formatMessage({id: 'edit-events'})}. ${intl.formatMessage({id: 'user-no-rights-edit'})}`)
                })
                test('regular and published event', () => {
                    const event = {publication_status: PUBLICATION_STATUS.PUBLIC}

                    const wrapper = getWrapper({user: regular, event, action})
                    const button = wrapper.find(Button)
                    expect(button.prop('aria-disabled')).toBe(true)
                    expect(button.prop('aria-label')).toBe(
                        `${intl.formatMessage({id: 'edit-events'})}. ${intl.formatMessage({id: 'user-no-rights-edit'})}`)
                })
            })
            describe('action === add', () => {
                const action = 'add'
                test('is owner, regular user & published', () => {
                    const event = {is_owner: true, publication_status: PUBLICATION_STATUS.PUBLIC}
                    const wrapper = getWrapper({user: regular, event, action})
                    const button = wrapper.find(Button)
                    expect(button.prop('aria-disabled')).toBe(true)
                    expect(button.prop('aria-label')).toBe(
                        `${intl.formatMessage({id: 'add-events'})}. ${intl.formatMessage({id: 'user-no-rights-edit'})}`)
                })
                test('sub_event limit reached & is series', () => {
                    function generateSubs(count = 0) {
                        const sub_events = [];
                        for(let i = 0; i < count; i++) {
                            sub_events.push({test: `random value ${i}`});
                        }
                        return {
                            sub_events,
                        }
                    }
                    const event = {super_event_type: constants.SUPER_EVENT_TYPE_RECURRING, ...generateSubs(65)}
                    const wrapper = getWrapper({user: admin, event, action})
                    const button = wrapper.find(Button)
                    expect(button.prop('aria-disabled')).toBe(true)
                    expect(button.prop('aria-label')).toBe(
                        `${intl.formatMessage({id: 'add-events'})}. ${intl.formatMessage({id: 'validation-isMoreThanSixtyFive'})}`)
                })
            })
        })
    })
})

