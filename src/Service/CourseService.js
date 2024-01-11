import axios from 'axios';
import { handleResponse } from './HelperService';

const getAllCourses = (params, onSuccess, onError) => {
    const response = axios.get('/course-all/', {params});
    return handleResponse(response, onSuccess, onError);
};

const createCourse = (params, onSuccess, onError) => {
    const response = axios.post('/course/', params);
    return handleResponse(response, onSuccess, onError);
};

const deleteCourse = (id, onSuccess, onError) => {
    const response = axios.delete(`/course/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const getCourse = (id, onSuccess, onError) => {
    const response = axios.get(`/course/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const updateCourse = (id, params, onSuccess, onError) => {
    const response = axios.put(`/course/${id}`, params);
    return handleResponse(response, onSuccess, onError);
};

export {
    getAllCourses,
    createCourse,
    deleteCourse,
    getCourse,
    updateCourse
}