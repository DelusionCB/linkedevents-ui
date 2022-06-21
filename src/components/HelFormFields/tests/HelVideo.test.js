import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {HelTextField, MultiLanguageField} from '../index';
import CONSTANTS from '../../../constants'
import {deleteVideo, addVideo, setNoVideos, setVideoData} from '../../../actions/editor';
import {UnconnectedHelVideo} from '../HelVideoFields/HelVideo';
import {get} from 'lodash';

const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const dispatch = jest.fn()
const {VALIDATION_RULES} = CONSTANTS

const defaultProps = {
    languages: ['fi'],
    editor: {

    },
    localeType: 'event',
    defaultValue: {
        name: {
            fi: '',
        },
        alt_text: {
            fi: '',
        },
        url: '',
    },

    disabled: false,
    noVideos: false,
    length: 1,
    videoKey: '0',
    setInitialFocus: true,
    validationErrors: {
        videos: [
            {
                url: [],
                alt_text: {},
                name: {},
            },
        ],
    },
    intl,
}

describe('HelVideo', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedHelVideo {...defaultProps} {...props} />, {context: {dispatch}});
    }

    describe('components', () => {
        describe('div', () => {
            test('correct key', () => {
                const wrapper = getWrapper()
                const divElement = wrapper.find('div').at(0)
                expect(divElement.key()).toBe(defaultProps.videoKey)
                expect(divElement.prop('className')).toBe('new-video row')
            })
        })
        describe('formatttedMessages', () => {
            test('correct amount', () => {
                const wrapper = getWrapper()
                const formattedElement = wrapper.find(FormattedMessage)
                expect(formattedElement).toHaveLength(1)
            })
        })
        describe('multilanguageFields', () => {
            const wrapper = getWrapper()
            const videoFields = wrapper.find(MultiLanguageField)
            test('amount of multilanguageFields', () => {
                expect(videoFields).toHaveLength(2)
            })
            test('default props for multilanguageFields', () => {

                const ids = ['event-video-name',
                    'event-video-alt_text']
                const value = [defaultProps.defaultValue.name,
                    defaultProps.defaultValue.alt_text]
                const types = ['text', 'text']
                const minValue = [undefined, undefined]
                const nameRefs = [undefined, undefined]
                const requiredFields = [true, true]
                const multilines = [false, false]
                const classNames = [undefined, undefined]
                const validationErrors = [defaultProps.validationErrors.videos[0].alt_text,
                    defaultProps.validationErrors.videos[0].name]
                const validations = [[VALIDATION_RULES.SHORT_STRING], [VALIDATION_RULES.MEDIUM_STRING]]
                const placeHolders = [undefined, undefined]
                const intialFocus = [undefined, undefined]
                videoFields.forEach((element, index) => {
                    expect(element.prop('id')).toBe(ids[index] + defaultProps.videoKey)
                    expect(element.prop('type')).toBe(types[index])
                    expect(element.prop('min')).toBe(minValue[index])
                    expect(element.prop('defaultValue')).toBe(value[index])
                    expect(element.prop('disabled')).toBe(defaultProps.disabled)
                    expect(element.prop('nameRef')).toBe(nameRefs[index])
                    expect(element.prop('label')).toBe(ids[index])
                    expect(element.prop('languages')).toBe(defaultProps.languages)
                    expect(element.prop('onBlur')).toBeDefined()
                    expect(element.prop('validationErrors')).toStrictEqual(validationErrors[index])
                    expect(element.prop('index')).toStrictEqual(defaultProps.videoKey)
                    expect(element.prop('setInitialFocus')).toBe(intialFocus[index])
                    expect(element.prop('required')).toBe(requiredFields[index])
                    expect(element.prop('multiLine')).toBe(multilines[index])
                    expect(element.prop('placeholder')).toBe(placeHolders[index])
                    expect(element.prop('className')).toBe(classNames[index])
                    expect(element.prop('validations')).toEqual(validations[index])
                })
            })
        })
        
        describe('HelTextField', () => {
            const wrapper = getWrapper()
            const urlField = wrapper.find(HelTextField)
            test('field for url is found', () => {
                expect(urlField).toHaveLength(1)
            })
            test('correct props for url field', () => {
                expect(urlField.prop('id')).toBe('event-video-url' + defaultProps.videoKey)
                expect(urlField.prop('index')).toBe(defaultProps.videoKey)
                expect(urlField.prop('required')).toBe(true)
                expect(urlField.prop('defaultValue')).toBe(defaultProps.defaultValue.url)
                expect(urlField.prop('label')).toBe(intl.formatMessage({id: `${defaultProps.localeType}-video-url`}))
                expect(urlField.prop('validations')).toStrictEqual([VALIDATION_RULES.IS_URL])
                expect(urlField.prop('validationErrors')).toBe(defaultProps.validationErrors.videos[0].url)
                expect(urlField.prop('onBlur')).toBeDefined()
                expect(urlField.prop('placeholder')).toBe('https://...')
                expect(urlField.prop('type')).toBe('url')
                expect(urlField.prop('disabled')).toBe(defaultProps.disabled)
                expect(urlField.prop('forceApplyToStore')).toBe(true)
            })
        })

        describe('button', () => {
            test('correct props', () => {
                const wrapper = getWrapper()
                const buttonElement = wrapper.find('button')
                expect(buttonElement.prop('aria-label')).toBe('Poista Video 1')
                expect(buttonElement.prop('className')).toBe('new-video--delete col-auto')
                expect(buttonElement.prop('onClick')).toBeDefined()

            })
        })
    })

    describe('methods', () => {
        describe('componentDidUpdate', () => {
            test('onBlur is called', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const spy = jest.spyOn(instance, 'onBlur')
                const prevProps = {...instance.props, noVideos: true}
                const prevState = {...instance.state}
                instance.componentDidUpdate(prevProps, prevState)
                expect(spy).toHaveBeenCalled()
                expect(spy).toHaveBeenCalledTimes(1)
            })
        })
        describe('onBlur', () => {
            beforeEach(() => {
                dispatch.mockClear()
            });
            test('setVideoData called with correct params', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const obj = {0: {}}
                instance.onBlur()
                expect(dispatch.mock.calls.length).toBe(1);
                expect(dispatch.mock.calls[0][0]).toEqual(setVideoData(obj, defaultProps.videoKey));
            })
        })
        describe('deleteVideo', () => {
            beforeEach(() => {
                dispatch.mockClear()
            });
            test('called with correct videoKey', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                instance.handleDeleteVideo(defaultProps.videoKey)
                expect(dispatch.mock.calls.length).toBe(1);
                expect(dispatch.mock.calls[0][0]).toEqual(deleteVideo(defaultProps.videoKey));
            })
        })
        describe('buildObject', () => {
            test('returns object determined inside as default', () => {
                const instance = getWrapper().instance();
                expect(instance.buildObject()).toEqual({})
            })
        })
    })
})
