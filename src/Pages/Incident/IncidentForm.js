import React, {useState, useEffect, useRef} from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import Overlay from '../../Components/Overlay';
import uniqid from 'uniqid';
import {AiFillCloseCircle, AiOutlineArrowUp} from 'react-icons/ai';
import {
    useNavigate,useParams
} from "react-router-dom";
import { permissionCheck } from '../../Utils/Utils';
import ScrollToTop from 'react-scroll-to-top';
import {createIncident, updateIncident, getIncident} from '../../Service/IncidentService';
import { getAllStatus } from '../../Service/StatusService';
import { getAllCategories } from '../../Service/CategoryService';
import { getAllFields } from '../../Service/FieldService';
import { capitalize, includes } from 'lodash';
import moment from 'moment';
import CategoryContents from './CategoryContents';
import { getAllGroups, getGroup } from '../../Service/GroupService';
import { getAllAgents } from '../../Service/AgentService';

let agent_timer_id = -1;
let group_timer_id = -1;
const { $ } = window;
const IncidentForm = () => {
    let { userInfo } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const [selected_category, setSelectedCategory] = useState({});
    const [fields, setFields] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [unique_id, setUniqueId] = useState("");

    const [state, setState] = useState({ 
        processing : false, 
        isAgentFocus: false,
        isGroupFocus: false,
        users:[],
        groups:[]
    });

    const { isAgentFocus, agents, groups, isGroupFocus, categories, isCategoryFocus} = state;
    //useEffect Entrance
    //useEffect(() => console.log(unique_id), [unique_id]);
    useEffect(() => {
        if(userInfo.access){
            if(userInfo.access.incidents){
                if(!userInfo.access.incidents.can_create && !userInfo.access.incidents.can_update) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "You're not allowed to access that page!"
                     })
                    navigate('/');
                }
            }
        }
        if(userInfo.role_name == "Requester"){
            setValue("requested_for", userInfo.fullname);
            setValue("requested_for_email", userInfo.email);
        }
        setUniqueId("INC-"+ moment().format('Ymd')+ "-"+ uniqid().toUpperCase());
        getAllFields("", {perpage:20, filter:"field_enabled:true,field_identifier:incident"}).then(res => {
            let status = res.data.status || res.status;
            if(status == 200){
                setFields(res.data.data);
            }
        })

        getAllStatus({filter:"status_name:open"}).then(res => {
            if(res.status == 200) setStatuses(res.data.data)
            else Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "Failed to get status data"
            })
        })
        if(incident_id){
            if(permissionCheck(userInfo, "incidents", "update")){
                getIncident(incident_id).then(res => {
                    if(res.status == 200){
                        Object.keys(res.data).forEach(key => {
                            if(key == "description" ) setValue(key, JSON.parse(res.data[key]).description);
                            else if(key == "category"){
                                setSelectedCategory({
                                    id: res.data[key],
                                    name: res.data["category_name"]
                                })
                            } else if(key == "ticket_attachment"){
                                setPhotoUpload({
                                    File:{name: res.data[key]}
                                })
                            }
                            else if(key == "requester_email"){
                                setValue(key, res.data[key]);
                                if(userInfo.role_name == "Requester"){
                                    if(userInfo.email !== res.data[key]){
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Error!',
                                            text: "You can only access your own tickets!"
                                        }).then(() => navigate('/incidents'));
                                    }
                                }
                            } else if(key == "group_id"){
                                setValue(key, res.data[key]);
                                setValue("assigned_agent_group_name", res.data["group_name"]);
                                if(userInfo.role_name == "Agent Supervisor"){
                                    if(!userInfo.agent_groups || userInfo.agent_groups[0].group_id !== res.data[key]){
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Error!',
                                            text: "You can only access your own or your group tickets!"
                                        }).then(() => navigate('/incidents'));
                                    }
                                }
                            }else if(key == "agent_id"){
                                setValue(key, res.data[key]);
                                if(userInfo.role_name == "Agent Supervisor" || userInfo.role_name == "Agent"){
                                    if(userInfo.agent_id !== res.data[key]){
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Error!',
                                            text: "You can only access your own tickets!"
                                        }).then(() => navigate('/incidents'));
                                    }
                                }
                            }
                            else setValue(key, res.data[key]);
                            
                        })
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed to get incident data"
                         })
                        navigate('/incidents');
                    }
                }).catch(err => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "Failed to get incident data"
                     })
                    navigate('/incidents');
                })  
                
                getAllStatus().then(res => {
                    if(res.status == 200) setStatuses(res.data.data)
                    else Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "Failed to get status data"
                    })
                })
                //getAllCategories({per_page}).then(res)
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "You're not allowed to access that page!"
                 })
                navigate('/incidents');
            }
        }
    },[])


    const onChangeAgent = (e) => {
        if (e.target.value.length) {
            clearTimeout(agent_timer_id);
            agent_timer_id = setTimeout(() => getAllAgents({search:e.target.value}).then((res) => {
            setState({ ...state, isAgentFocus: true, agents: res.data.data });
            }), 500);
        } else {
            clearTimeout(agent_timer_id);
            agent_timer_id = setTimeout(() => {
                setValue("assigned_agent", null); 
                setValue("assigned_agent_name", null);
            }, 500);
            //reset({ agent_supervisor_id: null});
            //setValue('assigned_agent', "");
            //setValue('assigned_agent_name', "");
            setState({ ...state, isAgentFocus: true, agents: [] });
        }
    }

    const onSelectAgent = (item) => {
        setValue('assigned_agent', item.id);
        setValue('assigned_agent_name', item.agent_name);
        setState({ ...state, isAgentFocus: false });
    };


    const renderFields = (field_info) => {
        let {field_name, for_agent_required_when_submitting_the_form, for_requester_required_when_submitting_the_form, label_for_agent, label_for_requester, field_length, field_type, for_requester_displayed_to_requester, ...field_detail} = field_info
       
        const getRequiredLabel = (field_info, role_name) => {
            let result = false;
            if(role_name == "Agent" || role_name == "Agent Supervisor") {
                if(for_agent_required_when_submitting_the_form) return true;
            }
            else if(role_name == "Administrator") return true;
            else if(role_name == "Requester") {
                if(for_requester_required_when_submitting_the_form) return true;
            }
            else return result;
        }

         let required = getRequiredLabel(field_info, userInfo.role_name);
            let required_info = required? {
                required: `${field_info.field_name} is required!`,
            }: {};
        const returnGetFunction = (entity_name) => {
            if(entity_name == "category") return getAllCategories;
            else if(entity_name == "status") return getAllStatus;
            else return "";
        } 
        const getFieldLabel = (role_name) => {
            if(role_name == "Agent" || role_name == "Agent Supervisor") return label_for_agent;
            else if(role_name == "Administrator") return label_for_agent;
            else if(role_name == "Requester") return label_for_requester;
            else return "";
        }
        if(field_type == "text-single") {   
            return (
                <>
                    <div className='form-group'>
                        <label htmlFor={field_name} className="black"><b>{capitalize(getFieldLabel(userInfo.role_name))}</b> {required && <span style={{color:"red"}}>*</span>}</label>
                        <input maxLength={field_info.field_length} id={field_info.field_name} {...register(field_info.field_name, required_info)} placeholder="Type min 3 char" className='form-control'autoComplete="off"/>
                    </div> 
                    {errors[field_name] && <span className='text-danger'>{errors[field_name]['message']}</span>}
                </>
            )
        }
        else if(field_type == "text-multiple") {
            return (
                <>
                    <div className='form-group'>
                        <label htmlFor={field_name} className="black"><b>{capitalize(getFieldLabel(userInfo.role_name))}</b> {required && <span style={{color:"red"}}>*</span>}</label>
                        <textarea maxLength ={field_info.field_length} {...register(field_info.field_name, required_info)} className='form-control'/>
                    </div> 
                    {errors[field_name] && <span className='text-danger'>{errors[field_name]['message']}</span>}
                </>
            )
        }
        else if(field_type == "dropdown-single") {
            //check if source is an array or not. If it is an array, then convert the array items to options of a select.
            let select_value = field_info.field_source? JSON.parse(field_info.field_source).value: "";
            let is_array_value = select_value && Array.isArray(select_value) && select_value.length > 0 && select_value[0].substr(0,2) !== "db";
            //console.log(select_value.split(","))
            if(for_requester_displayed_to_requester === true){
                if(is_array_value) {
                    let selects = "";
                    selects = select_value[0].split(",");
                    return(
                        <>
                            <div className='form-group'>
                                <label htmlFor={field_name} className="black"><b>{capitalize(getFieldLabel(userInfo.role_name))}</b> {required && <span style={{color:"red"}}>*</span>}</label>
                                <select className="form-control" {...register(field_info.field_name, required_info)} >
                                    {selects && selects.length > 0 && selects.map(item => {
                                        return <option value={item} style={{fontSize:"14px"}}>{item == '' ? "Select one": item}</option>
                                    })}
                                </select>
                                {errors[field_name] && <span className='text-danger'>{errors[field_name]['message']}</span>}
                            </div> 
                        </>
                    ); 
            } return <></>;
}
        }
    }

    const { incident_id } = useParams();

    const {processing} = state;
    const { register, handleSubmit, getValues, reset, setValue, control, formState: { errors } } = useForm({ defaultValues: { ticket_number:"", urgency:"", impact:"", priority:""} });

    const onFormSubmit = (data) => {
        setState({...state, processing:true})
        if(!selected_category.id) {
            setState({...state, processing:false})
            Swal.fire({
                icon: 'error',
                title: 'Incident Creation Failed!',
                text: "Please select a category for this incident!"
            });
            return;
        }
        const user_input = Object.assign({}, data);
        if(user_input.description){
            const val = {
                "description": user_input.description
            }
            user_input.description = JSON.stringify(val);
        }
        if(photo_upload.File) user_input.File = photo_upload.File;
        if(unique_id && !user_input.ticket_number && !incident_id) user_input.ticket_number = unique_id;
        if(selected_category.id) user_input.category = selected_category.id;
        if(!incident_id){
            const formData = new FormData();
            if(statuses) user_input.status = statuses[0].id;
            user_input.requested_date = moment().format('YYYY-MM-DD HH:mm:ss');
            user_input.source = "Portal"
            user_input.requester = userInfo.fullname;
            user_input.requester_email = userInfo.email;
            Object.keys(user_input).forEach(item => {
                formData.append(item, user_input[item]);
            })

            createIncident(formData).then(res => {
                let stats = res.data.status||res.status
                if(stats == 201){
                    setState({...state, processing:false})
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "A new incident has been created!"
                        }).then( () => navigate('/incidents'));
                   
                } else {
                    setState({...state, processing:false})
                    Swal.fire({
                        icon: 'error',
                        title: 'Incident Creation Failed!',
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
            const formData = new FormData();
            Object.keys(user_input).forEach(item => {
                let skipped_fields = [
                    'escalated_to',
                    'ticket_spam',
                    'forward_to_email'
                ]
                if(!includes(skipped_fields, item)) formData.append(item, user_input[item]);
            });
            updateIncident(incident_id, formData).then(res => {
                if(res.status == 200){
                    setState({...state, processing:false})
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "An incident has been updated!"
                        }).then( () => navigate('/incidents'));
                    
                } else {
                    setState({...state, processing:false})
                    Swal.fire({
                        icon: 'error',
                        title: 'Incident Update Failed!',
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

    const onChangeGroup = (e) => {
        if (e.target.value.length >= 3) {
          clearTimeout(group_timer_id);
          group_timer_id = setTimeout(() => getAllGroups({filter:`is_deleted:false,group_name:${e.target.value}`}).then((res) => {
            setState({ ...state, isGroupFocus: true, groups: res.data.data });
          }), 500);
        } else {
            clearTimeout(group_timer_id);
            group_timer_id = setTimeout(() =>{
                setValue("assigned_agent_group", null); 
                setValue("assigned_agent_group_name", null);
            }, 500);
            setState({ ...state, isGroupFocus: true, groups: [] });
        }
    }

    const onSelectGroup = (item) => {
        setValue('assigned_agent_group', item.id);
        setValue('assigned_agent_group_name', item.group_name);
        //setState({ ...state,});

        getGroup(item.id).then(res => {
            if(res.status == 200){
                setState({...state, agents:res.data.group_agents, isGroupFocus: false });
            } else {
                setState({...state, isGroupFocus: false });
            }
        }).catch(err => {
            setState({...state, isGroupFocus: false });
            let msg = "There's an error in processing your request. Please try again or contact support";
            if(err.response && err.response.data && err.response.data.message) msg = err.response.data.message;
            Swal.fire({
                icon: 'error',
                title: "error",
                text: msg
             });
        })
    };

    const [photo_upload, setPhotoUpload] = useState({
        img_upload:"",
        File:""
    });
    
    const onImageChange = (e) => {
        const [file] = e.target.files;
        const allowed_file_types = [
            "image/png",
            "image/jpg",
            "image/jpeg",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/pdf",
            "video/mp4", 
            "message/rfc822"
        ];
        if (file) {
            //bikin logic untuk allowed file types
            if(!includes(allowed_file_types, file.type)){
                Swal.fire({
                    icon: 'error',
                    title: "That file extension is not allowed (only .png, .jpeg, .jpg, excel files, .eml, mp4 and pdf)"
                });
                return;
            } 
            if(file.size <=1000000){
                //listPayment.img_upload = URL.createObjectURL(file);
                //listPayment.File = file;
                let photo_obj = {};
                photo_obj.File = file;
                photo_obj.img_upload = URL.createObjectURL(file);
                setPhotoUpload(photo_obj);
            } else{
                Swal.fire({
                    icon: 'error',
                    title: "The file size is too large"
                });
            }

        }
    }

    
    const onCloseModal = (e) => {
        e.preventDefault();
        setSelectedCategory({});
        $("#modal-category").modal('hide');
    }

    const onShowCategoryModal = () => {
        $('#modal-category').modal('show');
    }

    const onSetCategory = (category_obj) => {
        setSelectedCategory(category_obj);
        $("#modal-category").modal('hide');
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
                    <div className={'col-md-12'}>
                          {/*Category Select*/}
                            {/*End Category Modal Select*/}
                            <form name="form-agent" onSubmit={handleSubmit(onFormSubmit)} enctype="multipart/form-data">
                                    <div id="modal-category" className="modal fade">
                                        <div className="modal-dialog modal-lg" style={{ maxWidth: 1000 }}>
                                            <div className="modal-content" style={{width:"120%"}}>
                                                <div className="modal-header">
                                                    <h5 className="modal-title">
                                                        Select Incident Category
                                                    </h5>
                                                    <button type="button" className="close" onClick={onCloseModal} aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div className="modal-body">
                                                    <CategoryContents sendCategoryToParent={onSetCategory}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                        <div>
                                        <div className='row'>
                                            <div className='col-md-6' style={{display:"flex"}}>
                                                <div>
                                                    <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/incidents')}>arrow_back</span>
                                                </div>
                                                <div>
                                                    <h4 className='fw-500' style={{paddingLeft: 25, color:"black"}}>{!incident_id? "Add A New": "Edit"} Incident</h4>
                                                    <h6 style={{paddingLeft: 25, color:"black"}}>{!incident_id? "Configuration for the new incident" : "Modify incident data"}</h6>
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
                                            <div style={{padding: "20px 60px 0 60px"}}>
                                                <div className="row">
                                                    <div className='full-width' style={{padding: "0 20px"}}>
                                                        <Overlay display={state.processing} />
                                                        <div className="row">
                                                            <div className = "col-md-9 col-lg-9"> 
                                                                <div className='form-group' style={{display:"flex", columnGap:"20px", alignItems:"center"}}>
                                                                    <label htmlFor="ticket_number" className="black" style={{paddingTop:"0.5em"}}><b>Category:</b>&nbsp;<span style={{color:"red"}}>*</span></label>
                                                                    {!selected_category.id && <button type='button' className="btn" onClick={onShowCategoryModal} style={{cursor:"pointer", border:"1px solid black", background:"black", color:"white", borderRadius:"8px", fontSize:"16px"}}>+ Select Incident Category</button>}
                                                                    {selected_category.id && 
                                                                    <div style={{display:"flex", alignItems:"center", columnGap:"10px"}}>
                                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                                <span>{selected_category.name}</span>
                                                                            </div>
                                                                            <div style={{color: "red", cursor:"pointer"}} onClick={() => setSelectedCategory({})}><AiFillCloseCircle/></div>
                                                                    </div>}
                                                                </div>
                                                                <div className='form-group'>
                                                                    <label htmlFor='group_name' className="black"><b>Subject</b>&nbsp;<span style={{color:"red"}}>*</span></label>
                                                                    <input maxlength="150" id="subject" {...register("subject", {
                                                                    required: 'Subject is required!',
                                                                    })} className='form-control' autoComplete="off" disabled={userInfo.role_name == "Agent" || userInfo.role_name == "Agent Supervisor"}/>

                                                                    {errors.subject && <span className='text-danger'>{errors.subject.message}</span>}
                                                                </div>
                                                                <div className='form-group'>
                                                                    <label htmlFor='description' className="black"><b>Description:</b><span style={{color:"red"}}>*</span></label>
                                                                    <textarea maxLength ="2000" rows="7" {...register('description', {
                                                                    required: 'Description is required!',
                                                                    })} className='form-control' disabled={userInfo.role_name == "Agent" || userInfo.role_name == "Agent Supervisor"}/>
                                                                </div> 
                                                                {errors['description'] && <span className='text-danger'>{errors['description']['message']}</span>}
                                                                <div className='form-group'>
                                                                    <label htmlFor="requested_date" className="black"><b>Requested Date:</b></label>
                                                                    <input id="requested_date" value={moment().format('DD MMMM YYYY')} placeholder="Type min 3 char" className='form-control'autoComplete="off" disabled/>
                                                                </div>
                                                                <div style={{marginTop:"30px"}}>
                                                                    <label className="black bold">Attachment: </label>
                                                                    <div className="small font-italic text-muted mb-4">File must not be larger than 1 MB. Allowed types: jpg, png, pdf, xls, xlsx, mp4, .eml (email files)</div>
                                                                        {photo_upload.File && <h6>{photo_upload.File.name}</h6>}
                                                                        {!photo_upload.File && <h6>No File Inserted.</h6>}
                                                                        <button className="btn b2b-btn-add" type="button" onClick={()=> $('#attachment-incident-upload').click()} disabled={userInfo.role_name == "Agent" || userInfo.role_name == "Agent Supervisor"}>
                                                                                Upload a new attachment
                                                                        </button>
                                                                        <input id="attachment-incident-upload" type="file" accept="image/png, image/jpg, image/jpeg, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .pdf, video/mp4, message/rfc822" className='d-none' onChange={(e) =>onImageChange(e)}/>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-3 col-lg-3">
                                                                <div className='form-group'>
                                                                    <label htmlFor="ticket_number" className="black"><b>Ticket Number:</b></label>
                                                                    <input id="ticket_number" value={(!incident_id || incident_id == "null")? unique_id: getValues("ticket_number")} placeholder="Type min 3 char" className='form-control'autoComplete="off" disabled/>
                                                                </div>
                                                                <div className='form-group'>
                                                                    <label htmlFor='group_name' className="black"><b>Requested For:</b>&nbsp;<span style={{color:"red"}}>*</span></label>
                                                                    <input maxlength="100" id="group_name" {...register("requested_for", {
                                                                    required: 'Requested For is required!', 
                                                                    })} className='form-control' autoComplete="off" disabled={userInfo.role_name == "Agent" || userInfo.role_name == "Agent Supervisor"}/>

                                                                    {errors.requested_for && <span className='text-danger'>{errors.requested_for.message}</span>}
                                                                </div>
                                                                <div className='form-group'>
                                                                    <label htmlFor='group_name' className="black"><b>Requested For E-mail</b>&nbsp;<span style={{color:"red"}}>*</span></label>
                                                                    <input type="email" maxlength="100" id="group_name" {...register("requested_for_email", {
                                                                    required: 'Requestd For e-mail is required!',
                                                                    })} className='form-control' autoComplete="off" disabled={userInfo.role_name == "Agent" || userInfo.role_name == "Agent Supervisor"}/>

                                                                    {errors.requested_for_email && <span className='text-danger'>{errors.requested_for_email.message}</span>}
                                                                </div>
                                                                {fields.map(item => renderFields(item))}
                                                                {userInfo.role_name !== "Requester" && <>
                                                                    <div className='form-group' style={{marginTop:"30px"}}>
                                                                        <label htmlFor='group_name' className="black"><b>Assigned Group<span style={{color:"red"}}>*</span>: </b></label>
                                                                    
                                                                        <input onClick={() => setState({ ...state, isGroupFocus: true})} id="assigned_agent_group_name" {...register("assigned_agent_group_name", {required: { value: true, message: 'Group is required'}})} placeholder="Type min 3 char" className='form-control' onKeyUp={onChangeGroup} autoComplete="off" disabled={userInfo.role_name !=="Administrator"} />

                                                                        {errors.assigned_agent_group_name && <span className='text-danger'>{errors.assigned_agent_group_name.message}</span>}

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
                                                                    {getValues("assigned_agent_group") && <div className="form-group" style={{marginTop:"30px"}}>
                                                                        <label className="black"><b>Assigned Agent</b>&nbsp;</label>
                                                                        <input onClick={() => setState({ ...state, isAgentFocus: true})} id="assigned_agent_name" {...register("assigned_agent_name")} placeholder="Type min 3 char" className='form-control' onKeyUp={onChangeAgent} autoComplete="off"/>

                                                                        {errors.assigned_agent_name && <span className='text-danger'>{errors.assigned_agent_name.message}</span>}
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
                                                                    }

                                                                </>}
                                                            </div>
                                                        </div>
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

export default IncidentForm;