import './index.scss';

import React from 'react';
import PropTypes from 'prop-types'
import ImagePagination from './ImagePagination';
import {get as getIfExists} from 'lodash'
import {connect} from 'react-redux'
import {fetchUserImages as fetchUserImagesAction} from 'src/actions/userImages'
import ImageThumbnail from '../ImageThumbnail'
import {Button, Input, Label, Form, InputGroup, InputGroupAddon} from 'reactstrap';
import Spinner from 'react-bootstrap/Spinner';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import classNames from 'classnames';
import moment from 'moment'
import {MultiSelect} from '../../components/MultiSelect/MultiSelect'
import {transformOrganizationData} from '../../utils/helpers'
class ImageGalleryGrid extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            searchString: '',
            selectedPublishers: [],
        }
    }

    componentDidMount() {
        this.fetchImages();
    }

    componentDidUpdate(_, prevState) {    
        if (prevState.selectedPublishers !== this.state.selectedPublishers) {
            this.fetchImages();
        }
    }

    /**
     * Fetch images based on conditionals.
     * default fetch uses pageSize & pageNumber as default params.
     *
     * If defaultModal is true, pass 'true' to fetchUserImages, this sets publicImages true and
     * fetches default images which everyone can use.
     *
     * If user is logged in & searchString-state is not empty string, pass 'false' (publicImages), 'true' (filter) & searchString (filterString)
     * into request. This creates filtered fetch & brings items based on the searchString.
     *
     * @param {object} user
     * @param {number} pageSize Size of the items in request
     * @param {number} pageNumber Number of the page as pageSize is limited
     */
    fetchImages = (user = this.props.user, pageSize = this.props.pageSize, pageNumber = 1) => {
        const {fetchUserImages, defaultModal} = this.props;
        const {searchString, selectedPublishers} = this.state;
        let publisher = null;
        if(user && !!selectedPublishers){
            publisher = selectedPublishers.join(',')
        }
        const parameters = [pageSize, pageNumber,publisher]
        if (defaultModal) {
            parameters.push(true)
        } else if (user && searchString !== '') {
            parameters.push(false, true, searchString.trim())
        }
        fetchUserImages(...parameters);
    };

    /**
     * Get the desired page number as a parameter and fetch images for that page
     * @param {number} pageNumber
     * @param e Used for prevent default
     */
    changeImagePage = (pageNumber, e) => {
        e.preventDefault();
        this.fetchImages(this.props.user, 50, pageNumber);
    };

    /**
     * @param {string} e string to set state
     */
    searchOnChange = (e) => {
        this.setState({searchString: e})
    }
    /**
     * preventDefault & fetch images
     */
    submitHandler = () => {
        event.preventDefault();
        this.fetchImages();
    }

    formatDateTime = (dateTime) => {
        return moment(dateTime).format('D.M.YYYY H.mm')
    }

    /**
     * handles multiple organization selection
     * @param options currently selected organizations
     */
    handleOrganizationValueChange = async (options,e) => {
        if(options){
            const selectOrgs = options.map(item => item.value);
            this.setState((state)=>({
                ...state,
                selectedPublishers: selectOrgs,
            }
            ))
        }
    }

    render() {
        // save the id of the selected image of this event (or editor values)
        let selected_id = getIfExists(this.props.editor.values, 'image.id', null);
        // build the classes for the thumbnails
        let images = this.props.images.items.map((img) => {
            let selected = selected_id === img.id
            return (
                <div className='col-md-3 col-xs-12' key={img.id}>
                    <ImageThumbnail
                        locale={this.props.intl.locale}
                        selected={selected}
                        key={img.id}
                        url={img.url}
                        data={img}
                        defaultModal={this.props.defaultModal}
                        close={this.props.close}
                        user={this.props.user}
                        isSharedImage={img.is_shared_within_org}
                        publisher={img.publisher}
                    />
                    {
                        this.props.showImageDetails && (
                            <div className='imageDetails'> 
                                <p><FormattedMessage id='manage-media-publisher' /> {img.publisher_name}</p>
                                <p><FormattedMessage id='manage-media-created' /> {this.formatDateTime(img.created_time)}</p>
                                <p><FormattedMessage id='manage-media-last-modified' /> {this.formatDateTime(img.last_modified_time)}</p>
                            </div>
                        )
                    }
                </div >
            )
        });
       
        // ...and finally check if there is no image for this event to be able to set the class
        const {isFetching, fetchComplete, meta} = this.props.images
        const {defaultModal, user, intl, pageSize, organizations} = this.props
        const pageAmount = fetchComplete ? Math.ceil(parseInt(meta.count) / pageSize) : null;
        const imageCount = fetchComplete ? meta.count : null;
        const formatedOrganizations = !!organizations && (transformOrganizationData(organizations) ?? []);

        return (
            <div className='image-grid container-fluid'>
                {!defaultModal && user &&
                    <div>
                        <div className='search-images'>
                            <Form onSubmit={this.submitHandler}>
                                <Label htmlFor='search-imgs'><FormattedMessage id='search-images'/></Label>
                                <InputGroup>
                                    <InputGroupAddon className='inputIcon' addonType="prepend">
                                        <span aria-hidden className="glyphicon glyphicon-search"/>
                                    </InputGroupAddon>
                                    <Input
                                        id='search-imgs'
                                        placeholder={intl.formatMessage({id: 'search-images-text'})}
                                        type='text'
                                        onChange={(e) => this.searchOnChange(e.target.value)}
                                        value={this.state.searchString}
                                    />
                                
                                    <Button
                                        color='primary'
                                        variant='contained'
                                        type='submit'>
                                        <FormattedMessage id='search-images-text' />
                                    </Button>
                                </InputGroup>
                                {
                                    this.props.showOrganizationFilter && 
                                      <div className='organizationFilter'>
                                          <Label htmlFor='organization-select'>
                                              <FormattedMessage id='manage-media-filter-by-organization' />
                                          </Label>
                                          <MultiSelect 
                                              data={formatedOrganizations} 
                                              placeholder={intl.formatMessage({id: `organization-select-placeholder`})}
                                              handleChange={this.handleOrganizationValueChange}
                                          />
                                      </div>
                                }
                            </Form>
                        </div>
                        <div role='status' className='search-results'>
                            {isFetching && !fetchComplete
                                ? <div/>
                                : <FormattedMessage id='search-image-result' values={{count: imageCount, page: pageAmount}}>{txt => <p role='status'>{txt}</p>}</FormattedMessage>
                            }
                        </div>
                    </div>
                }
                {isFetching && !fetchComplete
                    ? <div role="status" className="search-loading-spinner"><Spinner animation="border">
                        <span className="sr-only">Loading...</span>
                    </Spinner></div>
                    : <div className={classNames ('row', {'image-row': !defaultModal, 'imageShort': images.length < 4})}>
                        {images.length > 0 ? images : <div/>}
                        <div className='clearfix'/>
                    </div>
                }
                {!defaultModal && (
                    <ImagePagination intl={intl} clickedPage={this.changeImagePage} pageSize={pageSize} responseMetadata={this.props.images.meta} />
                )}
            </div>
        )
    }
}

ImageGalleryGrid.defaultProps = {
    pageSize: 50,
}

ImageGalleryGrid.propTypes = {
    images: PropTypes.any,
    user: PropTypes.object,
    editor: PropTypes.object,
    fetchUserImages: PropTypes.func,
    defaultModal: PropTypes.bool,
    action: PropTypes.func,
    close: PropTypes.func,
    pageSize: PropTypes.number,
    intl: intlShape,
    showImageDetails: PropTypes.bool,
    showOrganizationFilter: PropTypes.bool,
    organizations: PropTypes.array,
};

const mapDispatchToProps = (dispatch) => ({
    fetchUserImages: (amount, pageNumber, publicImages, filter, filterString, publisher) => dispatch(fetchUserImagesAction(amount, pageNumber, publicImages, filter, filterString, publisher)),
});

const mapStateToProps = (state, ownProps) => ({
    organizations: state.organizations.data,
});

export {ImageGalleryGrid as UnconnectedImageGalleryGrid}
// TODO: if leave null, react-intl not refresh. Replace this with better React context
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ImageGalleryGrid))
