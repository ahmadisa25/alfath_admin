import Swal from 'sweetalert2';
import {datetime_input} from '../Images';
import { InputSwitch } from 'primereact/inputswitch';

export const updateObject = (currentObject, updatedProperties) => {
    return {
        ...currentObject,
        ...updatedProperties,
    };
};

export const urlEncodeData = (data) => {
    let form_body = [];
    for (let prop in data){
        form_body.push(encodeURIComponent(prop) + "=" + encodeURIComponent(data[prop]))
    }

    return form_body.join("&");
}

export const prunePhoneNumber = (phone_number) => {
    if(phone_number[0] == "0") return phone_number.slice(1);
    else if(phone_number[0] == "6" && phone_number[1] == "2") return phone_number.slice(2);
    else if(phone_number[0] == "+" && phone_number[1] == "6" && phone_number[2] == "2") return phone_number.slice(3);
    else return phone_number;
}

export const permissionCheck = (userInfo, key, access_type) => {
    let result = false;
    if(userInfo.access){
        if(userInfo.access[key]){
            if(userInfo.access[key][`can_${access_type}`] === true) result = true;
        }
    }

    return result;
}

export const updateArray = (currentArray, updatedProperties) => {
    return [...currentArray, updatedProperties];
};

export const uuid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export const renderFields = (field_type) => {
    if(field_type == "text-single") return <input type="text" disabled placeholder = "Single Input" style={{fontSize:"14px"}}/>
    else if(field_type == "number") return <input type="number" disabled placeholder = "Number Input" style={{fontSize:"14px"}}/>
    else if(field_type == "text-multiple") return <textarea disabled placeholder = "Text Area" style={{fontSize:"14px"}}/>
    else if(field_type == "dropdown-single") return <select disabled><option style={{fontSize:"14px"}}>Select one</option></select>
    else if(field_type == "dropdown-multiple") return <select disabled><option style={{fontSize:"14px"}}>Select many</option></select>
    else if(field_type == "datetime") return <img src={datetime_input} style={{width:"300px"}}/>
    else if(field_type == "checkbox") return  <div className="form-group">
        <label>
            Checkbox 1
        </label>
        <div>
            <InputSwitch checked={true} disabled/>
        </div>
    </div>
    else if(field_type == "content") return <span>Your content here...(a static user-defined content)</span>
    else return "";
}

export const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

export const truncateToEllipsis = (text) => {
    const maxLength = 100; // Set the maximum label length
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
export const isAdmin = (user_info) => {
    if(user_info.role_name == "Administrator") return true;
    return false;
}

export const isObjectEmpty = (obj) => {
    return Object.keys(obj).length === 0;
}

export const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
}

export const setFilterAnd = (params, key, value) => {
    if (params.filterAnd) {
        const filters = params.filterAnd.split(',');
        if (filters.indexOf(`${key}:${value}`) == -1) {
            filters.push(`${key}:${value}`);
            params.filterAnd = filters.join(',');
        }
    } else {
        params.filterAnd = `${key}:${value}`;
    }
    return params;
}

export const handleResponse = (response, onSuccess, onError = err => { }) => {
    if (onSuccess) {
        response.then(onSuccess).catch(onError);
    }
    return response;
}

export const handlerFormError = (data) => {
    if (data.errors) {
        const [key] = Object.keys(data.errors || {});
        const message = data.errors[key];
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message[0]
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message
        });
    }
}

export const sizeOfArray = function (array) {

    let size = 0;

    for (let key in array) {
        if (array.hasOwnProperty(key)) {
            size++;
        }
    }

    return size;
}

export const getMultipartOptions = axios => {
    const headers = axios.defaults.headers;
    return { headers: { ...headers, 'Content-Type': 'multipart/form-data' } };
}