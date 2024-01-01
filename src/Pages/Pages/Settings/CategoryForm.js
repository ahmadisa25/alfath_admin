import React, {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import Overlay from '../../../Components/Overlay';
import { InputSwitch } from 'primereact/inputswitch';
import {
    useNavigate,useParams
} from "react-router-dom";
import { permissionCheck } from '../../../Utils/Utils';
import { getAllGroups, getGroup } from '../../../Service/GroupService';
import { getAllAgents } from '../../../Service/AgentService';
import { getAllCategories, getCategory, createCategory, updateCategory } from '../../../Service/CategoryService';

const GENERAL_INFO = 1;


const { $ } = window;
let agent_timer_id = -1;
let group_timer_id = -1;
let category_timer_id = -1;
const CategoryForm = () => {
    let { userInfo } = useSelector(state => state.auth);
    const incident_category_depth = process.env.REACT_APP_INCIDENT_CATEGORY_DEPTH;
    const service_category_depth = process.env.REACT_APP_SERVICE_CATEGORY_DEPTH;
    const [category_type, setCategoryType] = useState("");
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
        if(parent_id && parent_id !== "null"){
            getCategory(parent_id).then(res => {
                console.log(res.data);
                if(res.status == 200){
                    //console.log(res.data);
                    setValue("parent_category_id", res.data.id);
                    setValue("parent_category_name", res.data.category_name);
                    setValue("type", res.data.type);
                    setCategoryType(res.data.type);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "Failed to get category data"
                     })
                    navigate('/');
                }
            }).catch(err => {
                //console.log(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "Failed to get category data"
                 })
                navigate('/');
            })
        }
        if(category_id && category_id !=="null"){
            if(permissionCheck(userInfo, "settings", "update")){
                    getCategory(category_id).then(res => {
                        //console.log(res);
                        if(res.status == 200){
                            Object.keys(res.data).forEach(key => {
                                setValue(key, res.data[key]);
                                if(key == "is_enabled") setCategoryEnabled(res.data[key])
                                else if(key == "assigned_agent_group" && res.data[key]){
                                    setValue("assigned_agent_group", res.data[key].id);
                                    setValue("assigned_agent_group_name", res.data[key].name);
                                }
                                else if(key == "assigned_agent" && res.data[key]){
                                    setValue("assigned_agent", res.data[key].id);
                                    setValue("assigned_agent_name", res.data[key].name);
                                }
                                else if(key == "parent_category" && res.data[key]){
                                    setValue("parent_category_id", res.data[key].id);
                                    setValue("parent_category_name", res.data[key].name);
                                } else if(key == "type") {
                                    setValue(key, res.data[key]);
                                    setCategoryType(res.data[key]);
                                } else if(key = "attachment_enabled"){
                                    setAttachmentEnabled(res.data.attachment_enabled);
                                }
                            })
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error!',
                                text: "Failed to get category data"
                             })
                            navigate('/');
                        }
                    }).catch(err => {
                        //console.log(err);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed to get category data"
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

    const { category_id, parent_id, depth} = useParams();
    const [is_enabled, setCategoryEnabled] = useState(false);
    const [is_attachment_enabled, setAttachmentEnabled] = useState(false);
    const {processing, isAgentFocus, agents, groups, isGroupFocus, categories, isCategoryFocus} = state;
    const { register, handleSubmit, getValues, reset, setValue, formState: { errors } } = useForm({ defaultValues: { category_name: '', parent_category_name:'', parent_category_id:null, urgency:'', type:'', assigned_agent:null, assigned_agent_name:null, assigned_agent_group:null, assigned_agent_group_name:null} });

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

    const checkDepth = (category_type, category_depth) => {
        if(category_type == "incident"){
            if(category_depth == incident_category_depth) return true;
            else if(category_depth-1 == incident_category_depth && category_id && category_id > 0) return true;
        } else if(category_type == "service request"){
            if(category_depth == service_category_depth) return true;
            else if(category_depth-1 == service_category_depth && category_id && category_id > 0) return true;
        }
        return false;
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

    const onChangeCategory = (e) => {
        if (e.target.value.length >= 3) {
            clearTimeout(category_timer_id);
            category_timer_id = setTimeout(() => getAllCategories({search:e.target.value}).then((res) => {
                setState({ ...state, isCategoryFocus: true, categories: res.data.data });
            }), 500);
        } else {
            clearTimeout(category_timer_id);
            category_timer_id = setTimeout(() => {
                setValue("parent_category_id", null); 
                setValue("parent_category_name", "");
            }, 500);
            setState({ ...state, isCategoryFocus: true, categories: [] });
        }
    }

    const onSelectCategory = (item) => {
        setValue('parent_category_id', item.id);
        setValue('parent_category_name', item.category_name);
        setState({ ...state, isCategoryFocus: false });
    };

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

    const onFormSubmit = (data) => {
        const user_input = Object.assign({}, data, {is_enabled}, {attachment_enabled: is_attachment_enabled});
        delete user_input.assigned_agent_group_name;
        delete user_input.assigned_agent_name;
        delete user_input.parent_category_name;
        if(!category_id || category_id == "null"){
            createCategory(user_input).then(res => {
                //console.log(res);
                if(res.status == 201){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "A new category has been created!"
                    }).then( () => navigate('/category-settings'));
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Category Creation Failed!',
                        text: res.data.message
                     });
                } 
            }).catch(err => {
                let msg = "There's an error in processing your request. Please try again or contact support";
                if(err.response && err.response.data && err.response.data.message) msg = err.response.data.message;
                Swal.fire({
                    icon: 'error',
                    title: "error",
                    text: msg
                 });
            })
        } else{
            delete user_input.parent_category;
            updateCategory(category_id, user_input).then(res => {
                if(res.status == 200){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "A category has been updated!"
                        }).then( () => navigate('/category-settings'));
                
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Category Update Failed!',
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
        }
        
    }
    
    return(
        <div className="content-wrapper" style={{height:"120vh"}}>
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
                                                    <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/category-settings')}>arrow_back</span>
                                                </div>
                                                <div>
                                                    <h4 className='fw-500' style={{paddingLeft: 25, color:"black"}}>{!category_id || category_id == "null"? "Add A New": "Edit"} Category</h4>
                                                    <h6 style={{paddingLeft: 25, color:"black"}}>{!category_id || category_id == "null"? "Configuration for the new category" : "Modify category data"}</h6>
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
                                                                <label className="bold black">Name<span style={{color:"red"}}>*</span></label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <input {...register('category_name', { required: { value: true, message: 'Name is required' } })} className='inputLogin' />
                                                                </div>
                                                                {errors.category_name && <span className='text-danger'>{errors.category_name.message}</span>}
                                                            </div>
                                                            <div className='form-group'>
                                                                <label className="bold black">Description<span style={{color:"red"}}>*</span></label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <input {...register('category_description', { required: { value: true, message: 'Description is required' } })} className='inputLogin' />
                                                                </div>
                                                                {errors.category_description && <span className='text-danger'>{errors.category_description.message}</span>}
                                                            </div>
                                                            <div className='form-group'>
                                                                <label className="bold black">Type<span style={{color:"red"}}>*</span></label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <select
                                                                    id="type"
                                                                    className="form-control"
                                                                    {...register('type',  { required: { value: true, message: 'Type is required' } })}
                                                                    disabled={parent_id && parent_id > 0 && parent_id !== "null"}
                                                                >
                                                                    <option value="">Select One</option>
                                                                    <option value="incident">Incident</option>
                                                                    <option value="service request">Service Request</option>
                                                                </select>
                                                                </div>
                                                                {errors.type && <span className='text-danger'>{errors.type.message}</span>}
                                                            </div>
                                                            {checkDepth(category_type, depth) && <div className='form-group'>
                                                                <label className="bold black">Urgency<span style={{color:"red"}}>*</span></label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <select
                                                                    id="urgency"
                                                                    className="form-control"
                                                                    {...register('urgency', { required: { value: true, message: 'Urgency is required' } })}
                                                                >
                                                                    <option value="">Select One</option>
                                                                    <option value="urgent">Urgent</option>
                                                                    <option value="high">High</option>
                                                                    <option value="medium">Medium</option>
                                                                    <option value="low">Low</option>
                                                                </select>
                                                                </div>
                                                                {errors.urgency && <span className='text-danger'>{errors.urgency.message}</span>}
                                                            </div>}
                                                    {parent_id && parent_id != "null" &&     
                                                    <div className="form-group" style={{marginTop:"30px"}}>
                                                        <label className="black"><b>Parent Category</b>&nbsp;</label>
                                                        <input onClick={() => setState({ ...state, isCategoryFocus: true})} id="parent_category_name" {...register("parent_category_name")} placeholder="Type min 3 char" className='form-control' onKeyUp={onChangeCategory} autoComplete="off" disabled/>
                                                        {errors.parent_category_name && <span className='text-danger'>{errors.parent_category_name.message}</span>}
                                                        {categories && categories.length > 0 && isCategoryFocus &&
                                                            <div className='mt-1 p-2' style={{ zIndex: 1, position: 'absolute', background: '#fff', border: '1px solid #ccc', borderRadius: 5, width: '97.2%', maxHeight: '375px', overflow: "auto", overflowY: "scroll" }}>
                                                                {
                                                                    categories.map((item, i) =>
                                                                        <div onClick={() => onSelectCategory(item)} key={i} className='d-flex align-items-center w-100 p-1 mb-1' style={{ border: '1px solid #ccc', borderRadius: 5, cursor: 'pointer' }}>
                                                                        <span className='ml-2'>{item.category_name}</span>
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                            }
                                                    </div>
                                                    }
                                                    {category_type == "service request" && checkDepth(category_type, depth) &&  <div className='form-group' style={{display:"flex", alignItems:"center", columnGap:"15px", marginTop:"30px"}}>
                                                        <label className="bold black">Requiring Attachments?</label>
                                                        <InputSwitch checked={is_attachment_enabled} onChange={(e) => setAttachmentEnabled(!is_attachment_enabled)} />
                                                    </div>}
                                                    <div className='form-group' style={{display:"flex", alignItems:"center", columnGap:"15px", marginTop:"30px"}}>
                                                        <label className="bold black">Set Category as Active?</label>
                                                        <InputSwitch checked={is_enabled} onChange={(e) => setCategoryEnabled(!is_enabled)} />
                                                    </div>
                                                    {checkDepth(category_type, depth) && <div className='form-group' style={{marginTop:"30px"}}>
                                                        <label htmlFor='group_name' className="black"><b>Assigned Group<span style={{color:"red"}}>*</span>: </b></label>
                                                        
                                                            <input onClick={() => setState({ ...state, isGroupFocus: true})} id="assigned_agent_group_name" {...register("assigned_agent_group_name", {required: { value: true, message: 'Group is required'}})} placeholder="Type min 3 char" className='form-control' onKeyUp={onChangeGroup} autoComplete="off" />

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
                                                    </div>}
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

export default CategoryForm;