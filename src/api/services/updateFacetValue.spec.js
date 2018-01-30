import expect, { createSpy } from 'expect';

import updateFacetValue from './updateFacetValue';

describe('updatefacetValue', () => {
    it('should call findOneAndUpdate to decrement count of field facet with oldValue and update to increment count of new value', async () => {
        const publishedFacet = {
            findOneAndUpdate: createSpy().andReturn({ value: { count: 10 } }),
            update: createSpy(),
            remove: createSpy(),
        };
        await updateFacetValue(publishedFacet)({
            field: 'fieldName',
            oldValue: 'old',
            newValue: 'new',
        });
        expect(publishedFacet.findOneAndUpdate).toHaveBeenCalledWith(
            { field: 'fieldName', value: 'old' },
            { $inc: { count: -1 } },
            { returnOriginal: false },
        );

        expect(publishedFacet.remove).toNotHaveBeenCalled();

        expect(publishedFacet.update).toHaveBeenCalledWith(
            {
                field: 'fieldName',
                value: 'new',
            },
            { $inc: { count: 1 } },
            { upsert: true },
        );
    });

    it('should call remove if findOneAndUpdate returned an updated facet with count at 0 or less', async () => {
        const publishedFacet = {
            findOneAndUpdate: createSpy().andReturn({
                value: {
                    field: 'fieldName',
                    value: 'old',
                    count: 0,
                },
            }),
            update: createSpy(),
            remove: createSpy(),
        };
        await updateFacetValue(publishedFacet)({
            field: 'fieldName',
            oldValue: 'old',
            newValue: 'new',
        });
        expect(publishedFacet.findOneAndUpdate).toHaveBeenCalledWith(
            {
                field: 'fieldName',
                value: 'old',
            },
            { $inc: { count: -1 } },
            { returnOriginal: false },
        );

        expect(publishedFacet.remove).toHaveBeenCalledWith({
            field: 'fieldName',
            value: 'old',
            count: 0,
        });
        expect(publishedFacet.update).toHaveBeenCalledWith(
            {
                field: 'fieldName',
                value: 'new',
            },
            {
                $inc: { count: 1 },
            },
            { upsert: true },
        );
    });

    it('should work with multi values', async () => {
        const publishedFacet = {
            findOneAndUpdate: createSpy().andReturn({ value: { count: 10 } }),
            update: createSpy(),
            remove: createSpy(),
        };
        await updateFacetValue(publishedFacet)({
            field: 'fieldName',
            oldValue: ['stay', 'old1', 'old2'],
            newValue: ['stay', 'new1', 'new2'],
        });
        expect(publishedFacet.findOneAndUpdate.calls.length).toBe(2);
        expect(publishedFacet.findOneAndUpdate).toHaveBeenCalledWith(
            { field: 'fieldName', value: 'old1' },
            { $inc: { count: -1 } },
            { returnOriginal: false },
        );
        expect(publishedFacet.findOneAndUpdate).toHaveBeenCalledWith(
            { field: 'fieldName', value: 'old2' },
            { $inc: { count: -1 } },
            { returnOriginal: false },
        );

        expect(publishedFacet.remove).toNotHaveBeenCalled();

        expect(publishedFacet.update.calls.length).toBe(2);

        expect(publishedFacet.update).toHaveBeenCalledWith(
            {
                field: 'fieldName',
                value: 'new1',
            },
            { $inc: { count: 1 } },
            { upsert: true },
        );

        expect(publishedFacet.update).toHaveBeenCalledWith(
            {
                field: 'fieldName',
                value: 'new2',
            },
            { $inc: { count: 1 } },
            { upsert: true },
        );
    });
});
