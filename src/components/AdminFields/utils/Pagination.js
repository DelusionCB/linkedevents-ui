import React from 'react';
import PropTypes from 'prop-types';

const Pagination = (props) => {

    if (props.data === undefined) {
        return null;
    }

    const pageAmount = Math.ceil(parseInt(props.data.count) / props.pageSize);
    const currentPage = props.data.currentPage;

    let classes;
    const pages = [];
    for (let i = 1; i < pageAmount + 1; i++) {
        classes = (props.data.currentPage !== undefined && currentPage === i) ? 'page-item active' : 'page-item';
        const additionalProps = currentPage === i ? {'aria-current':'page'} : {};
        pages.push(
            <li className={classes} {...additionalProps} key={i}>
                <a className='page-link' aria-label={props.intl.formatMessage({id: 'admin-user-page'}, {n: i})} href='#' onClick={(e) => props.clickedPage(i,e)}>{i}</a>
            </li>);
    }
    return <nav role='navigation' aria-label={props.intl.formatMessage({id: `admin-user-pagination`})}>
        <ul className='pagination'>
            {pages}
        </ul>
    </nav>
};

Pagination.propTypes = {
    pageSize: PropTypes.number,
    data: PropTypes.object,
    clickedPage: PropTypes.func,
    intl: PropTypes.object,
};

export default Pagination
