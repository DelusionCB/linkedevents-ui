import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {UnconnectedOrganizationSelect} from '../OrganizationSelect';
import {mockUser, mockOrganizations} from '../../../../../__mocks__/mockData';
import AsyncSelect from 'react-select/async';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const mockSuperAdminUser = JSON.parse(JSON.stringify(mockUser));
mockSuperAdminUser.userType = 'superadmin';

const defaultProps = {
    intl,
    user: mockSuperAdminUser,
    admin: {},
    selectedValue: 'http://localhost:8006/v1/organization/turku:40/',
    name: 'parent_organization',
    disabled: false,
    getSelectedOrg: jest.fn(),
    label: 'test-id',
    organizations: mockOrganizations,
}


function getWrapper(props) {
    return shallow(<UnconnectedOrganizationSelect {...defaultProps} {...props} />, {intl: {intl}});
}

describe('UnconnectedOrganizationSelect', () => {

    describe('Components', () => {
        describe('AsyncSelect', () => {
            const wrapper = getWrapper()
            test('correct props', () => {
                const orgId = defaultProps.selectedValue.split('/').findLast((item)=> item !== ''),
                    organization = defaultProps.organizations.find((org) => org.id === orgId)
                const asyncSelect = wrapper.find(AsyncSelect)
                expect(asyncSelect.prop('value')).toMatchObject({name: organization.name, value: organization['@id']})
                expect(asyncSelect.prop('classNamePrefix')).toBe('user-search')
                expect(asyncSelect.prop('inputId')).toBe('select')
                expect(asyncSelect.prop('isDisabled')).toBe(defaultProps.disabled)
                expect(asyncSelect.prop('defaultOptions')).toBe(true)
                expect(asyncSelect.prop('isClearable')).toBe(false)
                expect(asyncSelect.prop('onChange')).toBeDefined()
                expect(asyncSelect.prop('loadOptions')).toBeDefined()
                expect(asyncSelect.prop('formatOptionLabel')).toBeDefined()
            })
        })
    })
})
