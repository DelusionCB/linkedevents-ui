import React from 'react';
import {UnconnectedValidationCell} from '../ValidationCell';
import {Tooltip, Button} from 'reactstrap';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';

import fiMessages from 'src/i18n/fi.json';
const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
import {mockUserEvents, mockKeywordSets} from '../../../../../__mocks__/mockData';
const mockEvent = mockUserEvents[0];

const defaultProps = {
    event: mockEvent,
    handleInvalidRow: jest.fn(),
    routerPush: jest.fn(),
    intl,
    editor: {
        contentLanguages: ['fi'],
        keywordSets: mockKeywordSets,
        loading: false,
        validateFor: 'public',
        validationErrors: {},
        values: {
            sub_events: {},
        },
    },
};

describe('ValidationCell', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedValidationCell {...defaultProps} {...props}/>, {intl});
    }

    describe('components', () => {

        describe('td', () => {
            test('correct className with hasErrors being true', () => {
                const wrapper = getWrapper()
                wrapper.setState({hasErrors: true})
                const element = wrapper.find('td');
                expect(element.prop('className')).toBe('validation-cell error')
            })
            test('correct className with hasErrors being false', () => {
                const wrapper = getWrapper()
                wrapper.setState({hasErrors: false})
                const element = wrapper.find('td');
                expect(element.prop('className')).toBe('validation-cell')
            })
        })
        describe('button', () => {
            test('correct props & length while hasErrors is true', () => {
                const wrapper = getWrapper()
                wrapper.setState({hasErrors: true})
                const instance = wrapper.instance()
                const element = wrapper.find(Button);
                expect(element).toHaveLength(1)
                expect(element.prop('aria-label')).toBe('Tapahtumatiedoissa on puutteita. Muokkaa tapahtumaa ennen julkaisua.')
                expect(element.prop('id')).toBe('validationAlert')
                expect(element.prop('onClick')).toBe(instance.moveToEdit)
            })
            test('correct length while hasErrors is false', () => {
                const wrapper = getWrapper()
                wrapper.setState({hasErrors: false})
                const element = wrapper.find(Button);
                expect(element).toHaveLength(0)
            })
        })
        describe('span', () => {
            test('correct props & length while hasErrors is true', () => {
                const wrapper = getWrapper()
                wrapper.setState({hasErrors: true})
                const element = wrapper.find('span');
                expect(element).toHaveLength(1)
                expect(element.prop('aria-hidden')).toBe(true)
                expect(element.prop('className')).toBe('glyphicon glyphicon-alert')
            })
            test('correct length while hasErrors is false', () => {
                const wrapper = getWrapper()
                wrapper.setState({hasErrors: false})
                const element = wrapper.find('span');
                expect(element).toHaveLength(0)
            })
        })
        describe('tooltip', () => {
            test('correct props & length while hasErrors is true', () => {
                const wrapper = getWrapper()
                wrapper.setState({hasErrors: true})
                const instance = wrapper.instance()
                const element = wrapper.find(Tooltip);
                expect(element).toHaveLength(1)
                expect(element.prop('isOpen')).toBe(instance.state.tooltipOpen)
                expect(element.prop('target')).toBe('validationAlert')
                expect(element.prop('toggle')).toBe(instance.toggleTooltip)
            })
            test('correct length while hasErrors is false', () => {
                const wrapper = getWrapper()
                wrapper.setState({hasErrors: false})
                const instance = wrapper.instance()
                const element = wrapper.find(Tooltip);
                expect(element).toHaveLength(0)
            })
        })
    })
    describe('methods', () => {
        describe('toggleTooltip', () => {
            test('state changes correctly', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                expect(wrapper.state('tooltipOpen')).toBe(false)
                instance.toggleTooltip()
                expect(wrapper.state('tooltipOpen')).toBe(true)
            })
        })
        describe('moveToEdit', () => {
            test('routerPush is called', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                const spy = jest.spyOn(wrapper.instance().props, 'routerPush')
                instance.moveToEdit(defaultProps.event)
                expect(spy).toHaveBeenCalledWith( `/event/update/${defaultProps.event.id}`)
            })
        })
    })
})