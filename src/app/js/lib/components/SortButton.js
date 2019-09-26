import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@material-ui/core';
import { Sort as ContentSort } from '@material-ui/icons';
import withHandlers from 'recompose/withHandlers';
import { isLongText, getShortText } from '../../lib/longTexts';

const styles = {
    sortButton: {
        minWidth: 40,
    },
    ASC: { transform: 'rotate(180deg)' },
    DESC: {},
};

const SortButton = ({ name, label, sortBy, sortDir, sort }) => (
    <Button className={`sort_${name}`} onClick={sort} style={styles.sortButton}>
        {sortBy === name && <ContentSort style={styles[sortDir]} />}
        {isLongText(label, 15) ? getShortText(label, 15) : label}
    </Button>
);

SortButton.defaultProps = {
    sortBy: null,
    sortDir: null,
};

SortButton.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    sortDir: PropTypes.oneOf(['ASC', 'DESC']),
    sortBy: PropTypes.string,
    sort: PropTypes.func.isRequired,
};

export default withHandlers({
    sort: ({ sort, name }) => () => sort(name),
})(SortButton);
