import React  from 'react';
import { BrowserRouter, Routes, Route, Navigate, matchPath } from 'react-router-dom';
import LayoutScreen from '../../Pages/Layout/LayoutScreen';
import User from '../../Pages/User/User';
import { useSelector } from 'react-redux';
import HomePage from '../../Pages/Home/HomePage';
import NotFound from '../../Pages/Error/NotFound';
import Profile from '../../Pages/User/Profile';
import InstructorSettings from '../../Pages/Pages/Settings/Instructor/InstructorSettings';
import InstructorForm from '../../Pages/Pages/Settings/Instructor/InstructorForm';
import StudentSettings from '../../Pages/Pages/Settings/Student/StudentSettings';
import StudentForm from '../../Pages/Pages/Settings/Student/StudentForm';
import CourseSettings from '../../Pages/Pages/Settings/Course/CourseSettings';
import CourseForm from '../../Pages/Pages/Settings/Course/CourseForm';

const routeList = [
  '/users',
  '/roles',
  '/profile'
];

const tryRequire = (path) => {
  let match = 0;

  for (let key in routeList) {
    if (matchPath(routeList[key], path)) {
      match++;
    }
  }

  if (match > 0) {
    return true;
  } else {
    return false;
  }

};

const ToHome = () => {
  const refreshPath = useSelector(({ auth: { refreshPath } }) => refreshPath);
  const path = refreshPath.replace('login', 'dashboard').split('/').slice(0, 6).join('/');

  if (tryRequire(path)) {
    return <Navigate to={path} replace={true} />;
  } else {
    return <Navigate to='/not-found' replace={true} />;
  }
};


const menus = {
  user: [
    <Route path="/users" element={<User />} />,
    <Route path="/users/profile" element={<Profile />} />
  ],
}

const HomeNavigation = () => {
  const userInfo = useSelector(state => state.auth.userInfo);
  //if (userInfo.privileges) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LayoutScreen />} >
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/instructors" element={<InstructorSettings />} />
            <Route path="/instructor-form" element={<InstructorForm />} />
            <Route path="/instructor-form/:instructor_id" element={<InstructorForm />} />
            <Route path="/students" element={<StudentSettings />} />
            <Route path="/student-form" element={<StudentForm />} />
            <Route path="/student-form/:student_id" element={<StudentForm />} />
            <Route path="/courses" element={<CourseSettings />} />
            <Route path="/course-form" element={<CourseForm />} />
            <Route path="/course-form/:student_id" element={<CourseForm />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
};

export default HomeNavigation;
