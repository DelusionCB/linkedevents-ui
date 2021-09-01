import React from 'react'
import PropTypes from 'prop-types'
import {getStringWithLocale} from '../../utils/locale';
import {injectIntl} from 'react-intl';
import classNames from 'classnames';

class ImagePreview extends React.PureComponent {
    constructor(props){
        super(props)
        this.state = {
            currentText: props.intl.formatMessage({id: 'no-image'}),
            image: undefined,
        }

        this.getCurrentText = this.getCurrentText.bind(this)
    }

    static getDerivedStateFromProps(props, state) {
        if (props.image !== state.image) {
            return {
                currentText: '',
            };
        }

        return null;
    }

    componentDidUpdate(prevProps) {
        if (this.props.image !== prevProps.image) {
            this.setState({
                image: this.props.image,
                currentText: this.getCurrentText(),
            })
        }

        if (this.props.locale !== prevProps.locale) {
            this.setState({
                currentText: this.getCurrentText(),
            })
        }
    }    

    getCurrentText(){
        const {image, locale, intl} = this.props
        const imgUrl = image ? image.url : null
        const imgName = image ? getStringWithLocale(image, 'name', locale, '') : ''
        if(imgUrl){
            return intl.formatMessage({id: 'chosen-event-image'}, {name: imgName})
        }
        return intl.formatMessage({id: 'no-image'})
    }

    render(){
        const {validationErrors, image} = this.props
        const imgUrl = image ? image.url : null
        const backgroundStyle = {backgroundImage: 'url(' + imgUrl + ')'}

        return (
            <div
                className={classNames('image-picker--preview', {'validationError': validationErrors && !imgUrl})}
                style={imgUrl ? backgroundStyle : undefined}
            >
                <span
                    role="status"
                    aria-live="polite"
                    className={imgUrl ? 'sr-only' : undefined}
                >
                    {this.state.currentText} 
                </span>
            </div>
        )
    }
}

ImagePreview.propTypes = {
    intl: PropTypes.object.isRequired,
    image: PropTypes.object,
    locale: PropTypes.string.isRequired,
    validationErrors: PropTypes.array,
}

export {ImagePreview as UnconnectedImagePreview}
export default injectIntl(ImagePreview)
