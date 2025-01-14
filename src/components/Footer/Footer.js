import React from 'react';
import './Footer.scss';
import DebugReporterModal from '../helper/Helper'
import {report} from '../../utils/raven_reporter';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {FormattedMessage, injectIntl} from 'react-intl';

class Footer extends React.Component {
    constructor(props) {
        super(props);
    }

    /**
     * TODO: Enable when Sentry is activated & ready to be used
     */
    /*
    class Footer extends React.Component {
        constructor(props) {
        super(props);
        this.state = {
            reporting: false,
        };
        this.showReportForm = this.showReportForm.bind(this);
        this.closeReportForm = this.closeReportForm.bind(this);
        this.serializeState = this.serializeState.bind(this);
    }
    
        showReportForm() {
        this.setState({reporting: true});
    }
    closeReportForm() {
        this.setState({reporting: false});
    }

    serializeState(reportmsg) {
        this.closeReportForm();
        report(window.ARG, reportmsg, appSettings.commit_hash);
        window.setTimeout(() => alert(this.props.intl.formatMessage({id: `reportmodal-sent`})), 100);
    }
*/


    render(){
        const mailSubject = this.props.intl.formatMessage({id:'mailto-subject'})
        const mailBody = this.props.intl.formatMessage({id:'mailto-body'})
        return (
            <footer className='main-footer'>
                <div className='footer-logo'></div>
                <div className='footer-list'>
                    <Link to='/accessibility' aria-label={this.props.intl.formatMessage({id:'footer-accessibility'})}>
                        <FormattedMessage id='footer-accessibility' />
                    </Link>
                    {/*
                    <DebugReporterModal
                        showModal={this.state.reporting}
                        close={this.closeReportForm}
                        sendReport={this.serializeState}
                        intl={this.props.intl}
                    />
                    <button
                        aria-label={this.props.intl.formatMessage({id:'reportmodal-button'})}
                        onClick={this.showReportForm}
                        role='link'>
                        <FormattedMessage id='reportmodal-button'>{txt =>txt}</FormattedMessage>
                    </button>
                    */}
                    <FormattedMessage id='reportmodal-button'>{txt => (
                        <div>
                            <a
                                href={`mailto:sovellustuki@turku.fi
                                ?subject=${mailSubject}
                                &body=${mailBody}
                                `}
                                rel='noopener noreferrer'
                                target='_blank'>
                                {txt}
                            </a>
                        </div>
                    )}
                    </FormattedMessage>
                    <div><FormattedMessage id={'footer-city'} /></div>
                    <div><FormattedMessage id={'footer-city1'} /></div>
                    <div><FormattedMessage id={'footer-city2'} /></div>
                </div>
                <a href={this.props.intl.formatMessage({id:'footer-link'})} rel="noopener noreferrer" target="_blank"><FormattedMessage id={'footer-city3'} /></a>
            </footer>
        );
    }
}

Footer.propTypes = {
    intl: PropTypes.object,
}

export {Footer as UnconnectedFooter}
export default injectIntl(Footer);
