import './index.scss';

import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {FormattedMessage, injectIntl} from 'react-intl';
import {Button, Modal, ModalHeader, ModalBody} from 'reactstrap';
import {deleteImage} from 'src/actions/userImages.js';
import {connect} from 'react-redux';
import {isEmpty} from 'lodash';
import ImageGalleryGrid from '../ImageGalleryGrid';
import {confirmAction} from 'src/actions/app.js';
import {getStringWithLocale} from 'src/utils/locale';
import classNames from 'classnames'

export class ImagePicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: true,
            edit: false,
            imageFile: null,
            isOpen: false,
        };
    }

    handleDelete(event) {
        const {editor} = this.props;
        let selectedImage = editor.values.image;
        const currentLanguage = this.props.intl.locale;
        if (!isEmpty(selectedImage)) {
            this.props.dispatch(
                confirmAction('confirm-image-delete', 'warning', 'delete', {
                    action: (e) => this.props.dispatch(deleteImage(selectedImage, this.props.user)),
                    additionalMsg: getStringWithLocale(selectedImage, 'name', currentLanguage),
                    additionalMarkup: ' ',
                })
            );
        }
    }

    getModalCloseButton() {
        return (
            <Button onClick={() => this.props.close()} aria-label={this.context.intl.formatMessage({id: `close-image-gallery-modal`})}><span aria-hidden className="glyphicon glyphicon-remove"></span></Button>
        );
    }

    render() {
        const closebtn = this.getModalCloseButton();
        const defaultImages = {items: this.props.images.defaultImages};
        const {defaultModal, editor, user, intl, images, close, uiMode} = this.props;
        const formattedHeader = !defaultModal ? 'event-image-title' : 'default-modal-images'
        return (
            <div className='image-pickers'>
                <Modal
                    className={classNames('image-picker--dialog', uiMode)}
                    isOpen={this.props.isOpen}
                    toggle={this.props.close}
                    size='xl'
                    role='dialog'
                    id='dialog1'
                    aria-modal='true'>

                    <ModalHeader tag='h1' close={closebtn}>
                        <FormattedMessage id={formattedHeader}/>
                    </ModalHeader>
                    <ModalBody>
                        <ImageGalleryGrid
                            editor={editor}
                            user={defaultModal ? null : user}
                            images={defaultModal ? defaultImages : images}
                            locale={intl.locale}
                            defaultModal={defaultModal}
                            action={defaultModal ? null : this.handleDelete}
                            close={close}
                        />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}

ImagePicker.propTypes = {
    editor: PropTypes.object,
    user: PropTypes.object,
    images: PropTypes.object,
    children: PropTypes.element,
    dispatch: PropTypes.func,
    intl: PropTypes.object,
    locale: PropTypes.string,
    isOpen: PropTypes.bool,
    close: PropTypes.func,
    defaultModal: PropTypes.bool,
    uiMode: PropTypes.string,
};

ImagePicker.contextTypes = {
    intl: PropTypes.object,
}

const mapStateToProps = (state) => ({
    user: state.user,
    editor: state.editor,
    images: state.images,
});

export default injectIntl(connect(mapStateToProps)(ImagePicker));
