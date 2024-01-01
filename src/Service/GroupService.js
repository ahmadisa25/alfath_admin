import axios from 'axios';
import { handleResponse } from './HelperService';

const getAllGroups = (params, onSuccess, onError) => {
    if(params.filter){
        params.filter += ",is_deleted:false";
    } else params.filter = "is_deleted:false";
    const response = axios.get('v1/group', {params});
    return handleResponse(response, onSuccess, onError);
};

const getGroup = (id, onSuccess, onError) => {
    const response = axios.get(`v1/group/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const createGroup = (payload, onSuccess, onError) => {
    const response = axios.post('v1/group', payload);
    return handleResponse(response, onSuccess, onError);
};

const updateGroup = (id, payload, onSuccess, onError) => {
    const response = axios.put(`v1/group/${id}`, payload);
    return handleResponse(response, onSuccess, onError);
};

const deleteGroup= (id, onSuccess, onError) => {
    const response = axios.delete(`v1/group/${id}`);
    return handleResponse(response, onSuccess, onError);
};

export {
    getAllGroups,
    updateGroup,
    deleteGroup,
    createGroup,
    getGroup
}