import './index.scss'

import React from 'react';
import PropTypes from 'prop-types';
import CollapseButton from '../CollapseButton/CollapseButton';
import {Collapse} from 'reactstrap';
import {connect} from 'react-redux';
import {mapSideFieldsToForm} from '../../../utils/apiDataMapping';
import {injectIntl} from 'react-intl';

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

        const {id, editor, intl, type} = this.props;
        const {sideFields, values} = editor;
        const {isOpen} = this.state;
        const contentTexts = mapSideFieldsToForm(sideFields, values['type_id'], intl.locale)

        return (
            <div className='side-field col-sm-6'>
                <CollapseButton
                    targetCollapseNameId={contentTexts[type].mobileHeader}
                    isOpen={isOpen}
                    toggleHeader={this.toggleHeader}
                    useNameIdAsRawName={true}
                />
                <Collapse isOpen={isOpen}>
                    <div id={id} className='tip' dangerouslySetInnerHTML={{__html: contentTexts[type].content.replace(/\n/g, '<br />')}} />
                </Collapse>
            </div>
        );
    }
}

SideField.propTypes = {
    editor: PropTypes.object,
    type: PropTypes.string,
    id: PropTypes.string,
    intl: PropTypes.object,
};

SideField.contextTypes = {
    intl: PropTypes.object,
}

const mapStateToProps = (state) => ({
    editor: state.editor,
})

export {SideField as UnconnectedSideField}
export default injectIntl(connect(mapStateToProps)(SideField));
