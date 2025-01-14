import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class LanguageSelector extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false,
        };
    }

    componentDidMount() {
        document.addEventListener('click', this.handleClick, false);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClick, false);
    }

    handleClick = (event) => {
        if (!this.node.contains(event.target)) {
            this.handleOutsideClick();
        }
    }

    handleOutsideClick() {
        if ( this.state.isOpen) {
            this.setState({isOpen: false});
        }
    }

    toggle(e) {
        e.preventDefault();
        this.setState({isOpen: !this.state.isOpen});
    }

    handleLanguageChange(lang, e) {
        e.preventDefault();
        this.props.changeLanguage(lang);
        this.setState({isOpen: false})

    }

    getButtonAriaText(language){
        switch (language) {
            case 'fi':
                return 'Valitse kieleksi Suomi'
            case 'en':
                return 'Set language to English'
            case 'sv':
                return 'Byt språk till Svenska'
            default:
                return 'Valitse kieleksi Suomi'
        }
    }

    /**
     * Returns true if language is same as current locale
     * @param {object} language
     * @return {boolean}
     */
    isActiveLanguage(language) {
        const {userLocale} = this.props;
        return language.label === userLocale.locale.toUpperCase();
    }

    render() {
        const {userLocale} = this.props;
        const activeLocale = userLocale.locale.toUpperCase();
        return (
            <React.Fragment>
                <div onClick={this.toggle} ref={node => this.node = node} className='LanguageMain'>
                    <span className="glyphicon glyphicon-globe" />
                    <div className="currentLanguage">
                        <a
                            aria-expanded={this.state.isOpen}
                            aria-label={this.context.intl.formatMessage({id: `navbar.active`})}
                            aria-owns="language-list"
                            href="#"
                        >
                            {activeLocale}
                            <span className="caret"/>
                        </a>
                    </div>
                </div>
                <ul
                    id="language-list"
                    role="menu"
                    className={classNames('language', {open: this.state.isOpen})}
                >
                    {this.props.languages.map((language, index) => {
                        const additionalParams = this.isActiveLanguage(language) ? {'aria-current': true} : {};
                        return (
                            <li
                                role="presentation"
                                key={index}
                                className={classNames('language-item',{active: this.isActiveLanguage(language)})}
                                onClick={this.handleLanguageChange.bind(this, language)}
                            >
                                <a
                                    role="menuitem"
                                    lang={language.value}
                                    aria-label={this.getButtonAriaText(language.value)}
                                    href="#"
                                    {...additionalParams}
                                >
                                    {language.label}
                                </a>
                            </li>
                        )
                    })}
                </ul>
            </React.Fragment>
        )
    }
}

LanguageSelector.propTypes = {
    languages: PropTypes.array,
    userLocale: PropTypes.object,
    changeLanguage: PropTypes.func,
}

LanguageSelector.contextTypes = {
    intl: PropTypes.object,
}
export default LanguageSelector;
