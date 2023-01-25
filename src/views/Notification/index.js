import './index.scss';
import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl'


import {Button} from 'reactstrap';

import {clearFlashMsg as clearFlashMsgAction} from 'src/actions/app.js'

class Notifications extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            timer: null,
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.flashMsg !== prevProps.flashMsg) {
            if(this.state.timer) {
                clearTimeout(this.state.timer)
            }

            if(this.props.flashMsg && !this.props.flashMsg.sticky) {
                this.setState({
                    timer: setTimeout(this.props.clearFlashMsg, 10000),
                })
            }
            else {
                this.setState({
                    timer: null,
                })
            }
        }
    }

    shouldComponentUpdate(nextProps) {
        return !_.isEqual(nextProps, this.props)
    }

    render() {
        const {flashMsg, clearFlashMsg, isEventCreateOrUpdate} = this.props
        let flashMsgSpan = ('')
        let isSticky =  flashMsg && flashMsg.sticky
        let validations = false

        if(flashMsg && flashMsg.data.response && flashMsg.data.response.status == 400) {
            flashMsgSpan = _.values(_.omit(flashMsg.data, ['apiErrorMsg', 'response'])).join(' ')
            isSticky = true
        }
        else if(flashMsg && flashMsg.msg && flashMsg.msg.length) {
            flashMsgSpan = (<FormattedMessage id={flashMsg.msg} />)
            if (flashMsg.msg === 'validation-error') {
                validations = true
            }
        }

        let closeFn = isSticky ? function() {} : () => clearFlashMsg()

        let actionLabel
        if (flashMsg && flashMsg.action) {
            if (flashMsg.action.label) {
                actionLabel = flashMsg.action.label
            } else if (flashMsg.action.labelId) {
                actionLabel = <FormattedMessage id={flashMsg.action.labelId}/>
            }
        }

        let actionFn = flashMsg && flashMsg.action && flashMsg.action.fn

        let actionButton = null
        if (actionLabel && actionFn) {
            actionButton = <Button className={classNames({'errors' : validations})} key="snackActionButton" onClick={actionFn}>{actionLabel}</Button>
        }

        return (
            <React.Fragment>
                { flashMsgSpan &&
                    <dialog 
                        className={isEventCreateOrUpdate ? 'notification-create-update-contents' : 'notification'}
                        open={(!!flashMsg)}
                        onClose={closeFn}
                    >
                        <p className="text-center" role='alert'>{flashMsgSpan}{[actionButton]}</p>
                    </dialog>
                }
            </React.Fragment>
        )
    }
}

Notifications.propTypes = {
    flashMsg: PropTypes.object,
    clearFlashMsg: PropTypes.func,
    locale: PropTypes.string,
    isEventCreateOrUpdate: PropTypes.bool,
}

const mapDisPatchToProps = (dispatch) => ({
    clearFlashMsg: () => dispatch(clearFlashMsgAction()),
}) 
const mapStateToProps = (state) => ({
    locale: state.userLocale.locale,
})

export {Notifications as UnconnectedNotifications}
export default connect(mapStateToProps, mapDisPatchToProps)(Notifications)
