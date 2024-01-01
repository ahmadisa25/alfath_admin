import axios from 'axios';
import { handleResponse } from './HelperService';

const getAllStatus = (params, onSuccess, onError) => {
    const response = axios.get('v1/ticket-status', {params});
    return handleResponse(response, onSuccess, onError);
};


export {
    getAllStatus
}