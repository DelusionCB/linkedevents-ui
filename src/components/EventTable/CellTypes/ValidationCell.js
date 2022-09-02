import React from 'react';
import PropTypes from 'prop-types';
import {Button, Tooltip} from 'reactstrap';
import {injectIntl} from 'react-intl';
import {doValidations} from 'src/validation/validator';
import getContentLanguages from 'src/utils/language';
import {mapAPIDataToUIFormat} from 'src/utils/formDataMapping';
import {connect} from 'react-redux';
import {push} from 'connected-react-router';
import constants from 'src/constants';
import classNames from 'classnames';

const {PUBLICATION_STATUS} = constants;

class ValidationCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasErrors: false,
            subErrors: false,
            tooltipOpen: false,
        }
        this.toggleTooltip = this.toggleTooltip.bind(this);
        this.moveToEdit = this.moveToEdit.bind(this);
    }

    componentDidMount() {
        const {event, editor} = this.props;
        const formattedEvent = mapAPIDataToUIFormat(event);
        formattedEvent.sub_events = Object.values(formattedEvent.sub_events).reduce((acc, curr, index) => {
            acc[index] = {}
            acc[index]['start_time'] = curr['start_time']
            acc[index]['end_time'] = curr['end_time']
            return acc
        }, {});

        const validations = doValidations(
            formattedEvent,
            getContentLanguages(formattedEvent),
            PUBLICATION_STATUS.PUBLIC,
            editor.keywordSets
        );

        const hasSubValidationErrors = Object.keys(validations).includes('sub_events')
        const hasValidationErrors = Object.keys(validations).length > 0;
        const nextState = {}
        if (hasSubValidationErrors) {nextState.subErrors = true;}

        if (hasValidationErrors || hasSubValidationErrors) {
            this.props.handleInvalidRow(event.id);
            this.setState({hasErrors: true, ...nextState});
        }
    }

    toggleTooltip() {
        this.setState({tooltipOpen: !this.state.tooltipOpen});
    }

    moveToEdit() {
        const {routerPush, event} = this.props;
        routerPush(`/event/update/${event.id}`);
    }

    getValidations(messageId) {
        const {hasErrors, subErrors} = this.state;
        const {intl} = this.props;

        if (hasErrors && !subErrors) {
            return (<React.Fragment>
                <Button
                    aria-label={intl.formatMessage({id: messageId})}
                    onClick={this.moveToEdit}
                >
                    <span aria-hidden className='glyphicon glyphicon-alert' />
                </Button>
            </React.Fragment>)
        }

        const allErrors = hasErrors && subErrors;
        const glyphType = allErrors ? 'alert' : 'ok';
        return (<React.Fragment>
            <span aria-hidden className={`glyphicon glyphicon-${glyphType}`} />
            <span className='visually-hidden'>
                {intl.formatMessage({id: messageId})}
            </span>
        </React.Fragment>)
    }


    render() {
        const {intl, event:{id}} = this.props;
        const {hasErrors, subErrors, tooltipOpen} = this.state;
        // This is a unique id based on the event id + -validationAlert
        const uniqueId = id.replace(/[^\w]/gi, '') + '-validationAlert';
        const messageId = hasErrors ? 'event-validation-errors' : 'event-validation-no-errors'
        const subMessage = 'subevent-validation-errors'
        const message = subErrors ? subMessage : messageId

        return (
            <td id={uniqueId} className={classNames('validation-cell',{'error': hasErrors})}>
                {this.getValidations(message)}
                <Tooltip isOpen={tooltipOpen} target={uniqueId} toggle={this.toggleTooltip}>
                    {intl.formatMessage({id: message})}
                </Tooltip>
            </td>
        );
    }
}

ValidationCell.propTypes = {
    routerPush: PropTypes.func,
    intl: PropTypes.object,
    editor: PropTypes.object,
    event: PropTypes.object,
    handleInvalidRow: PropTypes.func,
};

const mapStateToProps = (state) => ({
    editor: state.editor,
});

const mapDispatchToProps = (dispatch) => ({
    routerPush: (url) => dispatch(push(url)),
});
export {ValidationCell as UnconnectedValidationCell}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ValidationCell))
