import axios from 'axios';
import { handleResponse } from './HelperService';

const getAllAnnouncements = (params, onSuccess, onError) => {
    const response = axios.get('/announcement-all/', {params});
    return handleResponse(response, onSuccess, onError);
};

const createAnnouncement = (params, onSuccess, onError) => {
    const response = axios.post('/announcement/', params, {
        "Content-Type": "multipart/form-data"
    });
    return handleResponse(response, onSuccess, onError);
};

const deleteAnnouncement = (id, onSuccess, onError) => {
    const response = axios.delete(`/announcement/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const getAnnouncement = (id, onSuccess, onError) => {
    const response = axios.get(`/announcement/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const updateAnnouncement = (id, params, onSuccess, onError) => {
    const response = axios.put(`/announcement/${id}`, params);
    return handleResponse(response, onSuccess, onError);
};

export {
    getAllAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
    getAnnouncement,
    updateAnnouncement
}