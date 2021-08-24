import './index.scss'

import React from 'react'
import {FormattedMessage} from 'react-intl'
import PropTypes from 'prop-types'
import EventGrid from '../../components/EventGrid'
import SearchBar from '../../components/SearchBar'
import {EventQueryParams, fetchEvents} from '../../utils/events'
import Spinner from 'react-bootstrap/Spinner'
import {Helmet} from 'react-helmet';

class SearchPage extends React.Component {

    state = {
        events: [],
        loading: false,
        searchExecuted: false,
    }

    searchEvents = async (searchQuery, startDate, endDate) => {
        this.setState({loading: true})

        const queryParams = new EventQueryParams()
        queryParams.page_size = 100
        queryParams.sort = 'start_time'
        queryParams.nocache = Date.now()
        queryParams.text = searchQuery
        if (startDate) queryParams.start = startDate.format('YYYY-MM-DD')
        if (endDate) queryParams.end = endDate.format('YYYY-MM-DD')

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

    render() {
        const {loading, searchExecuted} = this.state
        const {intl} = this.context
        const pageTitle = `Linkedevents - ${intl.formatMessage({id: `search-events`})}`

        return (
            <div className="container">
                <Helmet title={pageTitle}/>
                <h1><FormattedMessage id={`search-events`}/></h1>
                <p><FormattedMessage id="search-events-description"/></p>
                <p><FormattedMessage id='pick-time-range' /></p>
                <SearchBar onFormSubmit={(query, start, end) => this.searchEvents(query, start, end)}/>
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
