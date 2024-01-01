import axios from 'axios';
import { handleResponse } from './HelperService';

const getAllAgents = (params, onSuccess, onError) => {
    const response = axios.get('v1/agent?filter=is_deleted:false', {params});
    return handleResponse(response, onSuccess, onError);
};

const getAllSupervisors = (search, onSuccess, onError) => {
    const response = axios.get(`v1/agent-supervisors?search=${search}`);
    return handleResponse(response, onSuccess, onError);
};

const createAgent = (payload, onSuccess, onError) => {
    const response = axios.post('v1/agent', payload);
    return handleResponse(response, onSuccess, onError);
};

const getAgent = (id, onSuccess, onError) => {
    const response = axios.get(`v1/agent/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const updateAgent = (id, payload, onSuccess, onError) => {
    const response = axios.put(`v1/agent/${id}`, payload);
    return handleResponse(response, onSuccess, onError);
};

const deleteAgent = (id, onSuccess, onError) => {
    const response = axios.delete(`v1/agent/${id}`);
    return handleResponse(response, onSuccess, onError);
};

const unmapAgentFromGroup = (agent_id, group_id, onSuccess, onError) => {
    const response = axios.delete(`v1/agent-group/${agent_id}/${group_id}`);
    return handleResponse(response, onSuccess, onError);
};

const mapAgentToGroup = (payload, onSuccess, onError) => {
    const response = axios.post('v1/agent-group', payload);
    return handleResponse(response, onSuccess, onError);
};


export {
    getAllAgents,
    getAgent,
    updateAgent,
    unmapAgentFromGroup,
    createAgent,
    deleteAgent,
    mapAgentToGroup,
    getAllSupervisors
}