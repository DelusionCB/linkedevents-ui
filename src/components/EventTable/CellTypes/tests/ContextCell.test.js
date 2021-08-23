import React from 'react';
import ContextCell from '../ContextCell';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';
import {mockUserEvents} from '../../../../../__mocks__/mockData';

import fiMessages from 'src/i18n/fi.json';
const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const mockEvent = mockUserEvents[0]


const defaultProps = {
    event: mockEvent,
    isSuperEvent: true,
    superEventType: 'recurring',
};

describe('ContextCell', () => {
    function getWrapper(props) {
        return shallow(<ContextCell  {...defaultProps} {...props}/>, {context: {intl}});
    }

    describe('methods', () => {
        const mockDraft = {
            publication_status: 'draft',
            event_status: 'EventPostponed',
        };
        describe('getEventStatus', () => {
            test('return obj based on event status', () => {
                const element = getWrapper({event:mockDraft, isSuperEvent: true, superEventType: 'umbrella'});
                const instance = element.instance();
                const returnResult = instance.getEventStatus();
                expect(returnResult.draft).toBe(true);
                expect(returnResult.cancelled).toBe(false);
                expect(returnResult.postponed).toBe(true);
                expect(returnResult.umbrella).toBe(true);
                expect(returnResult.series).toBe(false);
            })    
        })
    })
})
