import {formatValues} from '../admin'
const organizationData = {
    affiliated_organizations:[],
    classification: 'org:3',
    data_source: '',
    founding_date: '2023-01-26',
    id: '',
    internal_type: 'normal',
    name: 'NewTK3',
    origin_id: '',
    parent_organization: 'http://localhost:8006/v1/organization/turku:40/',
    replaced_by: '',
}

describe('methods', () => {
    describe('formatValues', () => {
        test('return data with correct values when creating', () => {
            const result = formatValues(organizationData, false);
            const expectedResult = {
                affiliated_organizations: [],
                classification: 'org:3',
                data_source: '',
                founding_date: '2023-01-26',
                id: '',
                internal_type: 'normal',
                name: 'NewTK3',
                origin_id: '',
                parent_organization: 'http://localhost:8006/v1/organization/turku:40/',
                replaced_by: '',
            }
            expect(result).toStrictEqual(expectedResult);
        });
        test('return data with correct values when updating', () => {
            const data = {...organizationData, id:'dev:agc64ey3m4', data_source:'dev', internal_type: undefined}
            const result = formatValues(data, true);
            const expectedResult = {
                affiliated_organizations: [],
                classification: 'org:3',
                data_source: 'dev',
                founding_date: '2023-01-26',
                id:'dev:agc64ey3m4',
                internal_type: undefined,
                name: 'NewTK3',
                origin_id: '',
                parent_organization: 'http://localhost:8006/v1/organization/turku:40/',
                replaced_by: '',
            }
            expect(result).toStrictEqual(expectedResult);
        });
    })
});
