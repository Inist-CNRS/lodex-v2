import AbstractTableAdmin from '../core/AbstractTableAdmin';
import translate from 'redux-polyglot/translate';
import RoutineParamsAdmin from '../../shared/RoutineParamsAdmin';
import TableColumnsParameters from '../core/TableColumnsParameters';
import React from 'react';

export const defaultArgs = {
    params: {
        maxSize: 6,
        orderBy: 'value/asc',
    },
    columnsCount: 2,
    columnsParameters: [
        {
            id: 0,
            format: {
                name: 'None',
                option: undefined,
            },
            field: 'a_routine_field',
            title: 'Column 1',
        },
        {
            id: 1,
            field: 'a_routine_field',
            title: 'Column 2',
            format: {
                name: 'None',
                option: undefined,
            },
        },
    ],
};

class UnPaginatedTableAdmin extends AbstractTableAdmin {
    static defaultProps = {
        args: defaultArgs,
    };

    render() {
        const {
            p: polyglot,
            args: { params, columnsCount, columnsParameters },
        } = this.props;
        return (
            <div style={this.styles.container}>
                <RoutineParamsAdmin
                    params={params || defaultArgs.params}
                    onChange={this.setParams}
                    polyglot={polyglot}
                    showMaxSize={true}
                    showMaxValue={true}
                    showMinValue={true}
                    showOrderBy={true}
                />
                <TableColumnsParameters
                    onChange={this.setColumnParameter}
                    polyglot={polyglot}
                    parameterCount={columnsCount}
                    parameters={columnsParameters}
                />
            </div>
        );
    }
}

export default translate(UnPaginatedTableAdmin);
