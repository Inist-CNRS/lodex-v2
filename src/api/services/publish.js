import progress from './progress';
import indexSearchableFields from './indexSearchableFields';
import { CREATE_INDEX } from '../../common/progressStatus';
import {
    SCOPE_COLLECTION,
    SCOPE_DATASET,
    SCOPE_DOCUMENT,
    SCOPE_GRAPHIC,
} from '../../common/scope';

export default async ctx => {
    const count = await ctx.dataset.count({});

    const fields = await ctx.field.findAll();
    const collectionScopeFields = fields.filter(
        c => c.scope === SCOPE_COLLECTION || c.scope === SCOPE_DOCUMENT,
    );

    await ctx.publishDocuments(ctx, count, collectionScopeFields);

    const datasetScopeFields = fields.filter(
        c => c.scope === SCOPE_DATASET || c.scope === SCOPE_GRAPHIC,
    );
    await ctx.publishCharacteristics(ctx, datasetScopeFields, count);
    await ctx.publishFacets(ctx, fields, true);
    progress.start(CREATE_INDEX, null);
    await indexSearchableFields();

    progress.finish();
};
