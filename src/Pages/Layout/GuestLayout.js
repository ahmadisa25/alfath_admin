import React, {useState, useEffect} from 'react';
import { Outlet } from 'react-router-dom';
import GuestSidenav from '../../Components/GuestSidenav';
import Swal from 'sweetalert2';
import {Helmet} from "react-helmet";

const { $ } = window;
const GuestLayout = () => {
    const [is_hover, setHover] = useState(false);
    useEffect(()=>{
    }, [is_hover]);
    $("#wrapper").css("display","flex");
    return(
        <div style={{display:"flex", width:"100%", height: "100%"}}>
            <Helmet>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Helmet>
            <GuestSidenav layoutAdjust={setHover}/>
            <div id="content-wrapper" className="d-flex flex-column" style={is_hover? {marginLeft:"260px", width:"100%", height:"100%"}:{marginLeft: "60px", width:"100%", height:"100%"}}>
                
                <div id="content" style={{height: "100%"}}>
                    <div className="container-fluid" style={{height: "100%"}}>
                        <Outlet/>
                    </div>

                </div>


            </div>
        </div>
    )
}

export default GuestLayout;