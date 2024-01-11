import axios from 'axios';
import { handleResponse } from './HelperService';

const getAllStudents = (params, onSuccess, onError) => {
    const response = axios.get('/student-all/', {params});
    return handleResponse(response, onSuccess, onError);
};

const createStudent = (params, onSuccess, onError) => {
    const response = axios.post('/student/', params);
    return handleResponse(response, onSuccess, onError);
};

const deleteStudent = (id, onSuccess, onError) => {
    const response = axios.delete(`/student/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const getStudent = (id, onSuccess, onError) => {
    const response = axios.get(`/student/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const updateStudent = (id, params, onSuccess, onError) => {
    const response = axios.put(`/student/${id}`, params);
    return handleResponse(response, onSuccess, onError);
};

export {
    getAllStudents,
    createStudent,
    deleteStudent,
    getStudent,
    updateStudent
}