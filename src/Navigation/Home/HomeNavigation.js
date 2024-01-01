import React  from 'react';
import { BrowserRouter, Routes, Route, Navigate, matchPath } from 'react-router-dom';
import LayoutScreen from '../../Pages/Layout/LayoutScreen';
import User from '../../Pages/User/User';
import { useSelector } from 'react-redux';
import RequesterLanding from '../../Pages/Guest/RequesterLanding';
import HomePage from '../../Pages/Home/HomePage';
import NotFound from '../../Pages/Error/NotFound';
import Profile from '../../Pages/User/Profile';
import OutOfOffice from '../../Pages/OOO/OutOfOffice';
import Incidents from '../../Pages/Incident/Incidents';
import IncidentDetail from '../../Pages/Incident/IncidentDetail';
import AgentForm from '../../Pages/Pages/Settings/AgentForm';
import AgentSettings from '../../Pages/Pages/Settings/AgentSettings';
import SLAForm from '../../Pages/Pages/Settings/SLAForm';
import GroupForm from '../../Pages/Pages/Settings/GroupForm';
import GroupSettings from '../../Pages/Pages/Settings/GroupSettings';
import GroupMembers from '../../Pages/Pages/GroupMembers';
import BusinessHoursSettings from '../../Pages/Pages/Settings/BusinessHoursSettings';
import BusinessHoursForm from '../../Pages/Pages/Settings/BusinessHoursForm';
import BusinessHolidays from '../../Pages/Pages/Settings/BusinessHolidays';
import CategorySettings from '../../Pages/Pages/Settings/CategorySettings';
import CategoryForm from '../../Pages/Pages/Settings/CategoryForm';
import ServiceRequestFields from '../../Pages/Pages/Settings/ServiceRequestFields';
import ServiceRequestFieldProperties from '../../Pages/Pages/Settings/ServiceRequestFieldProperties';
import SLASettings from '../../Pages/Pages/Settings/SLASettings';
import IncidentForm from '../../Pages/Incident/IncidentForm';
import Services from '../../Pages/Services/Services';
import ServiceRequestForm from '../../Pages/Services/ServiceRequestForm';
import ServiceRequests from '../../Pages/Incident/ServiceRequests';
import OutOfOfficeApproval from '../../Pages/OOO/OutOfOfficeApproval';
import ServiceRequestDetail from '../../Pages/Incident/ServiceRequestDetail';
import ConversationContent from '../../Pages/ConversationContent';

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
            <Route path="/out-of-office" element={<OutOfOffice />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/ooo-approval-form" element={<OutOfOfficeApproval />} />
            <Route path="/ooo-approval-form/:ooo_id" element={<OutOfOfficeApproval />} />
            <Route path="/incident/:incident_id" element={<IncidentDetail/>} />
            <Route path="/service-request/:request_id" element={<ServiceRequestDetail/>} />
            <Route path="/incident-form" element={<IncidentForm />} />
            <Route path="/service-form" element={<ServiceRequestForm />} />
            <Route path="/service-form/create/:service_item_id" element={<ServiceRequestForm />} />
            <Route path="/service-form/edit/:service_item_id/:ticket_id" element={<ServiceRequestForm />} />
            <Route path="/incident-form/:incident_id" element={<IncidentForm />} />
            <Route path="/business-hours" element={<BusinessHoursSettings />} />
            <Route path="/business-hours-form" element={<BusinessHoursForm />} />
            <Route path="/business-hours-form/:bh_id" element={<BusinessHoursForm />} />
            <Route path="/business-holidays/:bh_id" element={<BusinessHolidays />} />
            <Route path="/requester-home" element={<RequesterLanding />} />
            <Route path="/conversation-content/:ticket_type/:cc_id" element={<ConversationContent />} />
            <Route path="/services" element={<Services />} />
            <Route path="/service-requests" element={<ServiceRequests />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/agent-form" element={<AgentForm />} />
            <Route path="/agent-form/:agent_id" element={<AgentForm />} />
            <Route path="/group-form" element={<GroupForm />} />
            <Route path="/group-form/:group_id" element={<GroupForm />} />
            <Route path="/group-members/:group_id" element={<GroupMembers />} />
            <Route path="/sla-form" element={<SLAForm />} />
            <Route path="/sla-form/:sla_id" element={<SLAForm />} />
            <Route path="/service-request-fields" element={<ServiceRequestFields />}/>
            <Route path="/service-field-form" element={<ServiceRequestFieldProperties />} />
            <Route path="/service-field-form/:field_id" element={<ServiceRequestFieldProperties />} />
            {/*<Route path="/field-properties" element={<FieldProperties />} />
            <Route path="/field-properties/:field_id" element={<FieldProperties />} />
    <Route path="/incident-fields" element={<IncidentFields />}/>*/}
            <Route path="/category-settings" element={<CategorySettings />}/>
            <Route path="/category-form/:category_id/:parent_id/:depth" element={<CategoryForm />}></Route>
            <Route path="/category-form/" element={<CategoryForm />}></Route>
            <Route path="/agent-settings" element={<AgentSettings />} />
            <Route path="/sla-settings" element={<SLASettings />} />
            <Route path="/group-settings" element={<GroupSettings />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
};

export default HomeNavigation;
