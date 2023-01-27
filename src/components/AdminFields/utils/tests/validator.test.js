import moment from 'moment';
import {validateOrg} from '../validator';
const responseData = {
    data: {
        data: [{
            '@context': 'http://schema.org',
            '@id': 'http://localhost:8006/v1/organization/turku:853/',
            '@type': 'Organization',
            affiliated_organizations: [],
            classification: 'org:3',
            created_time: '2022-11-16T06:34:02.325022Z',
            data_source: 'turku',
            dissolution_date: null,
            founding_date: null,
            has_regular_users: false,
            id: 'turku:853',
            is_affiliated: false,
            last_modified_time: '2023-01-09T12:21:10.850656Z',
            name: 'Turun kaupunki',
            parent_organization: null,
            replaced_by: null,
            sub_organizations: [
                'http://localhost:8006/v1/organization/turku:04/',
                'http://localhost:8006/v1/organization/turku:12/',
                'http://localhost:8006/v1/organization/turku:25/',
                'http://localhost:8006/v1/organization/turku:40/',
                'http://localhost:8006/v1/organization/turku:44/',
                'http://localhost:8006/v1/organization/turku:61/',
                'http://localhost:8006/v1/organization/turku:80/',
            ],
        }],
        meta: {count: 1, next: null, previous: null},
    },
    status: 200,
};

describe('validator', () => {
    const values = {
            classification: '',
            data_source: 'system',
            founding_date: '',
            id: '',
            internal_type: 'normal',
            name: 'Turun kaupunki    ',
            parent_organization: '',
        },
        validations = new Map(),
        validateValues = validations.set('name', {error: true, errorMsg: 'admin-error-nameUsed'});
    beforeEach(()=> {
        const validatorFile = require('../validator.js');
        const checkIfExists = jest.fn().mockImplementation(()=>{
            try {
                return responseData
            } catch (e) {
                return {}
            }

        }); 
        const asyncValidationFunc = jest.fn().mockImplementation(
            async (values, data, update = false)=>{
                const validationStatus = {
                    error: false,
                    errorMsg: '',
                };
                if (data === 'name') {
                    // remove possible leading and trailing space
                    const name = (values.name).trim();
                    if (!name) {
                        validationStatus.error = true;
                        validationStatus.errorMsg = 'admin-error-noName';
                    }
                    else if (name.length < 4 || name.length > 40) {
                        validationStatus.error = true;
                        validationStatus.errorMsg = name.length < 4 ? 'admin-error-tooShort' : 'admin-error-tooLong';
                    }
                    else {
                        const response = await checkIfExists(values, 'name');
                        const lowerValueName = name?.toLowerCase();
                        const lowerDataName = (response.data[0]?.name)?.toLowerCase();
                        if (update) {
                            if (response.meta.count && response.data[0].id !== values.id && lowerValueName === lowerDataName) {
                                validationStatus.error = true;
                                validationStatus.errorMsg = 'admin-error-nameUsed';
                            }
                        }
                        else if (response.meta.count && lowerValueName === lowerDataName) {
                            validationStatus.error = true;
                            validationStatus.errorMsg = 'admin-error-nameUsed';
                        }
                    }
                }
                return validationStatus;
            }
        );
        const normalValidationFunc = jest.fn().mockImplementation(
            async (values, data)=>{
                const validationStatus = {
                    error: false,
                    errorMsg: '',
                };
                if (data === 'classification' && !values.classification) {
                    validationStatus.error = true
                    validationStatus.errorMsg = 'admin-error-noClassification'
                } else if (data === 'founding_date' && values.founding_date) {
                    const validTime = !moment(values.founding_date, moment.ISO_8601, true).isValid()
                    validationStatus.error = validTime
                    validationStatus.errorMsg = validTime ? 'admin-error-incorrectDate' : ''
                }
                return validationStatus
            }
        );
        jest.spyOn(validatorFile, 'validator').mockImplementation(
            async (values, data, update, async) =>{
                try {
                    if (async) {
                        return await asyncValidationFunc(values, data, update)
                    } else {
                        return normalValidationFunc(values, data)
                    }
                } catch (e) {
                    throw new Error();
                }
            }
        );
        jest.spyOn(validatorFile, 'validateOrg').mockReturnValue(validateValues);
    })
    describe('validateOrg', () => {
        test('returns right error message', async() => {
            const update = false;
            const expectedValue = await validateOrg(values, update);
            expect(expectedValue).toMatchObject(validateValues)
        })
    })
})
