import './UserPermissions/index.scss'
import React from 'react';
import PropTypes from 'prop-types'
import {injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';
import {getAdminOrganizations} from '../../../utils/user';
import OrganizationSelect from '../utils/OrganizationSelect';
import UserContainer from './UserPermissions/UserContainer';
import constants from '../../../constants';

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
        if (this.props.user) {
            this.fetchOrganizations();
        }
    }

    componentDidUpdate(prevProps) {
        if(this.props.user && prevProps.user !== this.props.user) {
            this.fetchOrganizations();
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
        return (
            <div>
                {userType !== constants.USER_TYPE.SUPERADMIN ?
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
                    <OrganizationSelect label={this.props.intl.formatMessage({id: 'admin-select-org-super'})} getSelectedOrg={(e) => this.selectOrg(e)} name='userOrg'
                        selectedValue={selectedOrg.name} intl={this.props.intl}/>
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
})

Users.propTypes = {
    intl: PropTypes.oneOfType([
        PropTypes.object,
        intlShape.isRequired,
    ]),
    user: PropTypes.object,
}

export default connect(mapStateToProps, null)(injectIntl(Users))
