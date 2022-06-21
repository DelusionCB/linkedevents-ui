import './HelVideoFields.scss';

import React from 'react';
import PropTypes from 'prop-types';
import constants from 'src/constants';
import {addVideo, setNoVideos} from 'src/actions/editor';
import SelectorRadio from '../Selectors/SelectorRadio';
import {Button} from 'reactstrap';
import HelVideo from './HelVideo';
import {FormattedMessage} from 'react-intl';

const  {GENERATE_LIMIT} = constants;

/**
 * empty video object
 * @type {{alt_text: {}, name: {}, url: string}}
 */
const EMPTY_VIDEO = {
    name: {},
    alt_text: {},
    url: '',
};


class HelVideoFields extends React.Component {
    static contextTypes = {
        intl: PropTypes.object,
        dispatch: PropTypes.func,
    };
    constructor(props) {
        super(props);
        this.state = {
            noVideos: !(this.props.defaultValue && this.props.defaultValue.length > 0),
        }
    }


    /**
     * @param prevProps
     * @param prevState
     */
    componentDidUpdate(prevProps, prevState) {
        const {defaultValue: currentValue} = this.props;

        // Did change occur? If so...
        if (prevProps.defaultValue !== currentValue) {
            if(currentValue && currentValue.length > 0) {
                // video array has content
                this.setState({noVideos: false});
            } else {
                // video array is empty
                this.setState({noVideos: true});
            }
        }
    }


    /**
     * Dispatch new video with EMPTY_VIDEO -object
     */
    handleAddVideo() {
        this.context.dispatch(addVideo(EMPTY_VIDEO));
    }

    /**
     * If state noVideos is true, call handleAddVideo
     * Else call setNoVideos & clear all videos from values.
     */
    toggleVideos = () => {
        if (this.state.noVideos) {
            this.handleAddVideo();
        } else {
            this.context.dispatch(setNoVideos());
        }
    }

    /**
     * Generate new videos, each separated into HelVideo -components.
     * @returns {[]}
     */
    generateVideos() {
        const {validationErrors, disabled, defaultValue, languages, localeType, editorValues} = this.props;
        const {noVideos} = this.state;
        const videos = defaultValue;
        const newVideos = [];
        let keys;
        let firstKey;
        if (videos) {
            keys = Object.keys(videos);
            firstKey = keys.length > 1 ? keys[keys.length - 1] : false;
        }
        for (const key in videos) {
            if (videos.hasOwnProperty(key) && !this.state.noVideos) {
                newVideos.push(
                    <HelVideo
                        editor={editorValues}
                        key={key}
                        length={newVideos.length + 1}
                        videoKey={key}
                        defaultValue={defaultValue[key]}
                        validationErrors={validationErrors}
                        languages={languages}
                        noVideos={noVideos}
                        setInitialFocus={key === firstKey}
                        disabled={disabled}
                        localeType={localeType}
                    />
                );
            }
        }
        return newVideos;
    }

    /**
     * Get radios to toggle when ever content has videos or not.
     * @returns {JSX.Element}
     */
    getToggleRadios() {
        const {noVideos} = this.state;
        const {disabled} = this.props;
        return (
            <div className='row video-toggle'>
                <SelectorRadio
                    checked={noVideos}
                    disabled={disabled}
                    handleCheck={this.toggleVideos}
                    messageID='no-videos'
                    value='no_videos'
                />
                <SelectorRadio
                    checked={!noVideos}
                    disabled={disabled}
                    handleCheck={this.toggleVideos}
                    messageID='has-videos'
                    value='has_videos'
                />
            </div>
        )
    }

    render() {
        const {defaultValue, disabled} = this.props;
        const isOverLimit = defaultValue && defaultValue.length >= GENERATE_LIMIT.VIDEO_LENGTH;
        const disabledButton = disabled || isOverLimit || this.state.noVideos;

        return (
            <React.Fragment>
                {this.getToggleRadios()}
                <div className="event-videos">
                    <div className="videos">
                        {defaultValue && this.generateVideos()}
                        <div>
                            {!this.state.noVideos &&
                            <Button
                                size='lg'
                                block
                                disabled={disabledButton}
                                onClick={() => this.handleAddVideo()}
                            >
                                {this.context.intl.formatMessage({id: 'event-video-add'})}
                            </Button>
                            }
                            {isOverLimit &&
                                <p className='videosLimit' role='alert'>
                                    <FormattedMessage id='event-video-add-limit' values={{count: GENERATE_LIMIT.VIDEO_LENGTH}} />
                                </p>
                            }
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

HelVideoFields.propTypes = {
    action: PropTypes.string,
    setData: PropTypes.func,
    clearValue: PropTypes.func,
    defaultValue: PropTypes.array,
    disabled: PropTypes.bool,
    validationErrors: PropTypes.object,
    setDirtyState: PropTypes.func,
    languages: PropTypes.array,
    intl: PropTypes.object,
    editorValues: PropTypes.object,
    localeType: PropTypes.string,
}

export {HelVideoFields as UnconnectedHelVideoFields}
export default HelVideoFields
