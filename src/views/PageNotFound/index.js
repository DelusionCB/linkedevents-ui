import './index.scss'

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl'
import {Helmet} from 'react-helmet';
import {Link} from 'react-router-dom'

class PageNotFound extends React.Component {

    render() {
        const {intl} = this.context;
        const pageTitle = `Linkedevents - ${intl.formatMessage({id: `page-not-found`})}`

        return (
            <div className='pageNotFound'>
                <Helmet title={pageTitle}/>
                <div className='container notFound'>
                    <span aria-hidden={true} className='glyphicon glyphicon-search'/>
                    <div>
                        <FormattedMessage id='page-not-found'>{txt => <h1>{txt}</h1>}</FormattedMessage>
                        <FormattedMessage id='page-not-found-lead'>{txt => <p className='lead'>{txt}</p>}</FormattedMessage>
                        <Link to={'/'}><FormattedMessage id="page-not-found-return"/></Link>
                    </div>
                </div>
            </div>
        );
    }
}

PageNotFound.contextTypes = {
    intl: PropTypes.object,
}

export default PageNotFound;
