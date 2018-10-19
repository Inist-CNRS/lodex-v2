import React from 'react';
import PropTypes from 'prop-types';
import translate from 'redux-polyglot/translate';
import compose from 'recompose/compose';

import {
    field as fieldPropTypes,
    polyglot as polyglotPropTypes,
} from '../../propTypes';
import injectData from '../injectData';
import InvalidFormat from '../InvalidFormat';
import { getYearUrl, parseYearData, getDecadeData } from './getIstexData';
import { searchedFieldValues } from './IstexSummaryAdmin';
import composeRenderProps from '../../lib/composeRenderProps';
import IstexList from './IstexList';
import IssueFold from './IssueFold';
import VolumeFold from './VolumeFold';
import YearFold from './YearFold';
import IstexItem from '../istex/IstexItem';
import FetchIstex from './FetchIstex';
import DecadeFold from './DecadeFold';

export const FoldList = props => <IstexList {...props} />;
export const IstexDocument = ({ item }) => <IstexItem {...item} />;

export const fetchIstex = props => <FetchIstex {...props} />;

IstexDocument.propTypes = {
    item: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
};

export const IstexSummaryView = ({
    formatData,
    field,
    resource,
    searchedField,
    p: polyglot,
}) => {
    if (!resource[field.name] || !searchedField) {
        return (
            <InvalidFormat format={field.format} value={resource[field.name]} />
        );
    }

    const data = parseYearData(formatData);

    if (data.hits.length > 50) {
        return composeRenderProps([
            fetchIstex,
            FoldList,
            DecadeFold,
            FoldList,
            YearFold,
            FoldList,
            VolumeFold,
            FoldList,
            IssueFold,
            FoldList,
            IstexDocument,
        ])({
            data: data,
            issn: resource[field.name],
            searchedField: searchedField,
            getData: getDecadeData({
                issn: resource[field.name],
                searchedField: searchedField,
            }),
            polyglot: polyglot,
        });
    }

    return composeRenderProps([
        FoldList,
        YearFold,
        FoldList,
        VolumeFold,
        FoldList,
        IssueFold,
        FoldList,
        IstexDocument,
    ])({
        data: data,
        issn: resource[field.name],
        searchedField: searchedField,
        polyglot: polyglot,
    });
};

IstexSummaryView.propTypes = {
    fieldStatus: PropTypes.string,
    resource: PropTypes.object.isRequired, // eslint-disable-line
    field: fieldPropTypes.isRequired,
    formatData: PropTypes.shape({ hits: PropTypes.Array }),
    error: PropTypes.string,
    searchedField: PropTypes.oneOf(searchedFieldValues),
    p: polyglotPropTypes.isRequired,
};

IstexSummaryView.defaultProps = {
    className: null,
    fieldStatus: null,
    shrink: false,
    data: null,
    error: null,
};

export default compose(injectData(getYearUrl), translate)(IstexSummaryView);
