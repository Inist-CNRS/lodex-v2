import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Drawer, IconButton, Button } from '@material-ui/core';
import { Clear as CloseIcon } from '@material-ui/icons';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
    },
    close: {
        alignSelf: 'flex-end',
    },
};

class LodexDrawer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
        };
    }

    toggleOpen = () => this.setState({ open: !this.state.open });

    close = () => this.setState({ open: false });

    render() {
        const { children, label } = this.props;
        const { open } = this.state;
        return (
            <div>
                <Button label={label} onClick={this.toggleOpen} />
                <Drawer open={open}>
                    {
                        <div style={styles.container}>
                            <IconButton
                                style={styles.close}
                                onClick={this.close}
                            >
                                <CloseIcon />
                            </IconButton>
                            {children}
                        </div>
                    }
                </Drawer>
            </div>
        );
    }
}

LodexDrawer.propTypes = {
    children: PropTypes.element.isRequired,
    label: PropTypes.string.isRequired,
};

export default LodexDrawer;
