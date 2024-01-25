import axios from "axios";
import Swal from "sweetalert2";
import { getRoleById, loginUser, loginSSO } from "../../Service/UserService";
import { urlEncodeData } from "../../Utils/Utils";

const ACTION_LOGIN = 'ACTION_LOGIN';
const ACTION_LOGOUT = 'ACTION_LOGOUT';
const CLEAR_REFRESH_PATH = 'CLEAR_REFRESH_PATH';
const UPDATE_IMAGE = 'UPDATE_IMAGE';
const { $ } = window;

const logout = (role_name="") => dispatch => {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.setItem('last_path', window.location.pathname);
    if(role_name) localStorage.setItem('prev_role', role_name);
    else localStorage.removeItem('prev_role');
    sessionStorage.clear();
    dispatch({ type: ACTION_LOGOUT });
}

const authSSO = (navigate, payload, onError = err => { }) => dispatch => {
  loginSSO(payload, async res => {
    const {
      access_token,
      refresh_token
    } = res.data;


    const [header, payload] = access_token.split('.');
    const userInfo = JSON.parse(atob(payload));
    userInfo.profpic = process.env.REACT_APP_IMAGE_URL +"profpic/" +`${userInfo.profpic}`;
    //localStorage.setItem('prev_role', userInfo.role_name);
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.removeItem('image_name');

    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    /*if (userInfo.role_id) {
      const response = await getRoleById(userInfo.role_id);
      //const { privileges } = response.data;
      //userInfo.privileges = privileges;
    }*/
    Swal.fire({
      icon: 'success',
      title: 'Login Success!',
      text: 'Redirecting you to home page',
      timer: 750,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading()
      }
    }).then(r => {
      $("#wrapper").css("display", "flex");
      dispatch({ type: ACTION_LOGIN, userInfo });
      const last_path = localStorage.getItem("last_path");
      if(!last_path){
        if(userInfo.role_name == "Requester"){
          navigate('/requester-home');
        } else {
          navigate('/dashboard');
        }
      } else {
        let prev_role = localStorage.getItem('prev_role');
        if(prev_role && prev_role == userInfo.role_name) navigate(last_path);
        else {
          if(userInfo.role_name == "Requester"){
            navigate('/requester-home');
          } else {
            navigate('/dashboard');
          }
        }
      }
    
    })
  }, onError)

}

const login = (navigate, payload, onError = err => { }) => dispatch => {
  loginUser(urlEncodeData(payload), async res => {
    const access_token = res.data.Token;
    const refresh_token = res.data.Refresh;

    console.log(access_token);

    const [header, payload] = access_token.split('.');
    const userInfo = JSON.parse(atob(payload));
    userInfo.profpic = process.env.REACT_APP_IMAGE_URL +"profpic/" +`${userInfo.profpic}`;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.removeItem('image_name');

    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    /*if (userInfo.role_id) {
      const response = await getRoleById(userInfo.role_id);
      //const { privileges } = response.data;
      //userInfo.privileges = privileges;
    }*/
    Swal.fire({
      icon: 'success',
      title: 'Login Success!',
      text: 'Redirecting you to home page',
      timer: 1500,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading()
      }
    }).then(r => {
      $("#wrapper").css("display", "flex");
      const last_path = localStorage.getItem("last_path");
     
      dispatch({ type: ACTION_LOGIN, userInfo });
      if(!last_path){
        if(userInfo.role_name == "Requester"){
          navigate('/requester-home');
        } else {
          navigate('/dashboard');
        }
      } else {
        let prev_role = localStorage.getItem('prev_role');
        if(prev_role && prev_role == userInfo.role_name) navigate(last_path);
        else {
          if(userInfo.role_name == "Requester"){
            navigate('/requester-home');
          } else {
            navigate('/dashboard');
          }
        }
      }
    })
  }, onError)

}

export const updateImage = (tempUrl) => dispatch => {
  dispatch({ type: UPDATE_IMAGE, tempUrl });
}

export { ACTION_LOGIN, ACTION_LOGOUT, CLEAR_REFRESH_PATH, UPDATE_IMAGE, login, logout, authSSO};