import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import store from './Redux/Store/Store';
import axios from 'axios';
import { ACTION_LOGIN, ACTION_LOGOUT } from './Redux/Action/AuthAction';
import { getRoleById } from './Service/UserService';

const { $ } = window;
const REFRESH_URL = '/refresh/';
const LOGIN_URL = '/login/';
const USERTOKEN = {
  set: (access_token, refresh_token) => {
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
  },
  remove: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  get: () => ({
    access_token: localStorage.getItem('access_token'),
    refresh_token: localStorage.getItem('refresh_token'),
  })
};

axios.defaults.baseURL = process.env.REACT_APP_URL;
//axios.defaults.baseURL = "https://servicedesk-dev.modena.com/api/"
//axios.defaults.baseURL = "http://localhost:9502/"
let isRefreshing = false;
let failRequests = [];
axios.interceptors.response.use(ok200 => ok200, (error) => {
  const { config, response: { status } } = error;
  const originalRequest = config;
  if (status === 401) {
    if (config.url === REFRESH_URL || config.url === LOGIN_URL) {
      return Promise.reject(error);
    }

    if (isRefreshing == false) {
      isRefreshing = true;
      const refreshToken = USERTOKEN.get().refresh_token;
      axios.post(REFRESH_URL, { refreshToken }).then(async response => {
        if (response && response.status == 200) {
          isRefreshing = false;
          const access_token = response.data.Token;
          const refresh_token = response.data.RefreshToken;
          const [header, payload] = access_token.split('.');
          const userInfo = JSON.parse(atob(payload));
          //const profpic_base_url = process.env.REACT_APP_IMAGE_URL +"profpic/";
          //onst tempImageName = localStorage.getItem('image_name') || `${profpic_base_url}${userInfo.profpic}`;
          //userInfo.profpic = tempImageName;
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          USERTOKEN.set(access_token, refresh_token);

          if (userInfo.role_id) {
            const response = await getRoleById(userInfo.role_id);
            //const { privileges } = response.data;
            //userInfo.privileges = privileges;
          }
          store.dispatch({ type: ACTION_LOGIN, userInfo });
          failRequests.map(callback => callback(access_token));
        }
      }).catch(errorRefresh => {
        isRefreshing = false;
        $(".modal-backdrop").remove()
        console.log('get refresh token fail', errorRefresh);
        store.dispatch({ type: ACTION_LOGOUT });
        return Promise.reject(error);
      });
    }

    const retryOrigReq = new Promise((resolve, reject) => {
      failRequests.push(token => {
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        resolve(axios(originalRequest));
      })
    });

    return retryOrigReq;
  } else {
    return Promise.reject(error);
  }
});

const access_token = localStorage.getItem('access_token');

if (access_token) {
  //get user info from token 
  axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
  const [header, payload] = access_token.split('.');
  const userInfo = JSON.parse(atob(payload));
  const profpic_base_url = process.env.REACT_APP_IMAGE_URL +"profpic/";
  const tempImageName = localStorage.getItem('image_name') || `${profpic_base_url}${userInfo.profpic}`;
  userInfo.profpic = tempImageName;
  store.dispatch({ type: ACTION_LOGIN, userInfo });
} else {
  store.dispatch({ type: ACTION_LOGOUT });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
      <App />
    </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
