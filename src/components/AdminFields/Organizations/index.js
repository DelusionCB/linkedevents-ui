import './index.scss'
import React from 'react';
import PropTypes from 'prop-types'
import {injectIntl,intlShape, FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';
import {Button} from 'reactstrap';
import OrganizationSelect from '../utils/OrganizationSelect';
import OrganizationEditor from './OrganizationPermissions/OrganizationEditor';
import constants from '../../../constants'
import {isEqual} from 'lodash';

const {USER_TYPE} = constants;
class Organizations extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedOrg: {},
            mode: '',
        }
    }

    componentDidMount() {
        const {user:{userType}, activeOrganization, organizations} = this.props;
        if(userType === USER_TYPE.ADMIN && !!activeOrganization){
            const org = organizations.find((item)=> item.id === activeOrganization);
            this.selectOrg(org);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {user:{userType}, activeOrganization, organizations} = this.props;
        const prevActiveOrg = prevProps.organizations.find((org) => org.id === prevProps.activeOrganization);
        const activeOrg = organizations.find((org) => org.id === activeOrganization);
        if(userType === USER_TYPE.ADMIN && !!activeOrganization && !isEqual(prevActiveOrg,activeOrg)){
            const org = organizations.find((item)=> item.id === activeOrganization);
            this.selectOrg(org);
        }
    }

    /**
     * Sets org to state
     * @param {Object} org
     */
    selectOrg = (org) => {
        this.setState({selectedOrg: org})
    }

    /**
     * Sets mode to state
     * if mode === 'cancel' => selectedOrg = {}
     * @param {String} mode
     */
    setOrgMode = (mode = '') => {
        const newState = {mode: mode};
        if (mode === 'cancel') {
            newState.mode = '';
            newState.selectedOrg = {};
        }
        this.setState(newState);
    }

    /**
     * Returns buttons based on state.mode
     * @returns {JSX.Element}
     */
    getInitMode = () => {
        const {mode} = this.state;

        return (mode === '' ?
            <div className='control-buttons'>
                <Button onClick={() => this.setOrgMode('edit')}>
                    <FormattedMessage id='admin-org-select-edit' />
                </Button>
                <Button onClick={() => this.setOrgMode('add')}>
                    <FormattedMessage id='admin-org-add' />
                </Button>
            </div>
            :
            <div>
                <Button className='return-button' onClick={() => this.setOrgMode('cancel')}>
                    <span aria-hidden className={`glyphicon glyphicon-arrow-left`} />
                    <FormattedMessage id='admin-return' />
                </Button>
            </div>
        )
    }

    /**
     * Returns component for organization selection
     * @returns {JSX.Element}
     */
    getEditMode = () => {
        const {selectedOrg} = this.state;
        return (
            <div>
                <FormattedMessage id='admin-org-edit'>{txt => <h1>{txt}</h1>}</FormattedMessage>
                <OrganizationSelect
                    getSelectedOrg={(e) => this.selectOrg(e)}
                    name='name'
                    selectedValue={selectedOrg.name}
                />
            </div>
        )
    }

    render() {
        const {selectedOrg, mode} = this.state;
        const {user:{userType}} = this.props;
        const edit = mode === 'edit';
        const add = mode === 'add';
        const showOrgEditor = add || edit && Object.keys(selectedOrg).length > 0;
        const showOrgEditorForAdmin = userType === USER_TYPE.ADMIN;
        return (
            <div className='organizations-view'>
                <FormattedMessage id='admin-org-control'>{txt => <h1>{txt}</h1>}</FormattedMessage>
                {(userType === USER_TYPE.SUPERADMIN) && this.getInitMode()}
                <div>
                    {edit && this.getEditMode()}
                    <div>
                        {(showOrgEditor || showOrgEditorForAdmin) &&
                            <OrganizationEditor
                                orgMode={(e) => this.setOrgMode(e)}
                                intl={this.props.intl}
                                mode={mode}
                                organization={selectedOrg}
                            />
                        }
                    </div>
                </div>
            </div>
        );
    }
}


Organizations.propTypes = {
    intl: PropTypes.oneOfType([
        PropTypes.object,
        intlShape.isRequired,
    ]),
    user: PropTypes.object,
    activeOrganization: PropTypes.string,
    organizations: PropTypes.array,
}

const mapStateToProps = (state) => ({
    activeOrganization: state.user.activeOrganization,
    organizations: state.organizations.data,
    user: state.user.data,
})
const mapDispatchToProps = () => ({})

export {Organizations as UnconnectedOrganizations}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Organizations));

