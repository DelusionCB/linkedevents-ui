import './index.scss'

import React from 'react'
import {FormattedMessage} from 'react-intl'
import PropTypes from 'prop-types'
import EventGrid from '../../components/EventGrid'
import SearchBar from '../../components/SearchBar'
import {EventQueryParams, fetchEvents} from '../../utils/events'
import Spinner from 'react-bootstrap/Spinner'
import {Helmet} from 'react-helmet';
import constants from '../../constants'
import {Label} from 'reactstrap'
import classNames from 'classnames';

const {LOCATION_OPTIONS, DEFAULT_SEARCH_DISTANCE} = constants;
class SearchPage extends React.Component {

    state = {
        events: [],
        loading: false,
        searchExecuted: false,
        nearMeChecked: false,
        maxDistance: DEFAULT_SEARCH_DISTANCE,
        userCoordinates: {
            latitude: null,
            longitude: null,
        },
        locationErrorCode: null,
    }

    searchEvents = async (searchQuery, context, startDate, endDate) => {
        this.setState({loading: true})
        const {nearMeChecked, userCoordinates, maxDistance} = this.state;
        const queryParams = new EventQueryParams()
        queryParams.page_size = 100
        queryParams.sort = 'start_time'
        queryParams.nocache = Date.now()
        queryParams.text = searchQuery
        queryParams.type_id = context.join();
        if (startDate) queryParams.start = startDate.format('YYYY-MM-DD')
        if (endDate) queryParams.end = endDate.format('YYYY-MM-DD')
        if(nearMeChecked && userCoordinates.latitude) queryParams.lat = userCoordinates.latitude
        if(nearMeChecked && userCoordinates.longitude) queryParams.lon = userCoordinates.longitude
        // Convert the radius to meters
        if(nearMeChecked && maxDistance !== DEFAULT_SEARCH_DISTANCE) queryParams.radius = maxDistance * 1000

        try {
            const response = await fetchEvents(queryParams)
            this.setState({events: response.data.data, searchExecuted: true})
        } finally {
            this.setState({loading: false})
        }
    }

    getResults = () => {
        const {searchExecuted, events} = this.state

        return searchExecuted && !events.length > 0
            ? null
            : <EventGrid events={events} />
    }

    handleNearMeToggle = (e) => {
        this.setState({nearMeChecked : e.target.checked});
    }

    handleMaxDistanceChange = (e) => {
        this.setState({maxDistance: e.target.value});
    }

    onLocationSuccess = ({coords}) => {
        const {longitude, latitude} = coords;
        if(latitude && longitude){
            this.setState({userCoordinates: {latitude,longitude},locationErrorCode:null})
        }
    }

    onLocationError = (error) => {
        this.setState({locationErrorCode : error.code, nearMeChecked : false});
    }

    componentDidUpdate(){
        if('geolocation' in navigator){
            if(this.state.nearMeChecked && (!this.state.userCoordinates.latitude || !this.state.userCoordinates.longitude)){
                navigator.geolocation.getCurrentPosition(this.onLocationSuccess, this.onLocationError, LOCATION_OPTIONS);
            }
        }
    }

    render() {
        const {loading, searchExecuted} = this.state
        const {intl} = this.context
        const pageTitle = `Linkedevents - ${intl.formatMessage({id: `search-events`})}`
        return (
            <div className="container">
                <Helmet title={pageTitle}/>
                <h1><FormattedMessage id={`search-events`}/></h1>
                <p><FormattedMessage id="search-events-description"/></p>
                <div className='toggle-container'>
                    <div className="custom-control custom-checkbox">  
                        <input
                            id='toggle-near-me'
                            className='custom-control-input'
                            type='checkbox'
                            onChange={(e) => this.handleNearMeToggle(e)}
                            checked={this.state.nearMeChecked}
                            aria-checked={this.state.nearMeChecked}
                        />
                        <Label className={classNames('custom-control-label')} htmlFor='toggle-near-me'>
                            <FormattedMessage id="search-events-near-me"/>
                        </Label>
                    </div>
                    {this.state.nearMeChecked && (
                        <div>
                            <div>
                                <Label htmlFor='max-distance'>
                                    <FormattedMessage id="search-events-max-distance"/>
                                    &nbsp;
                                    <span>{this.state.maxDistance} km</span>
                                </Label>
                            </div>
                            <input
                                type='range'
                                id='max-distance'
                                min={1}
                                max={50}
                                step={1}
                                value={this.state.maxDistance}
                                onChange={this.handleMaxDistanceChange}
                                aria-label={intl.formatMessage({id: 'search-events-max-distance-aria-label'})}
                            />
                        </div>
                    )}
                    {
                        !!this.state.locationErrorCode && 
                        <div className="alert alert-info location-error-message" role="alert">
                            <FormattedMessage id={`${this.state.locationErrorCode === 1 ? 'location-permission-denied' : 'location-unavailable'}`}/>
                        </div>
                    }
                </div>
                <p><FormattedMessage id='pick-time-range' /></p>
                <SearchBar onFormSubmit={(query, context, start, end) => this.searchEvents(query, context, start, end)}/>
                <div id="search-page-results-count-status" role="status" aria-live="polite" aria-atomic="true">
                    {searchExecuted &&
                        <FormattedMessage
                            id="search-results-count"
                            values={{count: this.state.events.length}}
                        >
                            {txt => <p>{txt}</p>}
                        </FormattedMessage>
                    }
                </div>
                <section className="container-fluid">
                    {loading
                        ? <div className="search-loading-spinner"><Spinner animation="border" role="status">
                            <FormattedMessage id="loading">{txt => <span className="sr-only">{txt}</span>}</FormattedMessage>
                        </Spinner> </div>
                        : this.getResults()
                    }
                </section>
            </div>
        )
    }
}

SearchPage.propTypes = {
    events: PropTypes.array,
    loading: PropTypes.bool,
    searchExecuted: PropTypes.bool,
}
SearchPage.contextTypes = {
    intl: PropTypes.object,
}

export default SearchPage
