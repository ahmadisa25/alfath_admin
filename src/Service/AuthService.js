import axios from 'axios';
import { handleResponse } from './HelperService';


const getSession = (query,onSuccess, onError) => {
    const response = axios.get(`v1/sso-callback?${query}`);
    return handleResponse(response, onSuccess, onError);
};

/*const reloginSSO = (payload, onSuccess, onError) => {
    const response = axios.post("v1/relogin-sso", payload);
    return handleResponse(response, onSuccess, onError);
}*/

const getLoginURL = (params,onSuccess, onError) => {
    const response = axios.get(`v1/sso-login`, {params});
    return handleResponse(response, onSuccess, onError);
};


export {
    getSession,
    getLoginURL
}