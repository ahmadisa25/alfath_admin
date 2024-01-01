import React, {useState, useEffect, useRef} from 'react';
import { useSelector } from 'react-redux';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import Overlay from '../../../Components/Overlay';
import { id_flag } from '../../../Images';
import { RxCaretDown } from 'react-icons/rx';
import {AiFillCloseCircle} from 'react-icons/ai';
import { getModenaUserByEmail } from '../../../Service/UserService';
import { InputSwitch } from 'primereact/inputswitch';
import { filter } from 'lodash';
import {AiOutlineArrowUp} from 'react-icons/ai';
import {
    useNavigate,useParams
} from "react-router-dom";
import { permissionCheck, prunePhoneNumber } from '../../../Utils/Utils';
import { getAllGroups } from '../../../Service/GroupService';
import ScrollToTop from 'react-scroll-to-top';
import { createAgent, mapAgentToGroup, getAgent, unmapAgentFromGroup, updateAgent } from '../../../Service/AgentService';

const GENERAL_INFO = 1;
//const EMPLOYMENT_INFORMATION = 2;
//const GROUPS_ROLES = 3


const { $ } = window;
let email_timer_id = -1;
let group_timer_id = -1;
const AgentForm = () => {
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

        if(agent_id){
            if(permissionCheck(userInfo, "settings", "update")){
                getAgent(agent_id).then(res => {
                    if(res.status == 200){
                        Object.keys(res.data).forEach(key => {
                            setValue(key, res.data[key]);
                            if(key=="agent_signature") setAgentSignature(res.data[key])
                            else if(key == "agent_enabled") setAgentEnabled(res.data[key])
                        })
                        if(res.data.agent_groups.length){
                            let groups = res.data.agent_groups;
                            setValue("group_name", groups[0].group_name);
                            setValue("group", groups[0].group_id);
                            setPreviousGroup(groups[0].group_id);
                        }
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed to get agent data"
                         })
                        navigate('/');
                    }
                }).catch(err => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "Failed to get agent data"
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

    const navigate = useNavigate();

    const [state, setState] = useState({ 
        processing : false, 
        isEmailFocus: false,
        isGroupFocus: false,
        users:[],
        groups:[]
    });

    const { agent_id } = useParams();
    const [agent_enabled, setAgentEnabled] = useState(false);
    const [agent_signature, setAgentSignature] = useState("");
    const {processing, isEmailFocus, users, groups, isGroupFocus} = state;
    const { register, handleSubmit, getValues, reset, setValue, formState: { errors } } = useForm({ defaultValues: { agent_name: '', agent_user_id: "", agent_mobile_phone: '', agent_work_phone: '', agent_email:'', group:''} });
    const [previous_group_id, setPreviousGroup] = useState(0);

    const onReset = () => {
        reset({ agent_name: '', agent_user_id: "", agent_mobile_phone: '', agent_work_phone: '', agent_email:'', group:''});
        setAgentSignature('');
        setState({
            processing: false,
            isEmailFocus: false,
            isGroupFocus: false,
            users:[],
            groups:[]
        });
    }

    const onChangeGroup = (e) => {
        if (e.target.value.length >= 3) {
          clearTimeout(group_timer_id);
          group_timer_id = setTimeout(() => getAllGroups({filter:`is_deleted:false,group_name:${e.target.value},group_enabled:true`}).then((res) => {
            setState({ ...state, isGroupFocus: true, groups: res.data.data });
          }), 500);
        } else {
            clearTimeout(group_timer_id);
            setState({ ...state, isGroupFocus: true, groups: [] });
        }
    }

    const onSelectGroup = (item) => {
        setValue('group', item.id);
        setValue('group_name', item.group_name);
        setState({ ...state, isGroupFocus: false });
    };

    const deleteGroup = () => {
        const group_id = getValues("group");
        const swalWithBootstrapButtons = Swal.mixin({
        })
          
        swalWithBootstrapButtons.fire({
            icon: 'info',
            title: 'Delete Group',
            text: "Do you want to remove assignment from this group?",
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        }).then((result) => {
        if (result.isConfirmed) {
            unmapAgentFromGroup(agent_id, group_id).then(res => {
            if(res.data.status == 200){
                swalWithBootstrapButtons.fire(
                    'Removed!',
                    'Agent has been removed from that group.',
                    'success'
                ).then(r => {
                    setValue('group', null);
                    setValue('group_name', '');
                    setState({ ...state, isGroupFocus: false, groups:[] });
                });
            } else {
                const message = res.data.message || "Assignment removal failed";
                swalWithBootstrapButtons.fire(
                    'Error',
                    message,
                    'error'
                ) 
            }
            })
            
        } else if (
            result.dismiss === Swal.DismissReason.cancel
        ) {
            swalWithBootstrapButtons.fire(
            'Cancelled',
            'Agent deletion cancelled',
            'error'
            )
        }
        })
    }

    const onChangeEmail = (e) => {
        if (e.target.value.length >= 3) {
          clearTimeout(email_timer_id);
          email_timer_id = setTimeout(() => getModenaUserByEmail(e.target.value).then((res) => {
            let data = res.data.data;
            data = filter(data, (item) => {
                return item.employee_status == "Active"
            });
            setState({ ...state, isEmailFocus: true, users: data });
          }), 500);
        } else {
            clearTimeout(email_timer_id);
            reset({ agent_name: '', agent_user_id: "", agent_work_phone: ''});
            setState({ ...state, isEmailFocus: true, users: [] });
        }
    }

    const onSelectEmail = (item) => {
        setValue('agent_email', item.email);
        setValue('agent_name', item.employe_name);
        setValue('agent_user_id', item.emp_no);
        if(!item.phone || item.phone == "-"){
            setValue('agent_work_phone', 0)
        } else setValue('agent_work_phone', item.phone)
        setState({ ...state, isEmailFocus: false });
    };

    const onFormSubmit = (data) => {
        setState({...state, processing:true})
        const user_input = Object.assign({}, data, {agent_signature}, {agent_enabled});
        const group_id = user_input.group;
        delete user_input.group;
        delete user_input.group_name;
        user_input.agent_mobile_phone =  user_input.agent_mobile_phone && user_input.agent_mobile_phone > 0 ?  prunePhoneNumber(user_input.agent_mobile_phone): 0;
        user_input.agent_work_phone = user_input.agent_work_phone && user_input.agent_work_phone > 0 ? prunePhoneNumber(user_input.agent_work_phone).replace(/\s/g,''): 0;
        if(!agent_id){
            createAgent(user_input).then(res => {
                let stats = res.data.status||res.status
                if(stats == 200){
                    setState({...state, processing:false})
                    if(group_id){
                        const map_input = {
                            "agent_id": res.data.agent_id,
                            "group_id": group_id
                        }
                        mapAgentToGroup(map_input).then(res => {
                            if(res.status == 201)
                            Swal.fire({
                                icon: 'success',
                                title: 'Success!',
                                text: "A new agent has been created!"
                             }).then( () => navigate('/agent-settings'));
                             else if(res.status == 200){
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Success!',
                                    text: "An agent has been updated!"
                                 }).then( () => navigate('/agent-settings'));
                             }
                             else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Agent Group Mapping Failed!',
                                    text: "Please try again or contact support!"
                                }).then( () => navigate('/agent-settings'));
                            }
                        });
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: "A new agent has been created!"
                         }).then( () => navigate('/agent-settings'));
                    } 
                   
                } else {
                    setState({...state, processing:false})
                    Swal.fire({
                        icon: 'error',
                        title: 'Agent Creation Failed!',
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
            updateAgent(agent_id, user_input).then(res => {
                if(res.status == 200){
                    setState({...state, processing:false})
                    if(group_id && (previous_group_id !== group_id)){
                        const map_input = {
                            "agent_id": agent_id,
                            "group_id": group_id
                        }
                        mapAgentToGroup(map_input).then(res => {
                            if(res.status == 201)
                            Swal.fire({
                                icon: 'success',
                                title: 'Success!',
                                text: "An agent has been updated!"
                             }).then( () => navigate('/agent-settings'));
                             else if(res.status == 200){
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Success!',
                                    text: "An agent has been updated!"
                                 }).then( () => navigate('/agent-settings'));
                             } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Agent Group Mapping Failed!',
                                    text: "Please try again or contact support!"
                                }).then( () => navigate('/agent-settings'));
                            }
                        });
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: "An agent has been updated!"
                         }).then( () => navigate('/agent-settings'));
                    }
                    
                } else {
                    setState({...state, processing:false})
                    Swal.fire({
                        icon: 'error',
                        title: 'Agent Update Failed!',
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
    
    return(
        <div className="content-wrapper" style={{height:"120vh"}}>
             <ScrollToTop smooth color="orange" style={{background:"black", width:"9vw"}} component={
                <div style={{display:"flex", alignItems:"center", columnGap:"5px", justifyContent:"center"}}>
                    <div style={{color:"white"}}><AiOutlineArrowUp/></div>
                    <div>
                        <span style={{color:"white"}}>Back To Top</span>
                    </div>
                </div>
            }/>
            <div className="row" style={{ height: "120vh"}}>
                    {/*agent_id && agent_id > 0 && <div className='col-md-2' style={{borderRight: "2px solid #D0D5DD"}}>
                       <div className='flex flex-column' style={{rowGap: "30px", paddingTop: "50px", paddingLeft: "40px"}}>
                            <a onClick={() => setCurrentPage(GENERAL_INFO)}className={current_page !== GENERAL_INFO ?'b2b-inner-page-link' : 'b2b-inner-page-link-active'}>General Information</a>
                            <a onClick={() => setCurrentPage(EMPLOYMENT_INFORMATION)}className={current_page !== EMPLOYMENT_INFORMATION ?'b2b-inner-page-link' : 'b2b-inner-page-link-active'}>Employment Information</a>
                            <a onClick={() => setCurrentPage(GROUPS_ROLES)}className={current_page !== GROUPS_ROLES ?'b2b-inner-page-link' : 'b2b-inner-page-link-active'}>Groups & Roles</a>
                       </div>
                    </div>*/}
                    <div className={'col-md-12'}>
                            <form name="form-agent" onSubmit={handleSubmit(onFormSubmit)}>
                                        <div>
                                        <div className='row'>
                                            <div className='col-md-6' style={{display:"flex"}}>
                                                <div>
                                                    <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/agent-settings')}>arrow_back</span>
                                                </div>
                                                <div>
                                                    <h4 className='fw-500' style={{paddingLeft: 25, color:"black"}}>{!agent_id? "Add A New": "Edit"} Agent</h4>
                                                    <h6 style={{paddingLeft: 25, color:"black"}}>{!agent_id? "Configuration for the new agent" : "Modify agent data"}</h6>
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
                                        <div style={{padding:"10px 60px"}}><span style={{color:"red"}}>*</span><span>= Mandatory.</span></div>
                                        <div>
                                            <div style={{padding: "40px 60px 0 60px"}}>
                                                <div className="row">
                                                    <div className='full-width' style={{padding: "0 20px"}}>
                                                    <Overlay display={state.processing} />
                                                        <>
                                                    <div className='form-group'>
                                                        <label htmlFor='agent_email' className="black"><b>E-mail (From HRIS Sunfish)</b> <span style={{color:"red"}}>*</span><i style={{fontSize:"16px"}}>--> type in lowercase only</i></label>
                                                        <input maxLength="500" onClick={() => setState({ ...state, isEmailFocus: true})} id="agent_email" {...register("agent_email", {
                                                        required: 'Email is required!',
                                                        })} placeholder="Type min 3 char" className='form-control' onKeyUp={onChangeEmail} autoComplete="off" disabled={agent_id && agent_id >0}/>

                                                        {errors.agent_email && <span className='text-danger'>{errors.agent_email.message}</span>}

                                                        {users.length > 0 && isEmailFocus &&
                                                        <div className='mt-1 p-2' style={{ zIndex: 1, position: 'absolute', background: '#fff', border: '1px solid #ccc', borderRadius: 5, width: '97.2%', maxHeight: '375px', overflow: "auto", overflowY: "scroll" }}>
                                                            {
                                                            users.map((item, i) =>
                                                                <div onClick={() => onSelectEmail(item)} key={i} className='d-flex align-items-center w-100 p-1 mb-1' style={{ border: '1px solid #ccc', borderRadius: 5, cursor: 'pointer' }}>
                                                                <span className='ml-2'>{item.employe_name} <b>({item.email})</b></span>
                                                                </div>
                                                            )
                                                            }
                                                        </div>
                                                        }
                                                    </div>
                                                            <div className='form-group'>
                                                                <label className="bold black">Name</label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <input disabled {...register('agent_name', { required: { value: true, message: 'Name is required' } })} className='inputLogin' />
                                                                </div>
                                                                {errors.agent_name && <span className='text-danger'>{errors.agent_name.message}</span>}
                                                            </div>
                                                            <div className='form-group'>
                                                                <label className="bold black">NIK</label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <input disabled {...register('agent_user_id', { required: { value: true, message: 'NIK is required' } })} className='inputLogin' />
                                                                </div>
                                                                {errors.agent_user_id && <span className='text-danger'>{errors.agent_user_id.message}</span>}
                                                            </div>
                                                            <div className='form-group'>
                                                                <label className="bold black">Agent Signature</label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                    <ReactQuill theme="snow" value={agent_signature} onChange={setAgentSignature} />
                                                                </div>
                                                                {errors.nik && <span className='text-danger'>{errors.nik.message}</span>}
                                                            </div>
                                                            
                                                            <div className='row'>
                                                                <div className='col-md-6 col-sm-12'>
                                                                    <div className='form-group'>
                                                                        <label className="bold black">Work Number</label>
                                                                        <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                            <div style={{display:'flex', alignItems:'center', columnGap:"5px"}}>
                                                                                <div style={{paddingLeft:"10px"}}>
                                                                                    <img src={id_flag}/>
                                                                                </div>
                                                                                <RxCaretDown></RxCaretDown>
                                                                                <div>(+62)</div>
                                                                                <div style={{width:"100%"}}>
                                                                                    <input disabled {...register('agent_work_phone')} className='inputLogin' id="register-mobile-input" style={{width:"100%"}}/>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {errors.agent_work_phone && <span className='text-danger'>{errors.agent_work_phone.message}</span>}
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-6 col-sm-12'>
                                                                    <div className='form-group'>
                                                                        <label><b>Mobile Number</b> <span style={{color:"red"}}>*</span><i style={{fontSize:"16px"}}>--> numbers only</i></label>
                                                                        <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                            <div style={{display:'flex', alignItems:'center', columnGap:"5px"}}>
                                                                                <div style={{paddingLeft:"10px"}}>
                                                                                    <img src={id_flag}/>
                                                                                </div>
                                                                                <RxCaretDown></RxCaretDown>
                                                                                <div>(+62)</div>
                                                                                <div style={{width:"100%"}}>
                                                                                    <input maxLength="20" type="tel"  pattern="[0-9]+"{...register('agent_mobile_phone', { required: { value: true, message: 'Mobile Number is required' } })} className='inputLogin' id="register-mobile-input" style={{width:"100%"}}/>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {errors.agent_mobile_phone&& <span className='text-danger'>{errors.agent_mobile_phone.message}</span>}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className='form-group' style={{display:"flex", alignItems:"center", columnGap:"15px", marginTop:"10px"}}>
                                                                <label className="bold black">Set Agent as Active?</label>
                                                                <InputSwitch checked={agent_enabled} onChange={(e) => setAgentEnabled(!agent_enabled)} />
                                                            </div>
                                                            {getValues("group") > 0 && agent_id > 0 && 
                                                             <div className='form-group' style={{marginTop:"30px"}}>
                                                                <label htmlFor='group_name' className="black"><b>Assigned Group:</b></label>
                                                                <div style={{display:"flex", alignItem: "center", columnGap: "10px"}}>
                                                                    <div style={{color: "red", cursor:"pointer"}} onClick={deleteGroup}><AiFillCloseCircle/></div>
                                                                        <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                            <span>{getValues("group_name")}</span>
                                                                        </div>
                                                                </div>  
                                                             </div>
                                                            }
                                                            {(!getValues("group") || !agent_id) && 
                                                            <div className='form-group' style={{marginTop:"30px"}}>
                                                                <label htmlFor='group_name' className="black"><b>Assign a Group to the Agent</b></label>
                                                              
                                                                    <input onClick={() => setState({ ...state, isGroupFocus: true})} id="group_name" {...register("group_name")} placeholder="Type min 3 char" className='form-control' onKeyUp={onChangeGroup} autoComplete="off" />

                                                                    {errors.group_name && <span className='text-danger'>{errors.group_name.message}</span>}

                                                                    {groups.length > 0 && isGroupFocus &&
                                                                    <div className='mt-1 p-2' style={{ zIndex: 1, position: 'absolute', background: '#fff', border: '1px solid #ccc', borderRadius: 5, width: '97.2%', maxHeight: '375px', overflow: "auto", overflowY: "scroll" }}>
                                                                        {
                                                                    groups.map((item, i) =>
                                                                            <div onClick={() => onSelectGroup(item)} key={i} className='d-flex align-items-center w-100 p-1 mb-1' style={{ border: '1px solid #ccc', borderRadius: 5, cursor: 'pointer' }}>
                                                                            <span className='ml-2'>{item.group_name}</span>
                                                                            </div>
                                                                        )
                                                                        }
                                                                    </div>
                                                                    }
                                                                </div>
                                                            }
                                                        </>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                
                            </form>
                        {/*current_page == EMPLOYMENT_INFORMATION &&
                            <div style={{padding: "40px 60px 0 60px"}}>
                                <div className='form-group'>
                                    <label className="bold black">Position</label>
                                    <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                    <input {...register('company_name', { required: { value: true, message: 'Name is required' } })} className='inputLogin' disabled/>
                                    </div>
                                    {errors.name && <span className='text-danger'>{errors.name.message}</span>}
                                </div>
                                <div className='form-group'>
                                    <label className="bold black">Immediate Manager</label>
                                    <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                    <input {...register('company_name', { required: { value: true, message: 'Name is required' } })} className='inputLogin' disabled/>
                                    </div>
                                    {errors.name && <span className='text-danger'>{errors.name.message}</span>}
                                </div>
                            </div>*/      
                        }

                        {/*current_page == GROUPS_ROLES &&
                            <div style={{padding: "40px 60px 0 60px"}}>
                                       *Nanti dua-duanya pake input select kaya yang di sales mobile*
                                <div className='form-group'>
                                    <label className="bold black">Agent Groups</label>
                                    <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                    <input {...register('company_name', { required: { value: true, message: 'Name is required' } })} className='inputLogin' disabled placeholder='Search for agent groups'/>
                                    </div>
                                    {errors.name && <span className='text-danger'>{errors.name.message}</span>}
                                </div>
                                <div className='form-group'>
                                    <label className="bold black">Roles</label>
                                    <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                    <input {...register('company_name', { required: { value: true, message: 'Name is required' } })} className='inputLogin' disabled placeholder='Search for roles'/>
                                    </div>
                                    {errors.name && <span className='text-danger'>{errors.name.message}</span>}
                                </div>
                            </div>
                        */
                        }   
                    </div>
            </div>
        </div>
    )
}

export default AgentForm;