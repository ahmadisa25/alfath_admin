import axios from 'axios';
import { handleResponse } from './HelperService';

const getAllConversations = (ticket_id, params, onSuccess, onError) => {
    const response = axios.get(`v1/ticket-conversation/${ticket_id}`, params);
    return handleResponse(response, onSuccess, onError);
};

const getConversation = (id, params, onSuccess, onError) => {
    const response = axios.get(`v1/ticket-conversation/get/${id}`, params);
    return handleResponse(response, onSuccess, onError);
};

const createConversations = (params, onSuccess, onError) => {
    const response = axios.post(`v1/ticket-conversation`, params);
    return handleResponse(response, onSuccess, onError);
};

const insertFileToConversations = (params, onSuccess, onError) => {
    const response = axios.post(`v1/ticket-conversation/insert-files`, params);
    return handleResponse(response, onSuccess, onError);
};

const automateReplies = (params, onSuccess, onError) => {
    const response = axios.get(`v1/ticket-reply-automate`, params);
    return handleResponse(response, onSuccess, onError);
};

export {getAllConversations, createConversations, automateReplies, getConversation, insertFileToConversations}