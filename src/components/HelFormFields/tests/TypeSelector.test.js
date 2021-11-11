import React from 'react';
import {shallow} from 'enzyme';
import {FormattedMessage, IntlProvider} from 'react-intl';
import {merge} from 'lodash'
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {UnconnectedTypeSelector} from '../Selectors/TypeSelector';
import SelectorRadio from '../Selectors/SelectorRadio';
import {setData, clearValue} from '../../../actions/editor'
import constants from '../../../constants';
import {mockKeywordSets} from '../../../../__mocks__/mockData';
import {confirmAction} from '../../../actions/app';

const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const dispatch = jest.fn()
const store = {
    getState: () => (
        {
            router: {
                location: {
                    pathname: '/event/create/new',
                },
            },
        }
    ),
};

const defaultProps = {
    event: {},
    editor: {
        values: {
            type_id: constants.EVENT_TYPE.GENERAL,
            sub_events: {},
            super_event: '',
            super_event_type: '',
        },
    },
    intl,
    disabled: false,
    confirmAction: jest.fn(),
}

describe('TypeSelector', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedTypeSelector {...defaultProps} {...props} />, {context: {intl, store, dispatch}});
    }

    describe('renders', () => {
        describe('components', () => {
            describe('SelectorRadios', () => {
                test('correct default props', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    const radioElements = wrapper.find(SelectorRadio)
                    const elementIds = ['event', 'hobby']
                    const elementValues = ['event', 'hobby']
                    const {type} = instance.state;
                    const elementStates = [type === 'event', type === 'hobby']
                    expect(radioElements).toHaveLength(2)
                    radioElements.forEach((radio, index) => {
                        expect(radio.prop('handleCheck')).toBe(instance.handleTypeChange);
                        expect(radio.prop('messageID')).toBe(elementIds[index]);
                        expect(radio.prop('value')).toBe(elementValues[index]);
                        expect(radio.prop('ariaLabel')).toBe(intl.formatMessage({id: elementIds[index]}))
                        expect(radio.prop('disabled')).toBe(defaultProps.disabled || !instance.state.isCreateView)
                        expect(radio.prop('checked')).toBe(elementStates[index])
                    })
                })
                test('disabled attribute is true if props.disabled is true', () => {
                    const elements = getWrapper({disabled: true}).find(SelectorRadio)
                    elements.forEach((element) => {
                        expect(element.prop('disabled')).toBe(true);
                    });
                });
            })
        })
    })
    describe('methods', () => {
        describe('handleCheck', () => {
            let wrapper;

            beforeEach(() => {
                wrapper = getWrapper();
                dispatch.mockClear()
            });

            const clearValueKeys = ['keywords' ,'enrolment_url', 'enrolment_start_time',
                'enrolment_end_time', 'minimum_attendee_capacity', 'maximum_attendee_capacity']

            const confirmationCall = [
                {action: (e) => {
                    setData({type_id: 'event'})
                    clearValue(clearValueKeys)
                    wrapper.instance().setState({type: 'event'})
                },'additionalMsg': <FormattedMessage id='event-type-switch'/>,
                'additionalMarkup': ' '}]

            const event = (string) => ({target: {value: string}});
            test('hobby', () => {
                const expectedData = {type_id: constants.EVENT_TYPE.HOBBIES}
                expect(wrapper.state('type')).toBe('event');
                wrapper.instance().handleTypeChange(event('hobby'));
                expect(wrapper.state('type')).toBe('hobby');
                expect(dispatch.mock.calls.length).toBe(1);
                expect(dispatch.mock.calls[0][0]).toEqual(setData(expectedData));
            })

            test('event', () => {
                const expectedData = {type_id: constants.EVENT_TYPE.GENERAL}
                wrapper.instance().setState({type: 'hobby'})
                expect(wrapper.state('type')).toBe('hobby');
                wrapper.instance().handleTypeChange(event('event'));
                expect(wrapper.state('type')).toBe('event');
                expect(dispatch.mock.calls.length).toBe(1);
                expect(dispatch.mock.calls[0][0]).toEqual(setData(expectedData));
            })
            test('hobby with keywords should expect spy', () => {
                const editor = {editor: {values: {keywords: mockKeywordSets}}}
                wrapper.instance().setState({type: 'hobby'})
                wrapper.setProps(merge(defaultProps, editor))

                expect(wrapper.state('type')).toBe('hobby');
                wrapper.instance().handleTypeChange(event('event'));
                expect(dispatch.mock.calls.length).toBe(1)
                expect(JSON.stringify(dispatch.mock.calls)).toEqual(JSON.stringify([[confirmAction('confirm-type-switch', 'warning', 'switch-type',
                    ...confirmationCall)]]));
            })
        })
    })
})

