import React, {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import Overlay from '../../../../Components/Overlay';
import {
    useNavigate, useParams
} from "react-router-dom";
import { createQuestion, updateQuestion, getQuestion } from '../../../../Service/QuestionService';
import { renderFields, urlEncodeData } from '../../../../Utils/Utils';
import { permissionCheck } from '../../../../Utils/Utils';
import ScrollTop from '../../../../Components/ScrollTop';


const { $ } = window;   
const QuestionForm = () => {
    const { question_id, quiz_id, course_id } = useParams();
    let { userInfo } = useSelector(state => state.auth);
    const [state, setState] = useState({ processing : false });
    const navigate = useNavigate();
    
    const { register, watch, handleSubmit, setValue, getValues, formState: { errors } } = useForm({ defaultValues: {
        Name: "",
        Type: "",
        Length: 0,
        Choices:[]
    }});

    const selectedType = watch("Type");

    const onFieldTypeChange = (e) => {
        setValue("Type", e.target.value);
    }
    

    useEffect(() => {
        if(userInfo.access){
            if(userInfo.access.settings){
                if(!userInfo.access.settings.can_create && !userInfo.access.settings.can_edit) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "You're not allowed to access that page!"
                     })
                    navigate('/');
                }

                if(question_id && question_id != "null"){
                    //if(permissionCheck(userInfo, "settings", "update")){
                        getQuestion(question_id).then(res => {
                            if(res.data.Status == 200){
                                Object.keys(res.data.Data).forEach(item => 
                                    setValue(item, res.data.Data[item])
                                )
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error!',
                                    text: "Failed to get question data!"
                                 })
                                navigate(`/quiz/${quiz_id}/${course_id}`);
                            }
                        }).catch(err => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error!',
                                text: "Failed to get question data"
                             })
                             navigate(`/quiz/${quiz_id}/${course_id}`);
                        })
                    /*} else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "You're not allowed to access that page!"
                         })
                        navigate('/service-request-fields');
                    }*/
                }
            }
        }
        
    },[]);

    const onFormSubmit = (data) => {
        if(data.title){
            let regex = /^[a-zA-Z0-9\s]+$/;
            if(!regex.test(data.Title)){
                Swal.fire({
                    icon: 'error',
                    title: 'Question Creation Failed!',
                    text: "Only alphanumeric characters and spaces are allowed in Question Title!"
                 }).then(_ => {
                    setState({...state, processing:false});
                 });

                 return;
            }
        }
        let user_input = Object.assign({}, data, {ChapterQuizID: quiz_id});
        user_input = urlEncodeData(user_input)
        if(!question_id || question_id == "null"){
            createQuestion(user_input).then(res => {
                if(res.status == 201){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "A new question has been created!"
                        }).then( () => navigate(`/quiz/${quiz_id}/${course_id}`));
                   
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Question Creation Failed!',
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
            updateQuestion(question_id, user_input).then(res => {
                if(res.data.Status == 200){
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: "A question has been updated!"
                         }).then( () => navigate(`/quiz/${quiz_id}/${course_id}`));
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Question Update Failed!',
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

    const field_types = [
        "single-text", "multiple-text", "single-choices","multiple-choices"
    ];

    return(
        <div className="content-wrapper" style={{height:"100vh"}}>
            <ScrollTop/>
            <form name="form-field" onSubmit={handleSubmit(onFormSubmit)}>
            <div className="row">
                <div className="col-lg-12" style={{paddingBottom:"20px", borderBottom: "1px solid #D4D4D4"}}>
                    <div className='row'>
                        <div className='col-md-6' style={{display:"flex"}}>
                            <div>
                                <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate(`/quiz/${quiz_id}/${course_id}`)}>arrow_back</span>
                            </div>
                            <div>
                                <h4 className='fw-500' style={{paddingLeft: 25, color:"black"}}>{(!question_id || question_id =="null")? "Add A New": "Edit"} Question</h4>
                                <h6 style={{paddingLeft: 25, color:"black"}}>{(!question_id || question_id =="null")? "Configuration for the new question" : "Modify question data"}</h6>
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

                </div>
                
            </div>
            <div className="row" style={{ borderTop: "1px solid #D0D5DD", height: "100vh"}}>
                    <div className='col-md-12'>
                                    <div>
                                        <div>
                                            <div style={{padding: "40px 60px 0 60px"}}>
                                                <div className="row">
                                                    <div className='full-width' style={{padding: "0 20px"}}>
                                                        <Overlay display={state.processing} />
                                                        <>
                                                        <div style={{marginBottom:"30px"}}><span style={{color:"red"}}>*</span><span> = Mandatory.</span></div>
                                                            <div className='form-group' style={{marginBottom:"30px"}}>
                                                                <label className="bold black">Question Title<span style={{color:"red"}}>*</span></label><i style={{fontSize:"16px", color:"black"}}>--> Only alphanumeric characters and spaces are allowed</i>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <input {...register('Title', { required: { value: true, message: 'Title is required' } })} className='inputLogin' />
                                                                </div>
                                                                {errors.Title && <span className='text-danger'>{errors.Title.message}</span>}
                                                            </div>
                                                            <div className='form-group' style={{marginBottom:"30px"}}>
                                                                <label className="bold black">Field Type<span style={{color:"red"}}>*</span></label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <select
                                                                    id="field_type"
                                                                    className="form-control"
                                                                    {...register('Type',  { required: { value: true, message: 'Question Type is required' } })}
                                                                    onChange={onFieldTypeChange}
                                                                >
                                                                    <option value="">Select One</option>
                                                                    {field_types.map((item, i) => {
                                                                        return(<option key={i} value={item} >{item}</option>)
                                                                    })}
                                                                </select>
                                                                </div>
                                                               
                                                                {selectedType &&
                                                                    <div style={{marginTop:"20px", paddingLeft:"20px"}}>
                                                                    <h6 className="black bold">Field preview:</h6>
                                                                    <div>
                                                                        {renderFields(selectedType)}
                                                                    </div>
                                                                    </div>
                                                                }
                                                            </div>
                                                             {errors.Type && <span className='text-danger'>{errors.Type.message}</span>}

                                                            {(selectedType == "single-choices" || selectedType == "multiple-choices") && 
                                                             <div className='form-group' style={{marginBottom:"30px"}}>
                                                                <label className="bold black">Field Values <span style={{color:"red"}}>*</span></label><i style={{fontSize:"16px", color:"black"}}>--> separate multiple items with commas (",")</i>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <input type="text" {...register('Choices', {required: { value: true, message: 'Choices are required' } })} className='inputLogin' type="text" maxLength="500"/>
                                                                </div>
                                                                {errors.Choices && <span className='text-danger'>{errors.Choices.message}</span>}
                                                            </div>
                                                            }
                                                            <div className='form-group' style={{marginBottom:"30px"}}>
                                                                <label className="bold black">Answer Length (in characters)<span style={{color:"red"}}>*</span></label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <input {...register('Length', { required: { value: true, message: 'Length is required' } })} className='inputLogin' type="number" min="1"/>
                                                                </div>
                                                                {errors.Length && <span className='text-danger'>{errors.Length.message}</span>}
                                                            </div>
                                                        </>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                
                            
                        
                    </div>
            </div>
            </form>
        </div>
    )
}

export default QuestionForm;