import axios from 'axios';
import { handleResponse } from './HelperService';


const getAllAnswers = (payload, onSuccess, onError) => {
    let response = axios.get("/quiz-answer-all/");
    if (payload) {
        if(payload.filter){
            response = axios.get(`/quiz-answer-all?filter=${payload.filter}`);
        }
    }
    return handleResponse(response, onSuccess, onError);
}

const submitFinalGrade = (payload, onSuccess, onError) => {
    let response = axios.post("/student-quiz/", payload);
    return handleResponse(response, onSuccess, onError);
}


export {
    getAllAnswers, submitFinalGrade
};