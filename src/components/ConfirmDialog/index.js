import React from 'react';
import {connect} from 'react-redux'
import PropTypes from 'prop-types';
import {Button, Modal, ModalBody, ModalHeader, ModalFooter} from 'reactstrap';
import {FormattedMessage, injectIntl} from 'react-intl';
import {cancelAction, doAction} from '../../actions/app';

class ConfirmDialog extends React.Component {

    static propTypes = {
        children: PropTypes.node,
        fetchKeywordSets: PropTypes.func,
        cancel: PropTypes.func,
        do: PropTypes.func,
    };

    static childContextTypes = {
        intl: PropTypes.object,
        dispatch: PropTypes.func,
    };

    getChildContext() {
        return {
            dispatch: this.props.dispatch,
            intl: this.props.intl,
        }
    }

    getModalCloseButton() {
        return (
            <Button onClick={() => this.props.cancel()}><span className="glyphicon glyphicon-remove" /></Button>
        );
    }

    render() {
        const {app} = this.props;
        const {confirmAction} = app;
        const closebtn = this.getModalCloseButton();

        let confirmMsg = (<span/>)
        if(confirmAction && confirmAction.msg && confirmAction.msg.length) {
            confirmMsg = (<FormattedMessage id={confirmAction.msg} />)
        }

        let additionalMsg = ''
        if(confirmAction && confirmAction.data && confirmAction.data.additionalMsg) {
            additionalMsg = confirmAction.data.additionalMsg
        }

        let additionalMarkup = (<div/>)
        if(confirmAction && confirmAction.data && confirmAction.data.additionalMarkup) {
            additionalMarkup = confirmAction.data.additionalMarkup
        }
        const getMarkup = () => ({__html: additionalMarkup})

        const useWarningButtonStyle = this.props.app.confirmAction && this.props.app.confirmAction.style === 'warning'

        let actionButtonLabel = 'confirm'
        if(confirmAction && confirmAction.actionButtonLabel && confirmAction.actionButtonLabel.length > 0) {
            actionButtonLabel = confirmAction.actionButtonLabel;
        }

        return (
            <Modal
                size='lg'
                isOpen={!!this.props.app.confirmAction}
                onClose={() => this.props.dispatch(cancelAction())}
                className='ConfirmationModal'
                centered={true}
            >
                <ModalHeader tag='h1' close={closebtn}>
                    {confirmMsg}
                </ModalHeader>
                <ModalBody>
                    <p><strong>{additionalMsg}</strong></p>
                    <div dangerouslySetInnerHTML={getMarkup()}/>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="contained"
                        onClick={() => this.props.cancel()}
                    >
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button
                        variant="contained"
                        color={useWarningButtonStyle ? 'danger' : 'secondary'}
                        onClick={() => this.props.do(this.props.app.confirmAction.data)}
                    >
                        <FormattedMessage id={actionButtonLabel} />
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}

ConfirmDialog.propTypes = {
    intl: PropTypes.object,
    app: PropTypes.object,
    user: PropTypes.object,
    dispatch: PropTypes.func,
    auth : PropTypes.object,
    fetchUser: PropTypes.func,
    location: PropTypes.object,
}

const mapStateToProps = (state) => ({
    app: state.app,
})

const mapDispatchToProps = (dispatch) => ({
    do: (data) => dispatch(doAction(data)),
    cancel: () => dispatch(cancelAction()),
})

export {ConfirmDialog as UnconnectedConfirmDialog};
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ConfirmDialog));
