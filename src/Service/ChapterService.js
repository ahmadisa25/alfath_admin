import axios from 'axios';
import { handleResponse } from './HelperService';

const createChapter = (params, onSuccess, onError) => {
    const response = axios.post('/course-chapter/', params);
    return handleResponse(response, onSuccess, onError);
};

const deleteChapter = (id, onSuccess, onError) => {
    const response = axios.delete(`/course-chapter/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const getChapter = (id, onSuccess, onError) => {
    const response = axios.get(`/course-chapter/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const updateChapter = (id, params, onSuccess, onError) => {
    const response = axios.put(`/course-chapter/${id}`, params);
    return handleResponse(response, onSuccess, onError);
};

export {
    createChapter,
    deleteChapter,
    getChapter,
    updateChapter
}