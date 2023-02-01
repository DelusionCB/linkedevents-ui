import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import {get} from 'lodash';
import {checkEventEditability} from '../../utils/checkEventEditability';
import constants from '../../constants';
import showConfirmationModal from '../../utils/confirm';
import {appendEventDataWithSubEvents, getEventsWithSubEvents} from '../../utils/events';
import {Button, UncontrolledTooltip} from 'reactstrap';
import {confirmAction} from '../../actions/app';
import {getButtonLabel} from '../../utils/helpers';
import {Link} from 'react-router-dom';
import classNames from 'classnames';

const {PUBLICATION_STATUS, EVENT_STATUS, USER_TYPE, SUPER_EVENT_TYPE_UMBRELLA} = constants;

class EventActionButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            agreedToTerms: false,
        }
        this.handleChange = this.handleChange.bind(this);
        this.confirmEventAction = this.confirmEventAction.bind(this);
    }

    /**
     * Returns whether the button is a save button based on given action
     * @param {string} action
     * @returns {boolean}
     */
    isSaveButton(action) {
        return ['publish','update','update-draft'].includes(action)
    }

    /**
     * Opens a confirmation modal and runs the given action
     * @param props
     */
    confirmEventAction() {
        const {action, event, subEvents, confirm, runAfterAction, customAction, intl} = this.props;
        const eventData = [event, ...subEvents];

        const doConfirm = (data) => {
            showConfirmationModal(
                data,
                action,
                confirm,
                intl,
                event.publication_status,
                customAction)
                .then(() => runAfterAction(action, event))
        };

        const eventsWithSubEvents = getEventsWithSubEvents(eventData)
            .filter(eventId => eventId !== event.id);

        eventsWithSubEvents.length > 0 ?
            appendEventDataWithSubEvents(eventData, eventsWithSubEvents)
                .then((appendedData) => doConfirm(appendedData))
            : doConfirm(eventData)
    }

    /**
     * Toggle state agreedToTerms based on checkbox
     * @param event
     */
    handleChange = (event) => {
        this.setState({agreedToTerms: event.target.checked})
    }

    /**
     * Returns a Button element with additional input & label element if showTermsCheckbox is true.
     * If explanationId parameter is given then that string is used to fetch correct error message for the tooltip.
     * @param {boolean} showTermsCheckbox
     * @param {string} buttonLabel
     * @param {boolean} disabled
     * @param {string} [explanationId=''] - errorMessage
     * @returns {*}
     */
    getButton(showTermsCheckbox, buttonLabel, disabled, explanationId = '') {
        const {action, confirmAction, customAction, intl, idPrefix} = this.props;
        const color = 'secondary';
        /*
        color = this.getButtonColor(action), to get color based on action.
        The getButtonColor function is currently not in use and can be removed if deemed unnecessary.
        */

        let handleOnClick = null
        if (!disabled){
            handleOnClick = confirmAction ? this.confirmEventAction : customAction
        }

        let ariaLabelText = undefined;
        if(disabled && explanationId){
            ariaLabelText = `${intl.formatMessage({id: buttonLabel})}. ${intl.formatMessage({id: explanationId})}`
        }

        return (
            <Fragment>
                {showTermsCheckbox &&
                <div className='custom-control custom-checkbox'>
                    <input
                        className='custom-control-input'
                        type='checkbox'
                        checked={this.state.agreedToTerms}
                        onChange={this.handleChange}
                        id='terms-agree'
                    />
                    <label className='custom-control-label' htmlFor='terms-agree'>
                        <FormattedMessage id={'terms-agree-text'}>{txt => txt}</FormattedMessage>
                        &nbsp;
                        <Link to={'/terms'} target='_black'>
                            <FormattedMessage id={'terms-agree-link'}>{txt => txt}</FormattedMessage>
                        </Link>
                    </label>
                </div>
                }
                <Button
                    aria-disabled={disabled}
                    aria-label={ariaLabelText}
                    id={idPrefix + action}
                    color={color}
                    className={classNames(`editor-${action}-button`,{'disabled': disabled})}
                    onClick={handleOnClick}
                    style={disabled ? {cursor: 'not-allowed'} : null}
                >
                    <FormattedMessage id={buttonLabel}>{txt => txt}</FormattedMessage>
                </Button>
                {(disabled && explanationId) &&
                <UncontrolledTooltip placement="bottom" target={idPrefix + action} innerClassName='tooltip-disabled' hideArrow>
                    <FormattedMessage id={explanationId}>{txt => txt}</FormattedMessage>
                </UncontrolledTooltip>
                }
            </Fragment>
        )
    }

    /**
     * Returns string based on action
     * @param {string} action
     * @returns {string}
     */
    getButtonColor(action) {
        // this is not currently in use, see getButton() for further details
        if (action === 'publish' || action.includes('update') || action === 'edit') {
            return 'primary';
        } else if (action === 'cancel' || action === 'delete') {
            return 'secondary';
        } else {
            return 'default';
        }
    }

    render() {
        const {
            editor,
            user,
            action,
            customButtonLabel,
            event,
            superEvent,
            eventIsPublished,
            loading,
        } = this.props;

        let combinedOrgs = [];
        if(user){
            const {user:{
                adminOrganizations,
                organizationMemberships,
                publicMemberships,
            }} = this.props;
            combinedOrgs = [].concat(adminOrganizations,organizationMemberships,publicMemberships);
        }

        const userOrganizationIds = [...new Set([...combinedOrgs])];
        const isPublisherInUserOrgs = Object.keys(event).includes('publisher') ? userOrganizationIds.includes(event.publisher) : true;
        const userType = get(user, 'userType');
        const isSuperAdmin = userType === USER_TYPE.SUPERADMIN;
        const isRegularUser = userType === USER_TYPE.REGULAR;
        const isPublicUser = userType === USER_TYPE.PUBLIC
        const formHasSubEvents = get(editor, ['values', 'sub_events'], []).length > 0;
        const validationErrors = get(editor, ['validationErrors'], {})
        const validationDisable = Object.keys(validationErrors).length > 0
        const isDraft = get(event, 'publication_status') === PUBLICATION_STATUS.DRAFT;
        const {editable, explanationId} = checkEventEditability(user, event, action, editor, superEvent);
        const showTermsCheckbox = (isRegularUser || isPublicUser) && this.isSaveButton(action) && !isDraft;
        const canPerformActionsForOrg = (isSuperAdmin || 
        ([USER_TYPE.ADMIN, USER_TYPE.REGULAR, USER_TYPE.PUBLIC].includes(userType) && isPublisherInUserOrgs)
        );

        let disabled = (!editable ||
            validationDisable ||
            loading ||
            (showTermsCheckbox && !this.state.agreedToTerms) ||
            (!canPerformActionsForOrg)
        );

        const buttonLabel = customButtonLabel || getButtonLabel(action, isRegularUser,  isDraft, eventIsPublished, formHasSubEvents);

        return (
            <Fragment>
                {
                    this.getButton(showTermsCheckbox, buttonLabel,disabled, explanationId)
                }
            </Fragment>
        )
    }
}

EventActionButton.defaultProps = {
    event: {},
    superEvent: {},
    subEvents: [],
    idPrefix: 'default-',
}

EventActionButton.propTypes = {
    intl: PropTypes.object,
    editor: PropTypes.object,
    user: PropTypes.object,
    confirm: PropTypes.func,
    action: PropTypes.string,
    confirmAction: PropTypes.bool,
    customAction: PropTypes.func,
    customButtonLabel: PropTypes.string,
    event: PropTypes.object,
    eventIsPublished: PropTypes.bool,
    loading: PropTypes.bool,
    runAfterAction: PropTypes.func,
    subEvents: PropTypes.array,
    superEvent: PropTypes.object,
    idPrefix: PropTypes.string,
}

const mapStateToProps = (state) => ({
    editor: state.editor,
    user: state.user.data,
})

const mapDispatchToProps = (dispatch) => ({
    confirm: (msg, style, actionButtonLabel, data) => dispatch(confirmAction(msg, style, actionButtonLabel, data)),
})

export {EventActionButton as UnconnectedEventActionButton}
export default connect(mapStateToProps, mapDispatchToProps)(EventActionButton)
