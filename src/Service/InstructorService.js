import axios from 'axios';
import { handleResponse } from './HelperService';

const getAllInstructors = (params, onSuccess, onError) => {
    const response = axios.get('/instructor-all/', {params});
    return handleResponse(response, onSuccess, onError);
};

const createInstructor = (params, onSuccess, onError) => {
    const response = axios.post('/instructor/', params);
    return handleResponse(response, onSuccess, onError);
};

const deleteInstructor = (id, onSuccess, onError) => {
    const response = axios.delete(`/instructor/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const getInstructor = (id, onSuccess, onError) => {
    const response = axios.get(`/instructor/${id}`);
    return handleResponse(response, onSuccess, onError);
};

export {
    getAllInstructors,
    createInstructor,
    deleteInstructor,
    getInstructor
}