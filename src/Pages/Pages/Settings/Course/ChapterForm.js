import React, {useState, useEffect, useRef} from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import Overlay from '../../../../Components/Overlay';
import {AiOutlineArrowUp} from 'react-icons/ai';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    useNavigate,useParams
} from "react-router-dom";
import { permissionCheck, urlEncodeData } from '../../../../Utils/Utils';
import ScrollToTop from 'react-scroll-to-top';
import { createChapter, getChapter, updateChapter } from '../../../../Service/ChapterService';
import WysiwygText from '../../../../Components/WysiwygText';

const { $ } = window;

let instructor_timer_id = -1;
const ChapterForm = () => {
    let { userInfo } = useSelector(state => state.auth);
    const description_ref = useRef(null);
    const UPLOAD_DIR = process.env.REACT_APP_IMAGE_URL;
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

        if(chapter_id && chapter_id !== "null"){
            //if(permissionCheck(userInfo, "settings", "update")){
                getChapter(chapter_id).then(res => {
                    if(res.data.Status == 200){
                        setValue('Name', res.data.Data.Name)
                        description_ref.current.setText(res.data.Data.Description)
                        //setDescription(res.data.Data.Description)
                        setValue('Duration', res.data.Data.Duration)
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed to get course data!"
                         })
                        navigate(`/course/${course_id}`);
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

    const { chapter_id, course_id } = useParams();
    //const [agent_enabled, setAgentEnabled] = useState(false);
    const {processing, available_instructors, is_instructor_focus} = state;
    const { register, handleSubmit, getValues, reset, setValue, formState: { errors } } = useForm({ defaultValues: { Name: ''} });
    const [instructors, setInstructors] = useState([]);
    const [multi_select_val, setMultiSelectVal] = useState("");

    const [photo_upload, setPhotoUpload] = useState({
        img_upload:"",
        File:""
    });

    const onFormSubmit = (data) => {
        setState({...state, processing:true})
        let user_input = Object.assign({}, data, {Description: description_ref.current.getValue()}, {CourseID:course_id});
        user_input = urlEncodeData(user_input);
        if(!chapter_id || chapter_id == "null"){
            createChapter(user_input).then(res => {
                if(res.status == 201){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "Chapter data has successfully been created!"
                     }).then(_ => {
                        navigate(`/course/${course_id}`);
                     })
                 
                }
            }).catch(({response: {data}}) => {
                setState({...state, processing: false})
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: data && data.Message || "There's an error with your request. Please try again or contact support!"
                 }).then(_ => {
                    setState({...state, processing: false})
                 })
            })
        } else{
            updateChapter(chapter_id ,user_input).then(res => {
                if(res.data.Status == 200){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "Chapter data has successfully been updated!"
                     }).then(_ => {
                        navigate(`/course/${course_id}`);
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
                                                    <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/courses')}>arrow_back</span>
                                                </div>
                                                <div>
                                                    <h4 className='fw-500' style={{paddingLeft: 25, color:"black"}}>{!course_id? "Add A New": "Edit"} Course</h4>
                                                    <h6 style={{paddingLeft: 25, color:"black"}}>{!course_id? "Configuration for the new course" : "Modify course data"}</h6>
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
                                                            <input {...register('Name', { required: { value: true, message: 'Title is required' } })} className='inputLogin' />
                                                            </div>
                                                            {errors.Name && <span className='text-danger'>{errors.Name.message}</span>}
                                                    </div>
                                                    <WysiwygText label={"Description"} required={true} ref={description_ref}/>
                                                    <div className='form-group' style={{width:"12%"}}>
                                                        <label htmlFor='Duration' className="black"><b>Duration</b> <span style={{color:"red"}}>*</span><i style={{fontSize:"16px"}}>--> type numbers only</i></label>
                                                        <div className='d-flex align-items-center' style={{columnGap:"20px"}}>
                                                            <div>
                                                                <input type="number" className="inputLogin" maxLength="2000" id="Duration" {...register("Duration", {
                                                                required: 'Course duration is required!',
                                                                })} placeholder="60" className='form-control' autoComplete="off"/>
                                                            </div>
                                                            <div>Minutes</div>
                                                        </div>
                                                        {errors.Duration && <span className='text-danger'>{errors.Duration.message}</span>}
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

export default ChapterForm;