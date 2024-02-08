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
import ScrollToTop from 'react-scroll-to-top';
import { createMaterial, getMaterial, updateMaterial } from '../../../../Service/MaterialService';
import WysiwygText from '../../../../Components/WysiwygText';
import { includes } from 'lodash';

const { $ } = window;

let instructor_timer_id = -1;
const MaterialForm = () => {
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

        if(material_id && material_id != "null"){
            //if(permissionCheck(userInfo, "settings", "update")){
                getMaterial(material_id).then(res => {
                    if(res.data.Status == 200){
                        setValue('Name', res.data.Data.Name)
                        description_ref.current.setText(res.data.Data.Description)
                        setPhotoUpload({
                            img_upload: `${UPLOAD_DIR}${res.data.Data.FileUrl}   `
                        })
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed to get material data!"
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

    const { material_id, chapter_id, course_id } = useParams();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({ defaultValues: { Name: ''} });

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
                    title: "The image size is too large"
                });
            }

        }
    }

    const onFormSubmit = (data) => {
        setState({...state, processing:true})
        let user_input = Object.assign({}, data, {Description: description_ref.current.getValue()}, {CourseChapterID: chapter_id});
        let formData = new FormData();
        Object.keys(user_input).forEach(item => {
            formData.append(item, user_input[item])
        })
        if(!material_id || material_id == "null"){
            formData.append("file", photo_upload.File);
            createMaterial(formData).then(res => {
                if(res.status == 201){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "Material data has successfully been created!"
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
            if(photo_upload && photo_upload.File){
                formData.append("file", photo_upload.File);
            }
            updateMaterial(material_id ,formData).then(res => {
                if(res.data.Status == 200){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "Material data has successfully been updated!"
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
                                                    <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate(`/course/${course_id}`)}>arrow_back</span>
                                                </div>
                                                <div>
                                                    <h4 className='fw-500' style={{paddingLeft: 25, color:"black"}}>{(!material_id || material_id == "null")? "Add A New": "Edit"} Material</h4>
                                                    <h6 style={{paddingLeft: 25, color:"black"}}>{!material_id? "Configuration for the new material" : "Modify material data"}</h6>
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
                                                    <div className="form-group">
                                                        <label className="bold black">Material File</label>
                                                        <div>
                                                            {(photo_upload.img_upload) && <div>
                                                                <img className="img-account-profile mb-2" src={photo_upload.img_upload} alt="" style={{width:"10%"}} />
                                                            </div>}
                                                            {(!photo_upload?.img_upload) &&<div className="small font-italic text-muted mb-2">JPG, JPEG or PNG not larger than 1 MB</div>}
                                                            <button className="btn b2b-btn-add" type="button" onClick={()=> $('#picture-upload').click()}>
                                                                    Upload a new file
                                                            </button>
                                                            <input id="picture-upload" name="picture-upload" type="file" accept="image/png, image/jpg, image/jpeg, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .pdf, video/mp4" class='d-none'  onChange={(e) =>onImageChange(e)}/>
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

export default MaterialForm;