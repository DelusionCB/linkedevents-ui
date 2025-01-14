import './index.scss'
import React, {Fragment} from 'react'
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Helmet} from 'react-helmet';
import {getContent} from '../../utils/helpers';

class Help extends React.Component {
    render() {
        const content = getContent(this.props.locale, 'help');
        const {intl} = this.context;
        // Defined React Helmet title with intl
        const pageTitle = `Linkedevents - ${intl.formatMessage({id: 'more-info'})}`
        return (
            <Fragment>
                <Helmet title={pageTitle}/>
                <div className="container help-page" dangerouslySetInnerHTML={{__html: content}}/>
            </Fragment>
        )
    }
}

Help.propTypes = {
    locale: PropTypes.string,
}
Help.contextTypes = {
    intl: PropTypes.object,
}

const mapStateToProps = (state) => ({
    locale: state.userLocale.locale,
});
export {Help as UnconnectedHelp}
export default connect(mapStateToProps)(Help)
