import './index.scss'
import React from 'react';
import PropTypes from 'prop-types'
import {injectIntl} from 'react-intl';
import client from '../../../../api/client';
import {Button, Form, InputGroup, Label, Input, InputGroupAddon} from 'reactstrap';

class UserSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userEmail: '',
        }
    }

    /**
     * if state.userEmail includes '@' =>
     * get users data & call props.addedUser
     * @param {Object} e
     */
    handleSubmit = (e) => {
        const {userEmail} = this.state;
        e.preventDefault()
        if (userEmail.includes('@')) {
            this.getUserOptions(userEmail).then(res =>
                this.props.addedUser(res))
        }
    }

    /**
     * sets e to state
     * @param {String} e
     */
    onChange = (e) => {
        this.setState({userEmail: e})
    }

    /**
     * Takes users input w/ & parameters and
     * returns formatted object with data
     * for usage in functions
     * @param {String} input
     * @returns {Promise<*>}
     */
    getUserOptions = async (input) => {
        const queryParams = {
            email: input,
        }
        try {
            const response = await client.get(`user`, queryParams)
            const options = response.data.data
            return options.map(item => {
                return {
                    display_name: item.display_name,
                    email: item.email,
                    username: item.username,
                    admin_organizations: item.admin_organizations,
                    organization_memberships: item.organization_memberships,
                    public_memberships: item.public_memberships,
                    pk: item.pk,
                }
            })
        } catch (e) {
            throw Error(e)
        }
    }
    

    render() {
        const {intl} = this.props;
        return (
            <div className='user-search'>
                <Form onSubmit={(e) => this.handleSubmit(e)}>
                    <Label htmlFor='search-user'>{intl.formatMessage({id: 'admin-search-user'})}</Label>
                    <InputGroup>
                        <InputGroupAddon className='inputIcon' addonType="prepend">
                            <span aria-hidden className="glyphicon glyphicon-search"/>
                        </InputGroupAddon>
                        <Input
                            id='search-user'
                            className='user-search-input'
                            type='text'
                            onChange={(e) => this.onChange(e.target.value)}
                        />
                        <Button
                            className='user-search-button'
                            variant='contained'
                            color='primary'
                            type='submit'
                        >
                            {intl.formatMessage({id: 'admin-search-user-button'})}
                        </Button>
                    </InputGroup>
                </Form>
            </div>
        );
    }
}

UserSelect.propTypes = {
    organization: PropTypes.string,
    intl: PropTypes.object,
    addedUser: PropTypes.func,
}

export default (injectIntl(UserSelect))
