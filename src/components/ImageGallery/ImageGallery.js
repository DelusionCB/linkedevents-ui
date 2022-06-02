import React from 'react';
import PropTypes from 'prop-types';
import ImageEdit from '../ImageEdit';
import './index.scss';
import {connect} from 'react-redux';
import {Button} from 'reactstrap';
import {FormattedMessage} from 'react-intl';
import ImagePickerForm from '../ImagePicker';
import {get as getIfExists} from 'lodash';
import ValidationNotification from 'src/components/ValidationNotification'
import classNames from 'classnames';
import ImagePreview from './ImagePreview';
import {getEventLanguageType} from '../../utils/locale';

class ImageGallery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openEditModal: false,
            openOrgModal: false,
            openDefault: false,
        }

        this.toggleEditModal = this.toggleEditModal.bind(this);
        this.toggleOrgModal = this.toggleOrgModal.bind(this);
        this.validationRef = React.createRef();
    }


    toggleEditModal() {
        this.setState({openEditModal: !this.state.openEditModal})
    }

    toggleOrgModal(defaultModal) {
        if (defaultModal === true) {
            this.setState({openDefault: !this.state.openDefault})
        } else {
            this.setState({openOrgModal: !this.state.openOrgModal})
        }
    }

    render() {
        const {validationErrors, user, uiMode, editor} = this.props;
        const {openDefault, openOrgModal} = this.state;
        const backgroundImage = getIfExists(editor.values,'image.url', '');
        const localeType = getEventLanguageType(editor.values.type_id)
        const pickerProps = {
            isOpen: openDefault ? openDefault : openOrgModal,
            defaultModal: openDefault,
        }
        return (
            <React.Fragment>
                <div className='col-sm-6 imageGallery' ref={this.validationRef}>
                    <div/>
                    <Button
                        className='toggleEdit'
                        size='lg'
                        block
                        onClick={this.toggleEditModal}
                        disabled={!user}
                        aria-describedby='image-alert'
                    >
                        <span aria-hidden className="glyphicon glyphicon-plus"/>
                        <FormattedMessage id='upload-new-image' />
                    </Button>
                    <ValidationNotification
                        id='image-alert'
                        anchor={this.validationRef.current}
                        validationErrors={validationErrors}
                        className='validation-notification'
                    />
                    <Button
                        className='toggleOrg'
                        size='lg'
                        block
                        onClick={() => this.toggleOrgModal(false)}
                        disabled={!user}
                    >
                        <span aria-hidden className="glyphicon glyphicon-plus"/>
                        <FormattedMessage id='upload-image-select-bank' />
                    </Button>
                    <Button
                        className='toggleOrg'
                        size='lg'
                        block
                        onClick={() => this.toggleOrgModal(true)}
                        disabled={!user}
                    >
                        <span aria-hidden className="glyphicon glyphicon-plus"/>
                        <FormattedMessage id='select-from-default'/>
                    </Button>
                    <ImageEdit localeType={localeType} uiMode={uiMode} open={this.state.openEditModal} close={this.toggleEditModal}/>
                    <ImagePickerForm uiMode={uiMode} label="image-preview" name="image" loading={false} close={() => this.toggleOrgModal(openDefault)} {...pickerProps}/>
                </div>
                <div className='col-sm-5 side-field'>
                    <div className={classNames('image-picker', {'background': backgroundImage})}>
                        <ImagePreview
                            image={this.props.editor.values.image}
                            locale={this.props.locale}
                            validationErrors={validationErrors}
                            localeType={localeType}
                        />

                    </div>
                </div>
            </React.Fragment>
        )
    }
}

ImageGallery.propTypes = {
    user: PropTypes.object,
    editor: PropTypes.object,
    images: PropTypes.object,
    fetchUserImages: PropTypes.func,
    locale: PropTypes.string,
    validationErrors: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    defaultModal: PropTypes.bool,
    uiMode: PropTypes.string,
};

const mapStateToProps = (state) => ({
    images: state.images,
    user: state.user.data,
    editor: state.editor,
});
export {ImageGallery as UnconnectedImageGallery}
export default connect(mapStateToProps)(ImageGallery)
