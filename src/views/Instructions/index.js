import './index.scss'
import React, {Fragment} from 'react'
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Helmet} from 'react-helmet';
import {getContent} from '../../utils/helpers';

class Instructions extends React.Component {
    render() {
        const content = getContent(this.props.locale, 'tips');
        const {intl} = this.context;
        // Defined React Helmet title with intl
        const pageTitle = `Linkedevents - ${intl.formatMessage({id: 'instructions-page'})}`
        return (
            <Fragment>
                <Helmet title={pageTitle}/>
                <div className="container help-page" dangerouslySetInnerHTML={{__html: content}}/>
            </Fragment>
        )
    }
}

Instructions.propTypes = {
    locale: PropTypes.string,
}
Instructions.contextTypes = {
    intl: PropTypes.object,
}

const mapStateToProps = (state) => ({
    locale: state.userLocale.locale,
});
export {Instructions as UnconnectedInstructions}
export default connect(mapStateToProps)(Instructions)
