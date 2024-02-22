import axios from 'axios';
import { ACTION_LOGOUT } from '../Redux/Action/AuthAction';
import { handleResponse } from './HelperService';

const logoutUser = (role_name="") => dispatch => {
    dispatch({ type: ACTION_LOGOUT, isLoggedIn: false, role_name});
}

const loginUser = (payload, onSuccess, onError) => {
    const response = axios.post("/login-admin/", payload);
    return handleResponse(response, onSuccess, onError);
}


export {
    logoutUser,
    loginUser
};