import axios from 'axios';
import { ACTION_LOGOUT } from '../Redux/Action/AuthAction';
import { handleResponse } from './HelperService';

const getAllInstructors = (params, onSuccess, onError) => {
    delete params.direction
    const response = axios.get('/instructor-all/', {params});
    return handleResponse(response, onSuccess, onError);
};

export {
    getAllInstructors
}