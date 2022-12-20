import './index.scss'
import React from 'react';
import PropTypes from 'prop-types'
import {FormattedMessage, injectIntl} from 'react-intl';
import {executeSendRequestUser as executeSendRequestUserAction,
} from '../../../../actions/admin';
import {connect} from 'react-redux';
import {HelCheckbox} from '../../../HelFormFields';
import {Button} from 'reactstrap'

class UserEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editing: false,
            userData: {
                username: '',
                organization: '',
            },
            organization_levels: {
                admin: false,
                regular: false,
                private: false,
            },
        }
    }
    
    componentDidMount() {
        this.setUser()
        if (this.props.isNewUser) {
            this.setState({editing: true})
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.user !== this.props.user) {
            this.setUser()
        }
    }

    /**
     * Sets users permissions & data to state
     */
    setUser = () => {
        const {user, organization} = this.props;
        this.setState({userData: {
            username: user.username,
            organization: organization,
        },
        organization_levels: {
            admin: user.admin_organizations.includes(organization),
            regular: user.organization_memberships.includes(organization),
            private: user.public_memberships.includes(organization),
        },
        editing: false,
        })
    }

    /**
     * Sets editing to state
     */
    toggleEdit = () => {
        this.setState({editing: !this.state.editing});
    }

    /**
     * Sets user & clears if isNewUser exists
     * this.props.isNewUser -> this.props.clearUser
     */
    cancelEdit = () => {
        this.setUser()
        if (this.props.isNewUser) {
            this.props.clearUser()
        }
    }

    /**
     * Submits user & calls props.callUpdate.
     * if isNewUser, calls props.clearUser
     */
    handleSubmit = () => {
        const {callUpdate, clearUser, isNewUser} = this.props;
        const {userData, organization_levels} = this.state;
        this.props.executeSendRequestUser({...userData, organization_levels})
            .then(() => callUpdate())
        if (isNewUser) {
            clearUser()
        }
    }

    /**
     * sets users permissions to state
     * @param {Object} e
     * @param {String} type
     */
    handleChecks = (e, type) => {
        const newState = {...this.state.organization_levels};
        if (e.target.checked === true && type === 'admin') {
            newState.admin = true;
            newState.regular = true;

        } else if (e.target.checked === false && type === 'regular' && this.state.organization_levels.admin === true) {
            newState.admin = false;
            newState.regular = false;
        } else {
            newState[type] = e.target.checked;
        }
        this.setState({organization_levels: newState});
    }

    /**
     * Deletes user & calls update
     */
    handleDelete = () => {
        const {callUpdate} = this.props;
        const {userData} = this.state;
        const orgLevels = {
            organization_levels: {
                admin: false,
                regular: false,
                private: false,
            }}
        this.props.executeSendRequestUser({...userData, ...orgLevels})
            .then(() => callUpdate())
    }

    /**
     * Returns correct permission checkboxes
     * @param {String} type
     * @param {Boolean} permission
     * @returns {JSX.Element}
     */
    getUserPermissionCheckboxes = (type, permission = false) => {
        const {organization_levels, editing} = this.state;
        const {index} = this.props;
        return (
            <HelCheckbox
                fieldID={`${type}-${index}-UserCheckbox`}
                label={`${type}`}
                defaultChecked={organization_levels[type]}
                onChangeValue={(e) => this.handleChecks(e, type)}
                disabled={!editing || permission}
            />
        );
    }

    /**
     * Returns correct props for buttons based on state.editing
     * @returns {JSX.Element}
     */
    getButtons = () => {
        const {editing} = this.state;
        const buttonConf = {
            first: {
                click: editing ? () => this.handleSubmit() : () => this.toggleEdit(),
                className: editing ? 'submit-permission-changes-button' : 'edit-permission-button',
                msg: editing ? 'admin-save-user' : 'admin-edit-user',
            },
            second: {
                click: editing ? () => this.cancelEdit() : () => this.handleDelete(),
                className: editing ? 'cancel-permission-changes-button' : 'delete-user-button',
                msg: editing ? 'admin-cancel-user' : 'admin-delete-user',
            },
        };
        return (
            <>
                <Button onClick={() => buttonConf.first.click()} className={buttonConf.first.className}>
                    <FormattedMessage id={buttonConf.first.msg} />
                </Button>
                <Button onClick={() => buttonConf.second.click()} className={buttonConf.second.className}>
                    <FormattedMessage id={buttonConf.second.msg} />
                </Button>
            </>
        )
    }

    render() {
        const {user, organization} = this.props;
        return (
            <li className='userItem'>
                <div className='userItem-content'>
                    <div>
                        <FormattedMessage id='admin-user-name' />
                        <div>
                            <p>{user.display_name} - {user.email}</p>
                        </div>
                    </div>
                    <div>
                        <FormattedMessage id='admin-user-permissions' />
                        <div className="permission-checkboxes">
                            {this.getUserPermissionCheckboxes('admin')}
                            {this.getUserPermissionCheckboxes('regular')}
                            {this.getUserPermissionCheckboxes('private', organization !== appSettings.private_org_id)}
                        </div>
                    </div>
                    <div className='user-controls'>
                        {this.getButtons()}
                    </div>
                </div>
            </li>
        );
    }
}

UserEditor.propTypes = {
    user: PropTypes.object,
    organization: PropTypes.string,
    setUsers: PropTypes.func,
    setUserData: PropTypes.func,
    executeSendRequestUser: PropTypes.func,
    index: PropTypes.number,
    callUpdate: PropTypes.func,
    isNewUser: PropTypes.bool,
    clearUser: PropTypes.func,
}

const mapDispatchToProps = (dispatch) => ({
    executeSendRequestUser: (user) => dispatch(executeSendRequestUserAction(user)),
})

export default connect(null, mapDispatchToProps)(injectIntl(UserEditor))
