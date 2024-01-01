import axios from 'axios';
import { handleResponse } from './HelperService';

export const getMenuAll = (onSuccess, onError) => {
    const response = axios.get('v1/admin/menu');
    return handleResponse(response, onSuccess, onError);
};

export const getMenuByRoleId = (role_id, onSuccess, onError) => {
    const response = axios.get(`v1/admin/menu/${role_id}`);
    return handleResponse(response, onSuccess, onError);
};

export const getRoleAll = (_params, onSuccess, onError) => {
    const response = axios.get('v1/user-role', { params: _params });
    return handleResponse(response, onSuccess, onError);
};

export const createRole = (payload, onSuccess, onError) => {
    const response = axios.post(`v1/admin/role`, payload);
    return handleResponse(response, onSuccess, onError);
};

export const updateRole = (id, payload, onSuccess, onError) => {
    const response = axios.put(`v1/admin/role/${id}`, payload);
    return handleResponse(response, onSuccess, onError);
};

export const softDeleteRole = (role_id, payload, onSuccess, onError) => {
    const response = axios.put(`v1/admin/role/${role_id}/delete`, payload);
    return handleResponse(response, onSuccess, onError);
};

export const deleteRole = (role_id, onSuccess, onError) => {
    const response = axios.delete(`v1/admin/role/${role_id}`);
    return handleResponse(response, onSuccess, onError);
};