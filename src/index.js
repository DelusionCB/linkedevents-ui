import React, {Suspense, lazy} from 'react'
import ReactDOM from 'react-dom'
import {Route, Switch} from 'react-router'
import {withRouter, Redirect} from 'react-router-dom'
import {Provider, connect} from 'react-redux'
import {ConnectedRouter} from 'connected-react-router'
import {isIE, isLegacyEdge} from 'react-device-detect'
import Spinner from 'react-bootstrap/Spinner'

// Views
import App from './views/App'
import BrowserWarning from './views/Browser-Warning/BrowserWarning'


// Route views are dynamically imported, the 'then' methods don't do anything and only exist to suppress a warning.
const HomePage = lazy(() => import('./views/HomePage/HomePage').then(({default: Page}) => ({default: Page})));
const PageNotFound = lazy(() => import('./views/PageNotFound').then(({default: Page}) => ({default: Page})));
const Editor = lazy(() => import('./views/Editor').then(({default: Page}) => ({default: Page})));
const Search = lazy(() => import('./views/Search').then(({default: Page}) => ({default: Page})));
const Help = lazy(() => import('./views/Help').then(({default: Page}) => ({default: Page})));
const Terms = lazy(() => import('./views/Terms/Terms').then(({default: Page}) => ({default: Page})));
const Instructions = lazy(() => import ('./views/Instructions').then(({default: Page}) => ({default: Page})))
const Event = lazy(() => import('./views/Event').then(({default: Page}) => ({default: Page})));
const EventCreated = lazy(() => import('./views/EventCreated').then(({default: Page}) => ({default: Page})));
const EventListingPage = lazy(() => import('./views/EventListing').then(({default: Page}) => ({default: Page})));
const ModerationPage = lazy(() => import('./views/Moderation/Moderation').then(({default: Page}) => ({default: Page})));
const ManageMediaPage = lazy(() => import('./views/Media/ManageMedia').then(({default: Page}) => ({default: Page})));
const Accessibility = lazy(() => import('./views/Accessibility').then(({default: Page}) => ({default: Page})));

// Actors
import Validator from './actors/validator'

// JA addition
import Serializer from './actors/serializer';

// Translation
import IntlProviderWrapper from './components/IntlProviderWrapper'
import store, {history} from './store'
import moment from 'moment'
import * as momentTimezone from 'moment-timezone'

// Authentication
import userManager from './utils/userManager';
import {OidcProvider, processSilentRenew} from 'redux-oidc';
import LoginCallback from './views/Auth/LoginCallback'
import LogoutCallback from './views/Auth/LogoutCallback'

// Moment locale
moment.locale('fi')
momentTimezone.locale('fi')

// Setup actor for validation. Actor is a viewless component which can listen to store changes
// and send new actions accordingly. Bind the store as this for function
store.subscribe(_.bind(Validator, null, store))

// JA: Serializing state for debugging
store.subscribe(_.bind(Serializer, null, store));

const LayoutContainer = withRouter(connect()(App));

if (window.location.pathname === '/silent-renew') {
    processSilentRenew();
} else {
    ReactDOM.render(
        isIE || isLegacyEdge ? <BrowserWarning/> :
            <Provider store={store}>
                <OidcProvider store={store} userManager={userManager}>
                    <IntlProviderWrapper>
                        <ConnectedRouter history={history}>
                            <LayoutContainer>
                                <Suspense fallback={
                                    <div className='loading-view-spinner'>
                                        <Spinner animation="border" role="status" />
                                    </div>
                                }>
                                    <Switch>
                                        <Route exact path="/" component={props => <HomePage {...props}/>}/>
                                        <Route exact path="/listing" component={props => <EventListingPage {...props} />}/>
                                        <Route exact path="/event/:eventId" component={props => <Event {...props} />}/>
                                        <Route exact path="/event/:action/:eventId" component={props => <Editor {...props} />}/>
                                        <Route exact path="/event/:eventId/recurring/:action" component={props => <Editor {...props} />}/>
                                        <Route exact path="/event/done/:action/:eventId" component={props => <EventCreated {...props} />}/>
                                        <Route exact path="/search" component={props => <Search {...props} />}/>
                                        <Route exact path="/help" component={props => <Help {...props} />}/>
                                        <Route exact path="/terms" component={props => <Terms {...props} />}/>
                                        <Route exact path="/instructions" component={props => <Instructions {...props}/>}/>
                                        <Route exact path="/moderation" component={props => <ModerationPage {...props} />}/>
                                        <Route exact path="/media" component={props => <ManageMediaPage {...props} />}/>
                                        <Route exact path="/accessibility" component={props => <Accessibility {...props} />}/>
                                        <Route exact path="/callback" component={LoginCallback}/>
                                        <Route exact path="/callback/logout" component={LogoutCallback}/>
                                        <Route exact path="/404" component={props => <PageNotFound {...props} />}/>
                                        <Redirect from="*" to="/404" />
                                    </Switch>
                                </Suspense>
                            </LayoutContainer>
                        </ConnectedRouter>
                    </IntlProviderWrapper>
                </OidcProvider>
            </Provider>,
        document.getElementById('content')
    )
}
