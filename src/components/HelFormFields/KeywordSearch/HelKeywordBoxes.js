import './HelKeywordBoxes.scss'

import React from 'react';
import PropTypes from 'prop-types';
import {getStringWithLocale} from '../../../utils/locale';
import classNames from 'classnames';
import {HelCheckbox} from '../index';
import {FormattedMessage} from 'react-intl';

class HelKeywordBoxes extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidUpdate(prevProps, prevState) {
        const {value} = this.props;
        if (prevProps.value !== value) {
            this.renderOptionBoxes()
        }
    }

    // PASS VALUE WHICH REFETCHES OPTIONS
    changePasser = (val, type) => {
        const {value} = this.props;
        const parent = value.parents.filter(item => item.value.includes(val))
        const children = value.children.filter(item => item.value.includes(val))
        if (type === 'parent') {
            this.props.onChange(...parent);
        }
        if (type === 'children') {
            this.props.onChange(...children);
        }
    };


    // PASS VALUE WHICH GOES TO REDUX
    valuePasser = (val, type) => {
        const {value} = this.props;
        const parent = value.parents.filter(item => item.value.includes(val))
        const option = [value]
        const children = value.children.filter(item => item.value.includes(val))
        if (type === 'parent') {
            if (event.target.checked) {
                this.props.onValueChange(...parent);
            } else {
                this.props.deleteValue(...parent);
            }
        }
        if (type === 'option') {
            if (event.target.checked) {
                this.props.onValueChange(...option);
            } else {
                this.props.deleteValue(...option);
            }
        }
        if (type === 'children') {
            if (event.target.checked) {
                this.props.onValueChange(...children);
            } else {
                this.props.deleteValue(...children);
            }
        }
    }

    checkValue = (val) => {
        const {keywords, value} = this.props;
        let parent
        let child
        if (Object.keys(value).length > 0 && Object.keys(val).length > 0) {
            if (value.parents) {
                parent = value.parents.map(item => item.value)
            }
            if (value.children) {
                child = value.children.map(item => item.value)
            }
            const mappedKeywords = keywords.map(item => item.value)
            return mappedKeywords.includes(val.value || child || parent);
        }
    }

    renderOptionBoxes() {
        const {value} = this.props;
        let contents = {
            parents: [],
            options: [],
            children: [],
        }
        
        if (Object.keys(value).length > 0) {

            if (value.parents) {

                value.parents.map((item, key) => {
                    contents.parents.push(

                        <li className='keywordItemParent' key={key}>
                            <button
                                onClick={() => this.changePasser(item.value, 'parent')}
                                className='keywordButton'
                            >
                                <span className="glyphicon glyphicon-arrow-up" />
                            </button>
                            <HelCheckbox
                                ref={item.id}
                                disabled={item.ontology_type === 'OntologyHierarchy'}
                                label={item.label}
                                fieldID={item.label}
                                defaultChecked={this.checkValue(item)}
                                onChangeValue={() => this.valuePasser(item.value,'parent')}
                            />
                        </li>
                    )
                })
            }
            if (value) {
                contents.options.push(

                    <li className='keywordItemOption' key={value.id}>
                        <HelCheckbox
                            ref={value.id}
                            disabled={value.ontology_type === 'OntologyHierarchy'}
                            label={value.label}
                            fieldID={value.label}
                            defaultChecked={this.checkValue(value)}
                            onChangeValue={() => this.valuePasser(value.value, 'option')}
                        />
                    </li>
                )
            }
            if (value.children) {
                value.children.map((item, key) => {
                    contents.children.push(

                        <li className='keywordItemChild' key={key}>
                            <button
                                onClick={() => this.changePasser(item.value, 'children')}
                                className='keywordButton'
                            >
                                <span className="glyphicon glyphicon-arrow-down" />
                            </button>
                            <HelCheckbox
                                ref={item.id}
                                disabled={item.ontology_type === 'OntologyHierarchy'}
                                label={item.label}
                                fieldID={item.label}
                                defaultChecked={this.checkValue(item)}
                                onChangeValue={() => this.valuePasser(item.value,'children')}
                            />
                        </li>
                    )
                })
            }
        }
        return (
            <ul className='notPaddedUl'>
                <ul className='notPaddedUl'>
                    {contents.parents}
                    <ul className='paddedUl'>
                        {contents.options}
                        <ul className='paddedUl'>
                            {contents.children}
                        </ul>
                    </ul>
                </ul>
            </ul>
        )
    }

    render() {
        return (
            <div className={classNames('keywordBoxes',{'hasValue': Object.keys(this.props.value).length > 0})}>
                {this.renderOptionBoxes()}
            </div>
        );
    }
}

HelKeywordBoxes.contextTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
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
