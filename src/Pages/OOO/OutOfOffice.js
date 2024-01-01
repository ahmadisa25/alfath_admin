import React, {useState, useEffect} from 'react';
import ScrollTop from '../../Components/ScrollTop';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BsTrash2Fill } from 'react-icons/bs';
import { createOOO, getAllOOO, deleteOOO } from '../../Service/OutOfOfficeService';
import { useSelector } from 'react-redux';
import moment from 'moment';
import Swal from 'sweetalert2';
import Overlay from '../../Components/Overlay';
import ApprovalList from './ApprovalList';

const OutOfOffice = () => {
    let { userInfo } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const [from_date, setFromDate] = useState(null);
    const [to_date, setToDate] = useState(null);
    const [remark, setRemark] = useState("");
    const [refresh, setRefresh] = useState(false);
    const [page, setPage] = useState(userInfo.role_name == "Agent"? "Application" : "Approval");
    const [state, setState] = useState({
        processing: false
    });

    useEffect(() => {
        if(userInfo.role_name == "Requester"){
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "You are not allowed to access this page"
            });
            navigate('/');
        }
}, [])

    const [ooos, setOOOs] = useState([]);

    useEffect(() => {
        getAllOOO({filter:`agent_id:${userInfo.agent_id}`, per_page:3, order:"created_at", direction:"desc"}).then(res => {
            if(res.data.status == 200){
                setOOOs(res.data.data);
            }
        })
    }, [])

    useEffect(() => {
        getAllOOO({filter:`agent_id:${userInfo.agent_id}`, per_page:3, order:"created_at", direction:"desc"}).then(res => {
            if(res.data.status == 200){
                setOOOs(res.data.data);
            }
            setRefresh(false);
        })
    }, [refresh])

    const submitOOO = () => {
        setState({...state, processing: true});
        if(!from_date){
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "Please choose from date!"
             })
             setState({...state, processing: false});

            return;
        }

        if(!to_date){
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "Please choose to date!"
             })
             setState({...state, processing: false});
            return;
        }

        if(!remark){
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "Please put in reason for Out of Office!"
             })
             setState({...state, processing: false});
            return;
        }
        createOOO({
            agent_id: userInfo.agent_id,
            ooo_start_date: moment(from_date).format("YYYY-MM-DD"),
            ooo_end_date: moment(to_date).format("YYYY-MM-DD"),
            ooo_remark: remark
        }).then(res => {
            if(res.status == 200){
                if(res.data && res.data.ooo_id){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "Successfully applied for Out of Office!"
                     }).then(() =>{
                        setState({...state, processing: false});
                        setFromDate(null)
                        setToDate(null)
                        setRemark("")
                        setRefresh(true)
                        if (userInfo.role_name == "Agent Supervisor" || userInfo.role_name == "Administrator" )setPage("Approval")
                     })
                }
            } else {
                let message = res.message || "There's an error while applying OOO! Please check your data!"
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: message
                 }).then(() =>{
                    setFromDate(null)
                    setToDate(null)
                    setRemark("")
                    setRefresh(true)
                    setState({...state, processing:false})
                 })
            }

            
        }).catch(err => {
            let message = err.response.data.message || "There's an error while applying OOO! Please check your data!"
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: message
             }).then(() =>{
                setState({...state, processing:false})
                setFromDate(null)
                setToDate(null)
                setRemark("")
                setRefresh(true)
             })
        })
    }

    const removeOOO = (id) => {
        setState({...state, processing: true});
        const swalWithBootstrapButtons = Swal.mixin({
        })
        
        swalWithBootstrapButtons.fire({
          title: 'Delete OOO',
          text: "Are you sure you want to delete this OOO data?",
          showCancelButton: true,
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel',
          reverseButtons: true
        }).then((result) => {
          if (result.isConfirmed) {
            deleteOOO(id).then(res => {
                if(res.data.status == 200){
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: "Successfully deleted for Out of Office!"
                         }).then(() =>{
                            setRefresh(true)
                         })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: res.data.message
                    })
                }
    
                setState({...state, processing:false})
            }).catch(err => {
                let message = err.response.data.message || "Failed to delete OOO. Please try again or contact support";
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: message
                 })
            })
          
          }
        });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return( 
        <div className="content-wrapper" style={{height:"120vh"}}>
            <Overlay display={state.processing} />
            <ScrollTop/>
            <div className='row'>
                <div className='col-md-6' style={{display:"flex"}}>
                    {/*<div>
                        <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/dashboard')}>arrow_back</span>
                     </div>*/}
                    <div>
                        <h4 className='fw-500' style={{paddingLeft: 35, color:"black"}}>Out Of Office</h4>
                        <h6 style={{paddingLeft: 35, color:"black"}}>{userInfo.role_name == "Agent" ? "Apply for Out of Office" : "Application and Approval of OOOs"}</h6>
                    </div>       
                </div>
            </div>
            <div className='card mb-4' style={{margin:userInfo.role_name == "Agent" ?"30px 0" :"0px 0px", border:"0px"}}>
                {(userInfo.role_name == "Agent Supervisor" || userInfo.role_name == "Administrator") &&<div style={{background:"white", zIndex:"999"}}>
                    <ul className="nav nav-tabs" style={{margin:"20px 30px 0px 30px", border:"0"}}>
                         <li className="nav-item">
                            <a className={page === "Approval" ? "nav-link active": "nav-link b2b-tab-nav-link"} aria-current="page" href="#" onClick={()=> setPage("Approval")}>Approval List</a>
                        </li>
                        <li className="nav-item">
                            <a className={page === "Application" ? "nav-link active": "nav-link b2b-tab-nav-link"} aria-current="page" href="#" onClick={()=> setPage("Application")}>Apply OOO</a>
                        </li> 
                    </ul>
                </div>}
                {page == "Application" && 
                            <div className="container-fluid">   
                                <div className='card shadow mb-4' style={{borderRadius:"0"}}>
                                        <div className='card-body'>
                                            <div className="row">
                                                <div className="col-md-8">
                                                        <div style={{marginBottom:"20px", fontSize:"16px"}}><span style={{color:"red"}}>*</span> = Mandatory. </div>
                                                        <div style={{display:"flex", columnGap:"50px"}}>
                                                            <div>
                                                                <p style={{fontSize:"14px", marginBottom:"15px"}}>From Date:<span style={{color:"red"}}>*</span></p>
                                                                <DatePicker 
                                                                onChange={(date) => {
                                                                    setFromDate(date)
                                                                }} 
                                                                selected={from_date}
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="Select Date"
                                                                dropdownMode="select"
                                                                minDate={tomorrow}
                                                                autoComplete="off"/>  
                                                            </div>
                                                            <div>
                                                                <p style={{fontSize:"14px", marginBottom:"15px"}}>To Date:<span style={{color:"red"}}>*</span></p>
                                                                <DatePicker 
                                                                onChange={(date) => {
                                                                    setToDate(date)
                                                                }} 
                                                                selected={to_date}
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="Select Date"
                                                                minDate={tomorrow}
                                                                dropdownMode="select"
                                                                autoComplete="off"/>  
                                                            </div>
                                                        </div>
                                                        <div style={{marginTop:"20px"}}>
                                                            <div><label style={{fontSize:"14px", marginBottom:"15px"}}>Reason for OOO:<span style={{color:"red"}}>*</span></label></div>
                                                            <div><textarea value={remark} maxLength ="2000" rows="7" style={{width:"100%"}} onChange={(e) => setRemark(e.target.value)}/></div>
                                                        </div>
                                                        {<div style={{marginTop:"20px"}}>
                                                            <button style={{borderRadius:"4px", padding:"5px 10px", fontSize:"16px",background:"black", color:"white"}} onClick={submitOOO}>
                                                                Apply
                                                            </button>
                                                        </div>}
                                                </div>
                                                <div className="col-md-4" style={{borderLeft:"1px solid #DEDEDE", paddingLeft:"22px"}}>
                                                    <h6 className="black bold">Last 3 OOOs</h6>
                                                    <div style={{display:"flex", flexDirection:"column", marginTop:"20px"}}>
                                                        {ooos && ooos.length > 0 && ooos.map((item, index) => {
                                                            if(index < 3)
                                                            return (
                                                                <div className='card' style={{marginBottom:"20px"}}>
                                                                    <div className='card-body'>
                                                                        <div>
                                                                            {/*<div style={{marginBottom:"20px"}}><b className="black" style={{fontSize:"18px"}}>Service-level Agreement</b></div>*/}
                                                                            <div className="flex" style={{marginBottom:"20px"}}>
                                                                                <div>
                                                                                    <div className='black' style={{fontSize:"18px"}}><b>{moment(item.ooo_start_date).format("DD MMM YYYY")} - {moment(item.ooo_end_date).format("DD MMM YYYY")} </b></div>
                                                                                    <div>{item.ooo_remark}</div>
                                                                                </div>
                                                                                {item.status !== "Waiting Approval" && <div style={{order:2, marginLeft:"auto", color:"black", cursor:"pointer"}} onClick={(e) => removeOOO(item.id)}>
                                                                                    <BsTrash2Fill/>
                                                                                </div>}
                                                                            </div>
                                                                            <div style={{display:"flex", marginBottom:"10px"}}>
                                                                                
                                                                                <div>
                                                                                    <div className='black' style={{fontSize:"14px"}}><b>Status:</b></div>
                                                                                    <div className='bold' style={{fontSize:"18px", color: item.status == "Approved" ? "#32CD32": item.status == "Waiting Approval" ? "#FDDA0D": "red"}}>{item.status}</div>
                                                                                </div>
                                                                                
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}

                                                        {(!ooos || ooos.length == 0) && <div>You have no OOO request yet!</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                
                                </div>
                            </div>
                }
                {page == "Approval" &&
                    <ApprovalList/>
                }
            </div>
        </div>
    );
}

export default OutOfOffice;