import axios from 'axios';
import { handleResponse } from './HelperService';

const getAllSLAs = (params, onSuccess, onError) => {
    const response = axios.get('v1/sla?filter=is_deleted:false', {params});
    return handleResponse(response, onSuccess, onError);
};

const createSLA = (payload, onSuccess, onError) => {
    const response = axios.post('v1/sla', payload);
    return handleResponse(response, onSuccess, onError);
};

const getSLA = (id, onSuccess, onError) => {
    const response = axios.get(`v1/sla/${id}`);
    return handleResponse(response, onSuccess, onError);
};


const getSLAMonitoring = (ticket_id, onSuccess, onError) => {
    const response = axios.get(`v1/sla-monitoring/${ticket_id}`);
    return handleResponse(response, onSuccess, onError);
};


const updateSLA = (id, payload, onSuccess, onError) => {
    const response = axios.put(`v1/sla/${id}`, payload);
    return handleResponse(response, onSuccess, onError);
};

const deleteSLA = (id, onSuccess, onError) => {
    const response = axios.delete(`v1/sla/${id}`);
    return handleResponse(response, onSuccess, onError);
};


export {
    getAllSLAs,
    getSLA,
    updateSLA,
    createSLA,
    deleteSLA,
    getSLAMonitoring
}