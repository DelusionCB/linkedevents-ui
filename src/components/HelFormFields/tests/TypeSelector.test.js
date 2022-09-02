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
        loading: false,
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
                    const elementIds = ['event', 'hobby', 'courses']
                    const elementValues = [constants.EVENT_TYPE.GENERAL, constants.EVENT_TYPE.HOBBIES, constants.EVENT_TYPE.COURSE]
                    const {type} = instance.state;
                    expect(radioElements).toHaveLength(3)
                    radioElements.forEach((radio, index) => {
                        expect(radio.prop('handleCheck')).toBe(instance.handleTypeChange);
                        expect(radio.prop('messageID')).toBe(elementIds[index]);
                        expect(radio.prop('value')).toBe(elementValues[index]);
                        expect(radio.prop('ariaLabel')).toBe(intl.formatMessage({id: elementIds[index]}))
                        expect(radio.prop('disabled')).toBe(defaultProps.disabled || !instance.state.isCreateView)
                        expect(radio.prop('checked')).toBe(type === elementValues[index])
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
        describe('handleTypeChange', () => {

            const event = (string) => ({target: {value: string}});

            describe('changing type when no values to clear', () => {
                beforeEach(() => {
                    dispatch.mockClear()
                });

                test.each([
                    constants.EVENT_TYPE.HOBBIES,
                    constants.EVENT_TYPE.COURSE,
                ])('event to %s, dispatch is called with correct params', (val) => {
                    const wrapper = getWrapper();
                    expect(wrapper.state('type')).toBe(constants.EVENT_TYPE.GENERAL);
                    wrapper.instance().handleTypeChange(event(val));
                    expect(dispatch.mock.calls.length).toBe(1);
                    expect(dispatch.mock.calls[0][0]).toEqual(setData({type_id: val}));
                });

                test.each([
                    constants.EVENT_TYPE.COURSE,
                    constants.EVENT_TYPE.GENERAL,
                ])('hobby to %s, dispatch is called with correct params', (val) => {
                    const wrapper = getWrapper({event: {type_id: constants.EVENT_TYPE.HOBBIES}});
                    expect(wrapper.state('type')).toBe(constants.EVENT_TYPE.HOBBIES);
                    wrapper.instance().handleTypeChange(event(val));
                    expect(dispatch.mock.calls.length).toBe(1);
                    expect(dispatch.mock.calls[0][0]).toEqual(setData({type_id: val}));
                });

                test.each([
                    constants.EVENT_TYPE.GENERAL,
                    constants.EVENT_TYPE.HOBBIES,
                ])('course to %s, dispatch is called with correct params', (val) => {
                    const wrapper = getWrapper({event: {type_id: constants.EVENT_TYPE.COURSE}});
                    expect(wrapper.state('type')).toBe(constants.EVENT_TYPE.COURSE);
                    wrapper.instance().handleTypeChange(event(val));
                    expect(dispatch.mock.calls.length).toBe(1);
                    expect(dispatch.mock.calls[0][0]).toEqual(setData({type_id: val}));
                });
            });

            describe('changing type when values are cleared', () => {
                const clearValueKeys = ['keywords'];
                beforeEach(() => {
                    dispatch.mockClear()
                });
                const expectedCallValue = (wrapper, val) => {
                    const confirmCall = confirmationCall(wrapper, val);
                    const base = confirmAction('confirm-type-switch', 'warning', 'switch-type', ...confirmCall);

                    return JSON.stringify([[base]]);
                };

                const confirmationCall = (wrapper, type) => ([
                    {action: (e) => {
                        setData({type_id: type})
                        clearValue(clearValueKeys)
                        wrapper.instance().setState({type: type})
                    },'additionalMsg': <FormattedMessage id='type-switch'/>,
                    'additionalMarkup': ' '}]);

                test.each([
                    constants.EVENT_TYPE.HOBBIES,
                    constants.EVENT_TYPE.COURSE,
                ])('event to %s, dispatch confirmAction called with correct param to open modal', (val) => {
                    const editor = merge(
                        defaultProps,
                        {editor: {values: {keywords: mockKeywordSets}}}
                    )
                    const wrapper = getWrapper(editor);
                    wrapper.instance().handleTypeChange(event(val));
                    expect(dispatch.mock.calls.length).toBe(1);
                    expect(JSON.stringify(dispatch.mock.calls))
                        .toEqual(expectedCallValue(wrapper, val));
                });

                test.each([
                    constants.EVENT_TYPE.COURSE,
                    constants.EVENT_TYPE.GENERAL,
                ])('hobby to %s, dispatch confirmAction called with correct param to open modal', (val) => {
                    const editor = merge(
                        defaultProps,
                        {editor: {values: {keywords: mockKeywordSets}}},
                        {event: {type_id: constants.EVENT_TYPE.HOBBIES}}
                    )
                    const wrapper = getWrapper(editor);
                    wrapper.instance().handleTypeChange(event(val));
                    expect(dispatch.mock.calls.length).toBe(1);
                    expect(JSON.stringify(dispatch.mock.calls))
                        .toEqual(expectedCallValue(wrapper, val));
                });

                test.each([
                    constants.EVENT_TYPE.GENERAL,
                    constants.EVENT_TYPE.HOBBIES,
                ])('course to %s, dispatch confirmAction called with correct param to open modal', (val) => {
                    const editor = merge(
                        defaultProps,
                        {editor: {values: {keywords: mockKeywordSets}}},
                        {event: {type_id: constants.EVENT_TYPE.COURSE}}
                    )
                    const wrapper = getWrapper(editor);
                    wrapper.instance().handleTypeChange(event(val));
                    expect(dispatch.mock.calls.length).toBe(1);
                    expect(JSON.stringify(dispatch.mock.calls))
                        .toEqual(expectedCallValue(wrapper, val));
                });
            });
        });
    });
})

