import axios from 'axios';
import { handleResponse } from './HelperService';

const getDashboardData = (id, onSuccess, onError) => {
    const response = axios.get(`/dashboard`);
    return handleResponse(response, onSuccess, onError);
};

export {
    getDashboardData
}