import PropTypes from 'prop-types';
import React from 'react'
import {clearValue, setData} from '../../../actions/editor'
import {FormattedMessage, injectIntl} from 'react-intl'
import {get} from 'lodash'
import SelectorRadio from './SelectorRadio';
import constants from '../../../constants'
import {confirmAction} from '../../../actions/app';

const {
    EVENT_TYPE,
} = constants

class TypeSelector extends React.Component {
    constructor(props) {
        super(props);
        const {event, editor} = this.props;
        this.state = {
            isCreateView: false,
            type: event.type_id || editor.values.type_id || EVENT_TYPE.GENERAL,
        };
    }

    componentDidMount() {
        this.handleMount()
    }

    componentDidUpdate(prevProps, prevState) {
        const {type, isCreateView} = this.state;
        const {editor} = this.props;

        if (prevProps.editor.values.type_id !== editor.values.type_id && editor.values.type_id !== type) {
            const newType = editor.values.type_id || EVENT_TYPE.GENERAL;
            this.setState({type: newType});

        }else if (prevProps.editor.values && !editor.values.type_id && !isCreateView) {
            this.setState({isCreateView: true});
            this.context.dispatch(setData({type_id: EVENT_TYPE.GENERAL}))
        }
    }


    handleMount = () => {
        const {event:{type_id},editor:{values}} = this.props;
        const {router} = this.context.store.getState();
        // a brand event with no data sets this to true -> dispatches the initial type.
        let dispatchInitialType = false;

        const newState = {};
        if (type_id) {
            newState.type = type_id
            newState.isCreateView = false;
        } else {
            const updatedIsCreateView = get(router, ['location' ,'pathname'], '').includes('/event/create/new')
            // creating a new event
            if (updatedIsCreateView) {
                newState.isCreateView = true;
                // editor contains values? -> set editor.values.type_id to state.
                if (values.type_id) {newState.type = values.type_id;}
                else {dispatchInitialType = true;}
            }
        }

        if(Object.keys(newState).length > 0) {
            this.setState(newState)
        }
        if (dispatchInitialType) {
            this.context.dispatch(setData({type_id: EVENT_TYPE.GENERAL}))
        }
    }


    /**
     * Handles radio changes
     * 'event'
     * if value === 'event', set typeId.type_id to constants.EVENT_TYPE.GENERAL & set states.type to {@param event.target.value}
     *
     * 'hobby'
     * if value === 'hobby', set typeId.type_id to constants.EVENT_TYPE.HOBBIES & set states.type to {@param event.target.value}
     *
     * @param {Object} event Event
     */
    handleTypeChange = event => {
        const {value} = event.target
        const {editor:{values}} = this.props;
        const {dispatch} = this.context;

        let checkValues = [values.keywords]
        // Falsy values are filtered
        checkValues = checkValues.filter(val => val);
        // Keys used for clearing values from editor.values
        const clearValueKeys = 'keywords'

        const valuesToClear = []
        if (value === EVENT_TYPE.GENERAL) {
            // This can be expanded to include more values that should be cleared.
            if (checkValues.includes(values.keywords)) {
                valuesToClear.push(clearValueKeys);
            }
        }

        else if (value === EVENT_TYPE.COURSE) {
            // This can be expanded to include more values that should be cleared.
            if (checkValues.includes(values.keywords)) {
                valuesToClear.push(clearValueKeys);
            }
        }

        else if (value === EVENT_TYPE.HOBBIES) {
            // This can be expanded to include more values that should be cleared.
            if (checkValues.includes(values.keywords)) {
                valuesToClear.push(clearValueKeys)
            }
        }
        // If valuesToClear has length over 0, push confirmActionProps & values for action
        if (valuesToClear.length > 0) {
            dispatch(confirmAction('confirm-type-switch', 'warning', 'switch-type', {
                action: (e) => {
                    dispatch(setData({type_id: value}));
                    dispatch(clearValue(valuesToClear));
                },
                additionalMsg: <FormattedMessage id='type-switch' />,
                additionalMarkup: ' ',
            }));
        } else {
            dispatch(setData({type_id: value}));
        }
    }

    getSelectors = (messageID = '', value) => {
        const {type, isCreateView} = this.state
        const {disabled, event} = this.props;
        // check if value is same as state.type or value is same as props.event.type_id
        const isChecked = value === type || value === get(event, 'type_id')
        return (
            <SelectorRadio
                ariaLabel={this.context.intl.formatMessage({id: messageID})}
                value={value}
                checked={isChecked}
                handleCheck={this.handleTypeChange}
                messageID={messageID}
                disabled={disabled || !isCreateView}
                name='TypeGroup'
            >
            </SelectorRadio>
        )
    }


    render() {
        return (
            <div className="type-row row">
                <div className="col-sm-6">
                    <div className='custom-control-radio'>
                        {this.getSelectors('event', EVENT_TYPE.GENERAL)}
                        {this.getSelectors('hobby',EVENT_TYPE.HOBBIES)}
                        {this.getSelectors('courses',EVENT_TYPE.COURSE)}
                    </div>
                </div>
            </div>
        )
    }
}

TypeSelector.propTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
    store: PropTypes.object,
    editor: PropTypes.object,
    event: PropTypes.object,
    isCreateView: PropTypes.bool,
    isUmbrellaEvent: PropTypes.bool,
    hasUmbrellaEvent: PropTypes.bool,
    editedEventIsSubEvent: PropTypes.bool,
    disabled: PropTypes.bool,
}

TypeSelector.contextTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
    store: PropTypes.object,
};

export {TypeSelector as UnconnectedTypeSelector}
export default injectIntl(TypeSelector);
