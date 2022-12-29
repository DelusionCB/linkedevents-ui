import React from 'react';
import {connect} from 'react-redux'
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {setActiveOrganization, fetchUser as fetchUserAction} from '../../actions/user'
class ActiveOrganizationSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeOrganization: null,
            userOrganizations: [],
            isOpen: false,
        };
    }

    componentDidMount() {
        const {user: {adminOrganizations, organizationMemberships, publicMemberships}, organizations, activeOrganization} = this.props;
        if (organizations) {
            const userOrganizationIds = [...new Set([...adminOrganizations, ...organizationMemberships, ...publicMemberships])]
            const userOrganizations = organizations.filter(org => userOrganizationIds.includes(org.id))
            this.setState(() => ({userOrganizations: userOrganizations}))
            if (!this.state.activeOrganization && !!activeOrganization) {
                const defaultOrg = userOrganizations.find((org)=> org.id === activeOrganization)
                this.setState(() => ({activeOrganization: defaultOrg}))
            }
        }
        document.addEventListener('click', this.handleClick, false);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClick, false);
    }

    handleClick = (event) => {
        if(this.state.userOrganizations.length > 1){
            if (!this.node.contains(event.target)) {
                this.handleOutsideClick();
            }
        }
    }

    handleOutsideClick() {
        if (this.state.isOpen) {
            this.setState({isOpen: false});
        }
    }

    toggleOpen = (e) => {
        e.preventDefault();
        this.setState({isOpen: !this.state.isOpen});
    }
    
    fetchuserData =() =>{
        const {auth} = this.props;
        this.props.fetchUser(auth.user.profile.sub);
    }

    changeActiveOrganization = (org) =>{
        this.props.setActiveOrganization(org.id)
        this.fetchuserData();
    }

    handleActiveOrganizationChange = (org, e) => {
        e.preventDefault();
        this.setState({isOpen: false, activeOrganization: org})
        this.changeActiveOrganization(org);
    }
 
    render() {

        return (
            (this.state.userOrganizations.length > 1 && 
            <React.Fragment>
                <div onClick={this.toggleOpen} ref={node => this.node = node} className='active-organization'>
                    <div className="activeOrganization">
                        <a
                            aria-expanded={this.state.isOpen}
                            aria-label={this.state.activeOrganization?.name}
                            aria-owns="active-organization-list"
                            href="#"
                        >
                            {this.state.activeOrganization?.name}
                            <span className="caret" />
                        </a>
                    </div>
                </div>
                <ul
                    id="active-organization-list"
                    role="menu"
                    className={classNames('active-organization', {open: this.state.isOpen})}
                >
                    {this.state.userOrganizations.map((org, index) => {
                        return (
                            <li
                                role="presentation"
                                key={index}
                                className={classNames('org-item', {active: org == this.state.activeOrganization})}
                                onClick={this.handleActiveOrganizationChange.bind(this, org)}
                            >
                                <a
                                    role="menuitem"
                                    aria-label={org.name}
                                    href="#"
                                >
                                    {org.name}
                                </a>
                            </li>
                        )
                    })}
                </ul>
            </React.Fragment>
            )
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user.data,
    organizations: state.organizations.data,
    activeOrganization: state.user.activeOrganization,
    auth: state.auth,
})

ActiveOrganizationSelector.propTypes = {
    user: PropTypes.object,
    organizations: PropTypes.array,
    activeOrganization: PropTypes.string,
    setActiveOrganization: PropTypes.func,
    auth : PropTypes.object,
    fetchUser: PropTypes.func,
}

const mapDispatchToProps = (dispatch) => ({
    setActiveOrganization: (org) => dispatch(setActiveOrganization(org)),
    fetchUser: (id) => dispatch(fetchUserAction(id)),
});
export {ActiveOrganizationSelector as UnconnectedActiveOrganizationSelector}

export default connect(mapStateToProps, mapDispatchToProps)(ActiveOrganizationSelector);
