import { ACTION_LOGIN, ACTION_LOGOUT, CLEAR_REFRESH_PATH, UPDATE_IMAGE } from "../Action/AuthAction";
import { updateObject } from "../../Utils/Utils";

const init = {
    isLoggedIn: true,
    userInfo: {},
    refreshPath: window.location.pathname
}

const AuthReducer = (state = init, action) => {
    switch (action.type) {
        case ACTION_LOGIN:
            const { userInfo } = action;
            return { ...state, isLoggedIn: true, userInfo }
        case ACTION_LOGOUT:
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            return { ...state, isLoggedIn: false, userInfo: {} }
        case CLEAR_REFRESH_PATH:
            return { ...state, refreshPath: '' };
        case UPDATE_IMAGE:
            const profpic_base_url = process.env.REACT_APP_IMAGE_URL +"profpic/";
            localStorage.setItem('image_name',  `${profpic_base_url}${action.tempUrl}`);
            const _userInfo = { ...state.userInfo, ['profpic']: `${profpic_base_url}${action.tempUrl}` }
            return updateObject(state, {
                userInfo: _userInfo
            });
        default:
            return state;
    }
}

export default AuthReducer;