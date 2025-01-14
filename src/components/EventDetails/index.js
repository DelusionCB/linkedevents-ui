import './index.scss'
import React, {Fragment} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames';
import get from 'lodash/get'
import {
    injectIntl,
    FormattedMessage,
    intlShape,
} from 'react-intl'
import {mapKeywordSetToForm} from '../../utils/apiDataMapping'
import {getStringWithLocale, getEventLanguageType} from '../../utils/locale'
import LinksToEvents from '../LinksToEvents/LinksToEvents'
import {Badge} from 'reactstrap';
import constants from '../../constants';
import {getCurrentTypeSet, sanitizeString} from '../../utils/helpers';

const {EVENT_TYPE} = constants

/**
 * Replaces potentially malicious <script> elements from value string with empty strings.
 * Non-string values are returned unchanged.
 * @param {string} value
 * @returns {string}
 * @example
 * const foo = removeScriptElements('this <script>alert("contains");</script> stuff.');
 * foo === 'this alert("contains"); stuff.';
 */
export const removeScriptElements = (value) => {
    if (typeof value !== 'string') { return value;}
    return sanitizeString(value)
}


const NoValue = (props) => {
    let header = props.labelKey ? (<span ><FormattedMessage id={props.labelKey}/>&nbsp;</span>) : null
    return (
        <div className="no-value" >
            {header}
            <FormattedMessage id="no-value"/>
        </div>
    )
}

NoValue.propTypes = {
    labelKey: PropTypes.string,
}

const CheckedValue = ({label}) => (
    <div className="custom-control">
        <Badge color='primary'>{label}</Badge>
    </div>
)
CheckedValue.propTypes = {
    label: PropTypes.string,
}

const MultiLanguageValue = (props) => {
    if (props.hidden) {
        return (<div/>)
    }

    let value = props.value || []

    let count = (_.keys(value)).length

    // Determine column size depending on the amount of language options
    let colClass = 'col-md-12'
    if (count > 1) {
        colClass = (count === 2) ? 'col-md-6' : 'col-md-4'
    }

    // Use a separate array to ensure correct field order
    let langOptions = ['fi', 'sv', 'en', 'ru', 'zh_hans', 'ar']
    let elements = langOptions.reduce((acc, curr) => {
        let val = value[curr];
        if (val) {val = removeScriptElements(val);}
        const createHTML = () => ({__html: val});
        if (val) {
            const uniqueId = props.labelKey + `-${curr}`;
            acc.push(
                <div className={colClass} key={curr}>
                    <div className={`in-${curr} indented`}>
                        <label htmlFor={uniqueId} className="language"><FormattedMessage id={`in-${curr}`}/></label>
                        <input type="hidden" id={uniqueId} name={uniqueId}/>
                        <div lang={curr} dangerouslySetInnerHTML={createHTML()}/>
                    </div>
                </div>
            );
        }
        return acc;
    }, []);

    if (elements.length > 0) {
        return (
            <div className="multi-value-field">
                <label htmlFor={`${props.labelKey}-field`}><FormattedMessage id={props.labelKey}/></label>
                <input type='hidden' id={`${props.labelKey}-field`} />

                <div className="row">
                    {elements}
                </div>
            </div>
        )
    } else {
        return (
            <div className="multi-value-field" >
                <label htmlFor={`${props.labelKey}-field`}><FormattedMessage id={props.labelKey}/></label>
                <input type="hidden" id={`${props.labelKey}-field`} name={`${props.labelKey}-field`}/>
                <div>
                    <NoValue labelKey={props.labelKey}/>
                </div>
            </div>
        )
    }
}

MultiLanguageValue.propTypes = {
    hidden: PropTypes.bool,
    value: PropTypes.object,
    labelKey: PropTypes.string.isRequired,
}

