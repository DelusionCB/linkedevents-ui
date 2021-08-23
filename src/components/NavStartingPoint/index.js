import React from 'react'
import {Helmet} from 'react-helmet'
import PropTypes from 'prop-types';


// handles imitating traditional html page navigation focus setting
// and informing screen reader user of the current page title
class NavStartingPoint extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            title: '',
            hideTitleText: true,
        }
        this.onHelmetChange = this.onHelmetChange.bind(this)
    }

    componentDidUpdate(prevProps){
        const currentLocation = this.props.location
        const previousLocation = prevProps.location
        if (currentLocation && previousLocation){
            if(currentLocation.pathname !== previousLocation.pathname){
                // unhide title text only when first navigation occurs within the site
                // to prevent initial potential page load text render spam and reading
                // the title twice from the real page title and this helper title text
                this.setState({hideTitleText: false})
                document.getElementById('page-nav-starting-point').focus();
            }
        }
    }

    onHelmetChange({title}){
        this.setState({title})
    }

    render(){
        const {title, hideTitleText} = this.state
        return (
            <React.Fragment>
                <p
                    aria-hidden={hideTitleText} 
                    className='sr-only'
                    id='page-nav-starting-point'
                    tabIndex={-1}
                >
                    {title}
                </p>
                <Helmet onChangeClientState={this.onHelmetChange} />
            </React.Fragment >
        )
    }
}

NavStartingPoint.propTypes = {
    location: PropTypes.object,
}

export default NavStartingPoint
