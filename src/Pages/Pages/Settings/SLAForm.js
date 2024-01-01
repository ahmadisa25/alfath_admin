import React, {useState, useEffect, useRef} from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import Overlay from '../../../Components/Overlay';
import { InputSwitch } from 'primereact/inputswitch';
import { useParams } from 'react-router-dom';
import { findIndex, last, maxBy } from 'lodash';
import {IoMdAddCircle} from 'react-icons/io';
import {AiFillCloseCircle, AiOutlineDelete} from 'react-icons/ai';
import { permissionCheck } from '../../../Utils/Utils';
import {
    useNavigate
} from "react-router-dom";
import { createSLA, getSLA, updateSLA } from '../../../Service/SLAService';
import { getAllSupervisors } from '../../../Service/AgentService';


const { $ } = window;  
let agent_timer_id = -1; 
const SLAForm = () => {
    const { sla_id } = useParams();
    let { userInfo } = useSelector(state => state.auth);
    const [last_config_id, setLastConfigId] = useState(1);
    const [sla_config, setSLAConfig] = useState([
        { id: 1,
            priority: "Urgent",
            respond_within_value: 0,
            respond_within_units: "",
            resolve_within_value: 0,
            resolve_within_units: "",
            operational_hours: ""},
            { id: 2,
                priority: "High",
                respond_within_value: 0,
                respond_within_units: "",
                resolve_within_value: 0,
                resolve_within_units: "",
                operational_hours: ""},
            { id: 3,
                priority: "Medium",
                respond_within_value: 0,
                respond_within_units: "",
                resolve_within_value: 0,
                resolve_within_units: "",
                operational_hours: ""},
            { id: 4,
                priority: "Low",
                respond_within_value: 0,
                respond_within_units: "",
                resolve_within_value: 0,
                resolve_within_units: "",
                operational_hours: ""}
    ])
    const [sla_enabled, setSLAEnabled] = useState(false);
    const [state, setState] = useState({ processing : false, agents:[], isAgentFocus:false });
    const {agents, isAgentFocus} = state;
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({ defaultValues: { name:"", description:"", escalated_to:"", escalated_to_name:""} });
    
    const onAddNewConfig = () => {
        let config_id = last_config_id + 1;
        sla_config.push({ id: config_id,
            priority: "",
            respond_within_value: 0,
            respond_within_units: "",
            resolve_within_value: 0,
            resolve_within_units: "",
            operational_hours: ""},
            );

        setSLAConfig(sla_config);
        //setLastConfigId(config_id);
    }

    const onDeleteConfig = (config_id) => {
        const search_result = findIndex(sla_config, {id: config_id});
        if(search_result >=0){
            const arr = sla_config.filter((item, index) => index !== search_result);
            setSLAConfig(arr);
        } 
    }

    const onChangeAgent = (e) => {
        if (e.target.value.length) {
            clearTimeout(agent_timer_id);
            agent_timer_id = setTimeout(() => getAllSupervisors(e.target.value).then((res) => {
            setState({ ...state, isAgentFocus: true, agents: res.data });
            }), 500);
        } else {
            clearTimeout(agent_timer_id);
            agent_timer_id = setTimeout(() => {
                setValue("escalated_to", null); 
                setValue("escalated_to_name", null);
            }, 500);
            //reset({ agent_supervisor_id: null});
            //setValue('assigned_agent', "");
            //setValue('assigned_agent_name', "");
            setState({ ...state, isAgentFocus: true, agents: [] });
        }
    }

    const onSelectAgent = (item) => {
        setValue('escalated_to', item.agent_id);
        setValue('escalated_to_name', item.agent_name);
        setState({ ...state, isAgentFocus: false, agents:[] });
    };

    const onFormSubmit = (data) => {
        setState({...state, processing:true})
        const user_input = Object.assign({}, data, {sla_enabled});
        user_input['config'] = JSON.stringify(sla_config);
        delete user_input['escalated_to_name'];
        if(!sla_id){
            createSLA(user_input).then(res => {
                let stats = res.data.status||res.status
                if(stats == 200){
                    setState({...state, processing:false})
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: "A new SLA has been created!"
                         }).then( () => navigate('/sla-settings'));   
                } else {
                    setState({...state, processing:false})
                    Swal.fire({
                        icon: 'error',
                        title: 'SLA Creation Failed!',
                        text: res.data.message
                     });
                } 
            }).catch(err => {
                setState({...state, processing:false})
                let msg = "There's an error in processing your request. Please try again or contact support";
                if(err.response && err.response.data && err.response.data.message) msg = err.response.data.message;
                Swal.fire({
                    icon: 'error',
                    title: "error",
                    text: msg
                 });
            })
        } else{
            updateSLA(sla_id, user_input).then(res => {
                if(res.status == 200){
                    setState({...state, processing:false})
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: "An SLA has been updated!"
                         }).then( () => navigate('/sla-settings'));
                    
                } else {
                    setState({...state, processing:false})
                    Swal.fire({
                        icon: 'error',
                        title: 'SLA Update Failed!',
                        text: res.data.message
                     });
                } 
            }).catch(err => {
                setState({...state, processing:false})
                Swal.fire({
                    icon: 'error',
                    title: "error",
                    text: "There's an error in processing your request. Please try again or contact support"
                 });
            })
        }
    }

    const updateSLAConfigDetail = (config_id, key, value) => {
        const search_result = findIndex(sla_config, {id: config_id});
        if(search_result >=0){
            const updated_config = sla_config.map((input) =>
                input.id === config_id ? { ...input, [key]: value } : input
            );
            //const config_arr = sla_config;
            //config_arr[search_result][key] = value;
            setSLAConfig(updated_config);
        } 

       
    }

    useEffect(() => {
        if(userInfo.access){
            if(userInfo.access.settings){
                if(!userInfo.access.settings.can_create) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "You're not allowed to access that page!"
                     })
                    navigate('/');
                }
            }
        }
        if(sla_id){
            if(permissionCheck(userInfo, "settings", "update")){
                getSLA(sla_id).then(res => {
                    if(res.status == 200){
                        Object.keys(res.data.data).forEach(key => {
                            setValue(key, res.data.data[key]);
                            if(key == "sla_enabled") setSLAEnabled(res.data.data[key])
                            else if(key == "config") {
                                if(!res.data.data[key] || res.data.data[key].length <=0 || res.data.data[key] === "[]"){
                                    setSLAConfig([]);
                                } else {
                                    let config = JSON.parse(res.data.data[key]);
                                    let config_id = maxBy(config, 'id').id;
                                    setSLAConfig(config);
                                    //setLastConfigId(config_id);
                                }
                               
                            }
                        })
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed to get SLA data"
                         })
                        navigate('/');
                    }
                }).catch(err => {
                    console.log(err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "Failed to get SLA data"
                     })
                    navigate('/');
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "You're not allowed to access that page!"
                 })
                navigate('/');
            }
        }
    }, []);


    return(
        <div className="content-wrapper" style={{height:"100vh"}}>
             <form name="form-sla" onSubmit={handleSubmit(onFormSubmit)}>
            <div className="row">
                <div className="col-lg-12" style={{paddingBottom:"20px", borderBottom: "1px solid #D4D4D4"}}>
                    <div className='row'>
                        <div className='col-md-6' style={{display:"flex"}}>
                            <div>
                                <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/sla-settings')}>arrow_back</span>
                            </div>
                            <div>
                                <h4 className='fw-500' style={{paddingLeft: 25, color:"black"}}>SLA Configuration</h4>
                                <h6 style={{paddingLeft: 25, color:"black"}}>Setup for Service Level Agreements</h6>
                            </div>       
                        </div>
                        <div className='col-md-6'>
                                                <button type="submit" class="btn right" style={{padding: "0.5em 4em", background:"#FAA819", color:"white"}}>
                                                    <div style={{display: "flex", alignItems:"center", justifyContent:"center"}}>
                                                        <div>Save</div>
                                                    </div>
                                                </button>
                        </div>
                    </div>

                </div>
                
            </div>
            <div style={{padding:"20px 60px 0 60px"}}><span style={{color:"red"}}>*</span><span>= Mandatory.</span></div>
            <div className="row" style={{ height: "100vh"}}>
                    <div className='col-md-12'>
                                <div>
                                        <div>
                                            <div style={{padding: "40px 60px 0 60px"}}>
                                                <div className="row">
                                                    <div className='full-width' style={{padding: "0 20px"}}>
                                                        <Overlay display={state.processing} />
                                                        <>
                                                            <div className='form-group'>
                                                                <label className="bold black">SLA Name<span style={{color:"red"}}>*</span></label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <input {...register('name', { required: { value: true, message: 'Name is required' } })} className='inputLogin' />
                                                                </div>
                                                                {errors.name && <span className='text-danger'>{errors.name.message}</span>}
                                                            </div>
                                                            <div className='form-group'>
                                                                <label className="bold black"> SLA Description<span style={{color:"red"}}>*</span></label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <textarea {...register('description', { required: { value: true, message: 'Description is required' } })} className='inputLogin' />
                                                                </div>
                                                                {errors.description && <span className='text-danger'>{errors.description.message}</span>}
                                                            </div>
                                                        </>
                                                    </div>
                                                </div>
                                                <div className='form-group' style={{display:"flex", alignItems:"center", columnGap:"15px", marginTop:"10px"}}>
                                                                <label className="bold black">Set SLA as Active?</label>
                                                                <InputSwitch checked={sla_enabled} onChange={(e) => setSLAEnabled(!sla_enabled)} />
                                                </div>
                                                <div className="col-lg-12 col-md-12 col-12" id="po-table"> 
                                                <div>
                                                    <table className="table table-condensed" style={{ marginTop: 16}}>
                                                        <thead>
                                                            <tr>
                                                                <th className='b2b-th'>Priority</th>
                                                                <th className='b2b-th'>Respond Within</th>
                                                                <th className='b2b-th'>Resolve Within</th>
                                                                    <th className='b2b-th'>Operational Hrs</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {sla_config && sla_config.length > 0 && sla_config.map(item => {
                                                                return(
                                                                    <tr>
                                                                        <td>
                                                                            <div className='form-group'>
                                                                                {/*<div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                                    <input type="text" className='inputLogin' onChange={(e) => updateSLAConfigDetail(item.id, "priority", e.target.value)} value={item.priority} min="1" disabled/>
                                                                                </div>*/}
                                                                                <div className="black bold" style={{padding:"10px 15px"}}>
                                                                                    {item.priority}
                                                                                </div>

                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div style={{display: "flex", columnGap:"5px"}}>
                                                                                <div className='form-group'>
                                                                                    <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                                        <input type="text" className='inputLogin' onChange={(e) => updateSLAConfigDetail(item.id, "respond_within_value", e.target.value)} value={item.respond_within_value} min="1" required/>
                                                                                    </div>
                                                                                </div>
                                                                                <div className='form-group'>
                                                                                    <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                                        <select className="form-select inputLogin" aria-label="Default select example" onChange={(e) => updateSLAConfigDetail(item.id, "respond_within_units", e.target.value)} value={item.respond_within_units} style={{padding:"12px"}} required>
                                                                                            <option value="">Select</option>
                                                                                            <option value="Minutes">Minutes</option>
                                                                                            <option value="Hours">Hours</option>
                                                                                            <option value="Days">Days</option>
                                                                                            <option value="Months">Months</option>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div style={{display: "flex", columnGap:"5px"}}>
                                                                                <div className='form-group'>
                                                                                    <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                                                <input type="text" className='inputLogin' onChange={(e) => updateSLAConfigDetail(item.id, "resolve_within_value", e.target.value)} value={item.resolve_within_value} min="1" required/>
                                                                                            </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className='form-group'>
                                                                                    <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                                        <select className="form-select inputLogin" aria-label="Default select example" onChange={(e) => updateSLAConfigDetail(item.id, "resolve_within_units", e.target.value)} value={item.resolve_within_units} style={{padding:"12px"}} required>
                                                                                            <option value="">Select</option>
                                                                                            <option value="Minutes">Minutes</option>
                                                                                            <option value="Hours">Hours</option>
                                                                                            <option value="Days">Days</option>
                                                                                            <option value="Months">Months</option>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div style={{display: "flex", columnGap:"15px", alignItems:"center"}}>
                                                                                <div className='form-group'>
                                                                                    <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                                        <select className="form-select inputLogin" aria-label="Default select example" style={{padding:"12px"}} onChange={(e) => updateSLAConfigDetail(item.id, "operational_hours", e.target.value)} value={item.operational_hours} required>
                                                                                            <option value="">Select</option>
                                                                                            <option value="Business Hours">Business Hours</option>
                                                                                            <option value="All Calendar Days">All Calendar Days</option>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>
                                                                                {/*<div style={{display:"flex", alignItem: "center", columnGap: "10px", paddingBottom:"20px"}}>
                                                                                    <div style={{color: "red", cursor:"pointer"}} onClick={(e) => onDeleteConfig(item.id)}><AiFillCloseCircle/></div>
                                                                </div> */}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })}
                                                            
                                                        </tbody>
                                                    </table>
                                                    {/*(!sla_config || sla_config.length <= 0) && 
                                                                <div style={{textAlign:"center"}}>
                                                                    <span> No condition is set. Maybe you wanna add a new condition? </span>
                                                                </div>
                                                        */}
                                                    {/*<div className='form-group' style={{marginTop:"20px"}}>
                                                        <div style={{display:"flex", alignItem: "center", columnGap: "10px", cursor: "pointer"}} onClick={onAddNewConfig}>
                                                            <div style={{color: "green"}}><IoMdAddCircle/></div>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <span className="modena-orang">Add a new condition</span>
                                                            </div>
                                                            </div>
                                                </div>*/}

                                                    <div className="form-group" style={{marginTop:"30px"}}>
                                                        <label className="black"><b>Select a supervisor that will get escalation notification when these conditions are not met:</b>&nbsp;<span style={{color:"red"}}>*</span></label>
                                                        <input onClick={() => setState({ ...state, isAgentFocus: true})} id="escalated_to_name" {...register("escalated_to_name", { required: { value: true, message: 'Escalation officer is required!' } })} placeholder="Type min 3 char" className='form-control' onKeyUp={onChangeAgent} autoComplete="off"/>
                                                        {errors.escalated_to_name && <span className='text-danger'>{errors.escalated_to_name.message}</span>}
                                                        {agents && agents.length > 0 && isAgentFocus &&
                                                            <div className='mt-1 p-2' style={{ zIndex: 1, position: 'absolute', background: '#fff', border: '1px solid #ccc', borderRadius: 5, width: '97.2%', maxHeight: '375px', overflow: "auto", overflowY: "scroll" }}>
                                                                {
                                                                    agents.map((item, i) =>
                                                                        <div onClick={() => onSelectAgent(item)} key={i} className='d-flex align-items-center w-100 p-1 mb-1' style={{ border: '1px solid #ccc', borderRadius: 5, cursor: 'pointer' }}>
                                                                        <span className='ml-2'>{item.agent_name}</span>
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                            }
                                                    </div>
                                                </div>
                                                {/*<div>
                                                    <h6 className="black bold">Choose when this policy must be enforced</h6>
                                                    <div style={{display: "flex", columnGap: "20px"}}>
                                                        <div className="form-check" style={{display:"flex", alignItems:"center", verticalAlign: "center"}}>
                                                            <input type="radio" name="inlineRadioOptions" id="inlineRadio1" value="option1" style={{marginRight:"10px"}}/>
                                                            <label className="form-check-label" for="inlineRadio1">Match <b>ALL</b> of the following:</label>
                                                        </div>
                                                        <div className="form-check" style={{display:"flex", alignItems:"center", verticalAlign: "center"}}>
                                                            <input type="radio" name="inlineRadioOptions" id="inlineRadio1" value="option1" style={{marginRight:"10px"}}/>
                                                            <label className="form-check-label" for="inlineRadio1">Match <b>ANY</b> of the following:</label>
                                                        </div>
                                                    </div>
                                                    <div className='form-group' style={{marginTop:"20px", paddingLeft:"40px"}}>
                                                        <div style={{display:"flex", alignItem: "center", columnGap: "10px"}}>
                                                            <div style={{color: "red"}}><AiFillCloseCircle/></div>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <input/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                    </div>
                                                    <div className='form-group' style={{marginTop:"20px"}}>
                                                        <div style={{display:"flex", alignItem: "center", columnGap: "10px"}}>
                                                            <div style={{color: "green"}}><IoMdAddCircle/></div>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <span className="modena-orang">Add a new condition</span>
                                                            </div>
                                                            </div>
                </div>*/}
                                                        
                                            </div>
                                            </div>

                                        </div>
                                    </div>

                        {/*current_page == ESCALATION_HANDLING &&
                            <div style={{padding:"40px"}}>
                                <h5 className="black bold">What happens when this SLA is violated?</h5>
                                <div style={{paddingLeft: "20px", marginTop:"20px"}}>
                                    <h6 className="black">Execute these rules when tickets are <b>not responded</b> in time:</h6>
                                    <div className='form-group' style={{marginTop:"20px", paddingLeft:"40px"}}>
                                        <div style={{display:"flex", alignItem: "center", columnGap: "10px"}}>
                                            <div style={{color: "red"}}><AiFillCloseCircle/></div>
                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                    <input/>
                                                </div>
                                            </div>  
                                    </div>
                                    <div className='form-group' style={{marginTop:"20px"}}>
                                        <div style={{display:"flex", alignItem: "center", columnGap: "10px"}}>
                                            <div style={{color: "green"}}><IoMdAddCircle/></div>
                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                    <span className="modena-orang">Add a new condition</span>
                                                </div>
                                            </div>
                                    </div>
                                </div>
                                <div style={{paddingLeft: "20px", marginTop:"20px"}}>
                                    <h6 className="black">Execute these rules when tickets are <b>not resolved</b> in time:</h6>
                                    <div className='form-group' style={{marginTop:"20px", paddingLeft:"40px"}}>
                                        <div style={{display:"flex", alignItem: "center", columnGap: "10px"}}>
                                            <div style={{color: "red"}}><AiFillCloseCircle/></div>
                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                    <input/>
                                                </div>
                                            </div>  
                                    </div>
                                    <div className='form-group' style={{marginTop:"20px"}}>
                                        <div style={{display:"flex", alignItem: "center", columnGap: "10px"}}>
                                            <div style={{color: "green"}}><IoMdAddCircle/></div>
                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                    <span className="modena-orang">Add a new condition</span>
                                                </div>
                                            </div>
                                    </div>
                                </div>
                            </div>
                    
                           
                    */}

                        {/*current_page == BUSINESS_HOURS_SETUP && 
                                    
                                    <div>
                                    <div>
                                        <div className='modal-header'>
                                            <h5 className="modal-title black bold">Business Hours Setup</h5>
                                            <div className='right'>
                                                <div class="form-check" style={{display: "flex", alignItems: "center", columnGap: "10px "}}>
                                                    <B2bCheckbox/>
                                                Active
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{padding: "40px 60px 0 60px"}}>
                                            <div className="row">
                                                <div className='full-width' style={{padding: "0 20px"}}>
                                                    <Overlay display={state.processing} />
                                                    <>
                                                        <div className='form-group'>
                                                            <label className="bold black">Name</label>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                            <input {...register('name', { required: { value: true, message: 'Name is required' } })} className='inputLogin' />
                                                            </div>
                                                            {errors.name && <span className='text-danger'>{errors.name.message}</span>}
                                                        </div>
                                                        <div className='form-group'>
                                                            <label className="bold black"> Description</label>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                            <textarea {...register('description', { required: { value: true, message: 'Description is required' } })} className='inputLogin' />
                                                            </div>
                                                            {errors.description && <span className='text-danger'>{errors.description.message}</span>}
                                                        </div>
                                                        <div style={{margin:"10px 0 30px 0"}}>
                                                            <h6 className="black bold">Service Desk Hours</h6>
                                                            <div style={{display:"flex", columnGap: "20px", marginLeft:"20px"}}>
                                                                <div className="form-check" style={{paddingTop:"10px"}}>
                                                                    <input className="form-check-input" type="radio" value="" id="flexCheckDefault"/>
                                                                    <label className="form-check-label" for="flexCheckDefault">
                                                                        24 hrs x 7 days
                                                                    </label>
                                                                </div>
                                                                <div className="form-check" style={{paddingTop:"10px"}}>
                                                                    <input className="form-check-input" type="radio" value="" id="flexCheckDefault"/>
                                                                    <label className="form-check-label" for="flexCheckDefault">
                                                                        Select working days/hours
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        
                                                    </>
                                                </div>
                                            </div>

                                            <div style={{paddingLeft:"6px"}}> 
                                                <div style={{display: "flex", columnGap:"55px", width:"100%"}}>
                                                    <div className="form-check" style={{paddingTop:"10px"}}>
                                                            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault"/>
                                                            <label className="form-check-label" for="flexCheckDefault">
                                                                Monday
                                                            </label>
                                                    </div>

                                                    <div style={{display: "flex", columnGap:"5px"}}>
                                                            <div className='form-group'>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                    <select className="form-select inputLogin" aria-label="Default select example">
                                                                        <option selected>30</option>
                                                                        <option value="1">One</option>
                                                                        <option value="2">Two</option>
                                                                        <option value="3">Three</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className='form-group'>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                    <select className="form-select inputLogin" aria-label="Default select example">
                                                                        <option selected>Mins</option>
                                                                        <option value="1">One</option>
                                                                        <option value="2">Two</option>
                                                                        <option value="3">Three</option>
                                                                    </select>
                                                                </div>
                                                        </div>
                                                    </div>
                                                    <div style={{paddingTop:"10px"}}>to</div>
                                                    <div style={{display: "flex", columnGap:"5px"}}>
                                                        <div className='form-group'>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <select className="form-select inputLogin" aria-label="Default select example">
                                                                    <option selected>30</option>
                                                                    <option value="1">One</option>
                                                                    <option value="2">Two</option>
                                                                    <option value="3">Three</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className='form-group'>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <select className="form-select inputLogin" aria-label="Default select example">
                                                                    <option selected>Mins</option>
                                                                    <option value="1">One</option>
                                                                    <option value="2">Two</option>
                                                                    <option value="3">Three</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{paddingTop:"10px"}}>9 hours</div>
                                                </div>
                                            </div>
                                            <div className="mh-2">
                                                <div style={{display: "flex", justifyContent: "space-between", marginBottom: "10px"}}>
                                                    <h6 className="black bold">Yearly Holiday List</h6>
                                                </div>
                                                <div style={{display: "flex", justifyContent: "space-between", marginBottom: "10px"}}>
                                                    <div style={{display:"flex", columnGap:"10px"}}>
                                                        <div className='form-group'>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                    <select className="form-select inputLogin" aria-label="Default select example">
                                                                        <option selected>30</option>
                                                                        <option value="1">One</option>
                                                                        <option value="2">Two</option>
                                                                        <option value="3">Three</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className='form-group'>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                    <select className="form-select inputLogin" aria-label="Default select example">
                                                                        <option selected>May</option>
                                                                        <option value="1">One</option>
                                                                        <option value="2">Two</option>
                                                                        <option value="3">Three</option>
                                                                    </select>
                                                                </div>
                                                        </div>
                                                    </div>
                                                    <div style={{display:"flex", columnGap:"10px"}}>
                                                        <div className='form-group'>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                    <input placeholder="Search..." className='inputLogin' />
                                                                </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <table className="table table-condensed" style={{borderRadius:0, marginBottom: 0, padding: "0.4rem"}}>
                                                            <thead>
                                                                <tr>
                                                                    <th className='b2b-th'>Holidays</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                            <tr style={{borderBottom:"1px solid black"}}>
                                                                    <td >
                                                                    <div style={{display:"flex", alignItem: "center", columnGap: "10px"}}>
                                                                        <div style={{color: "red"}}><AiFillCloseCircle/></div>
                                                                        <div>
                                                                            <span>Idul Fitri</span>
                                                                        </div>
                                                                    </div>
                                                                   
                                                                    </td>
                                                            </tr>
                                                                
                                                            </tbody>
                                                </table>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                */} 
                                                        

                    </div>
            </div>
            </form>
        </div>
    )
}

export default SLAForm;