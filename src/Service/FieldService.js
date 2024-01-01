import axios from 'axios';
import { handleResponse } from './HelperService';

const getAllFields = (field_identifier = null, params, onSuccess, onError) => {
    let url = 'v1/fields';
    if(field_identifier){
        url = `v1/fields?filter=field_identifier:${field_identifier}`;
    }
    const response = axios.get(url, {params});
    return handleResponse(response, onSuccess, onError);
};

const createField = (payload, onSuccess, onError) => {
    const response = axios.post('v1/field', payload);
    return handleResponse(response, onSuccess, onError);
};

const getField = (id, onSuccess, onError) => {
    const response = axios.get(`v1/field/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const updateField = (id, payload, onSuccess, onError) => {
    const response = axios.put(`v1/field/${id}`, payload);
    return handleResponse(response, onSuccess, onError);
};

const deleteField = (id, onSuccess, onError) => {
    const response = axios.delete(`v1/field/${id}`);
    return handleResponse(response, onSuccess, onError);
};


export {
    getAllFields,
    getField,
    updateField,
    createField,
    deleteField,

}