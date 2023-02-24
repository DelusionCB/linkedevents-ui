require('./index.scss')
import React from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {FormattedMessage, injectIntl} from 'react-intl'
import {isNull} from 'lodash'
import {push} from 'connected-react-router'
import {fetchOrganizations as fetchOrganizationsAction} from 'src/actions/organizations'
import {getOrganizationMembershipIds} from '../../utils/user'
import ImageGallery from '../../components/ImageGallery/ImageGallery';
import {fetchUserImages as fetchUserImagesAction} from 'src/actions/userImages'

import ImageGalleryGrid from '../../components/ImageGalleryGrid'

export class ManageMedia extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            availableLocales: [],
        }
    }

    componentDidMount() {
        const {user, editor} = this.props
        const availableLanguages = editor?.languages;
        const availableLocales = availableLanguages?.reduce((total, lang) => [...total, lang.id], []);
        if (!isNull(user) && !isNull(getOrganizationMembershipIds(user))) {
            this.fetchOrganizationsData();
        }
        this.setState({availableLocales: availableLocales});
    }

    componentDidUpdate(prevProps, prevState) {
        const {user, routerPush, auth, isFetchingUser, activeOrganization} = this.props
        const oldUser = prevProps.user

        // redirect to home if user logged out or is not in the middle of logging in.
        if (isNull(user) && !isFetchingUser && !auth.isLoadingUser && !auth.user) {
            routerPush('/')
        }

        // fetch data if user logged in
        if (isNull(oldUser) && user && !isNull(getOrganizationMembershipIds(user))) {
            this.fetchOrganizationsData();
        }

        if(prevProps.activeOrganization !== activeOrganization){
            this.fetchImages();
        }
    }

    fetchOrganizationsData = () => {
        const {fetchOrganizations} = this.props;
        fetchOrganizations();
    }

    fetchImages = (user = this.props.user, pageSize = 50, pageNumber = 1) => {
        const {fetchUserImages} = this.props;
        if(!isNull(user)){
            const parameters = [pageSize, pageNumber]
            fetchUserImages(...parameters);
        }
        
    };

    render() {
        const {editor, user, images} = this.props;
        const validationErrors = editor?.validationErrors;
        const currentLocale = this.state.availableLocales?.includes(this.context.intl.locale) ? this.context.intl.locale : 'fi';
        return(
            <div className="container manageMedia">
                <h1><FormattedMessage id="manage-media"/></h1>
                {
                    user && 
                    <React.Fragment>
                        <ImageGallery
                            className="btn-secondary"
                            uiMode={''}
                            validationErrors={validationErrors && validationErrors['image']}
                            locale={currentLocale}
                            isManageMedia={true}
                        />
                        <ImageGalleryGrid  
                            editor={editor}
                            user={user}
                            images={images}
                            showImageDetails={true}
                            showOrganizationFilter = {true}
                        />
                    </React.Fragment>
                }
            </div>
        )
    }
}

ManageMedia.propTypes = {
    editor: PropTypes.object,
    user: PropTypes.object,
    images: PropTypes.object,
    intl: PropTypes.object,
    locale: PropTypes.string,
    auth: PropTypes.object,
    isFetchingUser: PropTypes.bool,
    routerPush: PropTypes.func,
    showImageDetails: PropTypes.bool,
    showOrganizationFilter: PropTypes.bool,
    fetchOrganizations: PropTypes.func,
    fetchUserImages: PropTypes.func,
    activeOrganization: PropTypes.string,
}


ManageMedia.contextTypes = {
    intl: PropTypes.object,
}

const mapStateToProps = (state) => ({
    images: state.images,
    user: state.user.data,
    editor: state.editor,
    auth: state.auth,
    isFetchingUser: state.user.isFetchingUser,
    activeOrganization: state.user.activeOrganization,
})

const mapDispatchToProps = (dispatch) => ({
    routerPush: (url) => dispatch(push(url)),
    fetchOrganizations: () => dispatch(fetchOrganizationsAction()),
    fetchUserImages: (amount, pageNumber, publicImages, filter, filterString, publisher) => dispatch(fetchUserImagesAction(amount, pageNumber, publicImages, filter, filterString, publisher)),
})

export {ManageMedia as UnconnectedManageMedia}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ManageMedia));
