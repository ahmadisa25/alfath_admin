import React, {useState, useEffect, useRef} from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import Overlay from '../../../../Components/Overlay';
import {AiOutlineArrowUp} from 'react-icons/ai';
import {
    useNavigate,useParams
} from "react-router-dom";
import { permissionCheck, prunePhoneNumber, urlEncodeData } from '../../../../Utils/Utils';
import ScrollToTop from 'react-scroll-to-top';
import { createCourse, getCourse, updateCourse } from '../../../../Service/CourseService';
import { getAllInstructors } from '../../../../Service/InstructorService';
import Select from 'react-select';

const { $ } = window;

let instructor_timer_id = -1;
const CourseForm = () => {
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

        if(course_id){
            //if(permissionCheck(userInfo, "settings", "update")){
                getCourse(course_id).then(res => {
                    if(res.data.Status == 200){
                        setValue('Name', res.data.Data.Name)
                        setValue('Description', res.data.Data.Description)
                        setValue('Duration', res.data.Data.Duration)

                        if(res.data.Data.Instructors && res.data.Data.Instructors.length > 0){
                            const available_instructors = [...instructors];
                            res.data.Data.Instructors.forEach(item => {
                                available_instructors.push({label: `${item.Name} (${item.Email})`, value: item.ID}) 
                            })
                            setInstructors(available_instructors);
                        }
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed to get course data!"
                         })
                        navigate('/courses');
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

    const { course_id } = useParams();
    //const [agent_enabled, setAgentEnabled] = useState(false);
    const {processing, available_instructors, is_instructor_focus} = state;
    const { register, handleSubmit, getValues, reset, setValue, formState: { errors } } = useForm({ defaultValues: { Name: '',  MobilePhone: '', Email: ""} });
    const [instructors, setInstructors] = useState([]);
    const [multi_select_val, setMultiSelectVal] = useState("");

    const onChangeInstructor = (val) => {
        if (val.length >= 3) {
            clearTimeout(instructor_timer_id);
            instructor_timer_id = setTimeout(() => getAllInstructors({search:val}).then((res) => {
            let result = res.data.Data;
            const converted_data_array = [];
            result.forEach(item => {
                converted_data_array.push({
                    label: `${item.name} (${item.email})`,
                    value: item.id
                })
            })

            console.log(converted_data_array);
            setState({ ...state, is_instructor_focus: true, available_instructors: converted_data_array });
            }), 500);
        } else {
            clearTimeout(instructor_timer_id);
            setState({ ...state, is_instructor_focus: false, available_instructors: [] });
        }
    }

    const onSelectInstructor = (item) => {
        setInstructors(item);
        setState({ ...state, is_instructor_focus: false, available_instructors: []});
    };

    const onFormSubmit = (data) => {
        if(!instructors || instructors.length == 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "Please select at least 1 instructor!"
             })

             return;
        }
        const converted_data_array = [];
        instructors.forEach(item => {
            converted_data_array.push(item.value);
        })
        setState({...state, processing:true})
        let user_input = Object.assign({}, data, {Instructors:converted_data_array});
        user_input.MobilePhone =  user_input.MobilePhone && user_input.MobilePhone > 0 ?  prunePhoneNumber(user_input.MobilePhone): 0;
        user_input = urlEncodeData(user_input)
        if(!course_id){
            createCourse(user_input).then(res => {
                if(res.status == 201){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "Course data has successfully been created!"
                     }).then(_ => {
                        navigate('/courses');
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
            updateCourse(course_id ,user_input).then(res => {
                if(res.data.Status == 200){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "Course data has successfully been updated!"
                     }).then(_ => {
                        navigate('/courses');
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
                                                    <div className='form-group'>
                                                        <label htmlFor='Description' className="black"><b>Description</b> <span style={{color:"red"}}>*</span></label>
                                                        <textarea rows="10" className="inputLogin" maxLength="2000" id="Description" {...register("Description", {
                                                        required: 'Course description is required!',
                                                        })} placeholder="Type min 3 char" className='form-control' autoComplete="off"/>
                                                         {errors.Description && <span className='text-danger'>{errors.Description.message}</span>}
                                                    </div>
                                                    <div className='form-group'>
                                                        <label htmlFor='Instructors' className="black"><b>Instructors</b> <span style={{color:"red"}}>*</span><i style={{fontSize:"16px"}}>--> type in lowercase only</i></label>
                                                        <Select
                                                                            value={instructors}
                                                                            options={available_instructors}
                                                                            isMulti
                                                                            onInputChange={(e) => {
                                                                                setMultiSelectVal(e);
                                                                                onChangeInstructor(e)
                                                                            }}
                                                                            onChange={(e) => onSelectInstructor(e)}
                                                                            
                                                        />
                                                    </div>
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

export default CourseForm;