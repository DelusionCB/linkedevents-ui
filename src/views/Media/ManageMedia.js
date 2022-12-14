require('./index.scss')
import React from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {FormattedMessage, injectIntl} from 'react-intl'
import {isNull} from 'lodash'
import {push} from 'connected-react-router'

import ImageGalleryGrid from '../../components/ImageGalleryGrid'

export class ManageMedia extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        const {user, routerPush, auth, isFetchingUser} = this.props
        // redirect to home if user logged out or is not in the middle of logging in.
        if (isNull(user) && !isFetchingUser && !auth.isLoadingUser && !auth.user) {
            routerPush('/')
        }
    }
    render() {
        const {editor, user, intl, images} = this.props;
        return(
            <div className="container manageMedia">
                <h1><FormattedMessage id="manage-media"/></h1>
                {
                    user && 
                    <ImageGalleryGrid  
                        editor={editor}
                        user={user}
                        images={images}
                        showImageDetails={true}
                    />
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
})

const mapDispatchToProps = (dispatch) => ({
    routerPush: (url) => dispatch(push(url)),
})

export {ManageMedia as UnconnectedManageMedia}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ManageMedia));
