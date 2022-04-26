import './index.scss';
import React from 'react';
import PropTypes from 'prop-types';
import {FormattedHTMLMessage, FormattedMessage, injectIntl} from 'react-intl';
import {connect} from 'react-redux';
import {HelTextField, MultiLanguageField} from '../HelFormFields';
import {postImage as postImageAction} from 'src/actions/userImages';
import constants from 'src/constants';
import {Button, Input, InputGroup, InputGroupAddon, Modal, ModalBody, ModalHeader} from 'reactstrap';
import update from 'immutability-helper';
import {getStringWithLocale} from 'src/utils/locale';
import validationFn from 'src/validation/validationRules'
import classNames from 'classnames'
import {browserVersion, isFirefox, isSafari} from 'react-device-detect';

const {CHARACTER_LIMIT, VALIDATION_RULES} = constants;

const INITIAL_STATE = {
    image: {
        name: {},
        altText: {},
        photographerName: '',
    },
    license: 'event_only',
    imagePermission: false,
    edit: false,
    imageFile: null,
    thumbnailUrl: null,
    urlError: false,
    fileSizeError: false,
    hideAltText: false,
};

class ImageEdit extends React.Component {
    constructor(props) {
        super(props);
        this.hiddenFileInput = React.createRef();
        this.state = {
            validation: {
                altTextMinLength: 6,
                photographerMaxLength: CHARACTER_LIMIT.SHORT_STRING,
                nameMaxLength: CHARACTER_LIMIT.SHORT_STRING,
                altTextMaxLength: CHARACTER_LIMIT.MEDIUM_STRING,
            },
            image: {
                name: {},
                altText: {},
                photographerName: '',
            },
            license: 'event_only',
            imagePermission: false,
            edit: false,
            imageFile: null,
            thumbnailUrl: null,
            urlError: false,
            fileSizeError: false,
            hideAltText: false,
        };

        this.getCloseButton = this.getCloseButton.bind(this);
        this.handleImagePost = this.handleImagePost.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleLicenseChange = this.handleLicenseChange.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
        this.clearPictures = this.clearPictures.bind(this);
        this.setAltDecoration = this.setAltDecoration.bind(this);
    }

    componentDidMount() {
        const {
            altText,
            defaultName,
            defaultPhotographerName,
            license,
            updateExisting,
        } = this.props;
        if (updateExisting) {
            this.setState(
                {
                    image:
                        {
                            name: defaultName || {},
                            altText: altText || {},
                            photographerName: defaultPhotographerName || '',
                        },
                    license: license,
                });
        }
    }


