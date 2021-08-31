import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {UnconnectedTypeSelector} from '../Selectors/TypeSelector';
import SelectorRadio from '../Selectors/SelectorRadio';
import {setData} from '../../../actions/editor'
import constants from '../../../constants';

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
}

describe('UmbrellaSelector', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedTypeSelector {...defaultProps} {...props} />, {context: {intl, store, dispatch}});
    }

    describe('renders', () => {
        describe('components', () => {
            describe('SelectorRadios', () => {
                test('correct props', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    const radioElements = wrapper.find(SelectorRadio)
                    const elementIds = ['event', 'hobby']
                    const elementValues = ['event', 'hobby']
                    const {type} = instance.state;
                    const elementStates = [type === 'event', type === 'hobby']
                    expect(radioElements).toHaveLength(2)
                    radioElements.forEach((radio, index) => {
                        expect(radio.prop('handleCheck')).toBe(instance.handleCheck);
                        expect(radio.prop('messageID')).toBe(elementIds[index]);
                        expect(radio.prop('value')).toBe(elementValues[index]);
                        expect(radio.prop('ariaLabel')).toBe(intl.formatMessage({id: elementIds[index]}))
                        expect(radio.prop('disabled')).toBe(!instance.state.isCreateView)
                        expect(radio.prop('checked')).toBe(elementStates[index])
                    })
                })
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

            const event = (string) => ({target: {value: string}});
            test('hobby', () => {
                const expectedData = {type_id: constants.EVENT_TYPE.HOBBIES}
                expect(wrapper.state('type')).toBe('event');
                wrapper.instance().handleCheck(event('hobby'));
                expect(wrapper.state('type')).toBe('hobby');
                expect(dispatch.mock.calls.length).toBe(1);
                expect(dispatch.mock.calls[0][0]).toEqual(setData(expectedData));
            })

            test('event', () => {
                const expectedData = {type_id: constants.EVENT_TYPE.GENERAL}
                wrapper.instance().setState({type: 'hobby'})
                expect(wrapper.state('type')).toBe('hobby');
                wrapper.instance().handleCheck(event('event'));
                expect(wrapper.state('type')).toBe('event');
                expect(dispatch.mock.calls.length).toBe(1);
                expect(dispatch.mock.calls[0][0]).toEqual(setData(expectedData));
            })
        })
    })
})

