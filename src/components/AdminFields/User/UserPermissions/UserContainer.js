import './index.scss'
import React from 'react';
import PropTypes from 'prop-types'
import UserSelect from './UserSelect';
import UserEditor from './UserEditor';
import UserFilter from './UserFilter';
import Pagination from '../../utils/Pagination';
import {makeOrgUserRequest} from '../../../../actions/admin';


class UserContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            setFilterValue: '',
            userArray: [],
            addedUser: {},
            userMeta: {},
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.organization !== this.props.organization) {
            this.requestOrgUsers()
        }
        if (prevState.setFilterValue !== this.state.setFilterValue) {
            this.requestOrgUsers()
        }
    }

    /**
     * Makes request for userdata & sets to state
     */
    requestOrgUsers = () => {
        makeOrgUserRequest(this.props.organization, 5, 1, this.state.setFilterValue).then(r =>
            this.setState({userArray: r.data, userMeta: r.meta}))
    }

    /**
     * Returns users mapped to <UserEditor/>s
     * @param {Boolean} added
     * @returns {JSX.Element|unknown[]}
     */
    getUserRows = (added = false) => {
        const {addedUser} = this.state;
        const users = this.state.userArray
        if (added) {
            if (Object.keys(addedUser).length !== 0) {
                return (
                    <UserEditor
                        callUpdate={() => this.requestOrgUsers()}
                        clearUser={() => this.setState({addedUser: {}})}
                        key={addedUser.uuid}
                        index={addedUser.uuid}
                        user={addedUser}
                        organization={this.props.organization}
                        isNewUser
                    />
                );
            }} else {
            if (users) {
                return users.map((user, key) =>
                    <UserEditor
                        callUpdate={() => this.requestOrgUsers()}
                        key={key}
                        index={key}
                        user={user}
                        organization={this.props.organization}
                    />
                );
            }
        }
    }

    /**
     * Sets e to state
     * @param {String} e
     */
    setFilter = (e) => {
        this.setState({setFilterValue: e});
    }

    /**
     * Makes request for userdata & sets to state
     * @param {Number} i
     * @param {Object} e
     */
    clickedPage = (i, e) => {
        e.preventDefault();
        makeOrgUserRequest(this.props.organization, 5, i, this.state.setFilterValue).then(r =>
            this.setState({userArray: r.data, userMeta: r.meta}))
    };

    /**
     * Sets value to state
     * @param {Object} value
     */
    getAddedUser = (value) => {
        this.setState({addedUser: Object.assign({}, ...value)})
    }

    render() {

        const {organization, intl} = this.props;
        const {userArray, userMeta, addedUser} = this.state;
        return (
            <div>
                {organization &&
                <div className="user-permission-view">
                    <div>
                        <UserSelect addedUser={(value) => this.getAddedUser(value)} organization={organization}/>
                    </div>
                    <ul className='user-permissions-list-added'>
                        {this.getUserRows(true)}
                    </ul>
                    <div>
                        <UserFilter page={userMeta.currentPage} count={userArray.length} intl={intl} onSubmit={(e) => this.setFilter(e)} />
                        <ul className='user-permission-list'>
                            {this.getUserRows()}
                        </ul>
                        <Pagination pageSize={5} clickedPage={this.clickedPage} intl={intl} data={userMeta} />
                    </div>
                </div>
                }
            </div>
        );
    }
}

UserContainer.propTypes = {
    organization: PropTypes.string,
    intl: PropTypes.object,
}

export default UserContainer;
