import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { login, authSSO } from '../../Redux/Action/AuthAction';
import LoginLogo from '../../Components/LoginLogo/LoginLogo';
import Swal from 'sweetalert2';
import { bg_login_servicedesk, microsoft } from '../../Images';
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";


const LoginScreen = () => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [pswState, setPswState] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { username: '', password: '', client_id: '', remember_me: false } });
  const { $ } = window;
  $("#wrapper").css("display", "block");
  const onPasswordStateChange = () => {
    setPswState(!pswState);
  }

  const onSubmit = data => {
    dispatch(login(navigate, data, ({ response }) => {
      if (response.data && response.data.message) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: response.data.message,
          timer: 1500,
        })
      }
    }));
  }

  const buttonMicrosoftCLick = () => {
    localStorage.setItem('autoLogin', true);
    instance.loginRedirect(loginRequest).catch((err) => { console.log("Error", err); });
    //window.location.href = 'mslogin';
  }; 

  useEffect(() => {
    const msalaccountkeys = sessionStorage.getItem("msal.account.keys");
    if (isAuthenticated && msalaccountkeys) {

      localStorage.removeItem('autoLogin');
      instance
        .acquireTokenSilent({ ...loginRequest, account: accounts[0] })
        .then((res) => {
          const { accessToken } = res;
          dispatch(authSSO(navigate, { access_token: accessToken }, ({ response }) => {
            if (response && response.data && response.data.message) {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: response.data.message,
                timer: 1500,
              })
            }
          }));
        }).catch(err => console.log(err));
    }
  }, [isAuthenticated]);


  return (
    <div className='login-container' style={{ height: "100vh" }}>
      <div className='bg-login' id="login" style={{
      }}>
        <div style={{
          width: '100%', height: '100%',
          position: 'relative', backgroundImage: `url(${bg_login_servicedesk})`, backgroundPosition: 'center center',
          backgroundRepeat: "no-repeat", backgroundSize: 'cover', opacity: 0.6,
        }}></div>
        <div className="app-title" style={{
          color: '#000', fontWeight: 300,
          fontSize: 24, background: '#ffffff66',
          position: 'absolute', top: 40, left: 40,
          padding: '10px 24px',
          fontWeight: 500,
          borderRadius: 10
        }}>
          <h1 style={{ fontSize: 44, fontWeight: 700, color: '#db8011' }}>MODENA Service Desk</h1>
          Your Satisfaction is Our Happiness...
        </div>
      </div>
      <div className='login-form' style={{}}>
        <div className='d-flex' style={{ height: '100%', flexDirection: 'column', justifyContent: "center" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ margin: 40 }}>
              <div className='d-flex' style={{ width: '100%', flexDirection: 'column' }}>
                <div className='form-group'>
                  <h2 style={{ color: '#000', fontFamily: 'Inter', fontSize: 30 }}>MODENA Service Desk</h2>
                </div>
                <div className='form-group'>
                  <h4 style={{ fontSize: 14 }}>Sign in to start your session</h4>
                </div>
                <div className='form-group' style={{}}>
                  <label className="bold black">Email</label>
                  <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                    <input {...register('username', { required: { value: true, message: 'Username is required' }, pattern: { value: /\S+@\S+\.\S+/, message: "Entered value does not match email format" } })} className='inputLogin' />
                  </div>
                  {errors.username && <span className='text-danger'>{errors.username.message}</span>}
                </div>
                <div className='form-group'>
                  <label className="bold black">Password</label>
                  <div style={{ border: 'solid 1px #ccc', borderRadius: 4, display: 'flex' }}>
                    <input className='inputLogin' type={pswState ? "text" : "password"} {...register('password', { required: { value: true, message: 'Password is required' } })} />
                    <a onClick={onPasswordStateChange} className='btn btn-outline'><i className={!pswState ? 'fa fa-eye' : 'fa fa-eye-slash'} /></a>
                  </div>
                  {errors.password && <span className='text-danger'>{errors.password.message}</span>}
                </div>
                <div className='form-group'>
                  <div className='row'>
                    <div className='col-md-6 left'>
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                        <label className="bold black" for="flexCheckDefault" {...register('remember_me')} style={{ fontSize: 14 }}>
                          Remember Me?
                        </label>
                      </div>
                    </div>
                    <div className='col-md-6 right text-right'>
                      <NavLink to={'/forgot-password'} className='href-b2b' style={{ fontSize: 14 }}>Forgot Password?</NavLink>
                    </div>
                  </div>
                </div>
                <div className='form-group'>
                  <button type='submit' className='btn btn-block btn-b2b' style={{ cursor: "pointer", padding: 6 }}><span className="bold">Sign In</span></button>
                </div>
                <div
                  style={{
                    border: "solid 1px #ccc",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 6,color: '#000'
                  }}
                  onClick={buttonMicrosoftCLick}
                >
                  <img
                    src={microsoft}
                    style={{ width: 20, height: 20, marginRight: 10,  }}
                    alt=""
                  />
                  Sign In with Microsoft
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;