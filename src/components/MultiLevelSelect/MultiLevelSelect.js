import 'react-dropdown-tree-select/dist/styles.css'
import './MultiLevelSelect.scss'
import PropTypes from 'prop-types';
import {connect} from 'react-redux'
import React from 'react'
import DropdownTreeSelect from 'react-dropdown-tree-select'
import {isEqual} from 'lodash';
import {injectIntl} from 'react-intl';

export class MultiLevelSelect extends React.Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate = (nextProps) => {
        return !isEqual(nextProps.data, this.props.data)
    }

    render(){
        return(
            <DropdownTreeSelect 
                data={this.props.data} 
                texts={{placeholder: this.props.placeholder}} 
                ariaLabel={this.props.placeholder}
                className='organization-select'
                onChange={this.props.handleChange}
            />
        )
    
    }
}

MultiLevelSelect.propTypes = {
    data: PropTypes.array,
    placeholder: PropTypes.string,
    handleChange: PropTypes.func,
}

export default connect(null, null)(injectIntl(MultiLevelSelect));
