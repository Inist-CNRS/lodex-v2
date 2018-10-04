import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import Folder from 'material-ui/svg-icons/file/folder';
import translate from 'redux-polyglot/translate';
import { StyleSheet, css } from 'aphrodite/no-important';

import { ISTEX_API_URL } from '../../../../common/externals';
import fetch from '../../lib/fetch';
import ButtonWithStatus from '../../lib/components/ButtonWithStatus';
import { polyglot as polyglotPropTypes } from '../../propTypes';
import Alert from '../../lib/components/Alert';
import IstexIssue from './IstexIssue';

export const getIssueUrl = ({ issn, year, volume }) => {
    return `${ISTEX_API_URL}/?q=(${encodeURIComponent(
        `host.issn="${issn}" AND publicationDate:"${year}" AND host.volume:"${
            volume
        }"`,
    )})&facet=host.issue[*-*:1]&size=0&output=*`;
};

const styles = StyleSheet.create({
    li: {
        listStyleType: 'none',
    },
});

export class IstexVolumeComponent extends Component {
    state = {
        data: null,
        error: null,
        isLoading: false,
        isOpen: false,
    };

    open = () => {
        this.setState({
            isOpen: true,
        });

        if (!this.state.data) {
            const url = getIssueUrl(this.props);
            this.setState({ isLoading: true }, () => {
                fetch({ url }).then(({ response, error }) => {
                    if (error) {
                        console.error(error);
                        this.setState({
                            isLoading: false,
                            error: true,
                        });
                        return;
                    }

                    this.setState({
                        data: response,
                        isLoading: false,
                    });
                });
            });
        }
    };

    close = () => {
        this.setState({ isOpen: false });
    };

    render() {
        const { issn, year, volume, p: polyglot } = this.props;
        const { error, data, isOpen, isLoading } = this.state;

        if (error) {
            return <Alert>{polyglot.t('istex_error')}</Alert>;
        }

        return (
            <div className="istex-volume">
                {isOpen ? (
                    <div>
                        <ButtonWithStatus
                            label={`${polyglot.t('volume')} ${volume}`}
                            labelPosition="after"
                            icon={<Folder />}
                            onClick={this.close}
                            loading={isLoading}
                        />
                        <ul>
                            {get(
                                data,
                                ['aggregations', 'host.issue', 'buckets'],
                                [],
                            ).map(({ key }) => (
                                <li key={key} className={css(styles.li)}>
                                    <IstexIssue
                                        issn={issn}
                                        year={year}
                                        volume={volume}
                                        issue={key}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <ButtonWithStatus
                        label={`${polyglot.t('volume')} ${volume}`}
                        labelPosition="after"
                        icon={<Folder />}
                        onClick={this.open}
                        loading={isLoading}
                    />
                )}
            </div>
        );
    }
}

IstexVolumeComponent.propTypes = {
    issn: PropTypes.string.isRequired,
    year: PropTypes.string.isRequired,
    volume: PropTypes.number.isRequired,
    p: polyglotPropTypes.isRequired,
};

export default translate(IstexVolumeComponent);
