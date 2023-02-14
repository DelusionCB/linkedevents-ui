import './index.scss';

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {FormattedMessage, injectIntl} from 'react-intl';
import CustomDatePicker from '../CustomFormFields/Dateinputs/CustomDatePicker'
import {Button, Form, FormGroup} from 'reactstrap';
import HelCheckbox from '../HelFormFields/HelCheckbox';
import constants from '../../constants';

const {EVENT_TYPE_PARAM} = constants

const SearchBar = ({intl, onFormSubmit}) => {
    const [startDate, setStartDate] = useState(moment().startOf('day'));
    const [endDate, setEndDate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [contextType, setContextType] = useState([EVENT_TYPE_PARAM.EVENT, EVENT_TYPE_PARAM.HOBBY, EVENT_TYPE_PARAM.COURSE])

    const disableEventTypes = (type) => {
        return contextType.includes(type) && contextType.length === 1;
    }

    const checkEventTypes = (type) => {
        return contextType.includes(type);
    }

    const toggleEventTypes = (e) => {
        const typeID = e.target.id;
        if (contextType.length === 1 && contextType.includes(typeID)) {
            return null;
        }
        if (contextType.includes(typeID)) {
            setContextType([...contextType.filter(string => string !== typeID)])
        } else {
            setContextType([...contextType, typeID])
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onFormSubmit(searchQuery,contextType, startDate, endDate);
    };

    const handleQueryChange = (event) => setSearchQuery(event.target.value);

    return (
        <div className='search-bar'>
            <h2><FormattedMessage id='pick-time-range' /></h2>
            <div className='search-bar--dates'>
                <CustomDatePicker
                    id="startTime"
                    name="startTime"
                    label="search-date-label-start"
                    defaultValue={startDate}
                    onChange={setStartDate}
                    maxDate={endDate ? endDate : undefined}
                    type="date"
                />
                <CustomDatePicker
                    id="endTime"
                    name="endTime"
                    label="search-date-label-end"
                    defaultValue={endDate}
                    onChange={setEndDate}
                    minDate={startDate ? startDate : undefined}
                    type="date"
                />
            </div>
            <h2><FormattedMessage id='pick-type' /></h2>
            <div className='col-sm-12'>
                <HelCheckbox
                    label={<FormattedMessage id='event'/>}
                    fieldID={EVENT_TYPE_PARAM.EVENT}
                    defaultChecked={checkEventTypes(EVENT_TYPE_PARAM.EVENT)}
                    onChange={(e) => toggleEventTypes(e)}
                    disabled={disableEventTypes(EVENT_TYPE_PARAM.EVENT)}
                />
                <HelCheckbox
                    label={<FormattedMessage id='hobby'/>}
                    fieldID={EVENT_TYPE_PARAM.HOBBY}
                    defaultChecked={checkEventTypes(EVENT_TYPE_PARAM.HOBBY)}
                    onChange={(e) => toggleEventTypes(e)}
                    disabled={disableEventTypes(EVENT_TYPE_PARAM.HOBBY)}
                />
                <HelCheckbox
                    label={<FormattedMessage id='courses'/>}
                    fieldID={EVENT_TYPE_PARAM.COURSE}
                    defaultChecked={checkEventTypes(EVENT_TYPE_PARAM.COURSE)}
                    onChange={(e) => toggleEventTypes(e)}
                    disabled={disableEventTypes(EVENT_TYPE_PARAM.COURSE)}
                />
            </div>
            <div className='search-bar--input event-input'>
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <label htmlFor='search'>
                            <h2>{intl.formatMessage({id: 'event-name-or-place'})}</h2>
                        </label>
                        <input
                            aria-label={intl.formatMessage({id: 'event-search'}) + ' ' + intl.formatMessage({id: 'event-name-or-place'})}
                            id='search'
                            className='event-search-bar'
                            type='text'
                            onChange={handleQueryChange}
                            onBlur={handleQueryChange}
                            value={searchQuery}
                        />
                    </FormGroup>
                </Form>
            </div>
            <Button
                block
                variant='contained'
                color='primary'
                className='search-bar--submit-button'
                onClick={() => onFormSubmit(searchQuery, contextType, startDate, endDate)}>
                <FormattedMessage id='search-event-button' />
            </Button>
        </div>
    );
};

SearchBar.propTypes = {
    onFormSubmit: PropTypes.func,
    intl: PropTypes.object,
};

export {SearchBar as SearchBarWithoutIntl}
export default injectIntl(SearchBar);
