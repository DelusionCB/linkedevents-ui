import './HelOffersField.scss';
import PropTypes from 'prop-types';
import React from 'react';

import {FormattedMessage} from 'react-intl';
import NewOffer from './NewOffer';
import {Button} from 'reactstrap';
import constants from '../../constants';
import SelectorRadio from './Selectors/SelectorRadio';
import {addOffer, setFreeOffers} from 'src/actions/editor.js';

const {GENERATE_LIMIT} = constants;
class HelOffersField extends React.Component {
    static contextTypes = {
        intl: PropTypes.object,
        dispatch: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            // defaultValue exists and has length > 0 -> isFree: false
            isFree: !(this.props.defaultValue && this.props.defaultValue.length > 0),
        };
    }

    componentDidUpdate(prevProps, prevState) {
        const {defaultValue: currentValue} = this.props;

        // defaultValue was previously falsy and is now truthy.
        if (prevProps.defaultValue !== currentValue && currentValue && this.state.isFree) {
            this.setState({isFree: false});
        }
        // defaultValue was previously truthy and is now falsy.
        if (prevProps.defaultValue && !currentValue) {
            this.setState({isFree: true});
        }
    }

    togglePricing = () => {
        if (this.state.isFree) {
            this.addNewOffer();
        } else {
            this.context.dispatch(setFreeOffers());
        }
    }

    addNewOffer = () => {
        this.context.dispatch(addOffer({is_free: false}));
    }

    generateOffers() {
        const {validationErrors} = this.props;
        const offers = this.props.defaultValue;
        const newOffers = [];
        let keys;
        let firstKey;
        if (offers) {
            keys = Object.keys(offers);
            firstKey = keys.length > 1 ? keys[keys.length - 1] : false;
        }
        for (const key in offers) {
            if (offers.hasOwnProperty(key) && !this.state.isFree) {
                newOffers.push(
                    <NewOffer
                        editor={this.props.editor}
                        key={key}
                        length={newOffers.length + 1}
                        offerKey={key}
                        defaultValue={this.props.defaultValue[key]}
                        validationErrors={validationErrors}
                        languages={this.props.languages}
                        isFree={this.state.isFree}
                        setInitialFocus={key === firstKey}
                        disabled={this.props.disabled}
                    />
                );
            }
        }
        return newOffers;
    }

    getToggleRadios() {
        const {isFree} = this.state;
        const {disabled} = this.props;
        return (
            <div className='row price-toggle'>
                <SelectorRadio
                    checked={isFree}
                    disabled={disabled}
                    handleCheck={this.togglePricing}
                    messageID='is-free'
                    value='is_free'
                />
                <SelectorRadio
                    checked={!isFree}
                    disabled={disabled}
                    handleCheck={this.togglePricing}
                    messageID='is-not-free'
                    value='is_not_free'
                />
            </div>
        )
    }

    render() {
        const {disabled, defaultValue} = this.props;
        //Change OFFER_LENGTH in constants to change maximum length of prices users can add, currently limited to 20
        const isOverLimit = defaultValue && defaultValue.length >= GENERATE_LIMIT.OFFER_LENGTH;
        const disabledButton = disabled || isOverLimit || this.state.isFree;

        return (
            <React.Fragment>
                {this.getToggleRadios()}
                <div className="offers">
                    { defaultValue && this.generateOffers() }
                </div>
                {!this.state.isFree &&
                    <Button
                        size='lg'
                        block
                        variant="contained"
                        disabled={disabledButton}
                        onClick={this.addNewOffer}
                    >
                        <span aria-hidden className="glyphicon glyphicon-plus" />
                        <FormattedMessage id="event-add-price" />
                    </Button>
                }
                {isOverLimit &&
                    <p className='offersLimit' role='alert'>
                        <FormattedMessage id='event-add-price-limit' values={{count: GENERATE_LIMIT.OFFER_LENGTH}} />
                    </p>
                }
            </React.Fragment>
        );
    }
}

HelOffersField.propTypes = {
    defaultValue: PropTypes.arrayOf(PropTypes.object),
    validationErrors: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    languages: PropTypes.arrayOf(PropTypes.string),
    disabled: PropTypes.bool,
    editor: PropTypes.object,
};

export default HelOffersField;
