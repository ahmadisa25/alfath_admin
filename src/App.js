import React from 'react';
import { useSelector } from 'react-redux';
import AuthNavigation from './Navigation/Auth/AuthNavigation';
import HomeNavigation from './Navigation/Home/HomeNavigation';


const App = () => {
  const isLoggedIn = useSelector(({ auth: { isLoggedIn } }) => isLoggedIn);
  return isLoggedIn ? <HomeNavigation /> : <AuthNavigation />; {/**Ok Test CICD */ }
};

export default App;
