import './index.scss'
import React from 'react';
import PropTypes from 'prop-types'
import {intlShape} from 'react-intl';
import {connect} from 'react-redux';
import InstructionEditor from './InstructionsComponents/InstructionEditor';

function Instructions({intl, editor}){
    return (
        <InstructionEditor intl={intl} editor={editor} />
    )
}

Instructions.propTypes = {
    editor: PropTypes.object,
    intl: PropTypes.oneOfType([
        PropTypes.object,
        intlShape.isRequired,
    ]),
}

const mapStateToProps = (state) => ({
    editor: state.editor,
})

export {Instructions as UnconnectedInstructions};
export default connect(mapStateToProps, null)(Instructions)
