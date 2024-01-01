import axios from 'axios';
import { handleResponse } from './HelperService';

const getAllHours = (params, onSuccess, onError) => {
    const response = axios.get('v1/business-hours', {params});
    return handleResponse(response, onSuccess, onError);
};

const getHour = (id, onSuccess, onError) => {
    const response = axios.get(`v1/business-hours/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const createHour = (payload, onSuccess, onError) => {
    const response = axios.post('v1/business-hours', payload);
    return handleResponse(response, onSuccess, onError);
};

const updateHour = (id, payload, onSuccess, onError) => {
    const response = axios.put(`v1/business-hours/${id}`, payload);
    return handleResponse(response, onSuccess, onError);
};

const deleteHour = (id, onSuccess, onError) => {
    const response = axios.delete(`v1/business-hours/${id}`);
    return handleResponse(response, onSuccess, onError);
};

export {
    getAllHours,
    getHour,
    createHour,
    updateHour,
    deleteHour
}