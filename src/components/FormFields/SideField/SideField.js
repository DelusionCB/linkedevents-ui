import './index.scss'

import React from 'react';
import PropTypes from 'prop-types';
import CollapseButton from '../CollapseButton/CollapseButton';
import {Collapse} from 'reactstrap';

class SideField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: true,
        };
    }

    componentDidMount() {
        /**
         * Listen to 'resize' & call toggleHeader if
         * window width is more than 992 pixels & isOpen is false
         */
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992 && !this.state.isOpen) {
                this.toggleHeader()
            }
        })
    }

    componentWillUnmount() {
        /**
         * Remove the eventListener added in componentDidMount
         */
        window.removeEventListener('resize', () => {
            if (window.innerWidth > 992 && !this.state.isOpen) {
                this.toggleHeader()
            }
        })
    }

    /**
     * Call to toggle isOpen-state
     */
    toggleHeader = () => {
        this.setState({isOpen: !this.state.isOpen});
    }

    render() {
        const {children, id} = this.props;
        const {isOpen} = this.state;

        return (
            <div className='side-field col-sm-6'>
                <CollapseButton
                    targetCollapseNameId={id}
                    isOpen={isOpen}
                    toggleHeader={this.toggleHeader}
                />
                <Collapse isOpen={isOpen}>
                    <div className='tip'>
                        {children}
                    </div>
                </Collapse>
            </div>
        );
    }
}

SideField.propTypes = {
    id: PropTypes.string,
    children: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
};

export default SideField