export const TextValue = (props) => {
    if (_.isInteger(props.value) || (props.value && props.value.length !== undefined && props.value.length > 0)) {
        const isUrl = props.labelKey.includes('-url');
        // role is only used if labelKey contains the string '-url',
        // e.g. 'twitter-url' will have the role param and 'event-publisher' will not get the role param.
        const additionalParams = isUrl ? {role: 'address'} : {};
        return (
            <div className="single-value-field">
                <div>
                    <label htmlFor={props.labelKey}><FormattedMessage id={props.labelKey}/></label>
                    <input type="hidden" id={props.labelKey} />
                </div>
                <span {...additionalParams} className="value">{removeScriptElements(props.value)}</span>
            </div>
        )
    } else {
        return (
            <div className="single-value-field">
                <div>
                    <label htmlFor={props.labelKey}><FormattedMessage id={props.labelKey}/></label>
                    <input type="hidden" id={props.labelKey} />
                </div>
                <NoValue labelKey={props.labelKey}/>
            </div>
        )
    }
}

TextValue.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    labelKey: PropTypes.string.isRequired,
}

const ImageValue = (props) => {
    if (props.value !== undefined && props.value instanceof Object) {
        return <img src={props.value.url} alt={getStringWithLocale(props.value, 'alt_text', props.locale)} className="event-image"/>
    }
    return (
        <FormHeader>
            <FormattedMessage id={props.labelKey}/>
        </FormHeader>
    )
}

ImageValue.propTypes = {
    value: PropTypes.object,
    locale: PropTypes.string,
    labelKey: PropTypes.string,
}

const OptionGroup = (props) => {
    let values = props.values || []

    let elements = _.map(values, (val, key) => {
        let name = getStringWithLocale(val, 'name', props.locale) || val.label || val.id || val || ''
        return (<CheckedValue checked={true} label={name} key={key}/>)
    })

    if (elements.length === 0) {
        elements = (<NoValue labelKey={props.labelKey}/>)
    }
    return (
        <div className="option-group">
            <div>
                <label htmlFor={props.labelKey}><FormattedMessage id={props.labelKey}/></label>
                <input type="hidden" id={props.labelKey} />
            </div>
            {elements}
        </div>
    )
}

OptionGroup.propTypes = {
    values: PropTypes.array,
    labelKey: PropTypes.string,
    locale: PropTypes.string,
}
const DateTime = (props) => {
    if (props.value && props.value.length !== undefined && props.value.length > 0) {
        const options = {
            weekday: 'long',
            year: 'numeric', month: 'long', day: 'numeric',
            hour: 'numeric', minute: 'numeric',
            timeZone: 'Europe/Helsinki',
        }
        const value = Intl.DateTimeFormat(props.locale, options).format(new Date(props.value))
        return (
            <div className="single-value-field">
                <label id={props.labelKey}><FormattedMessage id={props.labelKey}/></label>
                <input type="hidden" aria-labelledby={props.labelKey} />
                <span className="value" aria-labelledby={props.labelKey}>
                    {value}
                </span>
            </div>
        )
    } else {
        return (
            <div className="single-value-field">
                <label htmlFor={props.labelKey}><FormattedMessage id={props.labelKey}/></label>
                <input type="hidden" id={props.labelKey} />
                <span className="value">
                    <NoValue id='value' labelKey={props.labelKey}/>
                </span>
            </div>
        )
    }
}

DateTime.propTypes = {
    value: PropTypes.string,
    locale: PropTypes.string,
    labelKey: PropTypes.string.isRequired,
}

const FormHeader = props => <h2>{props.children}</h2>

FormHeader.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
}

