import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../Redux/Action/AuthAction';
import Swal from 'sweetalert2';
import { mosque } from '../../Images';


const LoginScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [pswState, setPswState] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { Email: '', Password: '' } });
  const { $ } = window;
  $("#wrapper").css("display", "block");
  const onPasswordStateChange = () => {
    setPswState(!pswState);
  }

  const onSubmit = data => {
    dispatch(login(navigate, data, ({ response }) => {
      if (response?.data?.message) {
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
    //window.location.href = 'mslogin';
  }; 


  return (
    <div className='login-container' style={{ height: "100vh" }}>
      <div className='bg-login' id="login" style={{
      }}>
        <div style={{
          width: '100%', height: '100%',
          position: 'relative', backgroundImage: `url(${mosque})`, backgroundPosition: 'center center',
          backgroundRepeat: "no-repeat", backgroundSize: 'cover', opacity: 0.6,
        }}></div>
      </div>
      <div className='login-form' style={{}}>
        <div className='d-flex' style={{ height: '100%', flexDirection: 'column', justifyContent: "center" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ margin: 40 }}>
              <div className='d-flex' style={{ width: '100%', flexDirection: 'column' }}>
                <div className='form-group'>
                  <h2 className="bold" style={{ color: '#000', fontFamily: 'Inter', fontSize: 30 }}>Al-Fath Learning Centre</h2>
                </div>
                <div className='form-group'>
                  <h4 style={{ fontSize: 14 }}>Sign in to start your session</h4>
                </div>
                <div className='form-group' style={{}}>
                  <label className="bold black">Email</label>
                  <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                    <input {...register('Email', { required: { value: true, message: 'Email is required' }, pattern: { value: /\S+@\S+\.\S+/, message: "Entered value does not match email format" } })} className='inputLogin' />
                  </div>
                  {errors.Email && <span className='text-danger'>{errors.Email.message}</span>}
                </div>
                <div className='form-group'>
                  <label className="bold black">Password</label>
                  <div style={{ border: 'solid 1px #ccc', borderRadius: 4, display: 'flex' }}>
                    <input className='inputLogin' type={pswState ? "text" : "password"} {...register('Password', { required: { value: true, message: 'Password is required' } })} />
                    <a onClick={onPasswordStateChange} className='btn btn-outline'><i className={!pswState ? 'fa fa-eye' : 'fa fa-eye-slash'} /></a>
                  </div>
                  {errors.Password && <span className='text-danger'>{errors.Password.message}</span>}
                </div>
                {/*<div className='form-group'>
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
                </div>*/}
                <div className='form-group'>
                  <button type='submit' className='btn btn-block btn-b2b' style={{ cursor: "pointer", padding: 6 }}><span className="bold">Sign In</span></button>
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