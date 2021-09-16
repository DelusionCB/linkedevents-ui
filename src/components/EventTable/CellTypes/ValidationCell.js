import React from 'react';
import PropTypes from 'prop-types';
import {Tooltip, Button} from 'reactstrap';
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
            tooltipOpen: false,
        }
        this.toggleTooltip = this.toggleTooltip.bind(this);
        this.moveToEdit = this.moveToEdit.bind(this);
    }

    componentDidMount() {
        const {event, editor} = this.props;
        const formattedEvent = mapAPIDataToUIFormat(event);

        formattedEvent.sub_events = [];

        const validations = doValidations(
            formattedEvent,
            getContentLanguages(formattedEvent),
            PUBLICATION_STATUS.PUBLIC,
            editor.keywordSets
        );

        const hasValidationErrors = Object.keys(validations).length > 0;

        if (hasValidationErrors) {
            this.props.handleInvalidRow(event.id);
            this.setState({hasErrors: true});
        }
    }

    toggleTooltip() {
        this.setState({tooltipOpen: !this.state.tooltipOpen});
    }

    moveToEdit() {
        const {routerPush, event} = this.props;
        routerPush(`/event/update/${event.id}`);
    }


    render() {
        const {intl, event:{id}} = this.props;
        // This is a unique id based on the event id + -validationAlert
        const uniqueId = id.replace(/[^\w]/gi, '') + '-validationAlert';
        const messageId = this.state.hasErrors ? 'event-validation-errors' : 'event-validation-no-errors'

        return (
            <td id={uniqueId} className={classNames('validation-cell',{'error': this.state.hasErrors})}>
                {this.state.hasErrors &&
                <React.Fragment>
                    <Button
                        aria-label={intl.formatMessage({id: messageId})}
                        onClick={this.moveToEdit}
                    >
                        <span aria-hidden className='glyphicon glyphicon-alert'/>
                    </Button>
                </React.Fragment>
                }
                {!this.state.hasErrors &&
                    <React.Fragment>
                        <span aria-hidden className='glyphicon glyphicon-ok'/>
                        <span className='visually-hidden'>
                            {intl.formatMessage({id: messageId})}
                        </span>
                    </React.Fragment>
                }
                <Tooltip isOpen={this.state.tooltipOpen} target={uniqueId} toggle={this.toggleTooltip}>
                    {intl.formatMessage({id: messageId})}
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
