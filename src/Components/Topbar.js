import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../Redux/Action/AuthAction';
import { useNavigate } from 'react-router-dom';
import InitialIcon from './InitialIcon';
import { FaMosque } from "react-icons/fa";

const Topbar = () => {
    let { userInfo } = useSelector(state => state.auth);
    const is_null_url = userInfo.profpic == "null" || userInfo.profpic == null;
    //const profpic_base_url = process.env.REACT_APP_IMAGE_URL +"profpic/";
    const tempImageName = localStorage.getItem('image_name') || `${userInfo.profpic}`;
    const navigate = useNavigate();
    if (!userInfo) {
        userInfo = {}
    }

    const [notification_open, setNotificationOpen] = useState(false);
    const [profile_open, setProfileOpen] = useState(false);

    const dispatch = useDispatch();

    const signOut = () => {
        dispatch(logout(userInfo.role_name));
        navigate('/login');
    }

    return (
        <nav className="navbar navbar-expand bg-white topbar mb-4 sticky-top shadow">

            <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle">
                <i className="fa fa-bars"></i>
            </button>

            {/* <form
                className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
                <div className="input-group">
                    <input type="text" className="form-control bg-light border-0 small" placeholder="Search for..."
                        aria-label="Search" aria-describedby="basic-addon2" />
                    <div className="input-group-append">
                        <button className="btn btn-outline-primary" type="button">
                            <i className="fas fa-search fa-sm"></i>
                        </button>
                    </div>
                </div>
            </form> */}

            <div className='row' style={{display:"flex", width: "100%", justifyContent:"space-between"}}>
                <div className='col-md-6'>
                    <div style={{marginTop:"0.55em", display:"flex", columnGap:"17px"}}>
                        <div style={{color:"black"}}>
                            <FaMosque/>
                        </div>
                        <h5 className="black bold">Al-Fath Learning Centre</h5>
                    </div>
                    {/*<div class="input-group mt-1">
                        <div class="form-outline" style={{width: "50%", display:"flex", alignItems:"center", backgroundColor:"#ECECEC", borderRadius: "5px"}}>
                            <i className='fa fa-search' style={{marginLeft:"10px"}}/>
                            <input type="search" id="search-univ" class="form-control" placeholder="Search" style={{width: "100%", border:0,backgroundColor:"#ECECEC"}}/>
                        </div>
        </div>*/}
                </div>
                <div className='col-md-6' style={{display: "flex", columnGap:"2em"}}>
                    <div style={{display:"flex", alignItems:"center", marginLeft: "auto"}}>
                        <div style={{marginRight: "10px"}}>
                            <span className='black block'>{userInfo.name}</span>
                            <span className='block'>{userInfo.username}</span>
                        </div>

                        <div style={{display:"flex", alignItems:"center",}}>
                            <div className="rounded-circle" style={{backgroundColor:"#ECECEC", cursor:"pointer"}} onClick={() => {setProfileOpen(!profile_open); if(notification_open) setNotificationOpen(!notification_open);}}>
                            {(!userInfo.profpic || is_null_url) && <InitialIcon name={userInfo.name} icon_width={40} icon_height={40} icon_radius={20} text_size={22} ></InitialIcon>}
                                {userInfo.profpic && !is_null_url && <img className="icons-topbar rounded-circle" src={tempImageName}/>}
                                {profile_open &&
                                    <div className='profile-after' onBlur={() => {setProfileOpen(false); setNotificationOpen(false);}} tabIndex={profile_open ? -1 : 0}>
                                        <div>
                                            <div className='b2b-profile-menu' style={{borderBottom: "1px solid #D0D5DD"}}>
                                                <a className='black' style={{padding: "3px 0 9px 0"}} onClick={() => navigate('/profile')}>Profile</a>
                                            </div>
                                            <div className='b2b-profile-menu' style={{paddingBottom:"5px"}}>
                                                <a className='black' style={{padding: "3px 0 10px 0"}} onClick={() => signOut()}>Logout</a>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    {/*
                    <div style={{display:"flex", alignItems:"center",}}>
                        <div className="rounded-circle" style={{backgroundColor:"#ECECEC", padding: "0.5em 0.75em"}} onClick={() => {setNotificationOpen(!notification_open); if(profile_open) setProfileOpen(!profile_open);}}>
                            <i className="fas fa-bell" style={{fontSize: "1.5em"}}/>
                            {notification_open &&
                                <div className='notification-after' onBlur={() => {setProfileOpen(false); setNotificationOpen(false);}} tabIndex={notification_open ? -1 : 0}>
                                    <div style={{padding: "15px 20px"}}>
                                        <span className='black bold'>Notification</span>
                                        <NavLink to={'#'} className='href-b2b right underline'>Mark all as read</NavLink>
                                    </div>
                                    <div className='flex' style={{marginTop: "20px", justifyContent: "space-between", padding: "0 20px 0px 20px", borderBottom: "2px solid #D0D5DD"}}>
                                        <div className='b2b-notification-tabs black' style={{columnGap: "10px", paddingBottom: "10px"}}>
                                            <span>Update</span>
                                            <div className='b2b-notification-blob'>
                                                4
                                            </div>
                                            <div style={{position: "relative"}}>
                                                    <div style={{position: "absolute", width: "100px", height: "2px", background:"#D0D5DD", top:"22px", right: "1px"}}>
                                                    </div>
                                            </div>
                                        </div>
                                        <div className='b2b-notification-tabs black'>
                                            <span>Message</span>
                                            <div style={{position: "relative"}}>
                                                <div style={{position: "absolute", width: "100px", height: "2px", background:"green", top:"17px", left: "-84px"}}>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='b2b-notification-tabs black'>
                                            <span>Transaction</span>
                                            <div style={{position: "relative"}}>
                                                <div style={{position: "absolute", width: "100px", height: "2px", background:"#D0D5DD", top:"17px", left: "-92px"}}>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='b2b-notification-msg'>
                                            <div>
                                                <img className='b2b-notification-msg-img' src = {hawk}/>
                                            </div>
                                            <div>
                                                <span className='bold black'> Bang Japar</span>
                                                <p style={{marginTop: "5px"}} className='black'>自業自得</p>
                                            </div>
                                            <div style={{marginLeft: "auto"}}>    
                                                <span className='black right'>1h ago</span>
                                            </div>
                                        </div>
                                        <div className='b2b-notification-msg' style={{borderBottom: "1px solid #D0D5DD"}}>
                                            <div>
                                                <img className='b2b-notification-msg-img' src = {hawk}/>
                                            </div>
                                            <div>
                                                <span className='bold black'> Bang Japar</span>
                                                <p style={{marginTop: "5px"}} className='black'>自業自得</p>
                                            </div>
                                            <div style={{marginLeft: "auto"}}>    
                                                <span className='black right'>1h ago</span>
                                            </div>
                                        </div>
                                        <div className='b2b-notification-msg' style={{borderBottom: "1px solid #D0D5DD"}}>
                                            <div>
                                                <img className='b2b-notification-msg-img' src = {hawk}/>
                                            </div>
                                            <div>
                                                <span className='bold black'> Bang Japar</span>
                                                <p style={{marginTop: "5px"}} className='black'>自業自得</p>
                                            </div>
                                            <div style={{marginLeft: "auto"}}>    
                                                <span className='black right'>1h ago</span>
                                            </div>
                                        </div>
                                        <div className='b2b-notification-msg' style={{borderBottom: "1px solid #D0D5DD"}}>
                                            <div>
                                                <img className='b2b-notification-msg-img' src = {hawk}/>
                                            </div>
                                            <div>
                                                <span className='bold black'> Bang Japar</span>
                                                <p style={{marginTop: "5px"}} className='black'>自業自得</p>
                                            </div>
                                            <div style={{marginLeft: "auto"}}>    
                                                <span className='black right'>1h ago</span>
                                            </div>
                                        </div>
                                        <div className='text-center' style={{marginTop: "10px"}}>
                                            <span style={{color: "rgba(18, 183, 106, 1)"}}>See More...</span>
                                        </div>  
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    <div style={{display:"flex", alignItems:"center",}}>
                        <div className="rounded-circle" style={{backgroundColor:"#ECECEC", padding: "0.5em 0.75em"}}>
                            <i className="fas fa-window-maximize" style={{fontSize: "1.5em"}}/>
                        </div>
                    </div>*/}
                </div>
            </div>

        </nav>
    )
}
export default Topbar;