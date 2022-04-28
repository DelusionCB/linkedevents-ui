import './Terms.scss'
import React, {Fragment} from 'react'
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Helmet} from 'react-helmet';
import {getContent} from '../../utils/helpers';

class Terms extends React.Component {
    render() {
        const content = getContent(this.props.locale, 'terms');
        const {intl} = this.context;
        // Defined React Helmet title with intl
        const pageTitle = `Linkedevents - ${intl.formatMessage({id: 'terms-page'})}`
        return (
            <Fragment>
                <Helmet title={pageTitle}/>
                <div className="container help-page" dangerouslySetInnerHTML={{__html: content}}/>
            </Fragment>
        )
    }
}

Terms.propTypes = {
    locale: PropTypes.string,
}
Terms.contextTypes = {
    intl: PropTypes.object,
}

const mapStateToProps = (state) => ({
    locale: state.userLocale.locale,
});
export {Terms as UnconnectedTerms}
export default connect(mapStateToProps)(Terms)
