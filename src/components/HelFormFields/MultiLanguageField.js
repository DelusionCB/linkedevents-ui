import './MultiLanguageField.scss'

import PropTypes from 'prop-types';

import React from 'react'
import {FormattedMessage} from 'react-intl'
import HelTextField from './HelTextField'
import {setData} from 'src/actions/editor'

class MultiLanguageField extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            value: props.defaultValue || {},
            labelRef: null,
        }
    }

    static contextTypes = {
        intl: PropTypes.object,
        dispatch: PropTypes.func,
    };

    static propTypes = {
        defaultValue: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object,
        ]),
        onChange: PropTypes.func,
        name: PropTypes.string,
        forceApplyToStore: PropTypes.bool,
        setDirtyState: PropTypes.func,
        onBlur: PropTypes.func,
        languages: PropTypes.array,
        disabled: PropTypes.bool,
        required: PropTypes.bool,
        validations: PropTypes.array,
        validationErrors: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object,
        ]),
        index: PropTypes.string,
        multiLine: PropTypes.bool,
        label: PropTypes.string,
        id: PropTypes.string,
        type: PropTypes.string,
        setInitialFocus: PropTypes.bool,
        placeholder: PropTypes.string,
        min: PropTypes.number,
        max: PropTypes.number,
        className: PropTypes.string,
        nameRef: PropTypes.string,
    }

    onChange(e,value,lang) {
        this.setState({value: this.getValue()})

        if(typeof this.props.onChange === 'function') {
            this.props.onChange(event, this.getValue())
        }
    }

    onBlur(e, value) {
        this.setState({value: this.getValue()})
        if(this.props.name) {
            let obj = {}
            obj[this.props.name] = this.getValue()
            if(this.noValidationErrors() || this.props.forceApplyToStore) {
                this.context.dispatch(setData(obj))
            }

            if (this.props.setDirtyState) {
                this.props.setDirtyState()
            }
        }

        if(typeof this.props.onBlur === 'function') {
            this.props.onBlur(e, this.getValue())
        }
    }

    getValue() {
        let langs = _.map(this.refs, (ref, key) => key)
        let values = _.map(this.refs, ref => ref.getValue())
        let valueObj = _.zipObject(langs, values);
        return valueObj
    }

    noValidationErrors() {
        let errors = _.map(this.refs, elem => elem.getValidationErrors().length)
        errors = errors.filter(errorCount => (errorCount > 0))

        return (errors.length === 0)
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if(! _.isEqual(nextProps.defaultValue, this.props.defaultValue)) {
            this.setState({value: nextProps.defaultValue || {}})
        }
        this.forceUpdate()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !(_.isEqual(nextState, this.state)) ||
                !(_.isEqual(nextProps.languages, this.props.languages)) ||
                !(_.isEqual(nextProps.disabled, this.props.disabled))
    }

    setLabelRef = (element) => {
        this.setState({labelRef: element})
    }

    render() {
        let props = this.props
        // Set default language to fi if no languages are selected
        let langs = props.languages
        if(langs.length === 0) {
            langs = ['fi']
        }

        let textInputs = []

        if(langs.length === 1) {
            let label = this.context.intl.formatMessage({id: props.label})
            return (
                <div style={{position:'relative'}} key={`${props.name}_${langs[0]}`}>
                    <HelTextField required={this.props.required}
                        id={this.props.id}
                        defaultValue={this.state.value[langs[0]]}
                        name={this.props.name}
                        label={label}
                        ref={langs[0]}
                        nameRef={this.props.nameRef}
                        onChange={(e,v) => this.onChange(e,v,langs[0])}
                        onBlur={(e,v) => this.onBlur(e,v)}
                        disabled={this.props.disabled}
                        validations={this.props.validations}
                        validationErrors={this.props.validationErrors}
                        index={this.props.index}
                        multiLine={this.props.multiLine}
                        type={this.props.type}
                        setInitialFocus={this.props.setInitialFocus}
                        placeholder={this.props.placeholder}
                        min={this.props.min}
                        max={this.props.max}
                        className={this.props.className}
                    />

                </div>
            )
        } else {
            textInputs = langs.map((lang, index) => {
                let value = this.state.value[lang]
                return (
                    <div key={`${props.name}_${lang}`}>
                        <HelTextField
                            name={this.props.name}
                            id={this.props.id + index}
                            multiLine={this.props.multiLine}
                            required={this.props.required}
                            defaultValue={value} ref={lang}
                            label={this.context.intl.formatMessage({id: `${this.props.label}`}) + ' ' + this.context.intl.formatMessage({id: `in-${lang}`})}
                            nameRef={this.props.nameRef}
                            onChange={(e,v) => this.onChange(e,v,lang)}
                            onBlur={(e,v) => this.onBlur(e,v)}
                            disabled={this.props.disabled}
                            validations={this.props.validations}
                            validationErrors={this.props.validationErrors}
                            type={this.props.type}
                            setInitialFocus={this.props.setInitialFocus && (index === 0)}
                            placeholder={this.props.placeholder}
                            min={this.props.min}
                            max={this.props.max}
                            className={this.props.className}
                        />
                    </div>
                )
            },this)
        }

        return (
            <div className="multi-field">
                <div className="indented">
                    <label ref={this.setLabelRef}>
                        <FormattedMessage id={`${props.label}`} />
                    </label>
                    {textInputs}
                </div>
            </div>
        )
    }

}

MultiLanguageField.defaultProps = {
    type: 'text',
};

export default MultiLanguageField
