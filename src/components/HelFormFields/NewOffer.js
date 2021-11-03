import './NewOffer.scss'
import PropTypes from 'prop-types';
import React from 'react'
import MultiLanguageField from 'src/components/HelFormFields/MultiLanguageField'
import {setOfferData, deleteOffer, setMethods} from 'src/actions/editor'
import {get} from 'lodash'
import CONSTANTS from '../../constants'
import {
    injectIntl,
    intlShape,
    FormattedMessage,
} from 'react-intl'
import {mapPaymentMethodsToForm} from '../../utils/apiDataMapping';
import {embedValuesToIDs} from '../../utils/formDataMapping'

class NewOffer extends React.Component {
    
    static contextTypes = {
        dispatch: PropTypes.func,
    };

    static propTypes = {
        validationErrors: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object,
        ]),
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.isFree !== this.props.isFree) {
            this.onBlur()
        }
    }

    onBlur(e) {
        if(this.props.offerKey) {
            let obj = {}
            obj[this.props.offerKey] = this.buildObject()
            this.context.dispatch(setOfferData(obj, this.props.offerKey))
        }
    }

    deleteOffer() {
        this.context.dispatch(deleteOffer(this.props.offerKey))
    }

    // Creates database 'offers' object from inputs
    // const pairs - value being price, description etc
    // for (const key in defaultValue) forEach being language object
    buildObject() {
        let obj = {}
        obj['is_free'] = this.props.isFree
        // Unwrap connect and injectIntl
        const pairs = _.map(this.refs, (ref, key) => ({
            key: key,
            value: ref.getValue(),
        }))

        for (const key in this.props.defaultValue) {
            pairs.forEach((pair) => {
                obj[pair.key] = pair.value
            })
            if(obj.is_free == true) {
                obj = _.omit(obj, ['price', 'description', 'payment_methods']);
            }
        }
        return obj
    }

    isChecked = (values) => {
        const{defaultValue} = this.props;
        let currentMethods = get(defaultValue, 'payment_methods', []);
        return currentMethods.map(method => method['@id']).includes(values);
    }

    handlePaymentMethodChange = (e) => {
        const{defaultValue, editor, offerKey} = this.props;
        let currentMethods = get(defaultValue, 'payment_methods', []);
        if (e.target.checked){
            const checkedValue = editor.paymentMethods.find(element => element['@id'] === e.target.value);
            const checkedIDs = embedValuesToIDs(checkedValue['@id'])
            this.context.dispatch(setMethods({payment_methods: [...currentMethods, checkedIDs]}, offerKey));
        }
        else {
            const newCheckedValues = currentMethods.filter(method => method['@id'] !== e.target.value);
            if (newCheckedValues.length === 0) {
                this.context.dispatch(setMethods({payment_methods: []}, offerKey));
            } else {
                this.context.dispatch(setMethods({payment_methods: newCheckedValues}, offerKey));
            }
        }
    }

    getCheckboxes() {
        const{intl:{locale}, offerKey, editor} = this.props;
        const methodOptions = mapPaymentMethodsToForm(editor.paymentMethods, locale);
        const paymentOptionInputs = methodOptions.reduce((acc,curr,index) => {
            acc.push(
                <div key={index} className='custom-control custom-checkbox col-md-12 col-lg-6'>
                    <input
                        className='custom-control-input'
                        type="checkbox"
                        id={`${curr.label} ${offerKey}`}
                        checked={this.isChecked(curr.value)}
                        aria-checked={this.isChecked(curr.value)}
                        value={curr.value}
                        onChange={(e) => this.handlePaymentMethodChange(e)}
                    />
                    <label className='custom-control-label' htmlFor={`${curr.label} ${offerKey}`}>
                        {curr.label}
                    </label>
                </div>
            );
            return acc;
        }, []);
        return [...paymentOptionInputs];
    }


    render() {
        const {offerKey, defaultValue, isFree, languages, intl, length, disabled} = this.props
        const {VALIDATION_RULES} = CONSTANTS

        return (
            <div key={offerKey} className="new-offer row">
                <div className="col-auto">
                    <FormattedMessage id="event-price-count" values={{count: length}}>{txt => <h4>{txt}</h4>}</FormattedMessage>
                </div>
                <div className="new-offer--inputs col-12 order-last">
                    <MultiLanguageField
                        id={'event-price' + this.props.offerKey}
                        type='number'
                        min={0}
                        defaultValue={defaultValue.price}
                        disabled={disabled || isFree}
                        ref="price"
                        nameRef='price'
                        label="event-price"
                        languages={languages}
                        onBlur={e => this.onBlur(e)}
                        validationErrors={this.props.validationErrors['price']}
                        index={this.props.offerKey}
                        setInitialFocus={this.props.setInitialFocus}
                        required={true}
                        placeholder={intl.formatMessage({id: 'price-placeholder'})}
                        className='price-field'
                    />

                    <MultiLanguageField
                        id={'event-price-info' + this.props.offerKey}
                        defaultValue={defaultValue.description}
                        disabled={disabled || isFree}
                        ref="description"
                        label="event-price-info"
                        languages={languages}
                        multiLine={true}
                        onBlur={e => this.onBlur(e)}
                        validationErrors={this.props.validationErrors['offer_description']}
                        index={this.props.offerKey}
                        placeholder={intl.formatMessage({id: 'price-info-placeholder'})}
                        type='text'
                    />

                    <MultiLanguageField
                        id={'event-purchase-link' + this.props.offerKey}
                        defaultValue={defaultValue.info_url}
                        disabled={disabled}
                        ref="info_url"
                        label="event-purchase-link"
                        languages={languages}
                        onBlur={e => this.onBlur(e)}
                        validations={[VALIDATION_RULES.IS_URL]}
                        validationErrors={this.props.validationErrors['offer_info_url']}
                        index={this.props.offerKey}
                        placeholder='https://...'
                        type='url'
                    />
                    <div className="methods">
                        <FormattedMessage id="event-price-methods">{txt => <h4>{txt}</h4>}</FormattedMessage>
                        <div className='col-sm-12 row'>
                            {this.getCheckboxes()}
                        </div>
                    </div>
                </div>
                <button
                    aria-label={intl.formatMessage({id: 'delete'}) + ' ' + intl.formatMessage({id: 'event-price-fields-header'})}
                    className="new-offer--delete col-auto"
                    onClick={() =>  this.deleteOffer()}
                >
                    <span id="offer-del-icon" className="glyphicon glyphicon-trash" aria-hidden="true"><p hidden>trash</p></span>
                </button>
                <div className="w-100"></div>
            </div>
        )
    }
}

NewOffer.propTypes = {
    isFree: PropTypes.bool,
    languages: PropTypes.array,
    offerKey: PropTypes.string.isRequired,
    defaultValue: PropTypes.object,
    id: PropTypes.string,
    label: PropTypes.string,
    intl: intlShape,
    setInitialFocus: PropTypes.bool,
    length: PropTypes.number,
    disabled: PropTypes.bool,
    editor: PropTypes.object,
}

export {NewOffer as UnconnectedNewOffer}
export default (injectIntl(NewOffer));
