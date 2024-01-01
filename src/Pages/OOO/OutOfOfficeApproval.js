import React, {useState, useEffect} from 'react';
import ScrollTop from '../../Components/ScrollTop';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getOOO, updateOOO } from '../../Service/OutOfOfficeService';
import Swal from 'sweetalert2';
import moment, {isBefore} from 'moment';
import Overlay from '../../Components/Overlay';
import { useSelector } from 'react-redux';

const OutOfOfficeApproval = () => {
    let { userInfo } = useSelector(state => state.auth);
    const { ooo_id } = useParams();
    const navigate = useNavigate();
    const [ooo_data, setOOOData] = useState({});
    const [ooo_status, setOOOStatus] = useState("Approved");
    const [state, setState] = useState({
        processing:false
    });
    useEffect(() => {
            if(userInfo.role_name != "Agent Supervisor" && userInfo.role_name != "Administrator"){
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "You are not allowed to access this page"
                });
                navigate('/');
            }
    }, [])

    useEffect(() => {
        getOOO(ooo_id).then(res => {
            if(res.status == 200){
                setOOOData(res.data);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "Failed in getting OOO data!"
                 }).then(() => {
                    navigate('/out-of-office')
                 })
            }
        })
    }, [ooo_id])

    const submitOOO = () => {
        setState({...state, processing: true});
        updateOOO(ooo_id, {
            status: ooo_status
        }).then(res => {
            console.log(res);
            if(res.status == 200){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: `Successfully ${ooo_status} Out of Office!`
                     }).then(() =>{
                       navigate('/out-of-office')
                     })
            }

            setState({...state, processing:false})
        })
    }

    const disableApplyButton = (userInfo, ooo_data) => {
        if(moment(ooo_data.ooo_start_date).isBefore(moment()) || moment(ooo_data.ooo_end_date).isBefore(moment())){
            return true;
        }
        if(ooo_data){
            if(ooo_data.status == "Waiting Approval"){
                if(userInfo.role_name == "Agent Supervisor"){
                    if(ooo_data.agent.agent_email === userInfo.email) return true;
                    if(ooo_data.group){
                        if(userInfo.agent_groups && userInfo.agent_groups.length > 0){
                            if(userInfo.agent_groups[0].group_id !== ooo_data.group.group_id) return true;
                        }
                    } else return true;
                   
                }
            } else if(ooo_data.status !== null && ooo_data.status !=="Waiting Approval") return true;
        }

        return false;
       
    }
    return( 
        <div className="content-wrapper" style={{height:"120vh"}}>
                     <Overlay display={state.processing} />
            <ScrollTop/>
            {/*<div className='row'>
                <div className='col-md-6' style={{display:"flex"}}>
                    <div>
                        <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/dashboard')}>arrow_back</span>
                    </div>
                    <div>
                        <h4 className='fw-500' style={{paddingLeft: 25, color:"black"}}>Out Of Office Detail</h4>
                        <h6 style={{paddingLeft: 25, color:"black"}}>Out Of Office Application Specifics</h6>
                    </div>       
                </div>
    </div>*/}
            <div className='card shadow mb-4' style={{margin:"20px 50px", border:"0px"}}>
                <div className='card-body'>
                <div style={{display:"flex", alignItems:"center", cursor: "pointer", marginBottom:"30px", fontSize:"16px", color:"#FAA819"}} onClick={() => navigate('/out-of-office')}>
                    <div><span class="material-icons" style={{fontSize:"18px", marginTop:"5px"}}>arrow_back</span></div>
                    <div>&nbsp; Back to Approval List</div>
                </div>
                    <div className="row">
                        <div className="col-md-8">
                                <div style={{display:"flex", columnGap:"50px"}}>
                                    <div>
                                        <p style={{fontSize:"14px", marginBottom:"15px"}}>From Date:</p>
                                        <DatePicker 
                                        disabled
                                        selected={ooo_data && ooo_data.ooo_start_date && new Date(`${ooo_data.ooo_start_date}T00:00:00`)}
                                        dateFormat="dd MMM yyyy"
                                        placeholderText="Select Date"
                                        dropdownMode="select"
                                        autoComplete="off"/>  
                                    </div>
                                    <div>
                                        <p style={{fontSize:"14px", marginBottom:"15px"}}>To Date:</p>
                                        <DatePicker 
                                         disabled
                                         selected={ooo_data && ooo_data.ooo_end_date && new Date(`${ooo_data.ooo_end_date}T00:00:00`)}
                                         dateFormat="dd MMM yyyy"
                                        placeholderText="Select Date"
                                        dropdownMode="select"
                                        autoComplete="off"/>  
                                    </div>
                                </div>
                                <div style={{marginTop:"20px"}}>
                                    <div><label style={{fontSize:"14px", marginBottom:"15px"}}>Reason for OOO:</label></div>
                                    <div><textarea maxLength ="2000" rows="7" style={{width:"100%"}} disabled value={ooo_data && ooo_data.ooo_remark}/></div>
                                </div>
                                <div style={{marginTop:"20px"}}>
                                    <button style={{borderRadius:"4px", padding:"5px 10px", fontSize:"16px",background:"black", color:"white"}}  onClick={submitOOO} disabled={disableApplyButton(userInfo, ooo_data)}>
                                        Apply
                                    </button>
                                </div>
                        </div>
                        <div className="col-md-4" style={{borderLeft:"1px solid #DEDEDE", paddingLeft:"22px"}}>
                            <div className='card' style={{border:"none"}}>
                                <div className = "card-header" style={{background:"white", fontWeight:"700", color:"black", border:0}}>
                                    OOO Information
                                </div>
                                <div className='card-body' style={{paddingTop:"0.75rem"}}>

                                    {ooo_data && ooo_data.status === "Waiting Approval" && ooo_data.agent && ooo_data.agent.agent_email !== userInfo.email && <div className='form-group full-width sd-form-group' style={{fontSize:"16px"}}>
                                        <label className="bold black" style={{fontSize:"0.8em"}}>Action</label>
                                        <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                            <select className="form-select inputLogin" aria-label="Default select example" style={{fontSize:"0.8em"}} value ={ooo_status} onChange={(e) => setOOOStatus(e.target.value)} disabled={ooo_data && ooo_data.agent_id == userInfo.agent_id || ooo_data.status !== "Waiting Approval"}>
                                                <option value="Approved">Approve</option>
                                                <option value="Rejected">Reject</option>
                                            </select>
                                        </div>
                                    </div>}
                                    {ooo_data && ooo_data.status == "Waiting Approval" &&  ooo_data.agent && ooo_data.agent.agent_email === userInfo.email && <div className='form-group full-width sd-form-group' style={{fontSize:"0.8em"}}>
                                        <label className="bold black" style={{fontSize:"1em"}}>Status</label>
                                        <div className='bold'>
                                            <span style={{fontSize:"1.1em", color: "#FDDA0D"}}>{ooo_data.status}</span>
                                        </div>
                                    </div>}
                                    {ooo_data && ooo_data.status != "Waiting Approval" &&<div className='form-group full-width sd-form-group' style={{fontSize:"0.8em"}}>
                                        <label className="bold black" style={{fontSize:"1em"}}>Status</label>
                                        <div className='bold'>
                                            <span style={{fontSize:"1.1em", color: ooo_data.status == "Approved" ? "#32CD32": ooo_data.status == "Waiting Approval" ? "#FDDA0D": "red"}}>{ooo_data.status}</span>
                                        </div>
                                    </div>}
                                    
                                    <div className='form-group full-width sd-form-group' style={{fontSize:"0.8em", marginTop:"20px"}}>
                                        <label className="bold black" style={{fontSize:"1em"}}>Requested By</label>
                                        <div>
                                            <span style={{fontSize:"1.1em"}}>{ooo_data && ooo_data.agent && ooo_data.agent.agent_name}</span>
                                        </div>
                                    </div>

                                    <div className='form-group full-width sd-form-group' style={{fontSize:"0.8em", marginTop:"20px"}}>
                                        <label className="bold black" style={{fontSize:"1em"}}>Requested At</label>
                                        <div>
                                            <span style={{fontSize:"1.1em"}}>{ooo_data && ooo_data.created_at && moment(ooo_data.created_at).format("DD MMM yyyy")}</span>
                                        </div>
                                    </div>
                                    
                                    {/*Katak Select2 di SFA Mobile
                                    <div className='form-group full-width sd-form-group' style={{fontSize:"16px"}}>
                                        <label className="bold black">Agent</label>
                                        <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                            <input className='inputLogin' disabled={userInfo.role_name =="Requester"}/>
                                        </div>
                                    </div>*/}
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    );
}

export default OutOfOfficeApproval;