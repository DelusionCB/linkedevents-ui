import './index.scss';
import React, {Fragment} from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl'
import {getCharacterLimitByRule} from '../../utils/helpers'

const ValidationNotification =  ({
    validationErrors,
    anchor,
    index,
    className,
    id,
}) => {
    let errorMsg = null

    if(validationErrors && validationErrors[0]) {
        let errorText = null
        let textLimit = null
        if (typeof validationErrors[0] === 'object') {
            for (const object in validationErrors[0]) {
                if (validationErrors[0][object].key === index) {
                    errorText = `validation-${validationErrors[0][object].validation}`

                    // check if validation is text limiter
                    textLimit = getCharacterLimitByRule(validationErrors[0][object].validation)
                    if(textLimit) {
                        errorText = `validation-stringLimitReached`
                    }
                }
            }
        } else {
            errorText = `validation-${validationErrors[0]}`
            textLimit = getCharacterLimitByRule(validationErrors[0])
            if(textLimit) {
                errorText = `validation-stringLimitReached`
            }
        }
        if (errorText === null) {
            return (<React.Fragment />)
        }
        errorMsg = (<FormattedMessage className="msg" id={errorText} values={{limit: textLimit}}/>)
    } else {
        return (<React.Fragment />)
    }

    return (
        <Fragment>
            {anchor
                ? <p
                    id={id}
                    className={className}
                >
                    { errorMsg }
                </p>
                : <React.Fragment />
            }
        </Fragment>
    )
}

ValidationNotification.propTypes = {
    validationErrors: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    anchor: PropTypes.object,
    index: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string,
}

export default ValidationNotification
