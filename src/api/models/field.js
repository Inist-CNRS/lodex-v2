import omit from 'lodash.omit';
import { ObjectID } from 'mongodb';

import { validateField as validateFieldIsomorphic } from '../../common/validateFields';

export const INVALID_FIELD_MESSAGE = 'Invalid data for field which need a name, a label, a cover, a valid scheme, a type and a transformers array'; // eslint-disable-line

export const buildInvalidPropertiesMessage = name =>
    `Invalid data for field ${name} which need a name, a label, a cover, a valid scheme if specified and a transformers array`; // eslint-disable-line

export const buildInvalidTransformersMessage = name =>
    `Invalid transformers for field ${name}: transformers must have a valid operation and an args array`; // eslint-disable-line

export const validateField = (data, isContribution = false) => {
    const validation = validateFieldIsomorphic(data, isContribution);

    if (!validation.propertiesAreValid) {
        throw new Error(buildInvalidPropertiesMessage(data.name));
    }

    if (!validation.transformersAreValid) {
        throw new Error(buildInvalidTransformersMessage(data.name));
    }

    return data;
};

export default async (db) => {
    const collection = db.collection('field');

    await collection.createIndex({ name: 1 }, { unique: true });

    collection.findAll = () => collection.find({}).toArray();

    collection.findOneById = id => collection.findOne({ _id: new ObjectID(id) });

    collection.updateOneById = (id, field) => collection.findOneAndUpdate({
        _id: new ObjectID(id),
    }, omit(field, ['_id']), {
        returnOriginal: false,
    }).then(result => result.value);

    collection.removeById = id => collection.remove({ _id: new ObjectID(id) });

    collection.addContributionField = async (field, contributor, isLogged) => {
        await validateField(field, true);

        if (isLogged) {
            return collection.update({
                name: field.name,
                contribution: true,
            }, {
                $set: {
                    ...field,
                    cover: 'document',
                    contribution: true,
                },
            }, {
                upsert: true,
            });
        }

        return collection.update({
            name: field.name,
            contribution: true,
        }, {
            $set: {
                ...field,
                cover: 'document',
                contribution: true,
            },
            $addToSet: {
                contributors: contributor,
            },
        }, {
            upsert: true,
        });
    };

    return collection;
};
