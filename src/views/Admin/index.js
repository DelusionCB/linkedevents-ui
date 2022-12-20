import './index.scss'

import React from 'react'
import {connect} from 'react-redux'
import {FormattedMessage, injectIntl, intlShape} from 'react-intl'
import {get, isNull} from 'lodash'
import PropTypes from 'prop-types'
import {NavItem} from 'reactstrap';
import {Helmet} from 'react-helmet';
import {NavLink} from 'react-router-dom'
import {push} from 'connected-react-router'
import classNames from 'classnames';
import Instructions from '../../components/AdminFields/Instructions';
import Organizations from '../../components/AdminFields/Organizations';
import Users from '../../components/AdminFields/User';
import constants from '../../constants';
import Spinner from 'react-bootstrap/Spinner';

export class AdminPanel extends React.Component {
    constructor(props) {
        super(props);
    }
    
    componentDidMount() {
        this.checkUserPermissions()
    }
    componentDidUpdate(prevProps, prevState) {
        this.checkUserPermissions()
    }

    checkUserPermissions() {
        const {user, auth, isFetchingUser, routerPush} = this.props
        const noUser = isNull(user) && !isFetchingUser && !auth.isLoadingUser && !auth.user;
        const userIsNotSuperAdmin = !isNull(user) && user && user.userType !== constants.USER_TYPE.SUPERADMIN;

        if (noUser || userIsNotSuperAdmin) {
            routerPush('/')
        }
    }

    isActivePath(pathname){
        return pathname === this.props.location.pathname
    }

    handleOnClick = (url) => {
        const {routerPush} = this.props;
        routerPush(url);
    }

    getComponent(tab) {
        switch(tab){
            /*
            case 'instructions':
                return <Instructions />
             */
            case 'organizations':
                return <Organizations intl={this.props.intl} />
            case 'users':
                return <Users intl={this.props.intl} />
            default:
                return <div><h1>Tervetuloa hallintapaneeliin</h1></div>
        }
    }

    render() {
        const {match, intl} = this.props
        const tabMode = get(match, ['params', 'tab'])
        const pageTitle = `Linkedevents - ${intl.formatMessage({id: 'admin-panel'})}`
        if (!this.props.user) {
            return (
                <>
                    <Spinner animation='border' />
                </>
            )
        }
        return (
            <React.Fragment>
                <div className="admin-page">
                    <Helmet title={pageTitle}/>
                    <div className='container header'/>
                    <div className={classNames('container mt-5 pt-3')}>
                        <div className="admin-container">
                            <div className="mainheader">
                                <FormattedMessage id='admin-panel'>{txt => <h1>{txt}</h1>}</FormattedMessage>
                            </div>
                            <div id="admin-content">
                                <div id="admin-sidebar" className="col-md-3">
                                    <ul className='__links'>
                                        <NavItem>
                                            <NavLink
                                                strict={this.isActivePath('/admin')}
                                                className='nav-link'
                                                to='/admin'
                                                onClick={() => this.handleOnClick('/admin')}>
                                                <FormattedMessage id='admin-frontpage' />
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                strict={this.isActivePath('/admin/users')}
                                                className='nav-link'
                                                to='/admin/users'
                                                onClick={() => this.handleOnClick('/admin/users')}>
                                                <FormattedMessage id='admin-users' />
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                strict={this.isActivePath('/admin/organizations')}
                                                className='nav-link'
                                                to='/admin/organizations'
                                                onClick={() => this.handleOnClick('/admin/organizations')}>
                                                <FormattedMessage id='admin-organizations' />
                                            </NavLink>
                                        </NavItem>
                                        {/*
                                        <NavItem>
                                            <NavLink
                                                strict={this.isActivePath('/admin/instructions')}
                                                className='nav-link'
                                                to='/admin/instructions'
                                                onClick={() => this.handleOnClick('/admin/instructions')}>
                                                <FormattedMessage id='admin-sidefields' />
                                            </NavLink>
                                        </NavItem>
                                        */}
                                    </ul>
                                </div>
                                <div id="admin-details">
                                    <div>{this.getComponent(tabMode)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => ({
    editor: state.editor,
    user: state.user.data,
    auth: state.auth,
    isFetchingUser: state.user.isFetchingUser,
})

const mapDispatchToProps = (dispatch) => ({
    routerPush: (url) => dispatch(push(url)),
})

AdminPanel.propTypes = {
    isFetchingUser: PropTypes.bool,
    auth: PropTypes.object,
    match: PropTypes.object,
    intl: PropTypes.oneOfType([
        PropTypes.object,
        intlShape.isRequired,
    ]),
    user: PropTypes.object,
    routerPush: PropTypes.func,
    location: PropTypes.object,
}

export {AdminPanel as UnconnectedAdminPanel}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(AdminPanel))
