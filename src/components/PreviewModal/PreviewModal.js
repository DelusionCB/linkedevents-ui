import './index.scss';

import React from 'react';
import PropTypes from 'prop-types';
import EventDetails from '../EventDetails';
import {injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import {mapAPIDataToUIFormat, mapUIDataToAPIFormat} from 'src/utils/formDataMapping.js';
import classNames from 'classnames'
import {getEventLanguageType} from '../../utils/locale';
class PreviewModal extends React.Component {

    getFormattedLanguages(editor) {
        const languageArray = [];
        if (editor.values.in_language) {
            editor.languages.forEach(language => {
                if(editor.values.in_language.includes(language['@id'])) {
                    languageArray.push(language);
                }
            });
        }
        return languageArray;
    }

    getFormattedAudience(editor) {
        const audienceArray = [];
        if (editor.values.audience) {
            editor.keywordSets[0].keywords.forEach(audience => {
                if(editor.values.audience.includes(audience['@id'])) {
                    audienceArray.push(audience);
                }
            });
        }
        return audienceArray;
    }

    render() {
        const closebtn = <Button onClick={this.props.toggle} aria-label={this.context.intl.formatMessage({id: `close-preview-modal`})}><span className="glyphicon glyphicon-remove"></span></Button>
        const {superEvent = null, publisher, editor, values, uiMode} = this.props;
        const formattedEvent = mapAPIDataToUIFormat(mapUIDataToAPIFormat(values));
        const localeType = getEventLanguageType(formattedEvent.type_id)
        formattedEvent.in_language = this.getFormattedLanguages(editor);
        formattedEvent.audience = this.getFormattedAudience(editor);
        return (
            <Modal
                className={classNames('previewModal', uiMode)}
                size='xl'
                isOpen={this.props.isOpen}
                toggle={this.props.toggle}
            >
                <ModalHeader tag='h1' close={closebtn}>
                    <FormattedMessage id={`${localeType}-preview`}/>
                </ModalHeader>
                <ModalBody>
                    <div>
                        <EventDetails
                            values={values}
                            superEvent={superEvent}
                            rawData={formattedEvent}
                            publisher={publisher}
                            editor={editor}
                            disableSuperEventLinks
                            isPreview
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant='contained'
                        onClick={this.props.toggle}
                        color='secondary'
                    >
                        <FormattedMessage id='close' />
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}
PreviewModal.propTypes = {
    values: PropTypes.object,
    superEvent: PropTypes.object,
    publisher: PropTypes.object,
    editor: PropTypes.object,
    event: PropTypes.object,
    intl: intlShape,
    toggle: PropTypes.func,
    isOpen: PropTypes.bool,
    uiMode: PropTypes.string,
}
PreviewModal.contextTypes = {
    intl: PropTypes.object,
}

export default injectIntl(PreviewModal)
