import './index.scss';

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {FormattedMessage, injectIntl} from 'react-intl';
import CustomDatePicker from '../CustomFormFields/Dateinputs/CustomDatePicker'
import {Button, Form, FormGroup} from 'reactstrap';
import HelCheckbox from '../HelFormFields/HelCheckbox';

const SearchBar = ({intl, onFormSubmit}) => {
    const [startDate, setStartDate] = useState(moment().startOf('day'));
    const [endDate, setEndDate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [contextType, setContextType] = useState(['eventgeneral', 'eventhobbies'])

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
            <div className='col-sm-12'>
                <HelCheckbox
                    label={<FormattedMessage id='event'/>}
                    fieldID='eventgeneral'
                    defaultChecked={checkEventTypes('eventgeneral')}
                    onChange={(e) => toggleEventTypes(e)}
                    disabled={disableEventTypes('eventgeneral')}
                />
                <HelCheckbox
                    label={<FormattedMessage id='hobby'/>}
                    fieldID='eventhobbies'
                    defaultChecked={checkEventTypes('eventhobbies')}
                    onChange={(e) => toggleEventTypes(e)}
                    disabled={disableEventTypes('eventhobbies')}
                />
                {/*
                                <HelCheckbox
                                    label={<FormattedMessage id='course'/>}
                                    fieldID='course'
                                    //checked={showEventType.includes('eventcourse')}
                                    onChange={(e, v) => this.toggleEventTypes(e, 'eventcourse')}
                                /> */}
            </div>
            <div className='search-bar--input event-input'>
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <label htmlFor='search'>{intl.formatMessage({id: 'event-name-or-place'})}</label>
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
                <Button
                    variant='contained'
                    color='primary'
                    onClick={() => onFormSubmit(searchQuery, contextType, startDate, endDate)}>
                    <FormattedMessage id='search-event-button' />
                </Button>
            </div>
        </div>
    );
};

SearchBar.propTypes = {
    onFormSubmit: PropTypes.func,
    intl: PropTypes.object,
};

export {SearchBar as SearchBarWithoutIntl}
export default injectIntl(SearchBar);
