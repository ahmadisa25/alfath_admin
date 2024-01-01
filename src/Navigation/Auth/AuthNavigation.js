import React from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import LoginScreen from '../../Pages/Login/Login';
import LoginMicrosoft from '../../Pages/Login/LoginMicrosoft';

const ToLogin = () => {
  return <Navigate to="/" replace={true} />;
};

const AuthNavigation = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/mslogin" element={<LoginMicrosoft />} />
        <Route path="/sso-callback" element={<LoginScreen />} />
        <Route path="*" element={<ToLogin />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AuthNavigation;
