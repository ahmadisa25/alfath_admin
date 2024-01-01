import React, {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useForm, Controller } from 'react-hook-form';
import Overlay from '../../Components/Overlay';
import uniqid from 'uniqid';
import {AiFillCloseCircle, AiOutlineArrowUp} from 'react-icons/ai';
import { InputSwitch } from 'primereact/inputswitch';
import {
    useNavigate,useParams, useLocation
} from "react-router-dom";
import ScrollToTop from 'react-scroll-to-top';
import { getAllStatus } from '../../Service/StatusService';
import { getAllCategories, getCategory } from '../../Service/CategoryService';
import { getAllFields } from '../../Service/FieldService';
import { capitalize, includes, replace } from 'lodash';
import moment from 'moment';
import { createRequest, getRequest, updateRequest } from '../../Service/ServiceRequestService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import parse from 'date-fns/parse';

let agent_timer_id = -1;
let group_timer_id = -1;
const { $ } = window;
const ServiceRequestForm = () => {
    let { userInfo } = useSelector(state => state.auth);
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();
    const [fields, setFields] = useState([]);
    const [unique_id, setUniqueId] = useState("");
    const [category, setCategory] = useState({});
    const [attachment_enabled, setAttachmentEnabled] = useState(false);
    const [request_data, setRequestData] = useState([]);
    const [state, setState] = useState({ 
        processing : false, 
        isAgentFocus: false,
        isGroupFocus: false,
        users:[],
        groups:[]
    });
    //useEffect Entrance
    useEffect(() => {
        if(userInfo.access){
            if(userInfo.access.services){
                if(!userInfo.access.services.can_create) {
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
        getCategory(service_item_id).then(res => {
            if(res.status == 200){
                setCategory(res.data);
                if(res.data.attachment_enabled){
                    setAttachmentEnabled(res.data.attachment_enabled);
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "Get category data failed!"
                 })
                navigate('/services');
            }
        })
        setUniqueId("REQ-"+ moment().format('Ymd')+ "-"+ uniqid().toUpperCase());
        getAllFields("", {perpage:20, filter:`field_enabled:true,field_identifier:service request,category_id:${service_item_id}`}).then(res => {
            let status = res.data.status || res.status;
            if(status == 200){
                setFields(res.data.data);
            }
        })
        if(ticket_id){
            if(userInfo.role_name !== "Requester") {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "You're not allowed to access that page!"
                 })
                navigate('/service-requests');
                return;
            }
            getRequest(ticket_id).then(res => {
                if(res.status == 200){
                    if(res.data.ticket_fields){
                        const parsed_fields = JSON.parse(res.data.ticket_fields);
                        /*const isNumeric = (str) => {
                            return !isNaN(parseFloat(str));
                        }*/
                        Object.keys(parsed_fields).forEach(item => {
                            if(typeof parsed_fields[item] == 'string'){
                                const parsedDate = parse(parsed_fields[item], 'dd-MM-yyyy HH:mm:ss', new Date());
                                if(!isNaN(parsedDate) && parsedDate instanceof Date && parsedDate !=="Invalid Date"){
                                    setValue(item, parsedDate);
                                } else{
                                    setValue(item, parsed_fields[item]);
                               }           
                            }
                            else {
                                setValue(item, parsed_fields[item]);
                            }
                        })
                    }
                    if(res.data.requested_for_email){
                        setValue("requested_for", res.data.requested_for);
                        setValue("requested_for_email", res.data.requested_for_email);
                    }
                    if(res.data.ticket_attachment){
                        setAttachmentEnabled(true);
                        setPhotoUpload({
                            File:{name: res.data.ticket_attachment}
                        })
                    }
                    setRequestData(res.data);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "Get request data failed!"
                     })
                    navigate('/service-requests');
                }
            })
        }
    },[])

    const renderFields = (field_info) => {
        let {field_name, for_agent_required_when_submitting_the_form, for_requester_required_when_submitting_the_form, label_for_agent, label_for_requester, field_length, field_type, for_requester_displayed_to_requester, ...field_detail} = field_info
       
        const getRequiredLabel = (field_info, role_name) => {
            let result = false;
            if(role_name == "Agent" || role_name == "Agent Supervisor") {
                if(field_info.for_agent_required_when_submitting_the_form) return true;
            }
            else if(role_name == "Administrator") return true;
            else if(role_name == "Requester") {
                if(field_info.for_requester_required_when_submitting_the_form) return true;
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

        const renderFieldSource = (field_info) => {
            if(field_info.field_source){
                let select_value = JSON.parse(field_info.field_source).value;
                let is_array_value = select_value && Array.isArray(select_value) && select_value.length > 0 && select_value[0].substr(0,2) !== "db";
                if(!is_array_value) return [];
                const result = [];
                select_value.forEach(item => { 
                    result.push({
                        "label": item,
                        "value": item
                    });
                });
                return result;

            } else return [];
        }
        if(field_type == "text-single") {   
            return (
                <>
                    <div className='form-group'>
                        <label htmlFor={field_name} className="black"><b>{capitalize(getFieldLabel(userInfo.role_name))}</b> {required && <span style={{color:"red"}}>*</span>}</label>
                        <input maxLength={field_info.field_length} id={field_info.field_name} {...register(field_info.field_name, required_info)} placeholder="Type min 3 char" className='form-control' autoComplete="off"/>
                    </div> 
                    {errors[field_name] && <span className='text-danger'>{errors[field_name]['message']}</span>}
                </>
            )
        }
        else if(field_type == "datetime") {   
            return (
                <>
                    <div className='form-group'>
                        <label className="black bold">{capitalize(getFieldLabel(userInfo.role_name))}</label>
                        <br/>
                        <Controller
                        name={field_info.field_name}
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                            {...field}
                            selected={field.value}
                            onChange={(date) => {
                                setValue(field_info.field_name, date)
                            }}
                            showTimeSelect
                            timeIntervals={30}
                            timeCaption="Time"
                            dateFormat="dd-MM-yyyy HH:mm:ss"
                            timeFormat="HH:mm:ss"
                            placeholderText="DD-MM-YYYY HH:mm:ss"
                            dropdownMode="select"
                            autoComplete="off"
                            required={getRequiredLabel(field_info,userInfo.role_name)}
                            />
                        )}
                        />
                    </div> 
                    {errors[field_name] && <span className='text-danger'>{errors[field_name]['message']}</span>}
                </>
            )
        }
        else if(field_type == "number") {   
            return (
                <>
                    <div className='form-group'>
                        <label htmlFor={field_name} className="black"><b>{capitalize(getFieldLabel(userInfo.role_name))}</b> {required && <span style={{color:"red"}}>*</span>}</label>
                        <input type="number" min="0" maxLength={field_info.field_length} id={field_info.field_name} {...register(field_info.field_name, required_info)} placeholder="Type some numbers" className='form-control'autoComplete="off"/>
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
        else if(field_type == "checkbox"){
            return (
                <div className="form-group">
                    <label className="black bold">
                        {capitalize(getFieldLabel(userInfo.role_name))}
                    </label>
                    <div>
                        <Controller
                            name={field_info.field_name}
                            control={control}
                            defaultValue={false}
                            render={({ field }) => <InputSwitch checked={field.value} onChange={(e) => {
                                field.onChange(e.value);
                              }}/>}
                        />
                    </div>
                </div>
            )
        }
        else if(field_type == "content"){
            let select_value = field_info.field_source? JSON.parse(field_info.field_source).value: "";
            let is_array_value = select_value && Array.isArray(select_value) && select_value.length > 0 && select_value[0].substr(0,2) !== "db";
            if(is_array_value){
                return (
                    <div className="form-group">
                        <label className="black bold" style={{marginBottom:"0.3rem"}}>
                            {capitalize(getFieldLabel(userInfo.role_name))}
                        </label>
                        <p>{select_value[0]}</p>
                    </div>
                )
            } else {
                return "";
            }
        }
        else if(field_type == "dropdown-multiple"){
            return (
                <div className="form-group">
                    <label className="black bold">
                    {capitalize(getFieldLabel(userInfo.role_name))}
                    </label>
                    <div style={{marginTop:"5px"}}>
                    <Controller
                        name={field_info.field_name}
                        control={control}
                        defaultValue={null}
                        render={({ field }) => (
                        <Select
                            {...field}
                            options={renderFieldSource(field_info)}
                            isMulti
                            onChange={(selectedOptions) => {
                            setValue(field_info.field_name, selectedOptions);
                            }}
                        />
                        )}
                    />
                    </div>
                    {errors[field_name] && <span className='text-danger'>{errors[field_name]['message']}</span>}
                </div>
            )
        }
        else if(field_type == "dropdown-single") {
            //check if source is an array or not. If it is an array, then convert the array items to options of a select.
            let select_value = field_info.field_source? JSON.parse(field_info.field_source).value: "";
            console.log(select_value)
            let is_array_value = select_value && Array.isArray(select_value) && select_value.length > 0 && select_value[0].substr(0,2) !== "db";
            //console.log(select_value.split(","))
            if(for_requester_displayed_to_requester === true){
                if(is_array_value) {
                    let selects = "";
                    selects = select_value;
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

    const { service_item_id, ticket_id } = useParams();

    const { register, handleSubmit, setValue, control, formState: { errors } } = useForm({ defaultValues: { ticket_number:""} });

    const onFormSubmit = (data) => {
        if(attachment_enabled && !photo_upload.File){
            Swal.fire({
                icon: 'error',
                title: 'Request Creation Failed!',
                text: "Please insert attachment!"
             }).then(_ => {
                setState({...state, processing:false});
             });

             return;
        }
        setState({...state, processing:true})
        let mandatory_fields = [
            'ticket_number',
            'requested_date',
            'requester',
            'requester_email',
            'requested_for_email',
            'requested_for'
        ];
        let ticket_fields = {};
        Object.keys(data).forEach(item => {
            if(!includes(mandatory_fields, item)){
                ticket_fields[item] = data[item];
                delete data[item];
            }
            //clean T & Z on datetime-typed values
            if(typeof ticket_fields[item] == 'object' && !Array.isArray(ticket_fields[item])){
                const parsedDate = new Date(ticket_fields[item]);
                if(!isNaN(parsedDate) && parsedDate instanceof Date && parsedDate !=="Invalid Date"){
                    ticket_fields[item] = moment(ticket_fields[item]).format('DD-MM-YYYY HH:mm:ss');
                }
            }
           
        })
        const user_input = data;
        user_input["category"] = service_item_id;
        user_input["ticket_fields"] = JSON.stringify(ticket_fields);
        if(photo_upload.File) user_input.File = photo_upload.File;
        if(unique_id && !request_data.ticket_number && (!ticket_id || ticket_id == "null")) user_input.ticket_number = unique_id;
        //if(!incident_id){
            const formData = new FormData();
            //if(statuses) user_input.status = statuses[0].id;
            user_input.requested_date = moment().format('YYYY-MM-DD HH:mm:ss');
            user_input.source = "Portal"
            user_input.requester = userInfo.fullname;
            user_input.requester_email = userInfo.email;

            Object.keys(user_input).forEach(item => {
                formData.append(item, user_input[item]);
            })

            if(!ticket_id || ticket_id == "null"){
                createRequest(formData).then(res => {
                    let stats = res.data.status||res.status
                    if(stats == 201){
                        setState({...state, processing:false});
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: "A new request has been created!"
                            }).then( () => navigate('/service-requests'));
                       
                    } else {
                        setState({...state, processing:false});
                        Swal.fire({
                            icon: 'error',
                            title: 'Request Creation Failed!',
                            text: res.data.message
                         });
                    } 
                }).catch(err => {
                    setState({...state, processing:false});
                    let msg = "There's an error in processing your request. Please try again or contact support";
                    if(err.response && err.response.data && err.response.data.message) msg = err.response.data.message;
                    Swal.fire({
                        icon: 'error',
                        title: "error",
                        text: msg
                     });
                })
            } else {
                updateRequest(ticket_id, formData).then(res => {
                    let stats = res.status
                    if(stats == 200){
                        setState({...state, processing:false});
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: "A new request has been updated!"
                            }).then( () => navigate('/service-requests'));
                       
                    } else {
                        setState({...state, processing:false});
                        Swal.fire({
                            icon: 'error',
                            title: 'Request Creation Failed!',
                            text: res.data.message
                         });
                    } 
                }).catch(err => {
                    setState({...state, processing:false});
                    let msg = "There's an error in processing your request. Please try again or contact support";
                    if(err.response && err.response.data && err.response.data.message) msg = err.response.data.message;
                    Swal.fire({
                        icon: 'error',
                        title: "error",
                        text: msg
                     });
                })
            }
          
        //} else{
            /*updateIncident(incident_id, user_input).then(res => {
                if(res.status == 200){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "An incident has been updated!"
                        }).then( () => navigate('/incidents'));
                    
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Incident Update Failed!',
                        text: res.data.message
                     });
                } 
            }).catch(err => {
                Swal.fire({
                    icon: 'error',
                    title: "error",
                    text: "There's an error in processing your request. Please try again or contact support"
                 });
            })
        }*/
        
    }

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
            if(!includes(allowed_file_types, file.type)){
                Swal.fire({
                    icon: 'error',
                    title: "That file extension is not allowed (only .png, .jpeg, .jpg, excel files, .eml, mp4 and pdf)"
                });
                return;
            } 
            if(file.size <=1000000){
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
                            <form name="form-service" onSubmit={handleSubmit(onFormSubmit)} enctype="multipart/form-data">
                                        <div>
                                        <div className='row'>
                                            <div className='col-md-6' style={{display:"flex"}}>
                                                <div>
                                                    <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/services')}>arrow_back</span>
                                                </div>
                                                <div>
                                                    <h4 className='fw-500' style={{paddingLeft: 25, color:"black"}}>{(!ticket_id || ticket_id == "null") ? "Create A New" : "Edit A"} Service Request</h4>
                                                    <h6 style={{paddingLeft: 25, color:"black"}}>Request for: <b>{category.category_name}</b></h6>
                                                    <h6 style={{paddingLeft: 25, color:"black"}}>Description: <b>{category.category_description}</b></h6>
                                                </div>       
                                            </div>
                                            <div className='col-md-6'>
                                                <button type="submit" class="btn right" style={{padding: "0.5em 4em", background:"#FAA819", color:"white"}} disabled = {!fields || (fields && fields.length <=0)}>
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
                                                        <div className="row">
                                                            <div className="col-md-9 col-lg-9"> 
                                                                {fields&& fields.length <=0 && <h6>This type of request currently has no fields. Please contact support or system administrator. </h6>}
                                                                {fields && fields.length > 0 && fields.map(item => renderFields(item))}
                                                                {attachment_enabled == true && <div style={{marginTop:"30px"}}>
                                                                        <div style={{display:"flex"}}>
                                                                            <label className="black bold">Attachment <span style={{color:"red"}}>*</span> : </label>
                                                                        </div>                                                        
                                                                        <div className="small font-italic text-muted mb-4">File must not be larger than 1 MB. Allowed types: jpg, png, pdf, xls, xlsx, mp4, eml (email files)</div>
                                                                        {photo_upload.File && <h6>{photo_upload.File.name}</h6>}
                                                                        {!photo_upload.File && <h6>No File Inserted.</h6>}
                                                                        <button className="btn b2b-btn-add" type="button" onClick={()=> $('#attachment-upload').click()} disabled={userInfo.role_name == "Agent" || userInfo.role_name == "Agent Supervisor"}>
                                                                                Upload a new attachment
                                                                        </button>
                                                                        <input id="attachment-upload" type="file" accept="image/png, image/jpg, image/jpeg, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .pdf, video/mp4, message/rfc822" className='d-none'  onChange={(e) =>onImageChange(e)} />
                                                                </div>}
                                                            </div>
                                                            <div className="col-md-3 col-lg-3">
                                                                <div className='form-group'>
                                                                    <label htmlFor="ticket_number" className="black"><b>Ticket Number:</b></label>
                                                                    <input id="ticket_number" value={(!ticket_id || ticket_id == "null")? unique_id: request_data.ticket_number} placeholder="Type min 3 char" className='form-control'autoComplete="off" disabled/>
                                                                </div>
                                                                <div className='form-group'>
                                                                    <label htmlFor="ticket_number" className="black"><b>Requested Date:</b></label>
                                                                    <input id="ticket_number" value={(!ticket_id || ticket_id == "null")? moment().format('DD MMMM YYYY'): moment(request_data.requested_date).format('DD MMMM YYYY')} placeholder="Type min 3 char" className='form-control'autoComplete="off" disabled/>
                                                                </div>
                                                                <div className='form-group'>
                                                                    <label htmlFor='group_name' className="black"><b>Requested For:</b>&nbsp;<span style={{color:"red"}}>*</span></label>
                                                                    <input maxlength="500" id="group_name" {...register("requested_for", {
                                                                    required: 'Requested For is required!',
                                                                    })} className='form-control' autoComplete="off"/>

                                                                    {errors.requested_for && <span className='text-danger'>{errors.requested_for.message}</span>}
                                                                </div>
                                                                <div className='form-group'>
                                                                    <label htmlFor='group_name' className="black"><b>Requested For E-mail</b>&nbsp;<span style={{color:"red"}}>*</span></label>
                                                                    <input type="email" maxlength="500" id="group_name" {...register("requested_for_email", {
                                                                    required: 'Requestd For e-mail is required!',
                                                                    })} className='form-control' autoComplete="off"/>

                                                                    {errors.requested_for_email && <span className='text-danger'>{errors.requested_for_email.message}</span>}
                                                                </div>
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

export default ServiceRequestForm;