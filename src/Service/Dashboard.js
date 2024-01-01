import axios from 'axios';
import { handleResponse } from './HelperService';

const getDashboard = (params, onSuccess, onError) => {
    const response = axios.get('v1/dashboard', { params });
    return handleResponse(response, onSuccess, onError);
};

export {
    getDashboard,
};
