import axios from 'axios';
import { handleResponse } from './HelperService';

const getAll = (params, onSuccess, onError) => {
    const response = axios.get('v1/ticket', {params});
    return handleResponse(response, onSuccess, onError);
};

const getIncident = (id, onSuccess, onError) => {
    const response = axios.get(`v1/ticket/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const resolveIncident = (id, payload, onSuccess, onError) => {
    const response = axios.post(`v1/ticket-resolving/${id}`, payload);
    return handleResponse(response, onSuccess, onError);
};

const forwardIncident = (id, payload, onSuccess, onError) => {
    const response = axios.post(`v1/ticket-forwarding/${id}`, payload);
    return handleResponse(response, onSuccess, onError);
};

const createIncident = (payload, onSuccess, onError) => {
    const response = axios.post('v1/ticket', payload);
    return handleResponse(response, onSuccess, onError);
};

const updateIncident = (id, payload, onSuccess, onError) => {
    const response = axios.put(`v1/ticket/${id}`, payload);
    return handleResponse(response, onSuccess, onError);
};

const deleteIncident = (id, onSuccess, onError) => {
    const response = axios.delete(`v1/ticket/${id}`);
    return handleResponse(response, onSuccess, onError);
};

export {
    getAll, createIncident, updateIncident, deleteIncident, getIncident, forwardIncident, resolveIncident
}