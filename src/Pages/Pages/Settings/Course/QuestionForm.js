import React, {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import Overlay from '../../../Components/Overlay';
import {
    useNavigate, useParams
} from "react-router-dom";
import { createQuestion, updateQuestion } from '../../../../Service/QuestionService';
import { InputSwitch } from 'primereact/inputswitch';
import { isObjectEmpty, renderFields } from '../../../Utils/Utils';
import { permissionCheck } from '../../../Utils/Utils';
import ScrollTop from '../../../Components/ScrollTop';
import {AiFillCloseCircle} from 'react-icons/ai';


const { $ } = window;   
const QuestionForm = () => {
    const { question_id, quiz_id, course_id } = useParams();
    let { userInfo } = useSelector(state => state.auth);
    const [state, setState] = useState({ processing : false });
    const navigate = useNavigate();
    
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({ defaultValues: {} });

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
        if(data.field_name){
            let regex = /^[a-zA-Z0-9\s]+$/;
            if(!regex.test(data.field_name)){
                Swal.fire({
                    icon: 'error',
                    title: 'Request Creation Failed!',
                    text: "Only alphanumeric characters and spaces are allowed in Field Name!"
                 }).then(_ => {
                    setState({...state, processing:false});
                 });

                 return;
            }
        }
        const user_input = data;
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

    //useEffect(() => console.log(field_type_selected), [field_type_selected]);

    return(
        <div className="content-wrapper" style={{height:"100vh"}}>
            <ScrollTop/>
            <form name="form-field" onSubmit={handleSubmit(onFormSubmit)}>
            <div className="row">
                <div className="col-lg-12" style={{paddingBottom:"20px", borderBottom: "1px solid #D4D4D4"}}>
                    <div className='row'>
                        <div className='col-md-6' style={{display:"flex"}}>
                            <div>
                                <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/service-request-fields')}>arrow_back</span>
                            </div>
                            <div>
                                <h4 className='fw-500' style={{paddingLeft: 25, color:"black"}}>{!field_id? "Add A New": "Edit"} Field</h4>
                                <h6 style={{paddingLeft: 25, color:"black"}}>{!field_id? "Configuration for the new field" : "Modify field data"}</h6>
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
                                                                <label className="bold black">Field Name<span style={{color:"red"}}>*</span></label><i style={{fontSize:"16px", color:"black"}}>--> Only alphanumeric characters and spaces are allowed</i>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <input {...register('field_name', { required: { value: true, message: 'Name is required' } })} className='inputLogin' />
                                                                </div>
                                                                {errors.field_name && <span className='text-danger'>{errors.field_name.message}</span>}
                                                            </div>
                                                            <div className='form-group' style={{marginBottom:"30px"}}>
                                                                <label className="bold black">Field Placeholder<span style={{color:"red"}}>*</span></label><i style={{fontSize:"16px", color:"black"}}>--> max. 500 chars</i>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <textarea maxLength="500" {...register('field_placeholder')} className='inputLogin' />
                                                                </div>
                                                                {errors.field_name && <span className='text-danger'>{errors.field_name.message}</span>}
                                                            </div>
                                                            <div className='form-group' style={{display:"flex", columnGap:"20px", alignItems:"center", margin:"3 0px 0"}}>
                                                                    <label htmlFor="ticket_number" className="black" style={{paddingTop:"0.5em"}}><b>Category:</b>&nbsp;<span style={{color:"red"}}>*</span></label>
                                                                    {!selected_category.id && <button type='button' className="btn" onClick={onShowCategoryModal} style={{cursor:"pointer", border:"1px solid black", background:"black", color:"white", borderRadius:"8px", fontSize:"16px"}}>+ Select Service Category</button>}
                                                                    {selected_category.id && 
                                                                    <div style={{display:"flex", alignItems:"center", columnGap:"10px"}}>
                                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                                <span>{selected_category.category_name}</span>
                                                                            </div>
                                                                            <div style={{color: "red", cursor:"pointer"}} onClick={() => setSelectedCategory({})}><AiFillCloseCircle/></div>
                                                                    </div>}
                                                            </div>
                                                            <div className='form-group' style={{marginBottom:"30px"}}>
                                                                <label className="bold black">Field Type<span style={{color:"red"}}>*</span></label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <select
                                                                    id="field_type"
                                                                    className="form-control"
                                                                    {...register('field_type',  { required: { value: true, message: 'Type is required' } })}
                                                                    onChange={onFieldTypeChange}
                                                                >
                                                                    <option value="">Select One</option>
                                                                    {field_types.map((item, i) => {
                                                                        return(<option key={i} value={item} >{item}</option>)
                                                                    })}
                                                                </select>
                                                                </div>
                                                                {errors.field_type && <span className='text-danger'>{errors.field_type.message}</span>}
                                                                {field_type_selected &&
                                                                    <div style={{marginTop:"20px", paddingLeft:"20px"}}>
                                                                    <h6 className="black bold">Field preview:</h6>
                                                                    <div>
                                                                        {renderFields(field_type_selected)}
                                                                    </div>
                                                                    </div>
                                                                }
                                                            </div>
                                                            <div className='form-group' style={{marginBottom:"30px"}}>
                                                                <label className="bold black">Field Identifier<span style={{color:"red"}}>*</span></label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <select
                                                                    id="field_type"
                                                                    className="form-control"
                                                                    {...register('field_identifier',  { required: { value: true, message: 'Identifier is required' } })} value="Service Request"
                                                                    disabled
                                                                >
                                                                    <option value="Service Request">Service Request</option>
                                                                    {/*field_identifiers.map((item, i) => {
                                                                        return(<option key={i} value={item}>{item}</option>)
                                                                    })*/}
                                                                </select>
                                                                </div>
                                                                {errors.field_identifier && <span className='text-danger'>{errors.field_identifier.message}</span>}
                                                            </div>
                                                            
                                                            <div className='form-group' style={{marginBottom:"30px"}}>
                                                                <label className="bold black">Field Length (in characters)<span style={{color:"red"}}>*</span></label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <input {...register('field_length', { required: { value: true, message: 'Length is required' } })} className='inputLogin' type="number" min="1"/>
                                                                </div>
                                                                {errors.field_length && <span className='text-danger'>{errors.field_length.message}</span>}
                                                            </div>

                                                            <div className='form-group' style={{marginBottom:"30px"}}>
                                                                <label className="bold black">Field Values {is_dropdown && <span style={{color:"red"}}>*</span>}</label><i style={{fontSize:"16px", color:"black"}}>--> separate multiple items with commas (",")</i>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <input {...register('field_source', {required: { value: is_dropdown, message: 'Values is required' } })} className='inputLogin' type="text"/>
                                                                </div>
                                                                {errors.field_source && <span className='text-danger'>{errors.field_source.message}</span>}
                                                            </div>
                                                            <div className='form-group'>
                                                                <h6 className="bold black">Behavior</h6>
                                                                <div className="row" style={{marginTop:"10px"}}>
                                                                    <div className="col-md-6">
                                                                        <h6 className="black">For Agents</h6>
                                                                        <div className="form-check">
                                                                            <input className="form-check-input" type="checkbox" value="" id="check1" {...register("for_agent_required_when_submitting_the_form")}/>
                                                                            <label className="black" for="check1">
                                                                                Required When Submitting The Form
                                                                            </label>
                                                                        </div>
                                                                       {/* <div className="form-check">
                                                                        <input className="form-check-input" type="checkbox" value="" id="check1" {...register("for_agent_required_when_closing_the_ticket")}/>
                                                                            <label className="black" for="check1">
                                                                                Required When Closing The Ticket
                                                                            </label>
                                                                </div>*/}
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <h6 className="black">For Requesters</h6>
                                                                        {/*<div className="form-check">
                                                                            <input className="form-check-input" type="checkbox" value="" id="check1" {...register("for_requester_displayed_to_requester")}/>
                                                                                <label className="black" for="check1">
                                                                                    Displayed To Requester
                                                                                </label>
                                                                        </div>
                                                                        <div className="form-check">
                                                                            <input className="form-check-input" type="checkbox" value="" id="check1" {...register("for_requester_requester_can_edit")}/>
                                                                                <label className="black" for="check1">
                                                                                    Requester Can Edit
                                                                                </label>
                                                                </div>*/}
                                                                        <div className="form-check">
                                                                        <input className="form-check-input" type="checkbox" value="" id="check1" {...register("for_requester_required_when_submitting_the_form")}/>
                                                                                <label className="black" for="check1">
                                                                                    Required When Submitting The Form
                                                                                </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                            </div>  
                                                            <div className='form-group'>
                                                                <h6 className="bold black">Field Label</h6>
                                                                <div className="row" style={{marginTop:"10px"}}>
                                                                    <div className="col-md-6">
                                                                        <h6 className="black">For Agents</h6>
                                                                        <div className='form-group'>
                                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                            <input className='inputLogin' {...register('label_for_agent', { required: { value: true, message: 'Label For Agent is required' } })} />
                                                                            </div>
                                                                            {errors.label_for_agent && <span className='text-danger'>{errors.label_for_agent.message}</span>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <h6 className="black">For Requesters</h6>
                                                                        <div className='form-group'>
                                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                            <input className='inputLogin' {...register('label_for_requester', { required: { value: true, message: 'Label For Requester is required' } })} />
                                                                            </div>
                                                                            {errors.label_for_requester && <span className='text-danger'>{errors.label_for_requester.message}</span>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                            </div> 
                                                            <div className='form-group' style={{display:"flex", alignItems:"center", columnGap:"15px", marginTop:"10px"}}>
                                                                <label className="black bold">Set Field as Active?</label>
                                                                <InputSwitch checked={field_enabled} onChange={(e) => setFieldEnabled(!field_enabled)} />
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