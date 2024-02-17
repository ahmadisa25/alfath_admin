import axios from 'axios';
import { handleResponse } from './HelperService';

const createQuestion = (params, onSuccess, onError) => {
    const response = axios.post('/quiz-question/', params);
    return handleResponse(response, onSuccess, onError);
};

const deleteQuestion = (id, onSuccess, onError) => {
    const response = axios.delete(`/quiz-question/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const getQuestion = (id, onSuccess, onError) => {
    const response = axios.get(`/quiz-question/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const updateQuestion = (id, params, onSuccess, onError) => {
    const response = axios.put(`/quiz-question/${id}`, params);
    return handleResponse(response, onSuccess, onError);
};

export {
    createQuestion,
    deleteQuestion,
    getQuestion,
    updateQuestion
}