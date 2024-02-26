import axios from 'axios';
import { handleResponse } from './HelperService';


const getAllAnswers = (payload, onSuccess, onError) => {
    const response = axios.get("/quiz-answer-all/", payload);
    return handleResponse(response, onSuccess, onError);
}


export {
    getAllAnswers
};