const OffersValue = (props) => {
    const {offers} = props.values

    const handlePaymentMethods = (editor, values = [], locale) => {
        return values.reduce((acc, curr) => {
            let name;
            if (Object.values(curr).length === 1) {
                const checkedValue = editor.paymentMethods.find(element => element['@id'] === curr['@id']);
                name = getStringWithLocale(checkedValue, 'name', locale)
            } else {
                name = getStringWithLocale(curr, 'name', locale) || curr.label || curr.id || curr || ''
            }
            acc.push(name);
            return acc;
        }, []);
    }

    if (!offers || !offers.length || offers[0].is_free === true || offers[0] && typeof offers[0] !== 'object') {
        return (<FormattedMessage id="is-free"/>)
    }
    return (
        <div>
            {props.values.offers.map((offer, key) => (

                <div key={`offer-value-${key}`} className="offer-values">
                    <FormattedMessage id={props.label} values={{count: key + 1}}>{txt => <h3>{txt}</h3>}</FormattedMessage>
                    <MultiLanguageValue
                        labelKey="event-purchase-link"
                        hidden={offer.is_free}
                        value={offer.info_url}
                    />
                    <MultiLanguageValue
                        labelKey="event-price"
                        hidden={offer.is_free}
                        value={offer.price}
                    />
                    <MultiLanguageValue
                        labelKey="event-price-info"
                        hidden={offer.is_free}
                        value={offer.description}
                    />
                    <OptionGroup values={handlePaymentMethods(props.editor, offer.payment_methods, props.locale)} labelKey="event-price-methods" locale={props.locale}/>
                </div>
            ))}
        </div>
    )
}

OffersValue.propTypes = {
    values: PropTypes.object,
    labelKey: PropTypes.string,
    label: PropTypes.string,
    locale: PropTypes.string,
    editor: PropTypes.object,
}

const VideoValue = ({values, localeType}) => {

    if (!values || values.length === 0) {
        return (<NoValue labelKey={`${localeType}-video-header`}/>)
    }

    return (
        <div className={'video-item'}>
            {values.map((item, index) => (
                <div
                    key={`video-item-${index}`}
                    className={'video-item--container'}
                >
                    <FormattedMessage id='event-video-count' values={{count: index + 1}}>{txt => <h3>{txt}</h3>}</FormattedMessage>
                    {Object.entries(item)
                        .map(([key, value]) => {
                            if (key === 'url') {
                                return (
                                    <TextValue
                                        key={`video-value-${key}`}
                                        labelKey={`${localeType}-video-${key}`}
                                        value={removeScriptElements(value)}
                                    />
                                )
                            } else {
                                return (
                                    <MultiLanguageValue
                                        key={`video-value-${key}`}
                                        labelKey={`event-video-${key}`}
                                        value={value}
                                    />
                                )
                            }
                        })
                    }
                </div>
            ))}
        </div>
    )
}

VideoValue.propTypes = {
    values: PropTypes.array,
    localeType: PropTypes.string,
}

const VirtualInfo = (props) => {
    if (props.isvirtual && props.values) {
        const messageId = !props.location ? props.labelvirtual : props.labelvirtualphysical;
        return (
            <div className="single-value-field">
                <div>
                    <FormattedMessage id={messageId}>{txt => <label>{txt}</label>}</FormattedMessage>
                    <br/>
                    <FormattedMessage id={props.labelvirtualURL}>{txt => <span htmlFor={props.values}>{txt}</span>}</FormattedMessage>
                    <br/>
                    <a href={props.values} rel='noopener noreferrer' target="_blank">{props.values}</a>
                </div>
            </div>
        )
    } else {
        return (
            <div />
        )
    }
}
VirtualInfo.propTypes = {
    values: PropTypes.string,
    isvirtual: PropTypes.bool,
    labelvirtual: PropTypes.string,
    labelvirtualURL: PropTypes.string,
    labelvirtualphysical: PropTypes.string,
    location: PropTypes.object,
}


