import React from 'react';
import ScrollToTop from 'react-scroll-to-top';
import { AiOutlineArrowUp } from 'react-icons/ai';


const ScrollTop = () => {
    return(
        <ScrollToTop smooth color="orange" style={{background:"black"}} component={
            <div style={{display:"flex", alignItems:"center", columnGap:"5px", justifyContent:"center"}}>
                <div style={{color:"white"}}><AiOutlineArrowUp/></div>
                <div>
                    <span style={{color:"white"}}>Back To Top</span>
                </div>
            </div>
        }/>
    )
}

export default ScrollTop