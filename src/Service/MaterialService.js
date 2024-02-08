import axios from 'axios';
import { handleResponse } from './HelperService';

const createMaterial = (params, onSuccess, onError) => {
    const response = axios.post('/chapter-material/', params,{
        "Content-Type": "multipart/form-data"
    });
    return handleResponse(response, onSuccess, onError);
};

const deleteMaterial = (id, onSuccess, onError) => {
    const response = axios.delete(`/chapter-material/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const getMaterial = (id, onSuccess, onError) => {
    const response = axios.get(`/chapter-material/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const updateMaterial = (id, params, onSuccess, onError) => {
    const response = axios.put(`/chapter-material/${id}`, params,{
        "Content-Type": "multipart/form-data"
    });
    return handleResponse(response, onSuccess, onError);
};

export {
    createMaterial,
    deleteMaterial,
    getMaterial,
    updateMaterial
}