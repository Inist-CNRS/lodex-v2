import React, { PropTypes, Component } from 'react';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import { connect } from 'react-redux';
import moment from 'moment';
import translate from 'redux-polyglot/translate';
import compose from 'recompose/compose';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
import { polyglot as polyglotPropTypes } from '../../propTypes';

import { selectVersion } from '../resource';
import { fromResource } from '../selectors';

const getFormat = (latest, length) => (dateString, index) =>
    `${moment(dateString).format('L HH:mm:ss')}${index === length - 1 ? ` (${latest})` : ''}`;

const staticProps = {
    anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
    targetOrigin: { horizontal: 'left', vertical: 'top' },
};

export class SelectVersionComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            showMenu: false,
        };
    }

    getMenuItems = (versions, format) => versions.map((date, index) => (
        <MenuItem
            key={date}
            className={`version version_${index}`}
            value={index}
            primaryText={format(date, index)}
        />
    ))

    handleClick = (event) => {
        this.setState({
            anchorEl: event.target,
            showMenu: true,
        });
    }

    handleVersionClick = (event, value) => {
        this.setState({ showMenu: false });
        this.props.onSelectVersion(value);
    }

    handleRequestClose = () => {
        this.setState({ showMenu: false });
    }

    render() {
        const {
            versions,
            selectedVersion,
            p: polyglot,
        } = this.props;

        const { showMenu, anchorEl } = this.state;

        const format = getFormat(polyglot.t('latest'), versions.length);

        return (
            <div>
                <RaisedButton
                    label={format(versions[selectedVersion], selectedVersion)}
                    onClick={this.handleClick}
                />
                <Popover
                    open={showMenu}
                    onRequestClose={this.handleRequestClose}
                    anchorEl={anchorEl}
                    anchorOrigin={staticProps.anchorOrigin}
                    targetOrigin={staticProps.targetOrigin}
                >
                    <Menu onChange={this.handleVersionClick}>
                        {this.getMenuItems(versions, format)}
                    </Menu>
                </Popover>
            </div>
        );
    }
}

SelectVersionComponent.propTypes = {
    versions: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelectVersion: PropTypes.func.isRequired,
    selectedVersion: PropTypes.number.isRequired,
    p: polyglotPropTypes.isRequired,
};

const mapStateToProps = state => ({
    versions: fromResource.getVersions(state),
    selectedVersion: fromResource.getSelectedVersion(state),
});

const mapDispatchToProps = {
    onSelectVersion: selectVersion,
};

export default compose(
    withState('isOpen', 'setOpen', { open: false }),
    withHandlers({
        open: ({ setOpen }) => event => setOpen(() => ({ open: true, anchorEl: event.target })),
        close: ({ setOpen }) => () => setOpen(() => ({ open: false })),
    }),
    connect(mapStateToProps, mapDispatchToProps),
    translate,
)(SelectVersionComponent);
