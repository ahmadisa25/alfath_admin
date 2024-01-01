import axios from 'axios';
import { handleResponse } from './HelperService';

const getAllHolidays = (business_hour_id, params, onSuccess, onError) => {
    const response = axios.get(`v1/business-holiday?business_hour_id=${business_hour_id}`, {params});
    return handleResponse(response, onSuccess, onError);
};

const createHoliday = (payload, onSuccess, onError) => {
    const response = axios.post('v1/business-holiday', payload);
    return handleResponse(response, onSuccess, onError);
};

const deleteHoliday = (business_hour_id,holiday_date, onSuccess, onError) => {
    const response = axios.delete(`v1/business-holiday/${business_hour_id}/${holiday_date}`);
    return handleResponse(response, onSuccess, onError);
};

export {
    getAllHolidays,
    createHoliday,
    deleteHoliday
}