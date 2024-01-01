import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from "react-router-dom";
import Sidenav from '../../Components/Sidenav';
import Topbar from '../../Components/Topbar';
import Footer from '../../Components/Footer';
import {Helmet} from "react-helmet";

const { $ } = window;
const LayoutScreen = () => {
    const [is_hover, setHover] = useState(false);
    const sidenavRef = useRef(null);
    useEffect(()=>{
    }, [is_hover]);
    $("#wrapper").css("display","flex");

    return (
        <div style={{display:"flex", width:"100%", height: "100%"}}>
            <Helmet>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Helmet>
            <Sidenav layoutAdjust={setHover} ref={sidenavRef}/>
            <div id="content-wrapper" className="d-flex flex-column" style={is_hover? {marginLeft:"15vw", width:"100%", height:"100%"}:{marginLeft: "60px", width:"100%", height:"100%"}} onClick={() => sidenavRef.current.closeAfters()}>
                
                <div id="content" style={{height: "100%"}}>
                    <Topbar />
                    <div className="container-fluid" style={{height: "100%"}}>
                        <Outlet />
                    </div>

                </div>


            </div>
        </div>
    );
}

export default LayoutScreen;