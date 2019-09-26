import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
} from '@material-ui/core';

import { polyglot as polyglotPropTypes } from '../../propTypes';

const styles = {
    input: {
        width: '100%',
    },
};

class RoutineParamsAdmin extends Component {
    static propTypes = {
        params: PropTypes.shape({
            maxSize: PropTypes.number,
            maxValue: PropTypes.number,
            minValue: PropTypes.number,
            orderBy: PropTypes.string,
        }),
        onChange: PropTypes.func.isRequired,
        polyglot: polyglotPropTypes.isRequired,
        fieldsToShow: PropTypes.array.isRequired,
        showMaxSize: PropTypes.bool.isRequired,
        showMaxValue: PropTypes.bool.isRequired,
        showMinValue: PropTypes.bool.isRequired,
        showOrderBy: PropTypes.bool.isRequired,
    };

    setMaxSize = (_, maxSize) => {
        this.props.onChange({
            ...this.props.params,
            maxSize: parseInt(maxSize, 10),
        });
    };

    setMaxValue = (_, maxValue) => {
        this.props.onChange({
            ...this.props.params,
            maxValue: parseInt(maxValue, 10),
        });
    };

    setMinValue = (_, minValue) => {
        this.props.onChange({
            ...this.props.params,
            minValue: parseInt(minValue, 10),
        });
    };

    setOrderBy = (_, __, orderBy) => {
        this.props.onChange({
            ...this.props.params,
            orderBy,
        });
    };

    render() {
        const {
            params,
            polyglot,
            showMaxSize,
            showMaxValue,
            showMinValue,
            showOrderBy,
        } = this.props;

        const { maxSize, maxValue, minValue, orderBy } = params;

        var maxSizeField;

        if (showMaxSize) {
            maxSizeField = (
                <TextField
                    label={polyglot.t('max_fields')}
                    onChange={this.setMaxSize}
                    style={styles.input}
                    value={maxSize}
                />
            );
        } else {
            maxSizeField = '';
        }

        var minValueField;
        if (showMinValue) {
            minValueField = (
                <TextField
                    label={polyglot.t('min_value')}
                    onChange={this.setMinValue}
                    style={styles.input}
                    value={minValue}
                />
            );
        } else {
            minValueField = '';
        }

        var maxValueField;
        if (showMaxValue) {
            maxValueField = (
                <TextField
                    label={polyglot.t('max_value')}
                    onChange={this.setMaxValue}
                    style={styles.input}
                    value={maxValue}
                />
            );
        } else {
            maxValueField = '';
        }

        var orderByField;
        if (showOrderBy) {
            orderByField = (
                <FormControl>
                    <InputLabel>{polyglot.t('order_by')}</InputLabel>
                    <Select
                        onChange={this.setOrderBy}
                        style={styles.input}
                        value={orderBy}
                    >
                        <MenuItem value="_id/asc">
                            {polyglot.t('label_asc')}
                        </MenuItem>
                        <MenuItem value="_id/desc">
                            {polyglot.t('label_desc')}
                        </MenuItem>
                        <MenuItem value="value/asc">
                            {polyglot.t('value_asc')}
                        </MenuItem>
                        <MenuItem value="value/desc">
                            {polyglot.t('value_desc')}
                        </MenuItem>
                    </Select>
                </FormControl>
            );
        } else {
            orderByField = '';
        }

        return (
            <Fragment>
                {maxSizeField}
                {minValueField}
                {maxValueField}
                {orderByField}
            </Fragment>
        );
    }
}

export default RoutineParamsAdmin;
