import './MultiSelect.scss'
import PropTypes from 'prop-types';
import {connect} from 'react-redux'
import React from 'react'
import {FormattedMessage, injectIntl} from 'react-intl';
import Select from 'react-select'

export class MultiSelect extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        const {placeholder, data, handleChange} = this.props;
        return(
            <Select 
                options={data}
                placeholder={<span className='search-placeholder'>{placeholder}</span>}
                ariaLabel={placeholder}
                className='organization-select'
                onChange={handleChange}
                isMulti
                inputId='organization-select'
            />
        )
    
    }
}

MultiSelect.propTypes = {
    data: PropTypes.array,
    placeholder: PropTypes.string,
    handleChange: PropTypes.func,
}

export default connect(null, null)(injectIntl(MultiSelect));
