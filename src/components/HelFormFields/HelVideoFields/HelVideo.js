import './HelVideo.scss'
import PropTypes from 'prop-types';
import React from 'react'
import MultiLanguageField from 'src/components/HelFormFields/MultiLanguageField'
import {deleteVideo, setVideoData} from 'src/actions/editor'
import {get} from 'lodash'
import CONSTANTS from '../../../constants'
import {
    injectIntl,
    intlShape,
    FormattedMessage,
} from 'react-intl'
import {HelTextField} from '../index';

class HelVideo extends React.Component {

    static contextTypes = {
        dispatch: PropTypes.func,
    };

    static propTypes = {
        validationErrors: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object,
        ]),
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.noVideos !== this.props.noVideos) {
            this.onBlur()
        }
    }

    /**
     * Build object from refs for videos
     * @returns {{}}
     */
    buildObject() {
        let obj = {}
        // Unwrap connect and injectIntl
        const pairs = _.map(this.refs, (ref, key) => ({
            key: key,
            value: ref.getValue(),
        }))
        for (const key in this.props.defaultValue) {
            pairs.forEach((pair) => {
                obj[pair.key] = pair.value
            })
        }
        return obj
    }

    /**
     * If videoKey exists, dispatch setVideoData with object & key
     */
    onBlur(e) {
        if(this.props.videoKey) {
            let obj = {}
            obj[this.props.videoKey] = this.buildObject()
            this.context.dispatch(setVideoData(obj, this.props.videoKey))
        }
    }

    /**
     * Delete video with matching key
     * @param {number} key
     */
    handleDeleteVideo(key) {
        this.context.dispatch(deleteVideo(key))
    }

    render() {
        const {videoKey, defaultValue, noVideos, languages, intl, length, disabled, validationErrors, localeType, setInitialFocus} = this.props
        const {VALIDATION_RULES} = CONSTANTS
        return (
            <div key={videoKey} className='new-video row'>
                <div className='col-auto'>
                    <FormattedMessage id="event-video-count" values={{count: length}}>{txt => <h4>{txt}</h4>}</FormattedMessage>
                </div>
                <div className='event-videos--item-inputs col-12 order-last'>
                    <HelTextField
                        id={'event-video-url' + videoKey}
                        key='url-video-field'
                        ref='url'
                        index={videoKey}
                        required={true}
                        defaultValue={defaultValue.url}
                        label={intl.formatMessage({id: `${localeType}-video-url`})}
                        validations={[VALIDATION_RULES.IS_URL]}
                        validationErrors={get(validationErrors,['videos', videoKey, 'url'], null)}
                        setInitialFocus={setInitialFocus}
                        onBlur={e => this.onBlur(e)}
                        placeholder='https://...'
                        type='url'
                        disabled={disabled || noVideos}
                        forceApplyToStore
                    />
                    <MultiLanguageField
                        id={'event-video-name' + videoKey}
                        defaultValue={defaultValue.name}
                        ref='name'
                        required={true}
                        multiLine={false}
                        validations={[VALIDATION_RULES.SHORT_STRING]}
                        validationErrors={get(validationErrors,['videos', videoKey, 'name'], null)}
                        label='event-video-name'
                        languages={languages}
                        onBlur={e => this.onBlur(e)}
                        index={videoKey}
                        type='text'
                        disabled={disabled || noVideos}
                    />
                    <MultiLanguageField
                        id={'event-video-alt_text' + videoKey}
                        defaultValue={defaultValue.alt_text}
                        ref='alt_text'
                        required={true}
                        multiLine={false}
                        validations={[VALIDATION_RULES.MEDIUM_STRING]}
                        index={videoKey}
                        validationErrors={get(validationErrors,['videos', videoKey, 'alt_text'], null)}
                        label='event-video-alt_text'
                        languages={languages}
                        onBlur={e => this.onBlur(e)}
                        type='text'
                        disabled={disabled || noVideos}
                    />
                </div>
                <button
                    className='new-video--delete col-auto'
                    onClick={() => this.handleDeleteVideo(videoKey)}
                    style={{left: '480px', position: 'absolute'}}
                    aria-label={intl.formatMessage({id: 'delete'}) + ' ' + intl.formatMessage({id: 'event-video-count'}, {count: length})}
                >
                    <span id="video-del-icon" className="glyphicon glyphicon-trash" aria-hidden="true"><p hidden>trash</p></span>
                </button>
                <div className="w-100"></div>
            </div>
        )
    }
}

HelVideo.propTypes = {
    noVideos: PropTypes.bool,
    languages: PropTypes.array,
    videoKey: PropTypes.string.isRequired,
    defaultValue: PropTypes.object,
    id: PropTypes.string,
    label: PropTypes.string,
    intl: intlShape,
    setInitialFocus: PropTypes.bool,
    length: PropTypes.number,
    disabled: PropTypes.bool,
    editor: PropTypes.object,
    localeType: PropTypes.string,
}

export {HelVideo as UnconnectedHelVideo}
export default (injectIntl(HelVideo));
