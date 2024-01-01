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

const LoginMicrosoft = () => {
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showClear, setShowClear] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { username: '', password: '', client_id: '', remember_me: false } });

    const buttonMicrosoftCLick = () => {
        localStorage.setItem('autoLogin', true);
        increment();
        instance.loginRedirect(loginRequest).catch((err) => { console.log("Error", err); });
    };

    const getCount = () => {
        const count = parseInt(localStorage.getItem('login_count') || '0');
        return count;
    };
        
    const increment = () => {
        let count = getCount();
        count++;
        localStorage.setItem('login_count', `${count}`);
    }

    const onClearStorage = () => {
        localStorage.removeItem('autoLogin');
        localStorage.removeItem('login_count');
        window.location.reload();
    }

    useEffect(() => {
        setTimeout(() => {
            if (!localStorage.getItem('autoLogin') && getCount() < 3) { buttonMicrosoftCLick(); }
        }, 200);
        setTimeout(() => {
            setShowClear(true);
        }, 5000);
    }, [])

    useEffect(() => {
        const msalaccountkeys = sessionStorage.getItem("msal.account.keys");
        if (isAuthenticated && msalaccountkeys) {
            localStorage.removeItem('autoLogin');
            localStorage.removeItem('login_count');
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
                                timer: 750,
                            })
                        }
                    }));
                }).catch(err => {
                    console.log(err);

                });
        }
    }, [isAuthenticated]);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <div style={{
                width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', backgroundImage: `url(${bg_login_servicedesk})`, backgroundPosition: 'center center',
                backgroundRepeat: "no-repeat", backgroundSize: 'cover', opacity: 0.6,
            }}>
                {showClear && (<div
                    style={{
                        border: "solid 1px #ccc",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        padding: '6px 24px', color: '#000',
                        background: '#fff'
                    }}
                    onClick={onClearStorage}
                >
                    <img
                        src={microsoft}
                        style={{ width: 20, height: 20, marginRight: 10, }}
                        alt=""
                    />
                    Retry Sign In with Microsoft
                </div>)}
            </div>
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
    )
}

export default LoginMicrosoft