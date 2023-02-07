import './UserPermissions/index.scss'
import React from 'react';
import PropTypes from 'prop-types'
import {injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';
import {getAdminOrganizations} from '../../../utils/user';
import OrganizationSelect from '../utils/OrganizationSelect';
import UserContainer from './UserPermissions/UserContainer';
import constants from '../../../constants';
import {isNull} from 'lodash'

const {USER_TYPE} = constants;
class Users extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            adminOrganizations: [],
            selectedOrg: {},
            loading: true,
        }
    }

    componentDidMount() {
        const {user, activeOrganization, organizations} = this.props;
        if (user) {
            this.fetchOrganizations();
        }

        if(user && !isNull(user) && user.userType === USER_TYPE.ADMIN){
            const activeOrg = organizations.find((org) => org.id === activeOrganization);
            this.selectOrg(activeOrg)
        }
    }

    componentDidUpdate(prevProps) {
        const {user, activeOrganization, organizations} = this.props;
        if(user && prevProps.user !== user) {
            this.fetchOrganizations();
        }

        if(user && !isNull(user) && user.userType === USER_TYPE.ADMIN && prevProps.activeOrganization !== activeOrganization){
            const activeOrg = organizations.find((org) => org.id === activeOrganization);
            this.selectOrg(activeOrg)
        }
    }

    async fetchOrganizations() {
        const {user} = this.props;
        const adminOrganizations = await Promise.all(getAdminOrganizations(user.data));
        this.setState({
            adminOrganizations: adminOrganizations,
            loading: false,
        });
    }

    /**
     * sets org to state
     * @param {Object} org
     */
    selectOrg = (org) => {
        this.setState({selectedOrg: org})
    }

    /**
     * returns state.adminorganizations mapped into option -elements
     * @returns {JSX.Element||unknown[]}
     */
    getOrganizations() {
        return this.state.adminOrganizations.map((org, index) =>
            <option className='organization-select-option' value={org.data.id} key={index}>{org.data.name}</option>
        );
    }

    /**
     * returns <select /> or <OrganizationSelect /> based on users USER_TYPE
     * @param {String} userType
     * @returns {JSX.Element}
     */
    getOrgSearch(userType = '') {
        const {selectedOrg} = this.state;
        const userHasNoPermission = (userType !== USER_TYPE.SUPERADMIN && userType !== USER_TYPE.ADMIN);
        return (
            <div>
                { userHasNoPermission ?
                    <>
                    <FormattedMessage id='admin-select-org'>{txt => <label htmlFor='admin-select'>{txt}</label>}</FormattedMessage>
                    <select
                        id='admin-select'
                        className='organization-select'
                        defaultValue=''
                        onChange={(e) => this.selectOrg(e.target.value)}>
                        <option className='organization-select-option' value="" disabled hidden>
                            {this.props.intl.formatMessage({id: 'admin-select-option'})}
                        </option>
                        {this.getOrganizations()}
                    </select>
                    </>
                    :
                    <OrganizationSelect
                        label={this.props.intl.formatMessage({id: 'admin-select-org-super'})}
                        getSelectedOrg={(e) => this.selectOrg(e)}
                        name='userOrg'
                        selectedValue={selectedOrg.name}
                        intl={this.props.intl}
                        disabled={userType === USER_TYPE.ADMIN}
                    />
                }
            </div>
        )
    }

    render() {
        const {selectedOrg} = this.state;
        const {user} = this.props;
        return (
            <div className='user-view'>
                <FormattedMessage id='admin-user-control'>{txt => <h1>{txt}</h1>}</FormattedMessage>
                <div>
                    <div>
                        {this.getOrgSearch(user.userType)}
                    </div>
                    <div>
                        <UserContainer intl={this.props.intl} organization={selectedOrg.id} />
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    user: state.user.data,
    activeOrganization: state.user.activeOrganization,
    organizations: state.organizations.data,
})

Users.propTypes = {
    intl: PropTypes.oneOfType([
        PropTypes.object,
        intlShape.isRequired,
    ]),
    user: PropTypes.object,
    activeOrganization: PropTypes.string,
    organizations: PropTypes.array,
}

export default connect(mapStateToProps, null)(injectIntl(Users))
