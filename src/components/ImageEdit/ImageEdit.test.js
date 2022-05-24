import React from 'react';
import {shallow} from 'enzyme';


import {UnconnectedImageEdit} from './index';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {HelTextField, MultiLanguageField} from '../HelFormFields';
import {Button, Input} from 'reactstrap';
import constants from 'src/constants';
import {mockEditorNewEvent} from '__mocks__/mockData';

const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const {CHARACTER_LIMIT, VALIDATION_RULES} = constants;

const defaultImageFile = {
    lastModified: 1523945176255,
    name: 'test.jpg',
    size: 992558,
    type: 'image/jpeg',
    webkitRelativePath: '',
};


const defaultUser = {
    id: '038d639a-qwer-67n4-a32l-02le73o7a3',
    displayName: 'Erkki Esimerkki',
    firstName: 'Erkki',
    lastName: 'Esimerkki',
}
const defaultProps = {
    imageFile: defaultImageFile,
    thumbnailUrl: 'http://localhost:8080/cba659d9-5440-4a21-9b58-df53064ec763',
    user: defaultUser,
    close: jest.fn(),
    editor: mockEditorNewEvent,
    postImage: jest.fn(),
    intl: {intl},
    updateExisting: false,
};

describe('ImageEdit', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedImageEdit {...defaultProps} {...props}/>, {context: {intl}});
    }

    function longString(length) {
        let str = '';
        for (let i = 0; i < length; i++) {
            str += 'A';
        }
        return str;
    }

    describe('methods', () => {
        describe('componentDidMount', () => {
            test('if updateExisting: true, set image data to state', () => {
                const editImage = {
                    defaultName: {fi: 'default name to edit'},
                    altText: {fi: 'alt-text to edit'},
                    defaultPhotographerName: 'Phil Photo',
                };
                const wrapper = getWrapper({
                    updateExisting: true,
                    defaultName: editImage.defaultName,
                    altText: editImage.altText,
                    defaultPhotographerName: editImage.defaultPhotographerName,
                    license: 'event_only',
                });

                expect(wrapper.state('image')['name']).toEqual(editImage.defaultName);
                expect(wrapper.state('image')['altText']).toEqual(editImage.altText);
                expect(wrapper.state('image')['photographerName']).toEqual(editImage.defaultPhotographerName);
                expect(wrapper.state('license')).toBe('event_only');
            });
        });
        describe('clearPictures', () => {
            test('sets state imageFile and thumbnailUrl values to null', () => {
                const wrapper = getWrapper();
                wrapper.setState({
                    imageFile: defaultImageFile,
                    thumbnailUrl: defaultProps.thumbnailUrl,
                });
                expect(wrapper.state('imageFile')).toBeTruthy();
                expect(wrapper.state('thumbnailUrl')).toBeTruthy();
                wrapper.instance().clearPictures();
                expect(wrapper.state('imageFile')).toBe(null);
                expect(wrapper.state('thumbnailUrl')).toBe(null);
            });
        });
        describe('setAltDecoration', () => {
            test('sets correct boolean value to state.hideAltText based on target.checked', () => {
                const wrapper = getWrapper();
                expect(wrapper.state('hideAltText')).toBe(false);
                wrapper.instance().setAltDecoration({target:{checked: true}});
                expect(wrapper.state('hideAltText')).toBe(true);
                wrapper.instance().setAltDecoration({target:{checked: false}});
                expect(wrapper.state('hideAltText')).toBe(false);
            });
        });

        describe('handlers', () => {
            describe('handleChange', () => {
                test.each(['alt-text','name','photographer']
                )('sets correct value to state.image when called with target.id: %s', (value) => {
                    const wrapper = getWrapper();
                    // key that is used in the state object.
                    let stateKey = value;
                    let initVal = {};
                    let expectedVal = {fi: `${value}-finnish`, sv: `${value}-swedish`};
                    if (value === 'alt-text') {stateKey = 'altText';}
                    if (value === 'photographer') {
                        initVal = '';
                        expectedVal = 'Photographer Phil';
                        stateKey = 'photographerName';
                    }
                    expect(wrapper.state('image')[stateKey]).toEqual(initVal);
                    wrapper.instance().handleChange({target:{id:value}}, expectedVal);
                    expect(wrapper.state('image')[stateKey]).toEqual(expectedVal);

                });
            });

            describe('handleLicenseChange', () => {
                test.each(['cc_by','event_only']
                )('set correct state.license when value is %s', (value) => {
                    const wrapper = getWrapper();
                    if (value === 'event_only') {
                        // default is event_only so we first change to cc_by and then change it back.
                        wrapper.instance().handleLicenseChange({target:{name: 'license_type', value:'cc_by'}});
                        expect(wrapper.state('license')).toEqual('cc_by');
                        wrapper.instance().handleLicenseChange({target:{name: 'license_type', value:value}});
                        expect(wrapper.state('license')).toEqual(value);
                    } else {
                        wrapper.instance().handleLicenseChange({target:{name: 'license_type', value:value}});
                        expect(wrapper.state('license')).toEqual(value);
                    }
                })

                test('if target.name=permission, toggles state.imagePermission boolean', () => {
                    const wrapper = getWrapper();
                    expect(wrapper.state('imagePermission')).toBe(false);

                    wrapper.instance().handleLicenseChange({target:{name:'permission'}});
                    expect(wrapper.state('imagePermission')).toBe(true);

                    wrapper.instance().handleLicenseChange({target:{name:'permission'}});
                    expect(wrapper.state('imagePermission')).toBe(false);

                });
            });

            describe('handleImagePost', () => {
                const defaultBlob = new Blob([JSON.stringify(defaultImageFile)], {type: 'image/jpeg'});
                // let defaultImageBlob = new Blob([JSON.stringify(defaultImageFile)], {type:'image/jpeg'});
                const imageFile = new File([defaultBlob], 'testfile', {
                    type: 'image/jpeg',
                });

                const postImage = jest.fn();
                const close = jest.fn();
                const expectedImageName = imageFile.name.split('.')[0];

                const testImageReader = new FileReader();
                let defaultImage;
                testImageReader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.onload = () => {
                        const canvasElement = document.createElement('canvas');
                        canvasElement.width = img.width;
                        canvasElement.height = img.height;

                        const ctx = canvasElement.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);
                        ctx.canvas.toBlob((blob) => {
                            const canvasReader = new FileReader();
                            canvasReader.onload = () => {
                                defaultImage = canvasReader.result;
                            };
                            canvasReader.readAsDataURL(blob);
                        }, 'image/webp', 0.80);
                    }
                }
                testImageReader.readAsDataURL(imageFile);

                afterEach(() => {
                    postImage.mockReset();
                    close.mockReset();
                })

                test('calls postImage with correct props when !updateExisting', async () => {
                    const wrapper = getWrapper({postImage, close, imageFile});

                    wrapper.setState({imageFile: imageFile, thumbnailUrl: defaultImage});
                    wrapper.instance().handleChange({target:{id:'alt-text'}}, {fi:'finnishAlt'});
                    wrapper.instance().handleChange({target:{id:'name'}}, {fi:'finnishName'});
                    wrapper.instance().handleChange({target:{id:'photographerName'}}, 'Photographer Phil');
                    const expectedImage = defaultImage;
                    await wrapper.instance().handleImagePost();

                    const imageToPost = {
                        alt_text: {
                            fi: 'finnishAlt',
                        },
                        name: {
                            fi: 'finnishName',
                        },
                        file_name: expectedImageName,
                        image: expectedImage,
                        license: 'event_only',
                        photographer_name: 'Photographer Phil',
                    };

                    expect(postImage).toHaveBeenCalledWith(imageToPost,defaultUser,null)
                    expect(close).toHaveBeenCalled();

                });

                test('expect states to be default after postImage', async () => {
                    const wrapper = getWrapper({postImage, close, imageFile});
                    wrapper.setState({imageFile: imageFile, thumbnailUrl: defaultImage});
                    wrapper.instance().handleChange({target:{id:'alt-text'}}, {fi:'finnishAlt'});
                    wrapper.instance().handleChange({target:{id:'name'}}, {fi:'finnishName'});
                    wrapper.instance().handleChange({target:{id:'photographerName'}}, 'Photographer Phil');
                    const expectedImage = defaultImage
                    await wrapper.instance().handleImagePost();

                    const imageToPost = {
                        alt_text: {
                            fi: 'finnishAlt',
                        },
                        name: {
                            fi: 'finnishName',
                        },
                        file_name: expectedImageName,
                        image: expectedImage,
                        license: 'event_only',
                        photographer_name: 'Photographer Phil',
                    };

                    expect(postImage).toHaveBeenCalledWith(imageToPost,defaultUser,null)

                    expect(wrapper.state('imageFile')).toBe(null);
                    expect(wrapper.state('thumbnailUrl')).toBe(null);
                    expect(wrapper.state('image')['altText']).toEqual({});
                    expect(wrapper.state('image')['name']).toEqual({});
                    expect(wrapper.state('image')['photographerName']).toEqual('');
                    expect(wrapper.state('license')).toEqual('event_only');
                    expect(wrapper.state('imagePermission')).toBe(false);
                    expect(wrapper.state('urlError')).toBe(false);
                    expect(wrapper.state('fileSizeError')).toBe(false);
                    expect(wrapper.state('hideAltText')).toBe(false);

                    expect(close).toHaveBeenCalled();
                });

                test('calls postImage with correct props when updateExisting', async () => {
                    const wrapper = getWrapper(
                        {
                            postImage,
                            close,
                            updateExisting:true,
                            id: 1337,
                            defaultName: {fi: 'image name'},
                            altText: {fi: 'alt text'},
                            defaultPhotographerName: 'Phil Photo',
                            thumbnailUrl: defaultProps.thumbnailUrl,
                            license: 'cc_by',
                        });
                    await wrapper.instance().handleImagePost();
                    const imageToPost = {
                        alt_text:{fi:'alt text'},
                        name:{fi:'image name'},
                        id: 1337,
                        license: 'cc_by',
                        photographer_name: 'Phil Photo',
                    };

                    expect(postImage).toHaveBeenCalledWith(imageToPost,defaultUser, 1337);
                    expect(close).toHaveBeenCalled();
                });
                test('calls postImage with correct alt_text when hideAltText-state is true', async () => {
                    const wrapper = getWrapper({postImage, close, imageFile});
                    wrapper.setState({imageFile: imageFile, thumbnailUrl: defaultImage});
                    const checked = (bool) => ({target: {checked: bool}});
                    wrapper.instance().handleChange({target:{id:'alt-text'}}, {fi:'finnishAlt'});
                    wrapper.instance().handleChange({target:{id:'name'}}, {fi:'finnishName'});
                    wrapper.instance().handleChange({target:{id:'photographerName'}}, 'Photographer Phil');
                    wrapper.instance().setAltDecoration(checked(true))
                    const expectedImage = defaultImage
                    await wrapper.instance().handleImagePost();

                    const imageToPost = {
                        alt_text: {
                            fi: 'Kuva on koriste',
                        },
                        name: {
                            fi: 'finnishName',
                        },
                        file_name: expectedImageName,
                        image: expectedImage,
                        license: 'event_only',
                        photographer_name: 'Photographer Phil',
                    };

                    expect(postImage).toHaveBeenCalledWith(imageToPost,defaultUser,null)
                    expect(close).toHaveBeenCalled();
                });
            });
        });

        describe('validateFileSize', () => {
            let wrapper;
            let instance;
            beforeEach(() => {
                wrapper = getWrapper();
                instance = wrapper.instance();
            })
            test('if fileSize is over max size', () => {
                instance.validateFileSizes({size: 2019 * 2020});
                expect(wrapper.state('fileSizeError')).toBe(true)
            });

            test('fileSize is less than max size and fileSizeError is false', () => {
                const returnValue = instance.validateFileSizes({size: 999 * 999});
                expect(wrapper.state('fileSizeError')).toBe(false);
                expect(returnValue).toBe(true);
            });

            test('fileSize is less than max size and fileSizeError is true', () => {
                let returnValue = instance.validateFileSizes({size: 2999 * 2999});
                expect(wrapper.state('fileSizeError')).toBe(true);
                expect(returnValue).toBe(false);
                returnValue = instance.validateFileSizes({size: 999 * 999});
                expect(wrapper.state('fileSizeError')).toBe(false);
                expect(returnValue).toBe(true);
            });
        });

        describe('getIsReadyToSubmit', () => {
            let wrapper;

            beforeEach(() => {
                wrapper = getWrapper();
                wrapper.instance().handleLicenseChange({target:{name:'permission'}});
            })
            test('returns boolean based on if some altText is too short', () => {

                wrapper.instance().handleChange({target:{id:'name'}}, {fi:'finnishName', sv:'swedishName'});
                wrapper.instance().handleChange({target:{id:'alt-text'}}, {fi:'finnishAlt', sv:'swed'});
                wrapper.instance().handleChange({target:{id:'photographerName'}},'Phil Photo');


                expect(wrapper.instance().getNotReadyToSubmit()).toBe(true);
                wrapper.instance().handleChange({target:{id:'alt-text'}}, {fi:'finnishAlt', sv:'swedis'});
                expect(wrapper.instance().getNotReadyToSubmit()).toBe(false);
            });

            test('returns boolean based on if some altText is too long', () => {
                wrapper.instance().handleChange({target:{id:'name'}}, {fi:'finnishName', sv:'swedishName'});
                wrapper.instance().handleChange({target:{id:'photographerName'}},'Phil Photo');
                // max altText length is 320
                const tooLongAlt = longString(322);

                wrapper.instance().handleChange({target:{id:'alt-text'}}, {fi:'finnishAlt', sv:tooLongAlt});

                expect(wrapper.instance().getNotReadyToSubmit()).toBe(true);
                wrapper.instance().handleChange({target:{id:'alt-text'}}, {fi:'finnishAlt', sv:'this is short'});
                expect(wrapper.instance().getNotReadyToSubmit()).toBe(false);
            });

            test('returns boolean based on if some name is too short', () => {
                wrapper.instance().handleChange({target:{id:'name'}}, {fi:'', sv:'swedishName'});
                wrapper.instance().handleChange({target:{id:'alt-text'}}, {fi:'finnishAlt', sv:'swedishAlt'});
                wrapper.instance().handleChange({target:{id:'photographerName'}},'Phil Photo');


                expect(wrapper.instance().getNotReadyToSubmit()).toBe(true);
                wrapper.instance().handleChange({target:{id:'name'}}, {fi:'finnishName', sv:'swedishName'});
                expect(wrapper.instance().getNotReadyToSubmit()).toBe(false);
            });

            test('returns boolean based on if some name is too long', () => {
                wrapper.instance().handleChange({target:{id:'alt-text'}}, {fi:'finnishAlt', sv:'swedishAlt'});
                wrapper.instance().handleChange({target:{id:'photographerName'}},'Phil Photo');
                //max name length is 160
                const tooLongName = longString(170);
                wrapper.instance().handleChange({target:{id:'name'}}, {fi:tooLongName, sv:'swedishName'});

                expect(wrapper.instance().getNotReadyToSubmit()).toBe(true);
                wrapper.instance().handleChange({target:{id:'name'}}, {fi:'finnishName', sv:'swedishName'});
                expect(wrapper.instance().getNotReadyToSubmit()).toBe(false);
            });

            test('returns boolean based on if photographerName exists', () => {
                wrapper.instance().handleChange({target:{id:'name'}}, {fi:'finnishName', sv:'swedishName'});
                wrapper.instance().handleChange({target:{id:'alt-text'}}, {fi:'finnishAlt', sv:'swedishAlt'});

                expect(wrapper.instance().getNotReadyToSubmit()).toBe(true);
                wrapper.instance().handleChange({target:{id: 'photographerName'}}, 'Phil Photo');
                expect(wrapper.instance().getNotReadyToSubmit()).toBe(false);
            });

            test('returns boolean based on if photographerName is too long', () => {
                wrapper.instance().handleChange({target:{id:'name'}}, {fi:'finnishName', sv:'swedishName'});
                wrapper.instance().handleChange({target:{id:'alt-text'}}, {fi:'finnishAlt', sv:'swedishAlt'});

                // max photographer name length is 160
                const longName = longString(161);
                expect(wrapper.instance().getNotReadyToSubmit()).toBe(true);
                wrapper.instance().handleChange({target:{id: 'photographerName'}}, longName);
                expect(wrapper.instance().getNotReadyToSubmit()).toBe(true);
                wrapper.instance().handleChange({target:{id: 'photographerName'}}, 'Short Name');
                expect(wrapper.instance().getNotReadyToSubmit()).toBe(false);
            });

            test('return true if state.imagePermission is false', () => {
                wrapper.instance().handleChange({target:{id:'name'}}, {fi:'finnishName', sv:'swedishName'});
                wrapper.instance().handleChange({target:{id:'alt-text'}}, {fi:'finnishAlt', sv:'swedishAlt'});
                wrapper.instance().handleChange({target:{id:'photographerName'}},'Phil Photo');

                expect(wrapper.instance().getNotReadyToSubmit()).toBe(false);
                wrapper.instance().handleLicenseChange({target:{name:'permission'}});
                expect(wrapper.instance().getNotReadyToSubmit()).toBe(true);
            });
        });
        describe('getCheckedValue', () => {
            const licenseOptions = ['cc_by', 'event_only'];
            test.each(licenseOptions
            )('returns correct obj when state.license === %s', (value) => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                const otherValue = value === licenseOptions[0] ? licenseOptions[1] : licenseOptions[0];
                // other value is set to state, so we can test both true/false for each value.
                wrapper.setState({license: otherValue});

                expect(instance.getCheckedValue(value)).toEqual({checked: false});
                instance.handleLicenseChange({target:{name:'license_type', value:value}});
                expect(instance.getCheckedValue(value)).toEqual({checked: true});
            })
        });
        describe('getLicense', () => {
            const licenseTypes = ['event_only','cc_by'];
            test.each(
                licenseTypes
            )('inputs have correct checked params when state.license === %s', (value) => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                instance.handleLicenseChange({target:{name:'license_type', value: value}});
                const localWrapper = shallow(instance.getLicense());
                const elements = localWrapper.find('input').filterWhere(element => element.prop('name') === 'license_type');
                expect(elements).toHaveLength(2);
                expect(elements.at(0).prop('id')).toBe(licenseTypes[0])
                expect(elements.at(0).prop('checked')).toBe(wrapper.state('license') === licenseTypes[0]);
                expect(elements.at(1).prop('id')).toBe(licenseTypes[1])
                expect(elements.at(1).prop('checked')).toBe(wrapper.state('license') === licenseTypes[1]);
            });
        });
    });

    describe('render', () => {
        describe('contains input -', () => {
            test('two MultiLanguageField with correct parameters', () => {
                const wrapper = getWrapper();
                wrapper.instance().handleChange({target:{id:'alt-text'}},{fi: 'finnish alt-text'});
                wrapper.instance().handleChange({target:{id:'name'}},{fi: 'finnish name'});
                const elements = wrapper.find(MultiLanguageField);
                expect(elements).toHaveLength(2);

                // first MultiLanguageField - altText
                expect(elements.at(0).prop('id')).toBe('alt-text');
                expect(elements.at(0).prop('validations')).toEqual([VALIDATION_RULES.MEDIUM_STRING, VALIDATION_RULES.IS_MORE_THAN_SIX]);
                expect(elements.at(0).prop('label')).toBe('alt-text');
                expect(elements.at(0).prop('maxLength')).toEqual(CHARACTER_LIMIT.MEDIUM_STRING);
                expect(elements.at(0).prop('defaultValue')).toEqual({fi: 'finnish alt-text'});

                // second MultiLanguageField - name
                expect(elements.at(1).prop('id')).toBe('name');
                expect(elements.at(1).prop('validations')).toEqual([VALIDATION_RULES.SHORT_STRING]);
                expect(elements.at(1).prop('label')).toBe('image-caption-limit-for-min-and-max');
                expect(elements.at(1).prop('defaultValue')).toEqual({fi: 'finnish name'});
            });
            test('HelTextField with correct parameters', () => {
                const wrapper = getWrapper();
                wrapper.instance().handleChange({target:{id:'photographer'}},'Phil Photo');
                const element = wrapper.find(HelTextField);

                expect(element).toHaveLength(1);
                expect(element.prop('fullWidth')).toBeDefined();
                expect(element.prop('id')).toEqual('photographer');
                expect(element.prop('name')).toEqual('photographerName');
                expect(element.prop('label')).toBe(intl.formatMessage({id: 'photographer'}))
                expect(element.prop('validations')).toEqual([VALIDATION_RULES.SHORT_STRING]);
                expect(element.prop('maxLength')).toEqual(CHARACTER_LIMIT.SHORT_STRING);
                expect(element.prop('defaultValue')).toEqual('Phil Photo');
            });

            test('three Input components with correct parameters', () => {
                const wrapper = getWrapper();
                const elements = wrapper.find('input');
                expect(elements).toHaveLength(5);
                expect(elements.at(0).prop('type')).toBe('file');
                expect(elements.at(1).prop('type')).toBe('checkbox');
                expect(elements.at(2).prop('type')).toBe('checkbox');
                expect(elements.at(3).prop('type')).toBe('radio');
                expect(elements.at(4).prop('type')).toBe('radio');
                expect(elements.at(0).prop('name')).toBe('file_upload');
                expect(elements.at(1).prop('name')).toBe('decoration');
                expect(elements.at(2).prop('name')).toBe('permission');
                expect(elements.at(3).prop('name')).toBe('license_type');
                expect(elements.at(4).prop('name')).toBe('license_type');
                expect(elements.at(4).prop('value')).toBe('cc_by');
            });
            test('one input component for uploading file via hard disk', () => {
                const wrapper = getWrapper();
                const elements = wrapper.find('input');
                expect(elements).toHaveLength(5);
                expect(elements.at(0).prop('type')).toBe('file');
            })
            test('one Input component for uploading file via url', () => {
                const wrapper = getWrapper();
                const element = wrapper.find(Input);
                expect(element).toHaveLength(1);
                expect(element.prop('type')).toBe('url')
                expect(element.prop('name')).toBe('externalUrl')
            })
        })

        describe('State clearing and decoration', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance()
            const button = wrapper.find(Button).at(2)
            test('clear button sets correct state', () =>{
                wrapper.setState({imageFile: defaultImageFile});
                wrapper.setState({thumbnailUrl: defaultProps.thumbnailUrl});
                expect(button.prop('onClick')).toBe(instance.clearPictures)
                button.simulate('click')
                expect(wrapper.state('imageFile')).toBe(null);
                expect(wrapper.state('thumbnailUrl')).toBe(null);
            })
            test('set hideAltText-state when setAltDecoration is called', () => {
                const checked = (bool) => ({target: {checked: bool}});
                expect(wrapper.state('hideAltText')).toBe(false);
                instance.setAltDecoration(checked(true));
                expect(wrapper.state('hideAltText')).toBe(true);
            })
        })


    });

});

