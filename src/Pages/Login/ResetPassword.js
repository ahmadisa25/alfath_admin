import React, { Component, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useSearchParams } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { ACTION_LOGIN, login } from '../../Redux/Action/AuthAction';
import { login_bg, b2b_portal } from '../../Images';
import LoginLogo from '../../Components/LoginLogo/LoginLogo';
import { updatePassword, verifyTokenResetPassword } from '../../Service/UserService';
import Swal from 'sweetalert2';


const ResetPassword = () => {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const [username, setUsername] = useState(params.get("username"));
  const [clientId, setClientId] = useState(params.get("client_id"));
  const [token, setToken] = useState(params.get("token"));
  const [pswState, setPswState] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [confPswState, setConfPswState] = useState(true);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({ defaultValues: { password: '', confirm_password: '', username: '', client_id: '', token: ''} });
  const { $ } = window;
  $("#wrapper").css("display", "block");

  const onPasswordStateChange = () => {
    setPswState(!pswState);
  }

  const onConfirmPasswordStateChange = () => {
    setConfPswState(!confPswState);
  }

  const onSubmit = data => {
    data.username = username;
    data.client_id = parseInt(clientId);
    data.token = token;
    updatePassword(data).then((res) => {
      if(res.status == 200) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: res.data.message,
          timer: 1500,
        });

        window.location.href = "/login";
      }
    }).catch(({response: { data } }) => {
      if(data.status == 422) {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: data.message,
            timer: 2000,
        });
      } else {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: data.message,
            timer: 2000,
        });
      }
    });
        
    // <Navigate to="/login" replace={true} />;
  }
  useEffect(() => {
    verifyTokenResetPassword(username, clientId, token).then((res) => {
      setIsVerified(true);
    }).catch(({response: { data } }) => {
      setIsVerified(false);
      if(data.status == 422) {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: data.message,
            timer: 2000,
        });
      } else {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: data.message,
            timer: 2000,
        });
      }
    });
  }, [])
  return (
    <div className='login-container' style={{height:"100vh"}}>
        <div className='login-form' style={{}}>
          <div className='d-flex' style={{ height: '100%', flexDirection: 'column', justifyContent: "center" }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='row' style={{ width: '100%' }}>
                <div className='col-8 offset-2'>
                  <div className='mh-2' style={{display:"flex", alignItems:"center"}}>
                      <div><img src={b2b_portal} style={{width: "2em", height: "2em"}}/></div>
                      <div><h3 style={{ color: '#000', fontWeight: 600, marginLeft: "15px"}}>B2B Portal</h3></div>
                  </div>
                  <div className='form-group mh-2'>
                    <h2 style={{ color: '#000', fontWeight: 700 }}>Create New Password</h2>
                  </div>
                  {isVerified && 
                    <>
                      <div className='form-group mt-3 mb-3'>
                        <label className="bold black">Password</label>
                        <div className="inputDiv">
                        <input className='inputLogin' {...register('password', { required: { value: true, message: 'Password is required' }, minLength: { value: 8, message: "Min. length is 8"}, maxLength: { value: 15, message: "Max. length is 15"}, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/, message: "Password must have at least one uppercase letter, one lowercase letter, one number and one special character (!@#$%^&*)"} })} type={pswState ? "text" : "password"} />
                        <a onClick={onPasswordStateChange} className='btn btn-outline'><i className={!pswState ? 'fa fa-eye' : 'fa fa-eye-slash'}/></a>
                        </div>
                        {errors.password && <span className='text-danger'>{errors.password.message}</span>}
                    </div>
                    <div className='form-group mt-2 mb-4'>
                        <label className="bold black">Confirm Password</label>
                        <div className="inputDiv">
                        <input className='inputLogin' type="text" {...register('confirm_password', { required: { value: true, message: 'Confirm Password is required' }, validate: (val: string) => {if (watch('password') != val) { return "Your password do no match"; }} })}/>
                        </div>
                        {errors.confirm_password && <span className='text-danger'>{errors.confirm_password.message}</span>}
                    </div>
                    <div className='form-group mh-2'>
                        <div style={{ marginTop: 40 }}>
                        <button type='submit' className='btn btn-block btn-b2b btn-lg btn-submit-form' style={{fontSize:"1em"}}><span className="bold">Reset Password</span></button>
                        </div>
                    </div>
                  </>
                }
                {!isVerified && 
                  <>
                    <div className='mh-2'>
                        <p className='text-left'>Token is invalid or has been expired, please send request again.</p>
                    </div>
                    <div className='form-group mh-2'>
                        <NavLink to={'/login'} className='href-b2b'>Back to Login</NavLink>
                    </div>
                  </>
                }
                </div>
                <div className='col-1'></div>
              </div>
            </form>
          </div>
        </div>
        <div className='bg-login' id="login" style={{ position: 'relative'}}>
            <LoginLogo/>
        </div>
        {/* <div className='bg-login' id="login" style={{ position: 'relative'}}>
          <img src={login_bg} style={{ opacity: 0.7, position: 'absolute', width: '100%', top: 60 }} />
            <div className='text-center' style={{ color: 'white', width: "50%", margin: "0 auto", position: "absolute", bottom: 0, left: "27%", marginBottom: "2.5em"}}>
              <span className='bold' id="b2b-slogan">
                  Empowering your business <br/> with the tools to succeed
              </span>
              <p style={{fontSize: "18px", marginTop: "1.3em"}}>We provide you with easy-to-use collaboration tools, advanced data analytics, and streamlined communication channels</p>
            </div>
        </div> */}
    </div>
  );
};

export default ResetPassword;
