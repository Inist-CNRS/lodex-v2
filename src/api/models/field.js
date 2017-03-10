import omit from 'lodash.omit';
import pick from 'lodash.pick';
import { ObjectID } from 'mongodb';

import { validateField as validateFieldIsomorphic } from '../../common/validateFields';
import { COVER_DOCUMENT } from '../../common/cover';
import generateUid from '../services/generateUid';

export const buildInvalidPropertiesMessage = name =>
    `Invalid data for field ${name} which need a name, a label, a cover, a valid scheme if specified and a transformers array`; // eslint-disable-line

export const buildInvalidTransformersMessage = name =>
    `Invalid transformers for field ${name}: transformers must have a valid operation and an args array`; // eslint-disable-line

export const validateField = (data, isContribution) => {
    const validation = validateFieldIsomorphic(data, isContribution);

    if (!validation.propertiesAreValid) {
        throw new Error(buildInvalidPropertiesMessage(data.label));
    }

    if (!validation.transformersAreValid) {
        throw new Error(buildInvalidTransformersMessage(data.label));
    }

    return data;
};

export default async (db) => {
    const collection = db.collection('field');

    await collection.createIndex({ name: 1 }, { unique: true });

    collection.findAll = () => collection.find({}).toArray();

    collection.findSearchableName = async () => {
        const searchableFields = await collection.find({ searchable: true }).toArray();

        return searchableFields.map(({ name }) => name);
    };

    collection.findOneById = id => collection.findOne({ _id: new ObjectID(id) });

    collection.create = async (fieldData, nameArg) => {
        const name = nameArg || await generateUid();

        return collection.insertOne({
            ...fieldData,
            name,
        });
    };

    collection.updateOneById = (id, field) => collection.findOneAndUpdate({
        _id: new ObjectID(id),
    }, omit(field, ['_id']), {
        returnOriginal: false,
    }).then(result => result.value);

    collection.removeById = id => collection.remove({ _id: new ObjectID(id) });

    collection.addContributionField = async (field, contributor, isLogged, nameArg) => {
        const name = field.name || nameArg || await generateUid();
        await validateField({
            ...field,
            cover: COVER_DOCUMENT,
            name,
        }, true);

        if (!field.name) {
            const fieldData = {
                ...pick(field, ['name', 'label', 'scheme']),
                name,
                cover: COVER_DOCUMENT,
                contribution: true,
            };
            if (!isLogged) {
                fieldData.contributors = [contributor];
            }

            await collection.insertOne({
                ...fieldData,
                name,
            });

            return name;
        }

        if (isLogged) {
            await collection.update({
                name,
                contribution: true,
            }, {
                $set: {
                    ...pick(field, ['label', 'scheme']),
                    cover: COVER_DOCUMENT,
                    contribution: true,
                },
            });

            return name;
        }

        await collection.update({
            name,
            contribution: true,
        }, {
            $set: {
                ...pick(field, ['label', 'scheme']),
                cover: COVER_DOCUMENT,
                contribution: true,
            },
            $addToSet: {
                contributors: contributor,
            },
        });

        return name;
    };

    return collection;
};
