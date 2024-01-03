const handleResponse = (response, onSuccess, onError = err => { }) => {
    if (onSuccess) { 
        response.then(onSuccess).catch(onError);
    }
    return response;
}

const getMultipartOptions = axios => {
    const headers = axios.defaults.headers;
    return { headers: { ...headers, 'Content-Type': 'multipart/form-data' } };
}

export { handleResponse, getMultipartOptions };