import React, {useState, useEffect, useRef} from 'react';
import { useSelector } from 'react-redux';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import Overlay from '../../Components/Overlay';
import {AiOutlineArrowUp} from 'react-icons/ai';
import {
    useNavigate,useParams
} from "react-router-dom";
import { permissionCheck, prunePhoneNumber, urlEncodeData } from '../../Utils/Utils';
import ScrollToTop from 'react-scroll-to-top';
import { createAnnouncement, getAnnouncement, updateAnnouncement } from '../../Service/AnnouncementService';
import moment from 'moment';

const { $ } = window;

const AnnouncementForm = () => {
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

        if(announcement_id){
            //if(permissionCheck(userInfo, "settings", "update")){
                getAnnouncement(announcement_id).then(res => {
                    if(res.data.Status == 200){
                        setValue('Title', res.data.Data.title)
                        setDescription(res.data.Data.description)
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed to get announcement data!"
                         })
                        navigate('/announcements');
                    }
                })
            //} else {
                /*Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "You're not allowed to access that page!"
                 })
                navigate('/');*/
            //}
        }
    },[])

    const navigate = useNavigate();

    const [state, setState] = useState({ 
        processing : false, 
        available_instructors: [],
        is_instructor_focus: false
    });

    const { announcement_id } = useParams();
    //const [agent_enabled, setAgentEnabled] = useState(false);
    const {processing} = state;
    const { register, handleSubmit, getValues, reset, setValue, formState: { errors } } = useForm({ defaultValues: { Title: '',  Description: ''} });

    const [Description, setDescription] = useState("");

    const onFormSubmit = (data) => {
        setState({...state, processing:true})
        let user_input = Object.assign({}, data, {Description});
        console.log(user_input);
        user_input.MobilePhone =  user_input.MobilePhone && user_input.MobilePhone > 0 ?  prunePhoneNumber(user_input.MobilePhone): 0;
        user_input = urlEncodeData(user_input)
        if(!announcement_id){
            createAnnouncement(user_input).then(res => {
                if(res.status == 200){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "Announcement data has successfully been created!"
                     }).then(_ => {
                        navigate('/announcements');
                     })
                 
                }
            }).catch(({response: {data}}) => {
                setState({...state, processing: false})
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: data.Message || "There's an error with your request. Please try again or contact support!"
                 }).then(_ => {
                    setState({...state, processing: false})
                 })
            })
        } else{
            updateAnnouncement(announcement_id ,user_input).then(res => {
                if(res.data.Status == 200){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "Announcement data has successfully been updated!"
                     }).then(_ => {
                        navigate('/announcements');
                     })
                 
                }
            }).catch(({response: {data}}) => {
                setState({...state, processing: false})
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: data.Message || "There's an error with your request. Please try again or contact support!"
                 }).then(_ => {
                    setState({...state, processing: false})
                 })
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
                                                    <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/announcements')}>arrow_back</span>
                                                </div>
                                                <div>
                                                    <h4 className='fw-500' style={{paddingLeft: 25, color:"black"}}>{!announcement_id? "Add A New": "Edit"} Announcement</h4>
                                                    <h6 style={{paddingLeft: 25, color:"black"}}>{!announcement_id? "Configuration for the new announcement" : "Modify announcement data"}</h6>
                                                </div>       
                                            </div>
                                            <div className='col-md-6'>
                                                <button type="submit" className="btn right tawny" style={{padding: "0.5em 4em", color:"white"}}>
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
                                                            <label className="bold black">Title <span style={{color:"red"}}>*</span></label>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                            <input {...register('Title', { required: { value: true, message: 'Title is required' } })} className='inputLogin' />
                                                            </div>
                                                            {errors.Title && <span className='text-danger'>{errors.Title.message}</span>}
                                                    </div>
                                                    <div className='form-group'>
                                                        <label htmlFor='Description' className="black"><b>Description</b> <span style={{color:"red"}}>*</span></label>
                                                        <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                    <ReactQuill theme="snow" value={Description} onChange={setDescription} />
                                                        </div>
                                                         {errors.Description && <span className='text-danger'>{errors.Description.message}</span>}
                                                    </div>
                                                    <div className='form-group' style={{width:"12%"}}>
                                                        <label htmlFor='Created Date' className="black"><b>Created Date</b></label>
                                                        <div>
                                                            <div>{moment().format('DD MMM YYYY HH:mm')}</div>
                                                        </div>
                                                    </div>
                                                    

                                                            {/*<div className='form-group' style={{display:"flex", alignItems:"center", columnGap:"15px", marginTop:"10px"}}>
                                                                <label className="bold black">Set Agent as Active?</label>
                                                                <InputSwitch checked={agent_enabled} onChange={(e) => setAgentEnabled(!agent_enabled)} />
                                                    </div>*/}
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

export default AnnouncementForm;