import React, { Component } from 'react';
import PropTypes from 'prop-types';
import translate from 'redux-polyglot/translate';
import compose from 'recompose/compose';
import SparqlRequest from './SparqlRequest';
import { isURL } from '../../../../../common/uris.js';
import { field as fieldPropTypes } from '../../../propTypes';

import URL from 'url';
import IconButton from 'material-ui/IconButton';
import ActionSearch from 'material-ui/svg-icons/action/search';
import TextField from 'material-ui/TextField';
import PieChartView from '../../distributionChart/global-pie-chart';

const styles = {
    icon: {
        verticalAlign: 'bottom',
        width: '5%',
    },
    container: {
        display: 'block',
        width: '100%',
        color: 'lightGrey',
    },
    input: {
        fontSize: '0.7em',
        width: '95%',
        borderImage: 'none',
    },
};

export class sparqlText extends Component {
    render() {
        const { className, formatData, sparql, resource, field } = this.props;

        if (formatData != undefined) {
            const requestText =
                sparql.hostname + '?query=' + resource[field.name]; //@TODO à voir pour le format
            let data = [],
                obj;
            for (let i of formatData.results.bindings) {
                obj = {
                    _id: i.label.value,
                    value: i.value.value,
                };
                data.push(obj);
            }

            return (
                <div className={className}>
                    <div style={styles.container}>
                        <IconButton style={styles.icon}>
                            <ActionSearch color="lightGrey" />
                        </IconButton>
                        <TextField
                            style={styles.input}
                            name="sparqlRequest"
                            value={requestText}
                        />
                    </div>
                    <PieChartView />
                </div>
            );
        } else {
            return <span> </span>;
        }
    }
}

sparqlText.propTypes = {
    className: PropTypes.string,
    formatData: PropTypes.object,
    sparql: PropTypes.object,
    field: fieldPropTypes.isRequired,
    resource: PropTypes.object.isRequired,
    colorSet: PropTypes.arrayOf(PropTypes.string),
};

sparqlText.defaultProps = {
    className: null,
};

export default compose(
    translate,
    SparqlRequest(({ field, resource, sparql }) => {
        const value = resource[field.name];
        if (!value) {
            return null;
        }

        // const deleteBeforeSelect = value
        //     .substring(value.indexOf('SELECT'))
        //     .replace('SELECT', '')
        //     .trim();
        // let select = '';
        // for (let i of deleteBeforeSelect.split(' ')) {
        //     if (i.match(/^[A-Z]+[^a-z]$/)) {
        //         //search words written in capital letters
        //         break;
        //     } else {
        //         select += ' ' + i; // get all string of SELECT
        //     }
        // }
        // console.log(select); //eslint-disable-line

        let constructURL = sparql.hostname.replace(/[\s\n\r\u200B]+/g, '');
        !constructURL.startsWith('http://') &&
        !constructURL.startsWith('https://')
            ? (constructURL = 'https://' + constructURL)
            : null;

        !constructURL.endsWith('?query=') ? (constructURL += '?query=') : null;

        constructURL = constructURL + value.trim();
        constructURL = constructURL.replace(/LIMIT\s\d*/, ''); //remove LIMIT with her var
        switch (sparql.orderBy) {
            case '_id/asc':
                constructURL += ' ORDER BY ?label';
                break;
            case '_id/desc':
                constructURL += ' ORDER BY DESC(?label)';
                break;
            case 'value/asc':
                constructURL += ' ORDER BY ?value';
                break;
            case 'value/desc':
                constructURL += ' ORDER BY DESC(?value)';
                break;
            default:
                constructURL += ' ORDER BY DESC(?value)';
        }
        const requestPagination = constructURL + ' LIMIT ' + sparql.maxValue;
        if (isURL(requestPagination)) {
            const source = URL.parse(requestPagination);
            const target = {
                protocol: source.protocol,
                hostname: source.hostname,
                port: source.port, //for internal endpoint
                slashes: source.slashes,
                pathname: source.pathname,
                search: source.search,
            };
            return URL.format(target);
        }
        return null;
    }),
)(sparqlText);
