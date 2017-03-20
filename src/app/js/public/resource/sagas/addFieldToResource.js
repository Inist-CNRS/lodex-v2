import { call, put, select, takeLatest } from 'redux-saga/effects';

import {
    addFieldToResourceSuccess,
    addFieldToResourceError,
    getNewResourceFieldFormData,
    ADD_FIELD_TO_RESOURCE,
} from '../';
import { getAddFieldToResourceRequest } from '../../../fetch';
import fetchSaga from '../../../lib/fetchSaga';

export const parsePathName = pathname => pathname.match(/^(\/resource)(\/ark:\/)?(.*?$)/) || [];

export function* handleAddFieldToResource({ payload: uri }) {
    const formData = yield select(getNewResourceFieldFormData);
    const request = yield select(getAddFieldToResourceRequest, {
        ...formData,
        uri,
    });
    const { error, response } = yield call(fetchSaga, request);

    if (error) {
        yield put(addFieldToResourceError(error));
        return;
    }

    yield put(addFieldToResourceSuccess(response));
}

export default function* watchAddFieldToResource() {
    yield takeLatest(ADD_FIELD_TO_RESOURCE, handleAddFieldToResource);
}
