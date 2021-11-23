import React from 'react'
import PropTypes from 'prop-types'
import {get, isNil, uniqBy} from 'lodash'
import {connect} from 'react-redux'
import {FormattedMessage} from 'react-intl'
import {HelLabeledCheckboxGroup, HelSelect} from '../index'
import SelectedKeywords from '../../SelectedKeywords/SelectedKeywords'
import {mapKeywordSetToForm} from '../../../utils/apiDataMapping'
import {setData as setDataAction} from '../../../actions/editor'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {UncontrolledTooltip} from 'reactstrap'
import {getCurrentTypeSet} from '../../../utils/helpers';
import constants from '../../../constants';

export const handleKeywordChange = (checkedOptions, keywords, mainCategoryOptions, setData) => {
    if (isNil(checkedOptions)) {
        return
    }

    let updatedKeywords
    if (Array.isArray(checkedOptions)) {
        const mainCategoryValues = mainCategoryOptions.map(item => item.value)
        const mappedMainCategoryKeywords = mainCategoryOptions.filter(item => checkedOptions.includes(item.value))
        const nonMainCategoryKeywords = keywords.filter(item => !mainCategoryValues.includes(item.value))

        updatedKeywords = uniqBy([...mappedMainCategoryKeywords, ...nonMainCategoryKeywords], 'value')
    } else {
        updatedKeywords = uniqBy([...keywords, checkedOptions], 'value')
    }

    setData({keywords: updatedKeywords})
}

export const handleKeywordDelete = (deletedItem, keywords, setData) => {
    const updatedSelectedKeywords = keywords
        .filter(item => item.value !== deletedItem.value)

    setData({keywords: updatedSelectedKeywords})
}

export const getKeywordIds = (keywords) => keywords
    .filter(item => item)
    .map(item => {
        const value = item.value
        const searchKey = 'keyword/'
        const startIndex = value.indexOf(searchKey) + searchKey.length
        const endIndex = value.length - 1

        return value.substring(startIndex, endIndex)
    })
    .join()

/**
 * Returns new array with string inside it for validation
 * @param {object} errors
 * @param {string} validationRule
 */
export const filterValidations = (errors, validationRule) => {
    let rule;
    if (errors['keywords']) {
        rule = errors.keywords.find(rule => rule === validationRule);
        if (rule) {
            rule = [rule]
        }
    }
    return rule
}

const HelKeywordSelector = ({intl, editor, setDirtyState, setData, currentLocale, disabled, localeType}) => {
    const {values, keywordSets, validationErrors} = editor
    let keywords = get(values, 'keywords', [])
    const typeSet = getCurrentTypeSet(values.type_id)
    const mainCategoryOptions = mapKeywordSetToForm(keywordSets, typeSet, currentLocale)
    const secondaryCategoryOptions = mapKeywordSetToForm(keywordSets, 'turku:topic_type', currentLocale)

    return (
        <React.Fragment>
            <FormattedMessage id={`${localeType}-categories-header-type`}>{txt => <h3>{txt}</h3>}</FormattedMessage>
            <div>
                <HelLabeledCheckboxGroup
                    groupLabel={<FormattedMessage id="categories-header-content"/>}
                    selectedValues={keywords}
                    name="keywords"
                    disabled={disabled}
                    validationErrors={filterValidations(validationErrors,'atLeastOneMainCategory')}
                    itemClassName="col-lg-6"
                    options={mainCategoryOptions}
                    setDirtyState={setDirtyState}
                    customOnChangeHandler={(checkedOptions) => {
                        handleKeywordChange(checkedOptions, keywords, mainCategoryOptions, setData)
                    }}
                    currentLocale={currentLocale}
                />
                {values.type_id === constants.EVENT_TYPE.GENERAL &&
                <HelLabeledCheckboxGroup
                    groupLabel={<FormattedMessage id="event-categories-type"/>}
                    selectedValues={keywords}
                    name="keywords"
                    disabled={disabled}
                    validationErrors={filterValidations(validationErrors,'atLeastOneSecondaryCategory')}
                    itemClassName="col-lg-6"
                    options={secondaryCategoryOptions}
                    setDirtyState={setDirtyState}
                    customOnChangeHandler={(checkedOptions) => {
                        handleKeywordChange(checkedOptions, keywords, secondaryCategoryOptions, setData)
                    }}
                    currentLocale={currentLocale}
                />
                }
            </div>
            <div className="col-sm-6 hel-select keywords-select">
                <HelSelect
                    legend={intl.formatMessage({id: 'event-keywords'})}
                    name="keywords"
                    resource="keyword"
                    disabled={disabled}
                    setDirtyState={setDirtyState}
                    customOnChangeHandler={(selectedOption) =>
                        handleKeywordChange(selectedOption, keywords, mainCategoryOptions, setData)
                    }
                    currentLocale={currentLocale}
                    placeholderId={'event-keywords-search'}
                />
                <CopyToClipboard tabIndex='-1' aria-hidden='true' text={values['keywords'] ? getKeywordIds(keywords) : ''}>
                    <button id='keyword-clipboard' type='button' className="clipboard-copy-button btn btn-default" aria-label={intl.formatMessage({id: 'copy-keyword-to-clipboard'})}>
                        <span className="glyphicon glyphicon-duplicate" aria-hidden="true"></span>
                    </button>
                </CopyToClipboard>
                <UncontrolledTooltip placement='top' target='keyword-clipboard' hideArrow>{intl.formatMessage({id: 'copy-keyword-to-clipboard'})}</UncontrolledTooltip>
                <SelectedKeywords
                    selectedKeywords={keywords}
                    onDelete={(deletedItem) => handleKeywordDelete(deletedItem, keywords, setData)}
                    locale={currentLocale}
                    intl={intl}
                />
            </div>

        </React.Fragment>
    )
}

HelKeywordSelector.propTypes = {
    intl: PropTypes.object,
    setData: PropTypes.func,
    setDirtyState: PropTypes.func,
    editor: PropTypes.object,
    currentLocale: PropTypes.string,
    disabled: PropTypes.bool,
    localeType: PropTypes.string,
}

const mapDispatchToProps = (dispatch) => ({
    setData: (value) => dispatch(setDataAction(value)),
})
export {HelKeywordSelector as UnconnectedHelKeywordSelector}
export default connect(null, mapDispatchToProps)(HelKeywordSelector)
