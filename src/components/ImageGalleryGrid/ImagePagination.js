import React from 'react';
import PropTypes from 'prop-types';

const ImagePagination = (props) => {
    if (props.responseMetadata === undefined) {
        return null;
    }

    const pageAmount = Math.ceil(parseInt(props.responseMetadata.count) / props.pageSize);
    const currentPage = props.responseMetadata.currentPage;

    let classes;
    const pages = [];
    for (let i = 1; i < pageAmount + 1; i++) {
        classes = (props.responseMetadata.currentPage !== undefined && currentPage === i) ? 'page-item active' : 'page-item';
        const additionalProps = currentPage === i ? {'aria-current':'page'} : {};
        pages.push(
            <li className={classes} {...additionalProps} key={i}>
                <a className='page-link' aria-label={props.intl.formatMessage({id: 'image-page'}, {n: i})} href='#' onClick={(e) => props.clickedPage(i,e)}>{i}</a>
            </li>);
    }
    return <nav role='navigation' aria-label={props.intl.formatMessage({id: `image-pagination`})}>
        <ul className='pagination'>
            {pages}
        </ul>
    </nav>
};

ImagePagination.propTypes = {
    pageSize: PropTypes.number,
    responseMetadata: PropTypes.object,
    clickedPage: PropTypes.func,
    intl: PropTypes.object,
};

export default ImagePagination