const SubEventListing = (props) => {
    const subEventsExists = typeof props.value === 'object' && Object.keys(props.value).length > 0

    if (subEventsExists) {
        const subEvents = Object.values(props.value).sort();
        const mappedSubs = subEvents.map((values, index) => {
            if (values.start_time && values.end_time !== undefined) {
                const options = {
                    year: 'numeric', month: 'numeric', day: 'numeric',
                    hour: 'numeric', minute: 'numeric',
                    timeZone: 'Europe/Helsinki',
                }
                const valueStart = Intl.DateTimeFormat(props.locale, options).format(new Date(values.start_time))
                const valueEnd = Intl.DateTimeFormat(props.locale, options).format(new Date(values.end_time))

                return(
                    <FormattedMessage id={props.subLabel} key={index} values={{start: valueStart, end: valueEnd, count: index + 1}} />
                )
            } else if ((values.start_time && values.end_time) === undefined) {
                return (
                    <div className="no-value" key={index}>
                        <FormattedMessage id={props.noSubTimes} key={index} values={{count: index + 1}} />
                    </div>
                )
            }
        });
        return (
            <div className='subGrid'>
                <FormattedMessage id={props.label}>{txt => <h3>{txt}</h3>}</FormattedMessage>
                {mappedSubs}
            </div>
        )
    } else {
        return (
            <div/>
        )
    }
}
SubEventListing.propTypes = {
    value: PropTypes.object,
    subLabel: PropTypes.string,
    noSubTimes: PropTypes.string,
    label: PropTypes.string,
    locale: PropTypes.string,
}

