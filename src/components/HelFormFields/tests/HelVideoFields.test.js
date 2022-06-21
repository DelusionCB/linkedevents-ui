import React from 'react';
import {mount, shallow} from 'enzyme';
import {mockEditorNewEvent} from '__mocks__/mockData';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';

jest.mock('@city-i18n/localization.json', () => ({
    mapPosition: [60.451744, 22.266601],
}),{virtual: true});

jest.mock('@city-assets/urls.json', () => ({
    rasterMapTiles: 'this is a url to the maptiles',
}),{virtual: true});

import {UnconnectedHelVideoFields} from '../HelVideoFields/HelVideoFields';
import SelectorRadio from '../Selectors/SelectorRadio';
import {Button} from 'reactstrap';
import {addVideo,setNoVideos} from '../../../actions/editor';
import HelVideo from '../HelVideoFields/HelVideo';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages});
const {intl} = intlProvider.getChildContext();
const mockEditor = mockEditorNewEvent;
const dispatch = jest.fn()


describe('HelVideoFields', () => {
    const defaultProps = {
        localeType: 'event',
        action: 'create',
        setData: jest.fn(),
        validationErrors: {},
        setDirtyState: jest.fn(),
        languages: mockEditor.contentLanguages,
        intl: {intl},
        editorValues: {},
        defaultValues: [],
        disabled: false,
    };
    const MOCK_VIDEO = {
        url: 'http://www.turku.fi/',
        name: {fi: 'This is the finnish name of the first video'},
        alt_text: {fi: 'This is the finnish alt text for the first video.'},
    };
    const MOCK_VIDEO_2 = {
        url: 'http://www.turku.fi/sv',
        name: {fi: 'This is the finnish name of the second video'},
        alt_text: {fi: 'This is the finnish alt text for the second video.'},
    };

    const EMPTY_VIDEO = {
        url: '',
        name: {},
        alt_text: {},
    };

    function getWrapper(props) {
        return mount(<UnconnectedHelVideoFields {...defaultProps} {...props} />, {context: {intl, dispatch}});
    }

    describe('render', () => {
        describe('getToggleRadios', () => {
            test('is called', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                const spy = jest.spyOn(instance, 'getToggleRadios');
                wrapper.setProps({});
                expect(spy).toHaveBeenCalledTimes(1);
            });
        });
        describe('SelectorRadio', () => {
            const selectorRadioElements = getWrapper().find(SelectorRadio);
            test('correct amount of SelectorRadio inputs', () => {
                expect(selectorRadioElements).toHaveLength(2);
            });
            test.each([
                {index: 0, value: 'no_videos', checked: true},
                {index: 1, value: 'has_videos', checked: false},
            ])('SelectorRadio at index %# with correct default props',(
                {index, value, checked}
            ) => {
                const currentElement = selectorRadioElements.at(index);
                expect(currentElement.prop('checked')).toBe(checked);
                expect(currentElement.prop('handleCheck')).toBeDefined();
                expect(currentElement.prop('value')).toBe(value);
                const messageID = value.replace(/_/gi,'-');
                expect(currentElement.prop('messageID')).toEqual(messageID);
                expect(currentElement.prop('disabled')).toEqual(defaultProps.disabled);
            })

            test('elements are disabled if props.disabled is true', () => {
                const disabledRadioElements = getWrapper({disabled: true}).find(SelectorRadio);
                expect(disabledRadioElements.at(0).prop('disabled')).toBe(true);
                expect(disabledRadioElements.at(1).prop('disabled')).toBe(true);
            })
        })
        describe('Button', () => {
            test('is not rendered when state.noVideos', () => {
                const buttonElement = getWrapper().find(Button);
                expect(buttonElement).toHaveLength(0);
            });
            test('is rendered with correct props when !state.noVideos', () => {
                const wrapper = getWrapper({defaultValue: [MOCK_VIDEO]});
                const button = wrapper.find(Button);
                expect(button).toHaveLength(1);
                expect(button.prop('size')).toBe('lg');
                expect(button.prop('disabled')).toBe(false);
                expect(button.prop('block')).toBe(true);
                expect(button.prop('onClick')).toBeDefined();
            });
        });
    });
    describe('lifecycle methods', () => {
        describe('constructor', () => {
            test('state.noVideos is true when no props.defaultValue', () => {
                const wrapper = getWrapper();
                expect(wrapper.state('noVideos')).toBe(true);
            });
            test('state.noVideos is false when props.defaultValue exists', () => {
                const wrapper = getWrapper({defaultValue: [MOCK_VIDEO]});
                expect(wrapper.state('noVideos')).toBe(false);
            });
        });
        describe('componentDidUpdate', () => {
            let wrapper;
            let instance;
            beforeEach(() => {
                wrapper = getWrapper();
                instance = wrapper.instance();
            });
            const videos = [
                MOCK_VIDEO,
                MOCK_VIDEO_2,
            ];

            test('defaultValue prop changed from falsy to truthy -> noVideos changes to false', () => {
                expect(instance.state.noVideos).toBe(true);
                const originalValues = instance.props.defaultValue;
                wrapper.setProps({defaultValue: videos});
                expect(instance.state.noVideos).toBe(false);
                expect(originalValues).not.toBe(instance.props.defaultValue);
            });
            test('defaultValue prop changed from truthy to falsy -> noVideos change to true ', () => {
                wrapper.setProps({defaultValue: videos});
                expect(instance.state.noVideos).toBe(false);
                wrapper.setProps({defaultValue: undefined});
                expect(instance.state.noVideos).toBe(true);
            });
        })

    })
    describe('methods', () => {
        describe('toggleVideos', () => {
            let wrapper;
            let instance;
            beforeEach(() => {
                wrapper = getWrapper();
                instance = wrapper.instance();
            });
            test('calls handleAddVideo when defaultValue is falsy', () => {
                const spy = jest.spyOn(instance, 'handleAddVideo');
                dispatch.mockClear();
                instance.toggleVideos();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(dispatch).toHaveBeenCalledTimes(1);
                expect(dispatch).toHaveBeenCalledWith(addVideo(EMPTY_VIDEO));
            });
            test('calls setNoVideos when defaultValue is truthy', () => {
                wrapper.setProps({defaultValue: [MOCK_VIDEO]});
                dispatch.mockClear();
                instance.toggleVideos();
                expect(dispatch).toHaveBeenCalledTimes(1);
                expect(dispatch).toHaveBeenCalledWith(setNoVideos());
            });
        });

        describe('handleAddVideo', () => {
            test('calls handleAddVideo with correct props', () => {
                const wrapper = getWrapper();
                wrapper.instance().handleAddVideo();
                expect(dispatch).toHaveBeenCalledWith(addVideo(EMPTY_VIDEO));
            });
        });

        describe('generateOffers', () => {
            test('expect NewOffer amount to be same as offers.length', () => {
                const videos = [MOCK_VIDEO, MOCK_VIDEO_2];
                const videosWrapper = getWrapper({defaultValue: videos});
                const videoDetails = videosWrapper.instance().generateVideos();
                const videoWrapper = shallow(<div className="offers">{videoDetails}</div>);
                expect(videoWrapper).toHaveLength(1);
                expect(videoWrapper.find(HelVideo)).toHaveLength(videos.length);
            });

            const testVideos = [MOCK_VIDEO, MOCK_VIDEO_2];
            const wrapper = getWrapper({defaultValue: testVideos});
            const generateVideosReturn = wrapper.instance().generateVideos(testVideos);
            const videoWrapper = shallow(<div>{generateVideosReturn}</div>);
            const videoElements = videoWrapper.find(HelVideo);
            test.each([
                {index: 0},
                {index: 1},
            ])('HelVideo at index %# has correct params', ({index}) => {
                const {
                    editorValues: expectedEditor,
                    defaultValue: expectedValue,
                    validationErrors: expectedErrors,
                    languages: expectedLanguages,
                    disabled: expectedDisabled,
                } = wrapper.instance().props;
                const element = videoElements.at(index);
                expect(element.prop('editor')).toEqual(expectedEditor);
                expect(element.prop('length')).toBe(index + 1);
                expect(element.prop('videoKey')).toBe(index.toString());
                expect(element.prop('defaultValue')).toEqual(expectedValue[index]);
                expect(element.prop('validationErrors')).toEqual(expectedErrors);
                expect(element.prop('languages')).toBe(expectedLanguages);
                expect(element.prop('noVideos')).toBe(wrapper.state('noVideos'));
                expect(element.prop('disabled')).toBe(expectedDisabled);
            });
        });
    })
});
