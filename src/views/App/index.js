import 'src/assets/additional_css/bootstrap.custom.min.css';
import 'src/assets/main.scss';
import '@city-assets/main.scss';

import PropTypes from 'prop-types';

import React from 'react'
import {connect} from 'react-redux'

import Headerbar from 'src/components/Header'
import Footer from 'src/components/Footer/Footer';
import SkipLink from 'src/components/SkipLink'
import {Helmet} from 'react-helmet';
import {injectIntl} from 'react-intl'
import {
    fetchLanguages as fetchLanguagesAction,
    fetchKeywordSets as fetchKeywordSetsAction,
    fetchPaymentMethods as fetchPaymentMethodsAction,
    fetchSideFields as fetchSideFieldsAction,
} from '../../actions/editor'
import {fetchUser as fetchUserAction} from '../../actions/user'
import Favicon from '../../assets/images/favicon'
import MomentUtils from '@date-io/moment';
import moment from 'moment'
import cookieUtil from '../../utils/cookieUtils';
import NavStartingPoint from '../../components/NavStartingPoint';
import Notification from '../Notification';
import ConfirmDialog from '../../components/ConfirmDialog';

// localized moment utils
class LocalizedUtils extends MomentUtils {
    getDatePickerHeaderText(date) {
        return moment(date).format('DD.MM');
    }
    getDateTimePickerHeaderText(date) {
        return moment(date).format('DD.MM');
    }
}

class App extends React.Component {

    static propTypes = {
        children: PropTypes.node,
        fetchKeywordSets: PropTypes.func,
        cancel: PropTypes.func,
        do: PropTypes.func,
    };

    static childContextTypes = {
        intl: PropTypes.object,
        dispatch: PropTypes.func,
    };

    getChildContext() {
        return {
            dispatch: this.props.dispatch,
            intl: this.props.intl,
        }
    }

    UNSAFE_componentWillMount() {
        // fetch Hel.fi languages
        this.props.fetchLanguages()

        // Prefetch editor related hel.fi categories
        this.props.fetchKeywordSets()

        this.props.fetchPaymentMethods()

        // fetch sidefields
        this.props.fetchSideFields()
    }

    componentDidUpdate(prevProps) {
        // fetch user if user doesnt exist yet or new user is not same as previous one
        if(this.props.auth.user && this.props.auth.user !== prevProps.auth.user) {
            this.props.fetchUser(this.props.auth.user.profile.sub);
        }
    }

    render() {

        const isEventCreateOrUpdate = window.location.pathname.includes('/event/create/') ||
            window.location.pathname.includes('/event/update/');

        return (
            <div className='main-wrapper'>
                <Helmet>
                    <html lang={this.props.intl.locale} />
                    {appSettings.enable_cookies && cookieUtil.getConsentScripts()}
                    {appSettings.enable_cookies && cookieUtil.getCookieScripts()}
                </Helmet>
                <NavStartingPoint location={this.props.location}/>
                <SkipLink />
                <Favicon />
                <Headerbar />
                {!isEventCreateOrUpdate && <Notification flashMsg={this.props.app.flashMsg} isEventCreateOrUpdate={isEventCreateOrUpdate} />}
                <main id="main-content" className="content">
                    {this.props.children}
                </main>
                {isEventCreateOrUpdate && <Notification flashMsg={this.props.app.flashMsg} isEventCreateOrUpdate={isEventCreateOrUpdate} />}
                <ConfirmDialog />
                <Footer />
            </div>
        )
    }
}

App.propTypes = {
    intl: PropTypes.object,
    app: PropTypes.object,
    user: PropTypes.object,
    dispatch: PropTypes.func,
    fetchLanguages: PropTypes.func,
    fetchPaymentMethods: PropTypes.func,
    auth : PropTypes.object,
    fetchUser: PropTypes.func,
    location: PropTypes.object,
    fetchSideFields: PropTypes.func,
}

const mapStateToProps = (state) => ({
    editor: state.editor,
    app: state.app,
    user: state.user.data,
    auth: state.auth,
})

const mapDispatchToProps = (dispatch) => ({
    fetchKeywordSets: () => dispatch(fetchKeywordSetsAction()),
    fetchLanguages:() => dispatch(fetchLanguagesAction()),
    fetchPaymentMethods:() => dispatch(fetchPaymentMethodsAction()),
    fetchSideFields:() => dispatch(fetchSideFieldsAction()),
    fetchUser: (id) => dispatch(fetchUserAction(id)),
})

export {App as UnconnectedApp};
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(App))
