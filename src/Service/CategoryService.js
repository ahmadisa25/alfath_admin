import axios from 'axios';
import { handleResponse } from './HelperService';

const getAllCategories = (params, onSuccess, onError) => {
    if(params.filter){
        params.filter += ",is_deleted:false";
    } else params.filter = "is_deleted:false";
    const response = axios.get('v1/category', {params});
    return handleResponse(response, onSuccess, onError);
};


const getCategories = (id, params, onSuccess, onError) => {
    let url = `v1/categories`;
    if(id) url =`v1/categories?category_id=${id}`;
    const response = axios.get(url, {params});
    return handleResponse(response, onSuccess, onError);
};

const getCategory = (id, onSuccess, onError) => {
    const response = axios.get(`v1/category/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const createCategory = (payload, onSuccess, onError) => {
    const response = axios.post('v1/category', payload);
    return handleResponse(response, onSuccess, onError);
};

const updateCategory = (id, payload, onSuccess, onError) => {
    const response = axios.put(`v1/category/${id}`, payload);
    return handleResponse(response, onSuccess, onError);
};

const deleteCategory= (id, onSuccess, onError) => {
    const response = axios.delete(`v1/category/${id}`);
    return handleResponse(response, onSuccess, onError);
};

export {
    getAllCategories,
    getCategories,
    updateCategory,
    deleteCategory,
    createCategory,
    getCategory
}