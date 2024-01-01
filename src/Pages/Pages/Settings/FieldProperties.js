import React, {useState, useEffect, useRef} from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import Overlay from '../../../Components/Overlay';
import {
    useNavigate, useParams
} from "react-router-dom";
import { createField, updateField, getField } from '../../../Service/FieldService';
import { InputSwitch } from 'primereact/inputswitch';
import { isObjectEmpty, renderFields } from '../../../Utils/Utils';
import { permissionCheck } from '../../../Utils/Utils';
import ScrollTop from '../../../Components/ScrollTop';


const { $ } = window;   
const FieldProperties = () => {
    const { field_id } = useParams();
    let { userInfo } = useSelector(state => state.auth);
    const [state, setState] = useState({ processing : false });
    const [field_enabled, setFieldEnabled] = useState(false);
    const [field_type_selected, setFieldTypeSelected] = useState("");
    const navigate = useNavigate();
    
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({ defaultValues: { field_name:'', for_agent_when_submitting_the_form:false, for_agent_when_closing_the_ticket:false, for_requester_displayed_to_requester:false, for_requester_requester_can_edit: false, for_requester_required_when_submitting_the_form: false, label_for_agent:'', label_for_requester:'', field_type:'', field_length:0, field_identifier:'Incident', field_source:''} });

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

                if(field_id){
                    if(permissionCheck(userInfo, "settings", "update")){
                        getField(field_id).then(res => {
                            console.log(res.status);
                            if(res.status == 200){
                                Object.keys(res.data).forEach(key => {
                                    setValue(key, res.data[key]);
                                    if(key == "field_enabled") setFieldEnabled(res.data[key]);
                                    if(key == "field_source" && res.data[key]){
                                        let obj = JSON.parse(res.data[key]);
                                        if(!isObjectEmpty(obj) && !isObjectEmpty(obj.value) && Array.isArray(obj.value)){
                                            let text = "";
                                            let i = 0;
                                            if(obj.value.length == 1 ) setValue("field_source", obj.value[0])
                                            else {
                                                obj.value.forEach(item => {
                                                    if(i < obj.value.length -1)text += item +",";
                                                    else text += item;
                                                    i++;
                                                })
                                                setValue("field_source", text)
                                            }
                                            
                                        }
                                    }
                                })
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error!',
                                    text: "Failed to get field data"
                                 })
                                navigate('/incident-fields');
                            }
                        }).catch(err => {
                            console.log(err);
                            Swal.fire({
                                icon: 'error',
                                title: 'Error!',
                                text: "Failed to get field data"
                             })
                            navigate('/incident-fields');
                        })
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "You're not allowed to access that page!"
                         })
                        navigate('/incident-fields');
                    }
                }
            }
        }
        
    },[]);

    const onFormSubmit = (data) => {
        const user_input = Object.assign({}, data, {field_mode:"user-defined"}, {field_enabled});
        if(user_input.field_source){
            user_input.field_source = JSON.stringify({
                value: [user_input.field_source]
            });
        }
        if(!field_id){
            createField(user_input).then(res => {
                if(res.data.status == 201){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "A new field has been created!"
                        }).then( () => navigate('/incident-fields'));
                   
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Field Creation Failed!',
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
            updateField(field_id, user_input).then(res => {
                if(res.status == 200){
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: "A field has been updated!"
                         }).then( () => navigate('/incident-fields'));
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Field Update Failed!',
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
        "text-single","text-multiple","dropdown-single","dropdown-multiple","number","datetime","checkbox","content"
    ];

    const field_identifiers = [
        "Service Request", "Incident", "Agent", "Requester"
    ];

    const onFieldTypeChange = (e) => {
        setValue("field_type", e.target.value);
        setFieldTypeSelected(e.target.value);
    }

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
                                <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/incident-fields')}>arrow_back</span>
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
                                                        <div style={{marginBottom:"10px"}}><span style={{color:"red"}}>*</span><span> = Mandatory.</span></div>
                                                            <div className='form-group' style={{marginBottom:"30px"}}>
                                                                <label className="bold black">Field Name<span style={{color:"red"}}>*</span></label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <input {...register('field_name', { required: { value: true, message: 'Name is required' } })} className='inputLogin' />
                                                                </div>
                                                                {errors.field_name && <span className='text-danger'>{errors.field_name.message}</span>}
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
                                                                    {...register('field_identifier',  { required: { value: true, message: 'Identifier is required' } })} value="Incident"
                                                                    disabled
                                                                >
                                                                    <option value="Incident">Incident</option>
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
                                                                <label className="bold black">Field Values</label><i style={{fontSize:"16px", color:"black"}}>--> separate multiple items with commas (",")</i>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <input {...register('field_source')} className='inputLogin' type="text"/>
                                                                </div>
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
                                                                        <div className="form-check">
                                                                        <input className="form-check-input" type="checkbox" value="" id="check1" {...register("for_agent_required_when_closing_the_ticket")}/>
                                                                            <label className="black" for="check1">
                                                                                Required When Closing The Ticket
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <h6 className="black">For Requesters</h6>
                                                                        <div className="form-check">
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
                                                                        </div>
                                                                        <div className="form-check">
                                                                        <input className="form-check-input" type="checkbox" value="" id="check1" {...register("for_requester_required_when_submitting_the_form")}/>
                                                                                <label className="black" for="check1">
                                                                                    Required When Submiting The Form
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

export default FieldProperties;