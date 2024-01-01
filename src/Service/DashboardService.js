import axios from 'axios';
import { handleResponse } from './HelperService';

const getDashboardData = (params, onSuccess, onError) => {
    const response = axios.get('v1/dashboard', {params});
    return handleResponse(response, onSuccess, onError);
};

const getTicketReporting = (params, onSuccess, onError) => {
    const response = axios.post('v1/ticket-reporting', {params});
    return handleResponse(response, onSuccess, onError);
};

export {
    getDashboardData,
    getTicketReporting
}