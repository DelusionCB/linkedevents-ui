import './index.scss'
import React from 'react';
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';
import {MultiLanguageField} from '../../HelFormFields';
import CollapseButton from '../../FormFields/CollapseButton/CollapseButton';
import {Collapse} from 'reactstrap';

class Instructions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editedValues: [],
            generalHeader: false,
            hobbiesHeader: false,
            courseHeader: false,
        }
    }

    toggleHeader(e) {
        if (e.target.id) {
            this.setState({[e.target.id]: !this.state[e.target.id]})
        }
    }

    /**
     *
     *
     */
    buildObject() {
        let obj = {}
        // Unwrap connect and injectIntl
        const pairs = _.map(this.refs, (ref, key) => ({
            key: key,
            value: ref.getValue(),
        }))
        for (const key in this.props.editor.sideFields) {
            pairs.forEach((pair) => {
                obj[pair.key] = pair.value
            })
        }
        return obj
    }

    /**
     *
     */
    onBlur(e) {
        let obj
        obj = this.buildObject()
        this.setState({editedValues: obj})
    }

    mappedFields = (type) => {
        const {editor: {sideFields}} = this.props;
        let elements = []
        sideFields.forEach((field, index) => {
            const foo = Object.keys(field)
            foo.sort()
            foo.forEach((key) => {
                if (!['type_id', 'created_time', '@context', '@id', '@type', 'data_source', 'name', 'last_modified_time', 'sidefieldset_name'].includes(key) && field['type_id'] === type) {
                    elements.push(
                        <div key={`${index}-${key}`}>
                            <MultiLanguageField
                                id={key}
                                multiLine={true}
                                label={`${key}-${type.toLowerCase()}`}
                                ref={key}
                                type='textarea'
                                defaultValue={field[key]}
                                languages={Object.keys(field[key])}
                                onBlur={e => this.onBlur(e, type)}
                            />
                        </div>
                    )
                }
            })
        })
        return elements
    }


    render() {
        const {editor: {sideFields}} = this.props;
        return (
            <div className='sidefield-editor'>
                <div>
                    <h2>
                        <CollapseButton
                            id='generalHeader'
                            isOpen={this.state.generalHeader}
                            isRequired={true}
                            targetCollapseNameId='General'
                            toggleHeader={(e) => this.toggleHeader(e)}
                        />
                    </h2>
                    <Collapse isOpen={this.state.generalHeader}>
                        {this.mappedFields('General')}
                    </Collapse>
                </div>
                <div>
                    <h2>
                        <CollapseButton
                            id='hobbiesHeader'
                            isOpen={this.state.hobbiesHeader}
                            isRequired={true}
                            targetCollapseNameId='Hobbies'
                            toggleHeader={(e) => this.toggleHeader(e)}
                        />
                    </h2>
                    <Collapse isOpen={this.state.hobbiesHeader}>
                        {this.mappedFields('Hobbies')}
                    </Collapse>
                </div>
                <div>
                    <h2>
                        <CollapseButton
                            id='courseHeader'
                            isOpen={this.state.courseHeader}
                            isRequired={true}
                            targetCollapseNameId='Course'
                            toggleHeader={(e) => this.toggleHeader(e)}
                        />
                    </h2>
                    <Collapse isOpen={this.state.courseHeader}>
                        {this.mappedFields('Course')}
                    </Collapse>
                </div>
            </div>
        )
    }
}

Instructions.propTypes = {
    editor: PropTypes.object,
}

const mapDispatchToProps = (dispatch) => ({

});

const mapStateToProps = (state) => ({
    editor: state.editor,
})

export default connect(mapStateToProps, mapDispatchToProps)(Instructions)
