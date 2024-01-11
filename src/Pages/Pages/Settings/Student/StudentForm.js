import React, {useState, useEffect, useRef} from 'react';
import { useSelector } from 'react-redux';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import Overlay from '../../../../Components/Overlay';
import { id_flag } from '../../../../Images';
import { RxCaretDown } from 'react-icons/rx';
import {AiOutlineArrowUp} from 'react-icons/ai';
import {
    useNavigate,useParams
} from "react-router-dom";
import { permissionCheck, prunePhoneNumber, urlEncodeData } from '../../../../Utils/Utils';
import ScrollToTop from 'react-scroll-to-top';
import { createStudent, getStudent, updateStudent } from '../../../../Service/StudentService';

const { $ } = window;
const StudentForm = () => {
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

        if(student_id){
            //if(permissionCheck(userInfo, "settings", "update")){
                getStudent(student_id).then(res => {
                    if(res.data.Status == 200){
                        setValue('Name', res.data.Data.Name)
                        setValue('Email', res.data.Data.Email)
                        setValue('MobilePhone', res.data.Data.MobilePhone)
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
    });

    const { student_id } = useParams();
    //const [agent_enabled, setAgentEnabled] = useState(false);
    const {processing} = state;
    const { register, handleSubmit, getValues, reset, setValue, formState: { errors } } = useForm({ defaultValues: { Name: '',  MobilePhone: '', Email: ""} });

    const onReset = () => {
        reset({ Name: '',  MobilePhone: '', Email: ""});
        setState({
            processing: false,
            isEmailFocus: false,
            isGroupFocus: false,
            users:[],
            groups:[]
        });
    }

    const onFormSubmit = (data) => {
        setState({...state, processing:true})
        let user_input = Object.assign({}, data);
        user_input.MobilePhone =  user_input.MobilePhone && user_input.MobilePhone > 0 ?  prunePhoneNumber(user_input.MobilePhone): 0;
        user_input = urlEncodeData(user_input)
        if(!student_id){
            createStudent(user_input).then(res => {
                if(res.status == 201){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "Student data has successfully been created!"
                     }).then(_ => {
                        navigate('/students');
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
            updateStudent(student_id ,user_input).then(res => {
                if(res.data.Status == 200){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "Student data has successfully been updated!"
                     }).then(_ => {
                        navigate('/students');
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
                    <div className={'col-md-12'}>
                            <form name="form-agent" onSubmit={handleSubmit(onFormSubmit)}>
                                        <div>
                                        <div className='row'>
                                            <div className='col-md-6' style={{display:"flex"}}>
                                                <div>
                                                    <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/students')}>arrow_back</span>
                                                </div>
                                                <div>
                                                    <h4 className='fw-500' style={{paddingLeft: 25, color:"black"}}>{!student_id? "Add A New": "Edit"} Student</h4>
                                                    <h6 style={{paddingLeft: 25, color:"black"}}>{!student_id? "Configuration for the new student" : "Modify student data"}</h6>
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
                                                            <label className="bold black">Name <span style={{color:"red"}}>*</span></label>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                            <input {...register('Name', { required: { value: true, message: 'Name is required' } })} className='inputLogin' />
                                                            </div>
                                                            {errors.Name && <span className='text-danger'>{errors.Name.message}</span>}
                                                    </div>
                                                    <div className='form-group'>
                                                        <label htmlFor='Email' className="black"><b>E-mail</b> <span style={{color:"red"}}>*</span><i style={{fontSize:"16px"}}>--> type in lowercase only</i></label>
                                                        <input className="inputLogin" maxLength="500" id="Email" {...register("Email", {
                                                        required: 'Email is required!',
                                                        })} placeholder="Type min 3 char" className='form-control' autoComplete="off" disabled={student_id && student_id >0}/>

                                                    </div>
                                                            
                                                                    <div className='form-group'>
                                                                        <label><b style={{color:"black"}}>Mobile Number</b> <span style={{color:"red"}}>*</span><i style={{fontSize:"16px"}}>--> numbers only</i></label>
                                                                        <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                            <div style={{display:'flex', alignItems:'center', columnGap:"5px"}}>
                                                                                <div style={{paddingLeft:"10px"}}>
                                                                                    <img src={id_flag}/>
                                                                                </div>
                                                                                <RxCaretDown></RxCaretDown>
                                                                                <div>(+62)</div>
                                                                                <div style={{width:"100%"}}>
                                                                                    <input maxLength="20" type="tel"  pattern="[0-9]+"{...register('MobilePhone', { required: { value: true, message: 'Mobile Number is required' } })} className='inputLogin' id="register-mobile-input" style={{width:"100%"}}/>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {errors.MobilePhone&& <span className='text-danger'>{errors.MobilePhone.message}</span>}
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

export default StudentForm;