    handleUpload(e) {
        const file = e.target.files[0];
        if (file && !this.validateFileSizes(file)) {
            return;
        }
        const fileReader = new FileReader();
        fileReader.addEventListener('load', (event) => {
            // New img element is created with the uploaded image.
            const img = document.createElement('img');
            img.src = event.target.result;
            img.onload = () => {
                // Canvas element is created with content from the new img.
                const canvasElement = document.createElement('canvas');
                canvasElement.width = img.width;
                canvasElement.height = img.height;

                const ctx = canvasElement.getContext('2d');
                ctx.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);
                ctx.canvas.toBlob((blob) => {
                    const isLegacyFF = isFirefox && Number.parseInt(browserVersion, 10) < 96;
                    let finalBlob = blob;
                    // FF versions < 96 & Safari don't support toBlob type image/webp so a temporary webp file is created and used.
                    if (isLegacyFF || isSafari) {
                        finalBlob = new File([blob], 'file', {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });
                    }

                    const canvasReader = new FileReader();
                    canvasReader.onload = () => {
                        this.setState({
                            edit: true,
                            imageFile: file,
                            thumbnailUrl: canvasReader.result,
                        });
                    };

                    /**
                     * New webp image is only used if the original file wasn't already webp
                     * and if the new webp file is smaller than the original file.
                     */
                    if (file.type !== 'image/webp' && file.size > finalBlob.size) {
                        canvasReader.readAsDataURL(finalBlob);
                    } else {
                        canvasReader.readAsDataURL(file);
                    }


                }, 'image/webp', 0.80);
            };
        }, false);
        fileReader.readAsDataURL(file);
    }

    validateFileSizes = (file) => {
        const maxSizeInMB = 4;
        const decimalFactor = 1000 * 1000;
        const fileSizeInMB = file.size / decimalFactor;

        if (fileSizeInMB > maxSizeInMB) {
            this.setState({
                fileSizeError: true,
            });
            return false;
        }
        if (this.state.fileSizeError) {
            this.setState({
                fileSizeError: false,
            });
        }
        return true;

    };

    handleInputBlur() {
        const myData = document.getElementById('upload-external')
        const formData = new FormData(myData);
        const url = formData.get('externalUrl')
        if (!validationFn['isUrl'](undefined, url, undefined)) {
            this.setState({urlError: true});
            return false
        }
        if (this.state.urlError) {
            this.setState({urlError: false});
        }
        return true

    }

    handleExternalImageSave = () => {
        event.preventDefault();
        const externalElement = document.getElementById('upload-external')
        const formData = new FormData(externalElement);
        const externalUrlValue = formData.get('externalUrl');
        this.setState({thumbnailUrl: externalUrlValue, imageFile: null});
    }

    clickHiddenUpload() {
        this.hiddenFileInput.current.click();
    }

    /**
     * Clears both picture states if user decides to use different picture
     */
    clearPictures() {
        this.setState({
            imageFile: null,
            thumbnailUrl: null,
        })
    }

    /**
     * Handles setting decorative altText for picture and hiding inputs
     * @param e
     */
    setAltDecoration(e) {
        this.setState({hideAltText: e.target.checked})
    }

    /**
     * Handles the license radio input/image permission checkbox onClicks.
     * name = license_type -> set selected value to state.license
     * name = permission -> toggles state.imagePermission
     * @param e
     */
    handleLicenseChange(e) {
        if(e.target.name === 'license_type') {
            if (e.target.value === 'cc_by' || e.target.value === 'event_only') {
                this.setState({license: e.target.value});
            }
        }
        if (e.target.name === 'permission') {
            this.setState({imagePermission: !this.state.imagePermission})
        }
    }


    /**
     * Modifies/finalizes the object that is then dispatched to the server,
     * when !updateExisting the encoded base64 string that the thumbnail also uses is added to the object that is dispatched.
     * @returns {Promise<void>}
     */
    async handleImagePost() {
        const {
            hideAltText,
            image,
            imageFile: stateImageFile,
            license,
            thumbnailUrl,
        } = this.state;
        const {
            close,
            editor: {contentLanguages},
            id,
            imageFile,
            postImage,
            updateExisting,
            user,
        } = this.props;

        let imageToPost = {
            name: image['name'],
            alt_text: image['altText'],
            photographer_name: image['photographerName'],
            license: license,
        };
        if (hideAltText) {
            const decorationAlts = contentLanguages.reduce((acc,curr)  => {
                acc[curr] = this.context.intl.formatMessage({id: `description-alt.${curr}`});
                return acc;
            },  {});
            // default image alt texts are set.
            imageToPost = update(imageToPost, {
                alt_text:{$set: decorationAlts},
            });
        }
        if (!updateExisting) {
            if (imageFile || stateImageFile) {
                imageToPost = update(imageToPost,{
                    image:{$set: thumbnailUrl},
                    file_name:{$set: stateImageFile.name.split('.')[0]},
                });
            } else {
                imageToPost = update(imageToPost,{
                    url:{$set: thumbnailUrl},
                });
            }
        }
        postImage(imageToPost, user, updateExisting ? id : null);
        this.setState(INITIAL_STATE);
        close();
    }

    /**
     * Sets value to correct location in state
     * @example
     * this.state.image: {name:{}, altText:{},...}
     * handleChange({target:{id: name}} {fi:'some text'})
     * this.state.image: {name:{fi: 'some text'},altText:{},...}
     * handleChange({target:{id: altText}} {fi:'alt text here'})
     * this.state.image: {name:{fi: 'some text'},altText:{fi:'alt text here'},...}
     * @param event
     * @param value
     */
    handleChange(event, value){
        const {id} = event.target;
        let localImage = this.state.image;
        if (id.includes('alt-text')) {
            localImage = update(localImage, {
                'altText': {
                    $set: value,
                },
            });
        }
        else if (id.includes('name')) {
            localImage = update(localImage, {
                'name': {
                    $set: value,
                },
            });
        }
        else if (id.includes('photographer')) {
            localImage['photographerName'] = update(localImage['photographerName'], {
                $set: value,
            })
        }
        this.setState({image: localImage});
    }

    getCloseButton() {
        return (
            <Button
                className='icon-button'
                type='button'
                aria-label={this.context.intl.formatMessage({id: `close-image-edit-modal`})}
                onClick={() => this.props.close()}
            >
                <span className='glyphicon glyphicon-remove' />
            </Button>
        )
    }

    getFields() {
        const {hideAltText, image, validation} = this.state;
        const {editor: {contentLanguages}} = this.props;
        return (
            <React.Fragment>
                {!hideAltText &&
                    <MultiLanguageField
                        id='alt-text'
                        multiLine
                        required={true}
                        defaultValue={image.altText}
                        validations={[VALIDATION_RULES.MEDIUM_STRING, VALIDATION_RULES.IS_MORE_THAN_SIX]}
                        label='alt-text'
                        languages={contentLanguages}
                        maxLength={validation.altTextMaxLength}
                        onChange={this.handleChange}
                        onBlur={this.handleChange}
                        type='text'
                    />
                }
                <MultiLanguageField
                    id='name'
                    multiLine
                    required={true}
                    defaultValue={image.name}
                    validations={[VALIDATION_RULES.SHORT_STRING]}
                    label='image-caption-limit-for-min-and-max'
                    languages={contentLanguages}
                    onChange={this.handleChange}
                    onBlur={this.handleChange}
                    type='text'
                />

                <HelTextField
                    fullWidth
                    id='photographer'
                    name='photographerName'
                    required={true}
                    defaultValue={image.photographerName}
                    label={this.context.intl.formatMessage({id: 'photographer'})}
                    validations={[VALIDATION_RULES.SHORT_STRING]}
                    maxLength={validation.photographerMaxLength}
                    onChange={this.handleChange}
                    type='text'
                />
            </React.Fragment>
        )
    }

    /**
     * Used to determine 'checked' property of license_type input elements.
     * @param {string} prop
     * @returns {{checked: boolean}}
     */
    getCheckedValue = (prop) => ({checked: prop === this.state.license})

    getLicense() {
        const {imagePermission} = this.state;
        const {localeType} = this.props;
        return (
            <div className='image-license-container'>
                <div className='license-choices'>
                    <div className='license-help-text tip'>
                        <FormattedMessage id={`${localeType}-image-modal-image-license-explanation-only`}/>
                        <FormattedHTMLMessage id={'image-modal-image-license-explanation-cc-by'} />
                    </div>
                    <div className='custom-control custom-checkbox'>
                        <input
                            className='custom-control-input'
                            type='checkbox'
                            id='permission'
                            name='permission'
                            onChange={this.handleLicenseChange}
                            checked={imagePermission}
                        />
                        <label className='custom-control-label' htmlFor='permission'>
                            <FormattedMessage id={'image-modal-image-license-permission'}>{txt => txt}</FormattedMessage>
                        </label>
                    </div>
                    <div className='custom-control custom-radio'>
                        <input
                            className='custom-control-input'
                            type='radio'
                            id='event_only'
                            name='license_type'
                            value='event_only'
                            onChange={this.handleLicenseChange}
                            {...this.getCheckedValue('event_only')}
                        />
                        <label className='custom-control-label' htmlFor='event_only'>
                            <FormattedMessage id={`${localeType}-image-modal-license-restricted`}/>
                        </label>
                    </div>
                    <div className='custom-control custom-radio'>
                        <input
                            className='custom-control-input'
                            type='radio'
                            id='cc_by'
                            name='license_type'
                            value='cc_by'
                            onChange={this.handleLicenseChange}
                            {...this.getCheckedValue('cc_by')}
                        />
                        <label className='custom-control-label' htmlFor='cc_by'>
                            Creative Commons BY 4.0
                        </label>
                    </div>
                </div>
            </div>
        )
    }

    /**
     * Returns true if some value in altText:{} or name:{} is too short or too long, or imagePermission is false
     * @returns {boolean}
     */
    getNotReadyToSubmit() {
        const {altTextMinLength, altTextMaxLength, nameMaxLength, photographerMaxLength} = this.state.validation;
        const {name, altText, photographerName} = this.state.image;
        const {imagePermission, hideAltText} = this.state;

        const altTextTooShort = Object.values(altText).some(value => value.length < altTextMinLength);
        const altTextTooLong = Object.values(altText).some(value => value.length > altTextMaxLength);
        const nameTooShort = Object.values(name).some(value => value.length === 0);
        const nameTooLong = Object.values(name).some(value => value.length > nameMaxLength);
        const photographerNameNotValid = photographerName.length === 0 || photographerName.length > photographerMaxLength;
        if (hideAltText) {
            return nameTooShort || nameTooLong || photographerNameNotValid || !imagePermission;
        }
        else {
            return (altTextTooShort || altTextTooLong) || nameTooShort || nameTooLong || photographerNameNotValid || !imagePermission;
        }
    }



    render() {
        const {open, close, uiMode, localeType} = this.props;
        const thumbnailUrl = this.state.thumbnailUrl || this.props.thumbnailUrl;
        const errorMessage = this.state.urlError ? 'validation-isUrl' : 'uploaded-image-size-error';
        return (
            <React.Fragment>
                <Modal
                    className={classNames('image-edit-dialog', uiMode)}
                    role='dialog'
                    size='xl'
                    isOpen={open}
                    toggle={close}
                >
                    <ModalHeader tag='h1' close={this.getCloseButton()}>
                        <FormattedMessage id={'image-modal-image-info'}/>
                    </ModalHeader>
                    <ModalBody>
                        <div>
                            <div className='col-sm-12  image-edit-dialog--form'>
                                {!this.props.updateExisting &&
                                <div className='file-upload'>
                                    <div className='tip'>
                                        <p>
                                            <FormattedMessage id='uploaded-image-size-tip'>{txt => txt}</FormattedMessage>
                                            <br/>
                                            <FormattedMessage id='uploaded-image-size-tip2'>{txt => txt}</FormattedMessage>
                                            <br/>
                                            <FormattedMessage id='uploaded-image-event-tip'>{txt => txt}</FormattedMessage>
                                        </p>
                                    </div>
                                    <div className='file-upload-buttons'>
                                        <div className='file-upload--new'>
                                            <input
                                                onChange={(e) => this.handleUpload(e)}
                                                style={{display: 'none'}}
                                                name='file_upload'
                                                type='file'
                                                ref={this.hiddenFileInput}
                                                accept='image/png, image/jpeg, image/webp'
                                                aria-hidden
                                            />
                                            <Button
                                                size='xl' block
                                                className='upload-img'
                                                variant='contained'
                                                onClick={() => this.clickHiddenUpload()}
                                            >
                                                <FormattedMessage id='upload-image' />
                                            </Button>
                                        </div>
                                        <div className='file-upload--external'>
                                            <form onSubmit={this.handleExternalImageSave} id='upload-external'>
                                                <label className='image-url'>
                                                    <FormattedMessage id='upload-image-from-url' />
                                                    <InputGroup>
                                                        <InputGroupAddon className='inputIcons' addonType="prepend">
                                                            <span aria-hidden className="glyphicon glyphicon-link"/>
                                                        </InputGroupAddon>
                                                        <Input
                                                            className='file-upload--external-input'
                                                            name='externalUrl'
                                                            onBlur={this.handleInputBlur}
                                                            type='url'
                                                        />
                                                    </InputGroup>
                                                </label>
                                                {(this.state.fileSizeError || this.state.urlError) && (
                                                    <React.Fragment>
                                                        <FormattedMessage id={errorMessage}>{txt => <p role="alert" className='image-error'>{txt}</p>}</FormattedMessage>
                                                    </React.Fragment>
                                                )}
                                                <Button
                                                    size='xl' block
                                                    className='file-upload--external-button'
                                                    variant='contained'
                                                    color='primary'
                                                    type='submit'
                                                >
                                                    <FormattedMessage id='upload-image-from-url-button' />
                                                </Button>
                                                <div className='image'>
                                                    <img className="col-sm-6 image-edit-dialog--image" src={thumbnailUrl} alt={getStringWithLocale(this.state.image,'altText')} />
                                                </div>
                                                <div className='tools'>
                                                    <Button
                                                        onClick={this.clearPictures}
                                                        variant='contained'
                                                        color='primary'
                                                        size='xl' block
                                                    >
                                                        <FormattedMessage id='uploaded-image-button-delete' />
                                                    </Button>
                                                    <div className='custom-control custom-checkbox'>
                                                        <input
                                                            className='custom-control-input'
                                                            id='hideAltText'
                                                            name='decoration'
                                                            type="checkbox"
                                                            onChange={this.setAltDecoration}
                                                        />
                                                        <label className='custom-control-label' htmlFor='hideAltText'>
                                                            <FormattedMessage id={`${localeType}-uploaded-image-alt-decoration`}/>
                                                        </label>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                }

                                {this.getFields()}
                                <div className='help-license'>
                                    <FormattedMessage id='image-modal-image-license'>{txt => <h2>{txt}</h2>}</FormattedMessage>
                                </div>
                                {this.getLicense()}
                                <div className="help-notice">
                                    <FormattedHTMLMessage id={'image-modal-view-terms-paragraph-text'}/>
                                </div>
                            </div>
                            <div className="col-sm-12">
                                <Button
                                    size="lg" block
                                    type="button"
                                    color="primary"
                                    variant="contained"
                                    disabled={this.getNotReadyToSubmit()}
                                    onClick={() => this.handleImagePost()}
                                >
                                    <FormattedMessage id={'image-modal-save-button-text'}>{txt => txt}</FormattedMessage>
                                </Button>
                            </div>
                        </div>
                    </ModalBody>
                </Modal>
            </React.Fragment>
        )
    }
}

ImageEdit.propTypes = {
    editor: PropTypes.object,
    close: PropTypes.func,
    thumbnailUrl: PropTypes.string,
    imageFile: PropTypes.object,
    id: PropTypes.number,
    postImage: PropTypes.func,
    user: PropTypes.object,
    updateExisting: PropTypes.bool,
    defaultName: PropTypes.object,
    altText: PropTypes.object,
    defaultPhotographerName: PropTypes.string,
    license: PropTypes.string,
    open: PropTypes.bool,
    uiMode: PropTypes.string,
    localeType: PropTypes.string,
};
ImageEdit.contextTypes = {
    intl: PropTypes.object,
}

const mapStateToProps = (state) => ({
    user: state.user.data,
    editor: state.editor,
    images: state.images,
});

const mapDispatchToProps = (dispatch) => ({
    postImage: (data, user, id) => dispatch(postImageAction(data, user, id)),
});

export {ImageEdit as UnconnectedImageEdit}
// export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ImageEdit));
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ImageEdit))

