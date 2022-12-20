import './index.scss'
import React, {useState} from 'react';
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl';
import {Button, Form, Input, InputGroup, Label, InputGroupAddon} from 'reactstrap';

const UserFilter = ({
    onSubmit,
    page,
    count,
}) => {
    const [filter, setFilter] = useState('')

    /**
     * Submits state.filter
     * @param {Object} event
     */
    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(filter)
    }

    /**
     * sets e to state
     * @param {Object} e
     */
    const onChange = (e) => {
        setFilter(e.target.value)
    }
    
    return (
        <div>
            <div className='user-filter'>
                <Form onSubmit={handleSubmit}>
                    <Label htmlFor='filter-users'><FormattedMessage id='admin-filter-user'/></Label>
                    <InputGroup>
                        <InputGroupAddon className='inputIcon' addonType="prepend">
                            <span aria-hidden className='glyphicon glyphicon-search'/>
                        </InputGroupAddon>
                        <Input
                            className='user-filter-input'
                            id='filter-users'
                            type='text'
                            name='filter'
                            onChange={(e) => onChange(e)}
                        />
                        <Button
                            className='user-filter-button'
                            color='primary'
                            variant='contained'
                            type='submit'
                        >
                            <FormattedMessage id='admin-filter-user-button' />
                        </Button>
                    </InputGroup>
                </Form>
            </div>
            <div role='status' className='search-results'>
                <FormattedMessage id='admin-filter-results' values={{count: count, page: page}}>{txt => <p role='status'>{txt}</p>}</FormattedMessage>
            </div>
        </div>
    );
}

UserFilter.propTypes = {
    onSubmit: PropTypes.func,
    value: PropTypes.string,
    count: PropTypes.number,
    page: PropTypes.number,
}

export default UserFilter;
