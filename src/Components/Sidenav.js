import { navData } from "./NavData" ;
import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useSelector } from 'react-redux';
import styles from "./StyleModules/sidenav.module.css"
import { NavLink, useLocation } from "react-router-dom";
import { modena_logo, caret_up, caret_down} from "../Images";
import { permissionCheck } from "../Utils/Utils";

/*modified from a code made by Mary Gathoni*/
const Sidenav =  forwardRef(({layoutAdjust}, ref) => {
    useImperativeHandle(ref, () => {
        return { closeAfters: () => setafteropen({}) }
    })
    const location = useLocation();
    const currentPath = location.pathname;
    let { userInfo } = useSelector(state => state.auth);
    const [show, setshow] = useState(false);
    const [child_open, setchildopen] = useState({});
    const [after_open, setafteropen] = useState({});
    const [menu_style, setMenuStyle] = useState({display: "none", opacity: 0,  transition: "opacity 0.2s"});
    const toggleShow = () => {
        let value = !show;
        setshow(!show);
        if(value) layoutAdjust(true);
        else {
            setchildopen({});
            layoutAdjust(false)
        };
    }
    
    const toggleChildOpen = (index) => {
        let children_list = {...child_open}
        if (!children_list[index]) children_list[index] = true;
        else if (children_list[index] === true)children_list[index] = false;
        else if (children_list[index] === false) children_list[index] =  true;

        setchildopen(children_list)
    }

    const toggleAfterOpen = (index) => {
        let children_list = {...after_open}
        if (!children_list[index]) children_list[index] = true;
        else if (children_list[index] === true)children_list[index] = false;
        else if (children_list[index] === false) children_list[index] =  true;

        setafteropen(children_list)
    }

 

    //the transition as changed from using sidenav CSS module to using javascript due to a weird bug.
    useEffect(() => {
        if(show) {
            setMenuStyle({...menu_style, display:"block", opacity: 0})
            setTimeout(function () {
                setMenuStyle({...menu_style, display:"block", opacity: 1, paddingLeft: "16px", paddingTop:"4px", fontSize:"16px"});
            }, 360);
        }
        else setMenuStyle({display: "none", opacity: 0, transition: "opacity 0.2s"});
    }, [show])
    
    const menuStyleReturn = (currentPath, item_link) => {
        if(item_link == "/"){
            if(currentPath == "/") return {background: "#FAA819", color:"white", borderTopLeftRadius:8,borderBottomLeftRadius:8}
            else return {}
        } else{
            if(currentPath.includes(item_link)) return {background: "#FAA819", color:"white", borderTopLeftRadius:8,borderBottomLeftRadius:8}
            else return {}
        }
    }

    return (
        <div style={{position: "fixed", zIndex: 1, top: 0, left: 0, height:"100vh"}} className='sidenavparent'>
            <div className={show? styles.sidenavHover: styles.sidenav}>
                {/*<div style={{marginLeft: "19px"}}>
                        <div style={{display: "flex"}}>
                        <div><img src={modena_logo} style={{width: "20px", height: "20px"}}/></div>
                        <div style={{paddingTop:"5px"}}>{show && <h6 style={{position:"relative", marginBottom: "2em", marginLeft:"10px"}}>Servicedesk</h6>}</div>
                    </div> 
                    <div style={{position:"relative", marginBottom: "2em"}}>{show && <h6 className="bold">Menu</h6>}</div>
                </div>*/}
                {navData.map((item, index) => 
                    <div className='sidebar-placeholder' style={!permissionCheck(userInfo, item.permission, "view") ? {display:"none"}:{}}>
                        {permissionCheck(userInfo, item.permission, "view") && !item.child && 
                            <NavLink key={item.id} className={styles.sideitem} to={item.link} style={menuStyleReturn(currentPath, item.link)}>
                                    <div style={{display:"block", fontSize:"1.2rem"}}>{item.icon}</div>
                                    <div style={show? {display: "block"}: {display: "none"}}>
                                        <span style={menu_style} className="sidebar-title">{item.text}</span>
                                    </div>
                            </NavLink>
                        }
                        {permissionCheck(userInfo, item.permission, "view") && item.child && item.child.length > 0 &&
                        <>
                            <div className={styles.sideitem} style={{position: "relative"}} onClick={() => {
                                    if(show) toggleChildOpen(index)
                                    else toggleAfterOpen(index)
                                    }}>
                                <div style={{display:"flex", alignItems:"center", width: "100%"}}>
                                    <div style={{display:"block", fontSize:"1.2rem"}}>{item.icon}</div>
                                    <div style={show? {display:"block"}: {display:"none"}}>
                                        <span style={menu_style} className="sidebar-title">{item.text}</span>
                                    </div>
                                    <div style={show? {display:"block", marginLeft: "auto"}: {display:"none"}}>
                                        <img src={caret_up} style={!child_open[index]? {transform: "scaleY(-1)"}: {}}/>
                                    </div>
                                </div>
                                {!show && after_open[index] === true &&
                                    <div className='link-text-after'>
                                        {item.child.map(anak =>
                                            <NavLink key={anak.id} to={anak.link}>
                                                <span style={{color: "#444444", fontWeight:400, fontSize:"14px"}}>{anak.text}</span>
                                            </NavLink>
                                        )}
                                    </div>
                                }
                                
                            </div>
                                {item.child.map(anak =>
                                    <NavLink key={anak.id} className={child_open[index] === true? "sideitem-child " + styles.sideitemChild: "sideitem-child " + styles.sideitemChildClosed} to={anak.link} style={currentPath.includes(anak.link)? {background: "#FAA819", color:"white", borderTopLeftRadius:8,borderBottomLeftRadius:8}: {}}>
                                        {anak.icon? anak.icon: undefined}
                                        <span className={show? styles.linkText: styles.linkTextHidden} style={show? {display: "inline"}: {display:"none"}}>{anak.text}</span>
                                    </NavLink>
                                )}
                        </>
                        }
                    </div>
                )}
                <div onClick={toggleShow} style={{marginTop:"40px"}}>
                    <div className={styles.hideMenuSide}>
                        <div>
                            <span className="material-icons mt-1">
                                {show? "keyboard_double_arrow_left" :  "keyboard_double_arrow_right"}
                            </span>
                        </div>
                            <div style={{paddingBottom:"8px"}}>
                                <span style={Object.assign({}, menu_style, {paddingLeft:"10px"})} className="sideitem-hide-menu">
                                    Hide Menu
                                </span>
                            </div>
                    </div>
                </div>
            </div>
        </div>
       
    )
})

export default Sidenav;