// Group of checkboxes that output an array on change

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';
import classNames from 'classnames';
import {
    setLanguages as setLanguageAction,
} from 'src/actions/editor.js';
import {confirmAction} from '../../actions/app';
import {checkMultiLanguageFieldValues} from '../../utils/helpers';

class HelLanguageSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: this.props.checked,
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.checked !== this.props.checked) {
            this.setState({lang: this.props.checked})
        }
    }

    onChange = (event) => {
        const {options, editor} = this.props;
        const {lang: currentlySelectedLanguages} = this.state;
        const checkedOptions = options
            .filter((option, index) => this[`checkRef${index}`].checked)
            .map((checkedOption) => checkedOption.value);
        if (checkedOptions.length === 0 && currentlySelectedLanguages.length !== 0) {
            return null
        }
        // A previously selected language has been removed.
        const languageIsRemoved = currentlySelectedLanguages.length > checkedOptions.length;
        const targetLang = event.target.value;
        const {values, contentLanguages} = editor;
        if (languageIsRemoved && checkMultiLanguageFieldValues(values, contentLanguages, targetLang)) {
            this.props.confirm('confirm-language-remove', 'warning', 'remove-language', {
                action: (e) => {
                    this.props.setLanguages(checkedOptions);
                },
                additionalMsg: <FormattedMessage id={`${targetLang}-language-remove`} />,
                additionalMarkup: ' ',
            });
            // Else proceed with dispatching data & setting state
        } else {
            this.props.setLanguages(checkedOptions);
        }
        if (typeof this.props.onChange === 'function') {
            this.props.onChange(checkedOptions);
        }
    };

    render() {
        const {options, checked, disabled} = this.props;
        const checkboxes = options.map((item, index) => {
            const checkedOptions = checked;
            const isChecked = checkedOptions && checkedOptions.includes(item.value);
            const isDisabled = disabled || (isChecked && checkedOptions && checkedOptions.length === 1);

            return (
                <div className='custom-control custom-checkbox' key={index}>
                    <input
                        id={`checkBox-${item.value}`}
                        className='custom-control-input'
                        type='checkbox'
                        ref={(ref) => (this[`checkRef${index}`] = ref)}
                        key={index}
                        value={item.value}
                        name={item.value}
                        checked={isChecked}
                        onChange={this.onChange}
                        aria-checked={isChecked}
                        aria-disabled={isDisabled}
                        disabled={disabled}
                    />
                    <label className={classNames('custom-control-label', {disabled: isDisabled})} htmlFor={`checkBox-${item.value}`}>
                        <FormattedMessage id={item.label} />
                    </label>
                </div>
            );
        });

        return <div className='language-selection'>{checkboxes}</div>;
    }
}

HelLanguageSelect.propTypes = {
    confirm: PropTypes.func,
    setLanguages: PropTypes.func,
    onChange: PropTypes.func,
    options: PropTypes.array,
    checked: PropTypes.array,
    disabled: PropTypes.bool,
    editor: PropTypes.object,
};

const mapDispatchToProps = (dispatch) => ({
    setLanguages: (langs) => dispatch(setLanguageAction(langs)),
    confirm: (msg, style, actionButtonLabel, data) => dispatch(confirmAction(msg, style, actionButtonLabel, data)),
});

const mapStateToProps = (state) => ({
    editor: state.editor,
})
// TODO: if leave null, react-intl not refresh. Replace this with better React context
export {HelLanguageSelect as UnconnectedLanguageSelect}
export default connect(mapStateToProps, mapDispatchToProps)(HelLanguageSelect);