function keywordValues(props) {
    const {editor, values, intl} = props;
    let mainKeywords = [], secondaryKeywords = [], nonMainKeywords = [];
    if (values.keywords) {
        const mainCategoryValues = mapKeywordSetToForm(editor.keywordSets, getCurrentTypeSet(values.type_id), intl.locale)
            .map(item => item.value)
        const secondaryCategoryValues = mapKeywordSetToForm(editor.keywordSets, 'turku:topic_type', intl.locale)
            .map(item => item.value)

        nonMainKeywords = values.keywords.reduce((acc, curr) => {
            if (mainCategoryValues.includes(curr.value)) {
                mainKeywords.push(curr);
            }
            else if (secondaryCategoryValues.includes(curr.value)) {
                secondaryKeywords.push(curr);
            }
            else {
                acc.push(curr);
            }
            return acc;
        }, []);
    }
    return [mainKeywords, secondaryKeywords, nonMainKeywords]
}
const EventDetails = (props) => {
    const {editor, values, intl, rawData, publisher, superEvent} = props
    // Changed keywordSets to be compatible with Turku's backend.
    const [mainCategoryKeywords, secondaryCategoryKeywords, nonMainCategoryKeywords] = keywordValues({editor, values, intl})
    const subsExists = Object.keys(editor.values['sub_events']).length > 0
    const localeType = getEventLanguageType(values['type_id']);

    return (
        <div className={classNames('event-details', {'preview': props.isPreview})}>
            <ImageValue labelKey={`${localeType}-no-image`} value={values['image']} locale={intl.locale}/>
            <FormHeader>
                {intl.formatMessage({id: `${localeType}-description-fields-header`})}
            </FormHeader>

            <MultiLanguageValue labelKey="event-headline" value={values['name']}/>
            <MultiLanguageValue labelKey="event-short-description" value={values['short_description']}/>
            <MultiLanguageValue labelKey="event-description" value={values['description']}/>
            <MultiLanguageValue labelKey={`${localeType}-info-url`} value={values['info_url']}/>
            <MultiLanguageValue labelKey={`${localeType}-provider`} value={values['provider']}/>
            {publisher && <TextValue labelKey={`${localeType}-publisher`} value={get(publisher, 'name')}/>}

            <FormHeader>
                {intl.formatMessage({id: `${localeType}-datetime-fields-header`})}
            </FormHeader>
            {(!props.isPreview || (props.isPreview && !subsExists)) && (
                <Fragment>
                    <DateTime locale={intl.locale} value={values['start_time']} labelKey={`${localeType}-starting`}/>
                    <DateTime locale={intl.locale} value={values['end_time']} labelKey={`${localeType}-ending`}/>
                </Fragment>)
            }
            {props.isPreview && subsExists && (
                <Fragment>
                    <SubEventListing locale={intl.locale} label={`${localeType}-subEvent-fields-header`} subLabel="event-series" noSubTimes='event-series-time' value={values['sub_events']} />
                </Fragment>)
            }
            <FormHeader>
                {intl.formatMessage({id: `${localeType}-location-fields-header`})}
            </FormHeader>

            <VirtualInfo labelvirtualphysical='event-isvirtualphysical' labelvirtual='event-isvirtual' labelvirtualURL='event-location-virtual-url' location={get(values, 'location.name')} isvirtual={values['is_virtualevent']} values={get(values, 'virtualevent_url')}/>

            <MultiLanguageValue labelKey="event-location" value={get(values, 'location.name')}/>
            <TextValue labelKey="event-location-id" value={get(values, 'location.id')}/>
            <MultiLanguageValue
                labelKey="event-location-additional-info"
                value={values['location_extra_info']}
            />

            <FormHeader>
                {intl.formatMessage({id: 'event-price-fields-header'})}
            </FormHeader>
            <OffersValue locale={intl.locale} editor={editor} label={'event-price-count'} values={values}/>

            <FormHeader>
                {intl.formatMessage({id: `${localeType}-social-media-fields-header`})}
            </FormHeader>
            <TextValue labelKey="facebook-url" value={values['extlink_facebook']}/>
            <TextValue labelKey="twitter-url" value={values['extlink_twitter']}/>
            <TextValue labelKey="instagram-url" value={values['extlink_instagram']}/>

            <FormHeader>
                {intl.formatMessage({id: `${localeType}-video-header`})}
            </FormHeader>
            <VideoValue localeType={localeType} values={values['videos']} />

            <FormHeader>
                {intl.formatMessage({id: `${localeType}-categorization`})}
            </FormHeader>

            <OptionGroup values={mainCategoryKeywords} labelKey="categories-header-content" locale={intl.locale}/>
            {values['type_id'] === EVENT_TYPE.GENERAL &&
            <OptionGroup values={secondaryCategoryKeywords} labelKey="event-categories-type" locale={intl.locale}/>
            }
            <OptionGroup values={nonMainCategoryKeywords} labelKey="additional-keywords" locale={intl.locale}/>
            <OptionGroup values={rawData['audience']} labelKey="hel-target-groups" locale={intl.locale}/>
            <OptionGroup values={rawData['in_language']} labelKey="event-languages" locale={intl.locale}/>

            <FormHeader>
                {intl.formatMessage({id: 'audience-age-restrictions'})}
            </FormHeader>

            <TextValue labelKey="audience-min-age" value={values['audience_min_age']}/>
            <TextValue labelKey="audience-max-age" value={values['audience_max_age']}/>


            <FormHeader>
                {intl.formatMessage({id: `${localeType}-enrolment-header`})}
            </FormHeader>

            <TextValue labelKey={`${localeType}-enrolment-url`} value={values['enrolment_url']}/>

            <FormHeader>
                {intl.formatMessage({id: `${localeType}-enrolment-time`})}
            </FormHeader>
            <DateTime locale={intl.locale} value={values['enrolment_start_time']} labelKey={`${localeType}-enrolment-start-time`}/>
            <DateTime locale={intl.locale} value={values['enrolment_end_time']} labelKey={`${localeType}-enrolment-end-time`}/>

            <FormHeader>
                {intl.formatMessage({id: 'attendee-capacity'})}
            </FormHeader>
            <TextValue labelKey="minimum-attendee-capacity" value={values['minimum_attendee_capacity']}/>
            <TextValue labelKey="maximum-attendee-capacity" value={values['maximum_attendee_capacity']}/>


            {!props.disableSuperEventLinks &&
    <React.Fragment>
        <FormHeader>
            {intl.formatMessage({id: 'links-to-events'})}
        </FormHeader>
        <LinksToEvents
            event={rawData}
            superEvent={superEvent}
        />
    </React.Fragment>
            }
        </div>
    )
}

EventDetails.propTypes = {
    values: PropTypes.object,
    superEvent: PropTypes.object,
    rawData: PropTypes.object,
    intl: intlShape,
    publisher: PropTypes.object,
    editor: PropTypes.object,
    disableSuperEventLinks: PropTypes.bool,
    isPreview: PropTypes.bool,
}

export default injectIntl(EventDetails)
