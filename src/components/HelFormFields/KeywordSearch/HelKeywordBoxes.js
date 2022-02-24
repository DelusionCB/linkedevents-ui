import './HelKeywordBoxes.scss'
import React from 'react';
import PropTypes from 'prop-types';
import {getStringWithLocale} from '../../../utils/locale';
import classNames from 'classnames';
import {HelCheckbox} from '../index';

class HelKeywordBoxes extends React.Component {
    /**
     * Passes val to props.onChange
     * @param {Object} val
     */
    onChange = (val) => {
        this.props.onChange(val);
    };

    /**
     * Passes val to correct function based on event.target.checked.
     * @example
     * if event.target.checked -> onValueChange(val)
     * else val is removed
     * @param {Object} event
     * @param {Object} val
     */
    valueChanged = (event, val) => {
        if (event.target.checked) {this.props.onValueChange(val);}
        else {this.props.deleteValue(val);}
    }

    /**
     * Check if val.id or val.value already exists in some object found in the keywords array.
     * @param {Object} val
     * @returns {Boolean}
     */
    checkValue = (val) => {
        const {keywords} = this.props;
        return keywords.some(keyword => keyword.id === val.id || keyword.value === val.value)
    }

    /**
     * Iterates through all value.parents, value and  all value.children.
     * Returns a correctly nested ul containing checkboxes/button for all values.
     * @returns {JSX.Element || HTMLUListElement || HTMLElement}
     */
    getParentElements() {
        const {value} = this.props;
        /**
         * Contains all elements starting with parents of value.
         * Once the last parent element is reached -> start listing value and it's children.
         */
        const parents = value.parents.reduce((acc, parent, index) => {
            acc.push(
                <li className='keyword-parent' key={parent.id}>
                    <div className='parent-wrapper'>
                        {this.getButtonElement(parent, true)}
                        {this.getCheckboxElement(parent)}
                    </div>
                    {index === value.parents.length - 1 &&
                        <ul className='keyword-listing-nested' id='last-parent'>
                            {this.getOptionElement()}
                        </ul>
                    }
                </li>
            );
            return acc;
        }, []);

        // If parents.length > 0 --> parent elements didn't exist so start with selected value.
        return (
            <ul className='keyword-listing'>
                {parents.length > 0 ? parents : this.getOptionElement()}
            </ul>
        )
    }

    /**
     * Returns list element for value and ul containing list elements for each child if value has any.
     * @returns {JSX.Element || HTMLLIElement}
     */
    getOptionElement() {
        const {value} = this.props;
        return (
            <li className='keyword-option' key={value.id}>
                {this.getCheckboxElement(value)}
                <ul className='keyword-listing-nested'>
                    {
                        value.children.map((item, key) => (
                            <li className='keyword-child' key={key}>
                                {this.getButtonElement(item, false)}
                                {this.getCheckboxElement(item)}
                            </li>
                        ))
                    }
                </ul>
            </li>
        )
    }

    /**
     * Returns a HelCheckbox with values from item.
     * @param {Object} item
     * @returns {JSX.Element}
     */
    getCheckboxElement(item) {
        const {id, ontology_type, label} = item;
        const localeName = getStringWithLocale(item, 'name',this.props.currentLocale);
        return (
            <HelCheckbox
                ref={id}
                disabled={ontology_type === 'OntologyHierarchy'}
                label={localeName}
                fieldID={label}
                defaultChecked={this.checkValue(item)}
                onChangeValue={(e) => this.valueChanged(e, item)}
            />
        )
    }

    /**
     * Returns a button element with child span element.
     * Button and span element attributes are determined by item values and parent boolean.
     * @param {Object} item
     * @param {Boolean} parent false for child elements and true for parent elements.
     * @returns {JSX.Element || HTMLButtonElement}
     */
    getButtonElement(item, parent = false) {
        const {intl} = this.context;
        const keywordName = getStringWithLocale(item, 'name',this.props.currentLocale);
        // Contains values that specify what msg type and arrow direction is used.
        const elementAttributes = {msgType: 'narrower', arrowType: 'down'};
        // if parent is true -> arrow points up and change msg type.
        if (parent) {
            elementAttributes.msgType = 'broader';
            elementAttributes.arrowType = 'up';
        }
        return (
            <button
                aria-label={intl.formatMessage({id:`editor-show-${elementAttributes.msgType}-concepts`}, {value: keywordName || item.label})}
                onClick={() => this.onChange(item)}
                className='keyword-toggle-button'
            >
                <span aria-hidden className={`glyphicon glyphicon-arrow-${elementAttributes.arrowType}`} />
            </button>
        )
    }

    render() {
        const valueExists = Object.keys(this.props.value).length > 0;
        return (
            <div className={classNames('keywordBoxes',{'hasValue': valueExists})}>
                {valueExists && this.getParentElements()}
            </div>
        );
    }
}

HelKeywordBoxes.contextTypes = {
    intl: PropTypes.object,
};

HelKeywordBoxes.propTypes = {
    onChange: PropTypes.func,
    deleteValue: PropTypes.func,
    onValueChange: PropTypes.func,
    value: PropTypes.object,
    currentLocale: PropTypes.string,
    keywords: PropTypes.array,
};

export default HelKeywordBoxes;
