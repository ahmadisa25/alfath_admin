import axios from 'axios';
import { ACTION_LOGOUT } from '../Redux/Action/AuthAction';
import { handleResponse } from './HelperService';

const logoutUser = (role_name="") => dispatch => {
    dispatch({ type: ACTION_LOGOUT, isLoggedIn: false, role_name});
}

const uploadProfilePhoto = (payload, onSuccess, onError) => {
    const response = axios.post("v1/profpic", payload);
    return handleResponse(response, onSuccess, onError);
}


const loginUser = (payload, onSuccess, onError) => {
    const response = axios.post("/login/", payload);
    return handleResponse(response, onSuccess, onError);
}

const loginSSO = (payload, onSuccess, onError) => {
    const response = axios.post("v1/sso-login", payload);
    return handleResponse(response, onSuccess, onError);
}

const getUserAll = (params, onSuccess, onError) => {
    const response = axios.get('v1/user', { params });
    return handleResponse(response, onSuccess, onError);
};

const getUserById = (id, onSuccess, onError) => {
    const response = axios.get(`v1/admin/user/get/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const createUser = (payload, onSuccess, onError) => {
    const response = axios.post(`v1/admin/user/create`, payload);
    return handleResponse(response, onSuccess, onError);
};

const updateUser = (username, payload, onSuccess, onError) => {
    const response = axios.put(`v1/admin/user/update/${username}`, payload);
    return handleResponse(response, onSuccess, onError);
};

const deleteUser = (id, onSuccess, onError) => {
    const response = axios.delete(`v1/admin/user/delete/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const getRoles = (params, onSuccess, onError) => {
    const response = axios.get('v1/roles', { params });
    return handleResponse(response, onSuccess, onError);
};

const getUsersSAP = (params, onSuccess, onError) => {
    const response = axios.get('v2/users-sap', { params });
    return handleResponse(response, onSuccess, onError);
};

const getUsersMI = (params, onSuccess, onError) => {
    const response = axios.get('v2/users-misap', { params });
    return handleResponse(response, onSuccess, onError);
};

const getRoleById = (id, onSuccess, onError) => {
    const response = axios.get('v1/roles/' + id);
    return handleResponse(response, onSuccess, onError);
};

const createRole = (payload, onSuccess, onError) => {
    const response = axios.post('v1/roles', payload);
    return handleResponse(response, onSuccess, onError);
};

const updateRole = (id, payload, onSuccess, onError) => {
    const response = axios.put('v1/roles/' + id, payload);
    return handleResponse(response, onSuccess, onError);
};

const deleteRole = (id, onSuccess, onError) => {
    const response = axios.delete('v1/roles/' + id);
    return handleResponse(response, onSuccess, onError);
};

const getUserBranch = (params, onSuccess, onError) => {
    const response = axios.get('v1/branch', { params });
    return handleResponse(response, onSuccess, onError);
};

const getUserV2 = (params, onSuccess, onError) => {
    const response = axios.get('v2/users', { params });
    return handleResponse(response, onSuccess, onError);
};

const getUserByIdV2 = (id, onSuccess, onError) => {
    const response = axios.get('v2/users/' + id);
    return handleResponse(response, onSuccess, onError);
};

const getUserByUserIdV2 = (id, onSuccess, onError) => {
    const response = axios.get('v2/users/userid/' + id);
    return handleResponse(response, onSuccess, onError);
};

const createUserV2 = (payload, onSuccess, onError) => {
    const response = axios.post('v2/users', payload);
    return handleResponse(response, onSuccess, onError);
};

const updateUserV2 = (id, payload, onSuccess, onError) => {
    const response = axios.put('v2/users/' + id, payload);
    return handleResponse(response, onSuccess, onError);
};

const resetPassword = (payload, onSuccess, onError) => {
    const response = axios.post('v1/public/reset-password/request', payload);
    return handleResponse(response, onSuccess, onError);
};

const verifyTokenResetPassword = (username, client_id, token, onSuccess, onError) => {
    const response = axios.get('v1/public/reset-password/verify?username='+username+'&client_id='+client_id+'&token='+token);
    return handleResponse(response, onSuccess, onError);
};

const getModenaUserByEmail = (email, onSuccess, onError) => {
    const response = axios.get(`v1/${email}/modena`, { params: { perpage: 10 } });
    return handleResponse(response, onSuccess, onError);
};

const updatePassword = (payload, onSuccess, onError) => {
    const response = axios.put('v1/public/reset-password/update', payload);
    return handleResponse(response, onSuccess, onError);
};

export {
    getModenaUserByEmail,
    loginSSO,
    logoutUser,
    loginUser,
    getUserAll,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    getUserV2,
    getUserBranch,
    createUserV2,
    updateUserV2,
    getUserByIdV2,
    getUserByUserIdV2,
    getUsersMI,
    getUsersSAP,
    resetPassword,
    verifyTokenResetPassword,
    updatePassword,
    uploadProfilePhoto
};