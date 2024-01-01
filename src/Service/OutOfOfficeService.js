import axios from 'axios';
import { handleResponse } from './HelperService';

const getAllOOO = (params, onSuccess, onError) => {
    const response = axios.get('v1/ooo', {params});
    return handleResponse(response, onSuccess, onError);
};

const getOOO = (id, onSuccess, onError) => {
    const response = axios.get(`v1/ooo/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const createOOO = (payload, onSuccess, onError) => {
    const response = axios.post('v1/ooo', payload);
    return handleResponse(response, onSuccess, onError);
};

const updateOOO = (id, payload, onSuccess, onError) => {
    const response = axios.put(`v1/ooo/${id}`, payload);
    return handleResponse(response, onSuccess, onError);
};

const deleteOOO= (id, onSuccess, onError) => {
    const response = axios.delete(`v1/ooo/${id}`);
    return handleResponse(response, onSuccess, onError);
};

export {
    getAllOOO,
    updateOOO,
    deleteOOO,
    createOOO,
    getOOO
}