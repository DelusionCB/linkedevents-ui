import './index.scss'
import React from 'react'
import {connect} from 'react-redux'
import {FormattedMessage} from 'react-intl'
import PropTypes from 'prop-types'
import {EventQueryParams, fetchEvents} from '../../utils/events'
import {isNull, get} from 'lodash'
import constants from '../../constants'
import {getSortDirection} from '../../utils/table'
import EventTable from '../../components/EventTable/EventTable'
import {getOrganizationMembershipIds} from '../../utils/user'
import userManager from '../../utils/userManager';
import {Helmet} from 'react-helmet';
import {Collapse} from 'reactstrap';
import CollapseButton from '../../components/FormFields/CollapseButton/CollapseButton';
import SelectorRadio from '../../components/HelFormFields/Selectors/SelectorRadio';
import HelCheckbox from '../../components/HelFormFields/HelCheckbox';
import {fetchOrganizations as fetchOrganizationsAction} from 'src/actions/organizations'
import {MultiSelect} from '../../components/MultiSelect/MultiSelect'
import {transformOrganizationData} from '../../utils/helpers'

const {USER_TYPE, TABLE_DATA_SHAPE, PUBLICATION_STATUS, EVENT_TYPE_PARAM} = constants


export class EventListing extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showCreatedByUser: false,
            showContentLanguage: '',
            showEventType: [EVENT_TYPE_PARAM.EVENT, EVENT_TYPE_PARAM.HOBBY, EVENT_TYPE_PARAM.COURSE],
            showListingTips: false,
            tableData: {
                events: [],
                count: null,
                paginationPage: 0,
                pageSize: 25,
                fetchComplete: true,
                sortBy: 'last_modified_time',
                sortDirection: 'desc',
            },
            selectedPublishers: [],
        };
    }

    componentDidMount() {
        const {user} = this.props

        if (!isNull(user) && !isNull(getOrganizationMembershipIds(user))) {
            this.fetchTableData();
            this.fetchOrganizationsData();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {user} = this.props
        const oldUser = prevProps.user

        // fetch data if user logged in
        if (isNull(oldUser) && user && !isNull(getOrganizationMembershipIds(user))) {
            this.fetchTableData();
            this.fetchOrganizationsData();
        }
        if (prevState.showContentLanguage !== this.state.showContentLanguage || prevState.showEventType !== this.state.showEventType) {
            this.fetchTableData()
        }
    }

    /**
     * Fetches the table data
     */
    fetchTableData = async () => {
        const queryParams = this.getDefaultEventQueryParams()

        this.setLoading(false)

        try {
            const response = await fetchEvents(queryParams)

            this.setState(state => ({
                tableData: {
                    ...state.tableData,
                    events: response.data.data,
                    count: response.data.meta.count,
                },
            }))
        } finally {
            this.setLoading(true)
        }
    }

    /**
     * Handles table column sort changes
     * @param columnName    The column that should be sorted
     */
    handleSortChange = async (columnName) => {
        const {sortBy, sortDirection} = this.state.tableData
        const updatedSortDirection = getSortDirection(sortBy, columnName, sortDirection)
        const queryParams = this.getDefaultEventQueryParams()
        queryParams.setSort(columnName, updatedSortDirection)

        this.setLoading(false)

        try {
            const response = await fetchEvents(queryParams)

            this.setState(state => ({
                tableData: {
                    ...state.tableData,
                    events: response.data.data,
                    count: response.data.meta.count,
                    paginationPage: 0,
                    sortBy: columnName,
                    sortDirection: updatedSortDirection,
                },
            }))
        } finally {
            this.setLoading(true)
        }
    }

    /**
     * Handles table pagination page changes
     * @param event
     * @param newPage   The new page number
     */
    handlePageChange = async (event, newPage) => {
        const queryParams = this.getDefaultEventQueryParams()
        queryParams.page = newPage + 1

        this.setLoading(false)

        try {
            const response = await fetchEvents(queryParams)

            this.setState(state => ({
                tableData: {
                    ...state.tableData,
                    events: response.data.data,
                    count: response.data.meta.count,
                    paginationPage: newPage,
                },
            }))
        } finally {
            this.setLoading(true)
        }
    }

    /**
     * Handles table page size changes
     * @param   event   Page size selection event data
     */
    handlePageSizeChange = async (event) => {
        const pageSize = event.target.value
        const queryParams = this.getDefaultEventQueryParams()
        queryParams.page_size = pageSize

        this.setLoading(false)

        try {
            const response = await fetchEvents(queryParams)

            this.setState(state => ({
                tableData: {
                    ...state.tableData,
                    events: response.data.data,
                    count: response.data.meta.count,
                    paginationPage: 0,
                    pageSize: pageSize,
                },
            }))
        } finally {
            this.setLoading(true)
        }
    }


    /**
     * Toggles whether only events created by the user should be show
     * @param   event   onChange event
     */
    toggleUserEvents = (event) => {
        const showCreatedByUser = event.target.checked
        this.setState(state => ({
            showCreatedByUser: showCreatedByUser,
            tableData: {
                ...state.tableData,
                paginationPage: 0,
            }}),
        this.fetchTableData
        )};


    /**
     * setState e.target.id to toggle Collapse
     * @param e
     */
    toggleTip = (e) => {
        this.setState({showListingTips: !this.state.showListingTips})
    }

    /**
     * Sets checkbox checked if type is in state
     * @param type
     * @returns {boolean}
     */
    checkEventTypes = (type) => {
        const {showEventType} = this.state;
        return showEventType.includes(type);
    }

    /**
     * Disables checkbox if length is 1 & state includes @param type
     * @param type
     * @returns {boolean}
     */
    disableEventTypes = (type) => {
        const {showEventType} = this.state;
        return showEventType.includes(type) && showEventType.length === 1;
    }

    /**
     * Removes & adds typeId to state
     * @param event
     * @returns {null} if user is trying to click checked box when only one is checked
     */
    toggleEventTypes = (event) => {
        const {showEventType} = this.state;
        const typeID = event.target.id;
        let newTypes = [...showEventType];
        if (showEventType.length === 1 && showEventType.includes(typeID)) {
            return null;
        }
        if (newTypes.includes(typeID)) {
            newTypes = newTypes.filter(string => string !== typeID);
        } else {
            newTypes.push(typeID);
        }
        this.setState({
            showEventType: newTypes,
        });
    };


    /**
     * Toggles whether events based on language should be shown
     * @param event
     */
    toggleEventLanguages = (event) => {
        const contentLanguage = event.target.value === 'all' ? '' : event.target.value;
        this.setState(state => ({
            showContentLanguage: contentLanguage,
            tableData: {
                ...state.tableData,
                paginationPage: 0,
            },
        }));
    }

    /**
     * Sets the loading state
     * @param fetchComplete Whether the fetch has completed
     */
    setLoading = (fetchComplete) => {
        this.setState(state => ({
            tableData: {
                ...state.tableData,
                fetchComplete,
            },
        }))
    }

    getPublicationStatus = () => {
        const {user} = this.props

        if (!user.userType) {
            return null
        }
        if (user.userType === USER_TYPE.ADMIN) {
            return PUBLICATION_STATUS.PUBLIC
        }
        if (user.userType === USER_TYPE.REGULAR) {
            return null
        }
    }

    /**
     * Return the default query params to use when fetching event data
     * @returns {EventQueryParams}
     */
    getDefaultEventQueryParams = () => {
        const {user} = this.props
        const {showCreatedByUser, showEventType, tableData: {sortBy, sortDirection, pageSize}} = this.state
        const userType = get(user, 'userType')
        const publisher = userType === USER_TYPE.ADMIN && !showCreatedByUser
            ? getOrganizationMembershipIds(user)
            : null
        const useCreatedBy = userType === USER_TYPE.REGULAR && USER_TYPE.PUBLIC || showCreatedByUser
        const queryParams = new EventQueryParams()
        queryParams.super_event = 'none'
        queryParams.publication_status = this.getPublicationStatus()
        queryParams.setPublisher(publisher)
        if(this.state.selectedPublishers.length) {
            queryParams.setPublisher(this.state.selectedPublishers)
        }
        queryParams.page_size = pageSize
        queryParams.setSort(sortBy, sortDirection)
        queryParams.show_all = userType === USER_TYPE.REGULAR ? true : null
        queryParams.admin_user = userType === USER_TYPE.ADMIN ? true : null
        queryParams.created_by = useCreatedBy ? 'me' : null
        queryParams.type_id = showEventType.join();
        if (user.userType === 'public') {
            queryParams.created_by = 'me'
        } else {
            queryParams.created_by = useCreatedBy ? 'me' : null
        }
        if (this.state.showContentLanguage) {
            queryParams.language = this.state.showContentLanguage
        }
        return queryParams
    }

    handleLoginClick = () => {
        userManager.signinRedirect({
            data: {
                redirectUrl: window.location.pathname,
            },
        });
    };

    getPageSubtitle = () => {
        const {user} = this.props;

        if (get(user, 'userType') === USER_TYPE.SUPERADMIN) {
            return <FormattedMessage id="events-management-description-super-user" />
        }
        if (get(user, 'userType') === USER_TYPE.REGULAR) {
            return <FormattedMessage id="events-management-description-regular-user" />
        }
        if (get(user, 'userType') === USER_TYPE.PUBLIC) {
            return <FormattedMessage id="events-management-description-public-user" />
        }
        return <FormattedMessage id="events-management-description" />
    }

    fetchOrganizationsData = () => {
        const {fetchOrganizations} = this.props;
        fetchOrganizations();
    }

    /**
     * handles multilevel organization selection
     * @param selectedNodes currently selected organizations
     */
    handleOrganizationValueChange = async (_, selectedNodes) => {
        if(selectedNodes){
            const selectOrgs = selectedNodes.map(item => item.value);
            const queryParams = this.getDefaultEventQueryParams()
            queryParams.publisher = selectOrgs.join(',')
            this.setState(state => ({
                selectedPublishers: selectOrgs,
            }))
            this.setLoading(false)

            try {
                const response = await fetchEvents(queryParams)

                this.setState(state => ({
                    tableData: {
                        ...state.tableData,
                        events: response.data.data,
                        count: response.data.meta.count,
                    },
                }))
            } finally {
                this.setLoading(true)
            }
        }
    }

    render() {
        const {user,organizations} = this.props;
        const formatedOrganizations = !!organizations && (transformOrganizationData(organizations) ?? []);
        const {intl} = this.context;
        const {
            showCreatedByUser,
            showContentLanguage,
            tableData: {
                events,
                fetchComplete,
                count,
                pageSize,
                paginationPage,
                sortBy,
                sortDirection,
            },
        } = this.state;
        const header = <h1><FormattedMessage id={`${appSettings.ui_mode}-management`}/></h1>
        // Defined React Helmet title with intl
        const pageTitle = `Linkedevents - ${intl.formatMessage({id: `${appSettings.ui_mode}-management`})}`
        const pageSubtitle = this.getPageSubtitle()
        const isRegularUser = get(user, 'userType') === USER_TYPE.REGULAR
        const isPublicUser = get(user, 'userType') === USER_TYPE.PUBLIC
        if (!user) {
            return (
                <div className="container">
                    <Helmet title={pageTitle}/>
                    {header}
                    <p>
                        <button className='btn-link underline' rel='external' role='link' onClick={this.handleLoginClick}>
                            <FormattedMessage id="login" />
                        </button>
                        <FormattedMessage id="events-management-prompt" /></p>
                </div>);
        }
        return (
            <div className="container">
                <Helmet title={pageTitle} />
                {header}
                <p>
                    {pageSubtitle}
                </p>
                {!isRegularUser &&
                <div className='event-settings'>
                    <h2>
                        <CollapseButton
                            id='listingTips'
                            isOpen={this.state.showListingTips}
                            targetCollapseNameId='events-management-tip'
                            toggleHeader={this.toggleTip}
                        />
                    </h2>
                    <Collapse isOpen={this.state.showListingTips}>
                        <hr style={{borderTop: '2px solid black'}}/>
                        <div className='col-sm-6 radios'>
                            {!isPublicUser &&
                                <div className='row'>
                                    <div className='col-sm-12'>
                                        <HelCheckbox
                                            label={<FormattedMessage id='user-events-toggle'/>}
                                            fieldID='user-events-toggle'
                                            defaultChecked={showCreatedByUser}
                                            onChange={this.toggleUserEvents}
                                        />
                                    </div>
                                </div>
                            }
                          
                            <fieldset>
                                <label>
                                    <FormattedMessage id='organization-select-label'>{txt => <legend>{txt}</legend>}</FormattedMessage>
                                    <MultiSelect 
                                        data={formatedOrganizations} 
                                        placeholder={this.context.intl.formatMessage({id: `organization-select-placeholder`})}
                                        handleChange={this.handleOrganizationValueChange}
                                    />
                                </label>
                            </fieldset>
                           
                            <fieldset>
                                <FormattedMessage id='filter-event-type'>{txt => <legend>{txt}</legend>}</FormattedMessage>
                                <div className='row'>
                                    <div className='col-sm-12'>
                                        <HelCheckbox
                                            label={<FormattedMessage id='event'/>}
                                            fieldID={EVENT_TYPE_PARAM.EVENT}
                                            defaultChecked={this.checkEventTypes(EVENT_TYPE_PARAM.EVENT)}
                                            onChange={this.toggleEventTypes}
                                            disabled={this.disableEventTypes(EVENT_TYPE_PARAM.EVENT)}
                                        />
                                        <HelCheckbox
                                            label={<FormattedMessage id='hobby'/>}
                                            fieldID={EVENT_TYPE_PARAM.HOBBY}
                                            defaultChecked={this.checkEventTypes(EVENT_TYPE_PARAM.HOBBY)}
                                            onChange={this.toggleEventTypes}
                                            disabled={this.disableEventTypes(EVENT_TYPE_PARAM.HOBBY)}
                                        />
                                        <HelCheckbox
                                            label={<FormattedMessage id='courses'/>}
                                            fieldID={EVENT_TYPE_PARAM.COURSE}
                                            defaultChecked={this.checkEventTypes(EVENT_TYPE_PARAM.COURSE)}
                                            onChange={this.toggleEventTypes}
                                            disabled={this.disableEventTypes(EVENT_TYPE_PARAM.COURSE)}
                                        /> 
                                    </div>
                                </div>
                                <fieldset>
                                    <FormattedMessage id='filter-event-languages'>{txt => <legend>{txt}</legend>}</FormattedMessage>
                                    <div className='col-sm-12'>
                                        <SelectorRadio
                                            ariaLabel={this.context.intl.formatMessage({id: `filter-event-all`})}
                                            value='all'
                                            checked={showContentLanguage === ''}
                                            handleCheck={this.toggleEventLanguages}
                                            messageID='filter-event-all'
                                            name='radiogroup'
                                        >
                                        </SelectorRadio>
                                        <SelectorRadio
                                            ariaLabel={this.context.intl.formatMessage({id: `filter-event-fi`})}
                                            value='fi'
                                            checked={showContentLanguage === 'fi'}
                                            handleCheck={this.toggleEventLanguages}
                                            messageID='filter-event-fi-mobile'
                                            name='radiogroup'
                                        >
                                        </SelectorRadio>

                                        <SelectorRadio
                                            ariaLabel={this.context.intl.formatMessage({id: `filter-event-sv`})}
                                            value='sv'
                                            checked={showContentLanguage === 'sv'}
                                            handleCheck={this.toggleEventLanguages}
                                            messageID='filter-event-sv-mobile'
                                            name='radiogroup'
                                        >
                                        </SelectorRadio>
                                        <SelectorRadio
                                            ariaLabel={this.context.intl.formatMessage({id: `filter-event-en`})}
                                            value='en'
                                            checked={showContentLanguage === 'en'}
                                            handleCheck={this.toggleEventLanguages}
                                            messageID='filter-event-en-mobile'
                                            name='radiogroup'
                                        >
                                        </SelectorRadio>
                                    </div>
                                </fieldset>
                            </fieldset>
                        </div>
                        <hr style={{borderTop: '2px solid black'}}/>
                    </Collapse>
                </div>
                }
                <EventTable
                    tableCaption='table-event-management'
                    events={events}
                    user={user}
                    fetchComplete={fetchComplete}
                    count={count}
                    pageSize={parseInt(pageSize)}
                    paginationPage={paginationPage}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    handlePageChange={this.handlePageChange}
                    handlePageSizeChange={this.handlePageSizeChange}
                    handleSortChange={this.handleSortChange}
                />
            </div>
        )
    }
}

EventListing.propTypes = {
    user: PropTypes.object,
    showCreatedByUser: PropTypes.bool,
    tableData: TABLE_DATA_SHAPE,
    organizations: PropTypes.array,
    fetchOrganizations: PropTypes.func,
}

EventListing.contextTypes = {
    intl: PropTypes.object,
}

const mapStateToProps = (state) => ({
    user: state.user.data,
    organizations: state.organizations.data,
})

const mapDispatchToProps = (dispatch) => ({
    fetchOrganizations: () => dispatch(fetchOrganizationsAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(EventListing);
