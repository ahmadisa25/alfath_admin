import axios from 'axios';
import { handleResponse } from './HelperService';

const getAllRequests = (params, onSuccess, onError) => {
    const response = axios.get('v1/service-request', {params});
    return handleResponse(response, onSuccess, onError);
};

const getRequest = (id, onSuccess, onError) => {
    const response = axios.get(`v1/service-request/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const createRequest = (payload, onSuccess, onError) => {
    const response = axios.post('v1/service-request', payload);
    return handleResponse(response, onSuccess, onError);
};

const forwardRequest = (id, payload, onSuccess, onError) => {
    const response = axios.post(`v1/request-forwarding/${id}`, payload);
    return handleResponse(response, onSuccess, onError);
};

const updateRequest = (id, payload, onSuccess, onError) => {
    const response = axios.put(`v1/service-request/${id}`, payload);
    return handleResponse(response, onSuccess, onError);
};

const deleteRequest = (id, onSuccess, onError) => {
    const response = axios.delete(`v1/service-request/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const resolveRequest = (id, payload, onSuccess, onError) => {
    const response = axios.post(`v1/request-resolving/${id}`, payload);
    return handleResponse(response, onSuccess, onError);
};

export {
    getAllRequests, createRequest, updateRequest, deleteRequest, getRequest, forwardRequest, resolveRequest
}