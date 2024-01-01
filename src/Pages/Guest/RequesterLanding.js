import React, {useState, useEffect} from 'react';
import { browse2, browse, service, wfh, services, service_request, incident, issues, dashboard, requester_illus} from "../../Images";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { logoutUser } from '../../Service/UserService';

const RequesterLanding = () => {
    let { userInfo } = useSelector(state => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if(userInfo && userInfo.role_name){
            if(userInfo.role_name != "Requester"){
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "You are not allowed to access this page"
                });
                navigate('/');
            }
        } else {
            logoutUser(userInfo.role_name);
        }
    }, [userInfo])
    return(
        <div>
                <div style={{display: "flex", justifyContent:"center", flexDirection:"column", alignItems:"center", padding:"50px 20px", borderTopLeftRadius:8, borderTopRightRadius:8}}>
                    {/*<TypeAnimation sequence={[
                        // Same substring at the start will only be typed once, initially
                        'Hi, How can we help you?',
                        1000,
                        'The team here at Servicedesk will be glad to help!',
                        1000,
                        'We cover your IT needs from Software, hardware....even networks too!',
                        200,
                        "We're here to help you!",
                        1000,
                    ]}
                    speed={50}
                    style={{ fontSize: '2em', color:"#FAA819", fontWeight:"700" }}
                    repeat={Infinity}
                />*/}
                    <h6 className="bold" style={{color:"#FAA819", fontSize:"48px"}}>Hi, How can we help you?</h6>
                    
                </div>
                <div className='row'>
                    <div className='col-md-6' style={{padding:"20px 30px", display:"flex", flexDirection:"column", alignItems:"center"}}>
                            <div style={{padding:"20px 20px 10px 20px", borderRadius:"8px", width:"70%"}}>
                                <div style={{display:"flex", columnGap:"30px", cursor:"pointer"}} onClick={() => navigate('/incident-form')}>
                                    <div>
                                        <div><img src={incident} style={{width:"100px", height:"100px"}}/></div>
                                    </div>
                                    <div style={{padding:"10px 0"}}>
                                        <h6 className="bold" style={{color:"black"}}>Report an Incident</h6>
                                        <p>Browse the list of incidents</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{padding:"20px 20px 10px 20px", borderRadius:"8px", width:"70%"}} onClick={() => navigate('/incidents')}>
                                <div style={{display:"flex", columnGap:"30px", cursor:"pointer"}}>
                                        <div>
                                            <div><img src={dashboard} style={{width:"100px", height:"85px"}}/></div>
                                        </div>
                                        <div style={{padding:"10px 0"}}>
                                            <h6 className="bold" style={{color:"black"}}>Browse Incidents</h6>
                                            <p>You wanna revisit your issues? No problem.</p>
                                        </div>
                                </div>
                            </div>
                            <div style={{padding:"20px 20px 10px 20px", borderRadius:"8px", width:"70%"}} onClick={() => navigate('/services')}>
                                <div style={{display:"flex", columnGap:"30px", cursor:"pointer"}}>
                                    <div>
                                        <div><img src={services} style={{width:"100px", height:"100px"}}/></div>
                                    </div>
                                    <div style={{padding:"10px 0"}}>
                                        <h6 className="bold" style={{color:"black"}}>Browse Services</h6>
                                        <p>Check out our services catalog!</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{padding:"20px 20px 10px 20px", borderRadius:"8px", width:"70%"}}>
                                <div style={{display:"flex", columnGap:"30px", cursor:"pointer"}} onClick={() => navigate('/service-requests')}>
                                    <div>
                                        <div><img src={service_request} style={{width:"100px", height:"100px"}}/></div>
                                    </div>
                                    <div style={{padding:"10px 0"}}>
                                        <h6 className="bold" style={{color:"black"}}>Services History</h6>
                                        <p>Browse the list of services requested by you from time to time</p>
                                    </div>
                                </div>
                            </div>
                      
                    </div>
                    <div className='col-md-6' style={{display:"flex", alignItems:"center"}}>
                        <img src={requester_illus} style={{width:600, height:500}}/>
                    </div>
                </div>
                

        </div>
    )
}

export default RequesterLanding;