import axios from 'axios';
import { handleResponse } from './HelperService';

const createQuiz = (params, onSuccess, onError) => {
    const response = axios.post('/chapter-quiz/', params);
    return handleResponse(response, onSuccess, onError);
};

const deleteQuiz = (id, onSuccess, onError) => {
    const response = axios.delete(`/chapter-quiz/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const getQuiz = (id, onSuccess, onError) => {
    const response = axios.get(`/chapter-quiz/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const updateQuiz = (id, params, onSuccess, onError) => {
    const response = axios.put(`/chapter-quiz/${id}`, params);
    return handleResponse(response, onSuccess, onError);
};

export {
    createQuiz,
    deleteQuiz,
    getQuiz,
    updateQuiz
}