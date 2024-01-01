import React, {useState, useEffect, useRef} from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import Overlay from '../../../Components/Overlay';
import { InputSwitch } from 'primereact/inputswitch';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {AiFillCloseCircle} from 'react-icons/ai';
import {
    useNavigate,useParams
} from "react-router-dom";
import { permissionCheck } from '../../../Utils/Utils';
import {createHour, updateHour, getHour} from '../../../Service/BusinessHoursService';

const GENERAL_INFO = 1;


const { $ } = window;
let email_timer_id = -1;
let group_timer_id = -1;
const BusinessHoursForm = () => {
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

        if(bh_id){
            if(permissionCheck(userInfo, "settings", "update")){
                const work_hours = {...working_hours};
                const timeoff_hours = {...break_hours};
                getHour(bh_id).then(res => {
                    if(res.status == 200){
                        Object.keys(res.data).forEach(key => {
                            setValue(key, res.data[key]);
                            
                            if(key == "business_hour_enabled") setBusinessHourEnabled(res.data[key])
                            else if((key.search("break_from") > -1 || key.search("break_to") > -1) && res.data[key]){
                                
                                timeoff_hours[key] = moment(res.data[key], "HH:mm:ss").format("HH:mm");
                                const dayname = key.split("_")[0];
                                timeoff_hours[`break_hour_${dayname}`] = true;
                             
                            }else if((key.search("_from") > -1 || key.search("_to") > -1) && res.data[key]){
                                
                                work_hours[key] = moment(res.data[key], "HH:mm:ss").format("HH:mm");
                                const dayname = key.split("_")[0];
                                work_hours[`business_hour_${dayname}`] = true;
                                
                            }
                           
                        })
                        setBreakHours(timeoff_hours);
                        setWorkingHours(work_hours);
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed to get business hour data"
                         })
                        navigate('/');
                    }
                }).catch(err => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "Failed to get business hour data"
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

    const { bh_id } = useParams();
    const [business_hour_enabled, setBusinessHourEnabled] = useState(false);
    const [working_hours, setWorkingHours] = useState({
        'business_hour_mon':false,
        'business_hour_tue':false,
        'business_hour_wed':false,
        'business_hour_thu':false,
        'business_hour_fri':false,
        'business_hour_sat':false,
        'business_hour_sun':false,
        'mon_from':null,
        'mon_to':null,
        'tue_from':null,
        'tue_to':null,
        'wed_from':null,
        'wed_to':null,
        'thu_from':null,
        'thu_to':null,
        'fri_from':null,
        'fri_to':null,
        'sat_from':null,
        'sat_to':null,
        'sun_from':null,
        'sun_to':null
    });
    const [break_hours, setBreakHours] = useState({
        'break_hour_mon':false,
        'break_hour_tue':false,
        'break_hour_wed':false,
        'break_hour_thu':false,
        'break_hour_fri':false,
        'break_hour_sat':false,
        'break_hour_sun':false,
        'mon_break_from':null,
        'mon_break_to':null,
        'tue_break_from':null,
        'tue_break_to':null,
        'wed_break_from':null,
        'wed_break_to':null,
        'thu_break_from':null,
        'thu_break_to':null,
        'fri_break_from':null,
        'fri_break_to':null,
        'sat_break_from':null,
        'sat_break_to':null,
        'sun_break_from':null,
        'sun_break_to':null
    });
    const {processing} = state;
    const { register, handleSubmit, getValues, reset, setValue, formState: { errors } } = useForm({ defaultValues: { business_hour:"", business_hour_description:""} });

    const onDeleteTime = (key1, key2, type) => {
        if(type == "work"){
            const work_hours = {...working_hours};
            work_hours[key1] = "";
            work_hours[key2] = "";
            const dayname = key1.split("_")[0];
            work_hours[`business_hour_${dayname}`] = false;
            setWorkingHours(work_hours);
        } else {
            const timeoff_hours = {...break_hours};
            timeoff_hours[key1] = "";
            timeoff_hours[key2] = "";
            const dayname = key1.split("_")[0];
            timeoff_hours[`break_hour_${dayname}`] = false;
            setBreakHours(timeoff_hours);
        }
    }

    const onChangeTime = (time, key, type) => {
        if(time){
            let waktu = moment(time).format("HH:mm");
            if(type == "work"){
                const work_hours = {...working_hours};
                work_hours[key] = waktu;
                const dayname = key.split("_")[0];
                work_hours[`business_hour_${dayname}`] = true;
                setWorkingHours(work_hours);
            } else {
                const timeoff_hours = {...break_hours};
                timeoff_hours[key] = waktu;
                const dayname = key.split("_")[0];
                timeoff_hours[`break_hour_${dayname}`] = true;
                setBreakHours(timeoff_hours);
            }
        }
        
    }

    const onReset = () => {
        reset({ business_hour:"", business_hour_description:""});
        setBreakHours({
            'mon_break_from':"",
            'mon_break_to':"",
            'tue_break_from':"",
            'tue_break_to':"",
            'wed_break_from':"",
            'wed_break_to':"",
            'thu_break_from':"",
            'thu_break_to':"",
            'fri_break_from':"",
            'fri_break_to':"",
            'sat_break_from':"",
            'sat_break_to':"",
            'sun_break_from':"",
            'sun_break_to':""
        });
        setWorkingHours({
            'mon_from':"",
            'mon_to':"",
            'tue_from':"",
            'tue_to':"",
            'wed_from':"",
            'wed_to':"",
            'thu_from':"",
            'thu_to':"",
            'fri_from':"",
            'fri_to':"",
            'sat_from':"",
            'sat_to':"",
            'sun_from':"",
            'sun_to':""
        });
        setState({
            processing: false
        });
    }

    const onFormSubmit = (data) => {
        setState({...state, processing:true})
        const user_input = Object.assign({}, data, {business_hour_enabled}, working_hours, break_hours);
        if(!bh_id){
            createHour(user_input).then(res => {
                if(res.status == 201){
                    setState({...state, processing:false})
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "A new business hour has been created!"
                     }).then( () => navigate('/business-hours'));
                } else {
                    setState({...state, processing:false})
                    Swal.fire({
                        icon: 'error',
                        title: 'Business hour Creation Failed!',
                        text: res.data.message
                     });
                } 
            }).catch(err => {
                setState({...state, processing:false})
                let msg = "There's an error in processing your request. Please try again or contact support";
                if(err.response && err.response.data && err.response.data.message) msg = err.response.data.message;
                Swal.fire({
                    icon: 'error',
                    title: "error",
                    text: msg
                 });
            })
        } else{
            updateHour(bh_id, user_input).then(res => {
                if(res.data.status == 200){
                    setState({...state, processing:false})
                     Swal.fire({
                                icon: 'success',
                                title: 'Success!',
                                text: "A Business Hour has been updated!"
                             }).then( () => navigate('/business-hours'));
                } else {
                    setState({...state, processing:false})
                    Swal.fire({
                        icon: 'error',
                        title: 'Business Hour Update Failed!',
                        text: res.data.message
                     });
                } 
            }).catch(err => {
                setState({...state, processing:false})
                let msg = "There's an error in processing your request. Please try again or contact support";
                if(err.response && err.response.data && err.response.data.message) msg = err.response.data.message;
                Swal.fire({
                       icon: 'error',
                    title: "error",
                    text: msg
                 });
            })
        }
        
    }
    
    return(
        <div className="content-wrapper" style={{height:"120vh"}}>
            <div className="row" style={{ height: "120vh"}}>
                    <div className={'col-md-12'}>
                            <form name="form-biz-hours" onSubmit={handleSubmit(onFormSubmit)}>
                            <div>
                            <div className='row'>
                                            <div className='col-md-6' style={{display:"flex"}}>
                                                <div>
                                                    <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/business-hours')}>arrow_back</span>
                                                </div>
                                                <div>
                                                    <h4 className='fw-500' style={{paddingLeft: 25, color:"black"}}>{!bh_id? "Add A New": "Edit"} Business Hour</h4>
                                                    <h6 style={{paddingLeft: 25, color:"black"}}>{!bh_id? "Configuration for the new business hour" : "Modify business hour data"}</h6>
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
                                                            <label className="bold black">Name <span style={{color:"red"}}>*</span></label>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                            <input maxlength="500" {...register('business_hour', { required: { value: true, message: 'Name is required' } })} className='inputLogin' />
                                                            </div>
                                                            {errors.business_hour && <span className='text-danger'>{errors.business_hour.message}</span>}
                                                        </div>
                                                        <div className='form-group'>
                                                            <label className="bold black"> Description</label>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                            <textarea {...register('business_hour_description', { required: { value: true, message: 'Description is required' } })} className='inputLogin' />
                                                            </div>
                                                            {errors.business_hour_description && <span className='text-danger'>{errors.business_hour_description.message}</span>}
                                                        </div>
                                                        <div className='form-group' style={{display:"flex", alignItems:"center", columnGap:"15px", marginTop:"10px"}}>
                                                                <label className="bold black">Set Business Hour as Active?</label>
                                                                <InputSwitch checked={business_hour_enabled} onChange={(e) => setBusinessHourEnabled(!business_hour_enabled)} />
                                                         </div>
                                                        <div style={{margin:"10px 0 30px 0"}}>
                                                            <h6 className="black bold">Service Desk Hours: </h6>
                                                        </div>
                                                        
                                                        
                                                    </>
                                                </div>
                                            </div>

                                            <div style={{paddingLeft:"20px"}}> 
                                                <table className="table table-condensed" style={{borderRadius:0, marginBottom: 0, padding: "0.4rem"}}>
                                                        <thead>
                                                            <tr>
                                                                <th className='b2b-th'>Day</th>
                                                                <th className='b2b-th'>Work Hour</th>
                                                                <th className='b2b-th'>Break Hour</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((item, i) => 
                                                                    <tr style={{borderBottom:"1px solid black"}}>
                                                                        <td>
                                                                            {item}
                                                                        </td>
                                                                        <td>
                                                                            <div style={{display:"flex", columnGap:"10px"}}>
                                                                                <DatePicker onChange={(time) => onChangeTime(time,`${item.toLowerCase()}_from`, "work")} value={working_hours[`${item.toLowerCase()}_from`]} name={`${item.toLowerCase()}_from`}      showTimeSelect
                                                                                showTimeSelectOnly
                                                                                timeIntervals={30}
                                                                                timeCaption="Time"
                                                                                dateFormat="LT"
                                                                                placeholderText="--"
                                                                                dropdownMode="select"
                                                                                className="custom-datepicker"
                                                                                autoComplete="off"/>

                                                                                <div>&nbsp;&nbsp;to&nbsp;&nbsp;</div>

                                                                                <DatePicker onChange={(time) => onChangeTime(time,`${item.toLowerCase()}_to`, "work")} value={working_hours[`${item.toLowerCase()}_to`]} name={`${item.toLowerCase()}_to`}
                                                                                showTimeSelect
                                                                                showTimeSelectOnly
                                                                                timeIntervals={30}
                                                                                timeCaption="Time"
                                                                                dateFormat="LT"
                                                                                placeholderText="--"
                                                                                dropdownMode="select"
                                                                                className="custom-datepicker"
                                                                                autoComplete="off"/>

                                                                                <div style={{display:"flex", alignItem: "center", columnGap: "10px"}}>
                                                                                    <div style={{color: "red", cursor:"pointer"}} onClick={(e) => onDeleteTime(`${item.toLowerCase()}_from`, `${item.toLowerCase()}_to`, "work")}><AiFillCloseCircle/></div>
                                                                                </div>  
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div style={{display:"flex"}}>
                                                                                <DatePicker onChange={(time) => onChangeTime(time,`${item.toLowerCase()}_break_from`, "break")} value={break_hours[`${item.toLowerCase()}_break_from`]} name={`${item.toLowerCase()}_break_from`}
                                                                                showTimeSelect
                                                                                showTimeSelectOnly
                                                                                timeIntervals={30}
                                                                                timeCaption="Time"
                                                                                dateFormat="LT"
                                                                                placeholderText="--"
                                                                                dropdownMode="select"
                                                                                className="custom-datepicker"
                                                                                autoComplete="off"/>

                                                                                <div>&nbsp;&nbsp;to&nbsp;&nbsp;</div>

                                                                                <DatePicker onChange={(time) => onChangeTime(time,`${item.toLowerCase()}_break_to`, "break")} value={break_hours[`${item.toLowerCase()}_break_to`]}name={`${item.toLowerCase()}_break_to`}
                                                                                showTimeSelect
                                                                                showTimeSelectOnly
                                                                                timeIntervals={30}
                                                                                timeCaption="Time"
                                                                                dateFormat="LT"
                                                                                placeholderText="--"
                                                                                dropdownMode="select"
                                                                                className="custom-datepicker"
                                                                                autoComplete="off"/>

                                                                                <div style={{display:"flex", alignItem: "center", columnGap: "10px"}}>
                                                                                    <div style={{color: "red", cursor:"pointer"}} onClick={(e) => onDeleteTime(`${item.toLowerCase()}_break_from`, `${item.toLowerCase()}_break_to`, "break")}><AiFillCloseCircle/></div>
                                                                                </div> 
                                                                            </div>
                                                                        </td>
                                                                    </tr> 
                                                            )}
                                                            
                                                                
                                                        </tbody>
                                                    </table>
                                                {/*<div style={{display: "flex", columnGap:"55px", width:"100%"}}>
                                                    <div className="form-check" style={{paddingTop:"10px"}}>
                                                            {bh_id && <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault"/>}
                                                            <label className="form-check-label" for="flexCheckDefault">
                                                                Monday
                                                            </label>
                                                    </div>

                                                    <div style={{display: "flex", columnGap:"5px"}}>
                                                            <div className='form-group'>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                    <select className="form-select inputLogin" aria-label="Default select example">
                                                                        <option selected>30</option>
                                                                        <option value="1">One</option>
                                                                        <option value="2">Two</option>
                                                                        <option value="3">Three</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className='form-group'>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                    <select className="form-select inputLogin" aria-label="Default select example">
                                                                        <option selected>Mins</option>
                                                                        <option value="1">One</option>
                                                                        <option value="2">Two</option>
                                                                        <option value="3">Three</option>
                                                                    </select>
                                                                </div>
                                                        </div>
                                                    </div>
                                                    <div style={{paddingTop:"10px"}}>to</div>
                                                    <div style={{display: "flex", columnGap:"5px"}}>
                                                        <div className='form-group'>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <select className="form-select inputLogin" aria-label="Default select example">
                                                                    <option selected>30</option>
                                                                    <option value="1">One</option>
                                                                    <option value="2">Two</option>
                                                                    <option value="3">Three</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className='form-group'>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <select className="form-select inputLogin" aria-label="Default select example">
                                                                    <option selected>Mins</option>
                                                                    <option value="1">One</option>
                                                                    <option value="2">Two</option>
                                                                    <option value="3">Three</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{paddingTop:"10px"}}>9 hours</div>
                                                </div>*/}
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

export default BusinessHoursForm;