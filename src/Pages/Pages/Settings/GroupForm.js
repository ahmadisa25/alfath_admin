import React, {useState, useEffect, useRef} from 'react';
import { useSelector } from 'react-redux';
import 'react-quill/dist/quill.snow.css';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import Overlay from '../../../Components/Overlay';
import MTable from '../../../Components/MTable/MTable';
import ActionButton from '../../../Components/MTable/ActionButton';
import {FaEye} from 'react-icons/fa';
import { InputSwitch } from 'primereact/inputswitch';
import {AiFillCloseCircle} from 'react-icons/ai';
import ScrollTop from '../../../Components/ScrollTop';
import moment from 'moment';
import {
    useNavigate,useParams
} from "react-router-dom";
import { permissionCheck } from '../../../Utils/Utils';
import { getAllAgents, mapAgentToGroup } from '../../../Service/AgentService';
import { createGroup, getGroup, updateGroup } from '../../../Service/GroupService';
import { getAllHours, getHour } from '../../../Service/BusinessHoursService';
import { getAllSLAs, getSLA } from '../../../Service/SLAService';

const GENERAL_INFO = 1;
//const EMPLOYMENT_INFORMATION = 2;
//const GROUPS_ROLES = 3


const { $ } = window;
let supervisor_timer_id = -1;
//let group_timer_id = -1;
const GroupForm = () => {
    const tableBizHours = useRef();
    const tableSLA = useRef();
    let { userInfo } = useSelector(state => state.auth);
    //useEffect Entrance
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

        if(group_id){
            if(permissionCheck(userInfo, "settings", "update")){
                getGroup(group_id).then(res => {
                    if(res.status == 200){
                        Object.keys(res.data).forEach(key => {
                            setValue(key, res.data[key]);
                            if(key == "group_enabled") setGroupEnabled(res.data[key])
                            else if(key == "business_hours"){
                                setValue('business_hour_id', res.data[key].business_hour_id);
                                setBusinessHourName(res.data[key].business_hour);
                                //setPreviousBizHour(res.data[key].business_hour_id);
                            } else if(key == "agent_supervisor"){
                                setValue('agent_supervisor_id', res.data[key].id);
                                setValue('agent_supervisor_name', res.data[key].name);
                                setPreviousSupervisor(res.data[key].id);
                            } else if(key == "sla_name"){
                                setSLAName(res.data[key])
                            }
                        })
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed to get group data"
                         })
                        navigate('/');
                    }
                }).catch(err => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "Failed to get group data"
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
    },[])

    const [current_page, setCurrentPage] = useState(GENERAL_INFO);  

    const onChangeSupervisor = (e) => {
        if (e.target.value.length >= 3) {
            clearTimeout(supervisor_timer_id);
            supervisor_timer_id = setTimeout(() => getAllAgents({search:e.target.value}).then((res) => {
            setState({ ...state, isSupervisorFocus: true, agents: res.data.data });
            }), 500);
        } else {
            clearTimeout(supervisor_timer_id);
            //reset({ agent_supervisor_id: null});
            setValue('agent_supervisor_id', "");
            setState({ ...state, isSupervisorFocus: true, agents: [] });
        }
    }

    const onSelectSupervisor = (item) => {
        setValue('agent_supervisor_id', item.id);
        setValue('agent_supervisor_name', item.agent_name);
        setState({ ...state, isSupervisorFocus: false });
    };

    const onCloseModal = (e) => {
        e.preventDefault();
        setModalState("groups_list");
        setSelectedBusinessHour(null);
        $("#modal-business-hours").modal('hide');
    }

    const onCloseSLAModal = (e) => {
        e.preventDefault();
        setSLAModalState("sla_list");
        setSelectedSLA(null);
        $("#modal-sla").modal('hide');
    }

    const navigate = useNavigate();
    const [state, setState] = useState({ 
        processing : false, 
        isSupervisorFocus: false,
        agents:[],
        business_hours:[]
    });

    const { group_id } = useParams();
    const [modal_state, setModalState] = useState("groups_list");
    const [sla_modal_state, setSLAModalState] = useState("sla_list");
    const [biz_hours_selected, setBizHoursSelected] = useState('');
    const [group_enabled, setGroupEnabled] = useState(false);
    const [selected_sla, setSelectedSLA] = useState('');
    const [sla_name, setSLAName] = useState('');
    const [selected_business_hour, setSelectedBusinessHour] = useState('');
    const [business_hour_name, setBusinessHourName] = useState('');
    const {processing, agents, isSupervisorFocus} = state;
    const { register, handleSubmit, getValues, reset, setValue, formState: { errors } } = useForm({ defaultValues: { group_name:"", agent_supervisor_id: null, agent_supervisor_name:'', business_hour_id:''} });
    const [previous_supervisor_id, setPreviousSupervisor] = useState(0);
    //const [previous_biz_hour, setPreviousBizHour] = useState(0);

    const biz_hours_columns = [
        { id: 1, title: 'Business Hour Name', field: 'business_hour', sortable: true },
        { id: 2, title: 'Business Hour Description', field: 'business_hour_description', sortable: true, style:{width:300},
            render: data => {
                let text = data.business_hour_description;
                if(text.length > 30){
                    text = text.substring(0,20) + "...";
                } return text
            }
        },
        { id: 3, title: 'Active Status', field: 'business_hour_enabled', sortable: true,
            filter_text: "Please type in lower case: 'true' for active, 'false' for inactive",
            render: item => {
                return <InputSwitch checked={item.business_hour_enabled == true} disabled/>
            }
        },
        {
            id: 4,
            title: 'Action',
            style:{width:100},
            render: item => {
                return (
                    <div>
                        <ActionButton icon={<FaEye/>} link_color="#0099C3" click_action={(e) =>{
                            getHour(item.id).then(res => {
                                if(res.status == 200){
                                    setSelectedBusinessHour(res.data);
                                    setModalState("groups_view");
                                } else {
                                    alert('Business hour data retrieval failed');
                                }
                            })
                        }}
                        />
                    </div>
                );
            },
        }
    ];

    
    const sla_columns = [
        { id: 1, title: 'SLA Name', field: 'name', sortable: true },
        { id: 3, title: 'Active Status', field: 'sla_enabled', sortable: true,
        filter_text: "Please type in lower case: 'true' for active, 'false' for inactive",
        render: item => {
            return <InputSwitch checked={item.sla_enabled == true} disabled/>
        },
        },
        {
            id: 4,
            title: 'Action',
            style:{width:100},
            render: item => {
                return (
                    <div>
                        <ActionButton icon={<FaEye/>} link_color="#0099C3" click_action={(e) =>{
                            getSLA(item.id).then(res => {
                                if(res.status == 200){
                                    const config_data = Object.assign({}, res.data.data);
                                    config_data.config = JSON.parse(config_data.config);
                                    //console.log(config_data);
                                    setSelectedSLA(config_data);
                                    setSLAModalState("sla_view");
                                } else {
                                    alert('SLA data retrieval failed');
                                }
                            })
                        }}
                        />
                    </div>
                );
            },
        }
    ];

    const propsBizHours = { columns: biz_hours_columns, getData: getAllHours, showIndex: true };
    const propsSLA = { columns: sla_columns, getData: getAllSLAs, showIndex: true };

    //useEffect(() => console.log(selected_business_hour), [selected_business_hour]);

    const onReset = () => {
        reset({ group_name:"", agent_supervisor_id:null, agent_supervisor_name:'', business_hour_id:''});
        setGroupEnabled(false);
        setBusinessHourName('');
        setSelectedBusinessHour('');
        setState({
            processing: false,
            agents:[],
            business_hours:[]
        });
    }

    const onShowSLA = () => {
        tableSLA.current.reset();
        $('#modal-sla').modal('show');
    }

    
    const onShowBusinessHours = () => {
        tableBizHours.current.reset();
        $('#modal-business-hours').modal('show');
    }

    
    const onSelectSLA = () =>{
        setValue('sla_id', selected_sla.id);
        setSLAName(selected_sla.name);
        setSLAModalState("sla_list");
        setSelectedSLA(null);
        $("#modal-sla").modal('hide');

    }

    const onRemoveSLA = () =>{
        setValue('sla_id', '');
        setSLAName('');

    }

    const onSelectBusinessHour = () =>{
        setValue('business_hour_id', selected_business_hour.business_hour_id);
        setBusinessHourName(selected_business_hour.business_hour);
        setModalState("groups_list");
        setSelectedBusinessHour(null);
        $("#modal-business-hours").modal('hide');

    }
    

    const onRemoveBusinessHour = () =>{
        setValue('business_hour_id', '');
        setBusinessHourName('');

    }

    //useEffect(() => console.log(group_enabled), [group_enabled]);

    const onFormSubmit = (data) => {
        //console.log(data);
        setState({...state, processing:true})
        if(!data.agent_supervisor_id){
            Swal.fire({
                icon: 'error',
                title: 'Group creation failed!',
                text: "Please select a Supervisor from the list!"
            });
            return;
        }
        
        //console.log(group_enabled);
        const user_input = Object.assign({}, data, {group_enabled:group_enabled}); 
        //console.log(user_input);
        delete user_input.agent_supervisor_name;

        if(!user_input.business_hour_id) user_input.business_hour_id = null;
        if(!user_input.sla_id)  user_input.sla_id = null;
        if(user_input.sla_name) delete user_input.sla_name;
        if(!group_id){
            createGroup(user_input).then(res => {
                if(res.status == 200){
                    setState({...state, processing:false})
                    const map_input = {
                        "agent_id": user_input.agent_supervisor_id,
                        "group_id": res.data.group_id
                    }
                    mapAgentToGroup(map_input).then(res => {
                        if(res.status == 201)
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: "A new group has been created!"
                         }).then( () => navigate('/group-settings'));
                         else if(res.status == 200){
                            Swal.fire({
                                icon: 'success',
                                title: 'Success!',
                                text: "A group has been updated!"
                             }).then( () => navigate('/group-settings'));
                         }
                         else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Agent Supervisor Group Mapping Failed!',
                                text: "Please try again or contact support!"
                            }).then( () => navigate('/group-settings'));
                        }
                    });
                } else {
                    setState({...state, processing:false})
                    Swal.fire({
                        icon: 'error',
                        title: 'Group Creation Failed!',
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
            updateGroup(group_id, user_input).then(res => {
                if(res.status == 200){
                    setState({...state, processing:false})
                    if(previous_supervisor_id !== user_input.agent_supervisor_id){
                        const map_input = {
                            "agent_id": user_input.agent_supervisor_id,
                            "group_id": group_id
                        }
                        mapAgentToGroup(map_input).then(res => {
                            if(res.status == 201)
                            Swal.fire({
                                icon: 'success',
                                title: 'Success!',
                                text: "A group has been updated!"
                             }).then( () => navigate('/group-settings'));
                             else if(res.status == 200){
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Success!',
                                    text: "A group has been updated!"
                                 }).then( () => navigate('/group-settings'));
                             } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Agent Group Mapping Failed!',
                                    text: "Please try again or contact support!"
                                }).then( () => navigate('/group-settings'));
                            }
                        });
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: "A group has been updated!"
                         }).then( () => navigate('/group-settings'));
                    }
                    
                } else {
                    setState({...state, processing:false})
                    Swal.fire({
                        icon: 'error',
                        title: 'Group Update Failed!',
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
        }
        
    }
    
    return(
        <div className="content-wrapper" style={{height:"120vh"}}>
            <ScrollTop/>
            <div className="row" style={{ height: "120vh"}}>
                    <div className={'col-md-12'}>
                            <form name="form-group" onSubmit={handleSubmit(onFormSubmit)}>
                                        <div>
                                        <div className='row'>
                                            <div className='col-md-6' style={{display:"flex"}}>
                                                <div>
                                                    <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/group-settings')}>arrow_back</span>
                                                </div>
                                                <div>
                                                    <h4 className='fw-500' style={{paddingLeft: 25, color:"black"}}>{!group_id? "Add A New": "Edit"} Group</h4>
                                                    <h6 style={{paddingLeft: 25, color:"black"}}>{!group_id? "Configuration for the new group" : "Modify group data"}</h6>
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
                                        <div>
                                            <div style={{padding:"10px 60px"}}><span style={{color:"red"}}>*</span><span>= Mandatory.</span></div>
                                            <div style={{padding: "40px 60px 0 60px"}}>
                                           
                                                <div className="row">
                                                    <div className='full-width' style={{padding: "0 20px"}}>
                                                        <Overlay display={state.processing} />
                                                        <>
                                                    <div className='form-group'>
                                                        <label htmlFor='group_name' className="black"><b>Group Name</b>&nbsp;<span style={{color:"red"}}>*</span></label>
                                                        <input maxlength="500" id="group_name" {...register("group_name", {
                                                        required: 'Name is required!',
                                                        })} className='form-control' autoComplete="off"/>

                                                        {errors.group_name && <span className='text-danger'>{errors.group_name.message}</span>}
                                                    </div>

                                                    <div className='form-group'>
                                                        <label htmlFor='agent_supervisor_name' className="black"><b>Agent Supervisor</b>&nbsp;<span style={{color:"red"}}>*</span><i style={{fontSize:"16px"}}>--> type in lowercase only</i> </label>
                                                        <input onClick={() => setState({ ...state, isSupervisorFocus: true})} id="agent_supervisor_name" {...register("agent_supervisor_name", {
                                                        required: 'Supervisor is required!'})} placeholder="Type min 3 char" className='form-control' onKeyUp={onChangeSupervisor} autoComplete="off"/>

                                                        {errors.agent_supervisor_name && <span className='text-danger'>{errors.agent_supervisor_name.message}</span>}

                                                        {agents.length > 0 && isSupervisorFocus &&
                                                        <div className='mt-1 p-2' style={{ zIndex: 1, position: 'absolute', background: '#fff', border: '1px solid #ccc', borderRadius: 5, width: '97.2%', maxHeight: '375px', overflow: "auto", overflowY: "scroll" }}>
                                                            {
                                                                agents.map((item, i) =>
                                                                    <div onClick={() => onSelectSupervisor(item)} key={i} className='d-flex align-items-center w-100 p-1 mb-1' style={{ border: '1px solid #ccc', borderRadius: 5, cursor: 'pointer' }}>
                                                                    <span className='ml-2'>{item.agent_name} <b>({item.agent_user_id})</b></span>
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                        }
                                                    </div>

                                                    <div className='form-group' style={{display:"flex", alignItems:"center", columnGap:"15px", marginTop:"10px"}}>
                                                        <label className="bold black">Set Group as Active?</label>
                                                        <InputSwitch checked={group_enabled} onChange={(e) => setGroupEnabled(!group_enabled)} />
                                                    </div>

                                                    <div className='form-group' style={{display:"flex", alignItems:"center", columnGap:"15px", marginTop:"10px"}}>
                                                        {!getValues("business_hour_id") &&
                                                            <>
                                                                <label className="bold black">Choose Business Hours:</label>
                                                                <button type='button' className="btn" onClick={onShowBusinessHours} style={{cursor:"pointer", border:"1px solid black", background:"black", color:"white", borderRadius:"8px"}}>+ Add Business Hour</button>
                                                            </>
                                                        }
                                                        {getValues("business_hour_id") &&
                                                            <div style={{display:"flex", alignItems:"center", columnGap:"10px"}}>
                                                                <div><label className="bold black">Selected Business Hours:</label></div>
                                                                <div style={{display:"flex", alignItem: "center", columnGap: "10px", paddingBottom:"10px"}}>
                                                                    <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                        <span>{business_hour_name}</span>
                                                                    </div>
                                                                    <div style={{color: "red", cursor:"pointer"}} onClick={onRemoveBusinessHour}><AiFillCloseCircle/></div>
                                                                </div> 
                                                            </div>
                                                        }
                                                       
                                                    </div>
                                                    <div className='form-group' style={{display:"flex", alignItems:"center", columnGap:"15px", marginTop:"10px"}}>
                                                        {!getValues("sla_id") &&
                                                            <>
                                                                <label className="bold black">Choose Service-level Agreement:</label>
                                                                <button type='button' className="btn" onClick={onShowSLA} style={{cursor:"pointer", border:"1px solid black", background:"black", color:"white", borderRadius:"8px"}}>+ Add SLA</button>
                                                            </>
                                                        }
                                                        {getValues("sla_id") &&
                                                            <div style={{display:"flex", alignItems:"center", columnGap:"10px"}}>
                                                                <div><label className="bold black">Selected SLA:</label></div>
                                                                <div style={{display:"flex", alignItem: "center", columnGap: "10px", paddingBottom:"10px"}}>
                                                                    <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                        <span>{sla_name}</span>
                                                                    </div>
                                                                    <div style={{color: "red", cursor:"pointer"}} onClick={onRemoveSLA}><AiFillCloseCircle/></div>
                                                                </div> 
                                                            </div>
                                                        }
                                                       
                                                    </div>
                                                      {/*SLA Modal Select*/}
                                                      <div id="modal-sla" className="modal fade">
                                                        <div className="modal-dialog modal-lg" style={{ maxWidth: 1000 }}>
                                                            <div className="modal-content" style={{width:"120%"}}>
                                                                <div className="modal-header">
                                                                    <h5 className="modal-title">
                                                                        {sla_modal_state !== "sla_list" &&  
                                                                            <>
                                                                                <i className="fa fa-arrow-left" style={{cursor: "pointer"}} onClick={() => {
                                                                                    //tableSLA.current.refresh();
                                                                                    setSLAModalState("sla_list");
                                                                                    setSelectedSLA(null);
                                                                                }}></i>  
                                                                                &nbsp;
                                                                            </>
                                                                        }
                                                                        {sla_modal_state == "sla_list" ? "SLA List": selected_sla.name + " Details"}
                                                                    </h5>
                                                                    <button type="button" className="close" onClick={onCloseSLAModal} aria-label="Close">
                                                                        <span aria-hidden="true">&times;</span>
                                                                    </button>
                                                                </div>
                                                                <div className="modal-body">
                                                                    {sla_modal_state == "sla_list" && <MTable ref={tableSLA} {...propsSLA} />}
                                                                    {sla_modal_state == "sla_view" &&
                                                                        <>
                                                                            <div>
                                                                                <span style={{fontWeight: 700}}>Description:&nbsp; &nbsp;</span>
                                                                                <span>{selected_sla.description}</span>
                                                                            </div>
                                                                            <br/>
                                                                            <h6 className="bold">Configuration:</h6>
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
                                                                                    {selected_sla.config && selected_sla.config.length > 0 && selected_sla.config.map(item => {
                                                                                        return(
                                                                                            <tr>
                                                                                                <td>
                                                                                                    <div>
                                                                                                        {item.priority}
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td>
                                                                                                    <div>
                                                                                                        <span>{item.respond_within_value} {item.respond_within_units}</span>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td>
                                                                                                    <div>
                                                                                                        <span>{item.resolve_within_value} {item.resolve_within_units}</span>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td>
                                                                                                    <div>
                                                                                                        <span>{item.operational_hours}</span>
                                                                                                    </div>
                                                                                                </td>
                                                                                            </tr>
                                                                                        )
                                                                                    })}
                                                                                    
                                                                                </tbody>
                                                                            </table>
                                                                        </>
                                                                    }
                                                                </div>
                                                                <div className="modal-footer">
                                                                    <button className="btn btn-outline-dark" type='button' style={{ width: 150 }}  onClick={onCloseSLAModal}><i className="fa fa-times"></i> Close</button>{sla_modal_state === "sla_view" && 
                                                                        <>
                                                                            <button className="btn btn-success" type='button' style={{ width: 150 }} onClick={onSelectSLA}><i className="fa fa-check"></i> Pick This</button>
                                                                        </>
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/*End SLA Modal Select*/}
                                                    {/*Business Hour Modal Select*/}
                                                    <div id="modal-business-hours" className="modal fade">
                                                        <div className="modal-dialog modal-lg" style={{ maxWidth: 1000 }}>
                                                            <div className="modal-content" style={{width:"120%"}}>
                                                                <div className="modal-header">
                                                                    <h5 className="modal-title">
                                                                        {modal_state !== "groups_list" &&  
                                                                            <>
                                                                                <i className="fa fa-arrow-left" style={{cursor: "pointer"}} onClick={() => {
                                                                                    //tableBizHours.current.refresh();
                                                                                    setModalState("groups_list");
                                                                                    setSelectedBusinessHour(null);
                                                                                }}></i>  
                                                                                &nbsp;
                                                                            </>
                                                                        }
                                                                        {modal_state == "groups_list" ? "Business Hours List": selected_business_hour.business_hour + " Details"}
                                                                    </h5>
                                                                    <button type="button" className="close" onClick={onCloseModal} aria-label="Close">
                                                                        <span aria-hidden="true">&times;</span>
                                                                    </button>
                                                                </div>
                                                                <div className="modal-body">
                                                                    {modal_state == "groups_list" && <MTable ref={tableBizHours} {...propsBizHours} />}
                                                                    {modal_state == "groups_view" &&
                                                                        <>
                                                                            <div>
                                                                                <span style={{fontWeight: 700}}>Description:&nbsp; &nbsp;</span>
                                                                                <span>{selected_business_hour.business_hour_description}</span>
                                                                            </div>
                                                                            <br/>
                                                                            <h6 className="bold">Work Hours and Break Hours List:</h6>
                                                                            <table className="table table-condensed" style={{borderRadius:0, marginBottom: 0, padding: "0.4rem"}}>
                                                                                        <thead>
                                                                                            <tr>
                                                                                                <th className='b2b-th'>Day</th>
                                                                                                <th className='b2b-th'>Work Hour</th>
                                                                                                <th className='b2b-th'>Break Hour</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((item, i) => 
                                                                                                    <tr style={{borderBottom:"1px solid black"}}>
                                                                                                        <td>
                                                                                                            {item}
                                                                                                        </td>
                                                                                                        <td>
                                                                                                            {selected_business_hour[`${item.toLowerCase()}_from`] ? moment(selected_business_hour[`${item.toLowerCase()}_from`], 'HH:mm:ss').format('HH:mm') : "--"} -  {selected_business_hour[`${item.toLowerCase()}_to`]? moment(selected_business_hour[`${item.toLowerCase()}_to`], 'HH:mm:ss').format('HH:mm'):"--"}
                                                                                                        </td>
                                                                                                        <td>
                                                                                                            {selected_business_hour[`${item.toLowerCase()}_break_from`]?moment(selected_business_hour[`${item.toLowerCase()}_break_from`], 'HH:mm:ss').format('HH:mm'):"--"} -  {selected_business_hour[`${item.toLowerCase()}_break_to`]?moment(selected_business_hour[`${item.toLowerCase()}_break_to`], 'HH:mm:ss').format('HH:mm'):"--"}
                                                                                                        </td>
                                                                                                    </tr> 
                                                                                            )}
                                                                                            
                                                                                             
                                                                                        </tbody>
                                                                            </table>
                                                                        </>
                                                                    }
                                                                </div>
                                                                <div className="modal-footer">
                                                                    <button className="btn btn-outline-dark" type='button' style={{ width: 150 }}  onClick={onCloseModal}><i className="fa fa-times"></i> Close</button>{modal_state === "groups_view" && 
                                                                        <>
                                                                            <button className="btn btn-success" type='button' style={{ width: 150 }} onClick={onSelectBusinessHour}><i className="fa fa-check"></i> Pick This</button>
                                                                        </>
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/*End Business Hour Modal Select*/}
                                                        </>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                
                            </form>
                    </div>
            </div>
        </div>
    )
}

export default GroupForm;