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
import { getYearUrl, parseYearData } from './getIstexData';
import { searchedFieldValues, yearSortDirValues } from './IstexSummaryAdmin';
import composeRenderProps from '../../lib/composeRenderProps';
import IstexList from './IstexList';
import IssueFold from './IssueFold';
import VolumeFold from './VolumeFold';
import YearFold from './YearFold';
import IstexItem from '../istex/IstexItem';
import DecadeFold from './DecadeFold';
import getDecadeFromData from './getDecadeFromData';

export const IstexDocument = ({ item }) => <IstexItem {...item} />;

IstexDocument.propTypes = {
    item: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
};

export const getComposedComponent = displayDecade =>
    displayDecade
        ? composeRenderProps([
              IstexList,
              DecadeFold,
              IstexList,
              YearFold,
              IstexList,
              VolumeFold,
              IstexList,
              IssueFold,
              IstexList,
              IstexDocument,
          ])
        : composeRenderProps([
              IstexList,
              YearFold,
              IstexList,
              VolumeFold,
              IstexList,
              IssueFold,
              IstexList,
              IstexDocument,
          ]);

export const IstexSummaryView = ({
    formatData,
    field,
    resource,
    searchedField,
    sortDir,
    yearThreshold,
    p: polyglot,
}) => {
    if (!resource[field.name] || !searchedField) {
        return (
            <InvalidFormat format={field.format} value={resource[field.name]} />
        );
    }

    const data = parseYearData(formatData, sortDir, yearThreshold);
    const displayDecade = yearThreshold && data.hits.length > yearThreshold;
    const ComposedComponent = getComposedComponent(displayDecade);

    return (
        <ComposedComponent
            data={displayDecade ? getDecadeFromData(data) : data}
            issn={resource[field.name]}
            searchedField={searchedField}
            polyglot={polyglot}
        />
    );
};

IstexSummaryView.propTypes = {
    fieldStatus: PropTypes.string,
    resource: PropTypes.object.isRequired,
    field: fieldPropTypes.isRequired,
    formatData: PropTypes.shape({ hits: PropTypes.Array }),
    error: PropTypes.string,
    searchedField: PropTypes.oneOf(searchedFieldValues),
    sortDir: PropTypes.oneOf(yearSortDirValues).isRequired,
    yearThreshold: PropTypes.number.isRequired,
    p: polyglotPropTypes.isRequired,
};

IstexSummaryView.defaultProps = {
    className: null,
    fieldStatus: null,
    formatData: null,
    error: null,
    yearThreshold: 50,
};

export default compose(
    injectData(getYearUrl),
    translate,
)(IstexSummaryView);
