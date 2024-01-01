import { useEffect, useRef, useState } from 'react';
import {
    useNavigate, useParams
} from "react-router-dom";
import { useSelector } from 'react-redux';
import MTable from '../../../Components/MTable/MTable';
import Swal from 'sweetalert2';
import Overlay from '../../../Components/Overlay';
import moment from 'moment';
import {BsTrashFill} from 'react-icons/bs';
import ActionButton from '../../../Components/MTable/ActionButton';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'moment/locale/id';
import { permissionCheck } from '../../../Utils/Utils';
import { useForm } from 'react-hook-form';
import {getAllHolidays, deleteHoliday, createHoliday} from '../../../Service/BusinessHolidayService';
import {getHour} from '../../../Service/BusinessHoursService';


const { $ } = window;   
const BusinessHolidays = () => {
    const { bh_id } = useParams();
    let { userInfo } = useSelector(state => state.auth);
    moment.locale('id');
    //const [modal_state, setModalState] = useState("add");
    const navigate = useNavigate();
    const tableAgent = useRef();
    const [bh_info, setBusinessHourInfo] = useState({});
    const [state, setState] = useState({ processing : false });
    const { register, handleSubmit, reset,formState: { errors } } = useForm({ defaultValues: { holiday_description:""} });
    const [holiday, setHoliday] = useState("");

    const onAddData = () => {
        $('#modal-holiday').modal('show');
        //navigate('/business-hours-form');
    }

    useEffect(() => {
        if(userInfo.access){
            if(userInfo.access.settings){
                if(!userInfo.access.settings.can_view) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "You're not allowed to access that page!"
                     })
                    navigate('/');
                }
            }
        }

        getHour(bh_id).then(res => {
            if(res.status == 200){
                setBusinessHourInfo(res.data);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "Failed to get business hour data"
                 })
                navigate('/business-hours');
            }
        }).catch(err => {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "Failed to get business hour data"
             })
            navigate('/business-hours');
        });
    },[]);

    const onRemove = (bh_id, holiday_date) => {
        const swalWithBootstrapButtons = Swal.mixin({
        })
          
          swalWithBootstrapButtons.fire({
            icon: 'info',
            title: 'Delete Business Holiday',
            text: "Are you sure you want to delete this business holiday?",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              deleteHoliday(bh_id, holiday_date).then(res => {
                //console.log(res);
                if(res.data.status == 200){
                    swalWithBootstrapButtons.fire(
                        'Deleted!',
                        'Business holiday has been deleted.',
                        'success'
                    ).then(_ => tableAgent.current.refresh());
                } else {
                    let msg = "Deletion failed. Please try again or contact support!";
                    if(res.data.message) msg = res.data.message;
                    swalWithBootstrapButtons.fire(
                        'Error',
                        msg,
                        'error'
                    ) 
                }
              })
              
            } else if (
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire(
                'Cancelled',
                'Business holiday deletion cancelled',
                'error'
              )
            }
          })
    };

    const columns =  [
        { id: 1, title: 'Holiday Date', field: 'holiday', sortable: true, style:{width:300}, render: data => moment(data.holiday, "YYYY-MM-DD").format("DD MMMM YYYY"), filter_text: "Please type in YYYY-MM-DD format. This should filter OOOs with holiday date equal or greater than your inputted",  },
        { id: 2, title: 'Holiday Description', field: 'holiday_description', sortable: false, style:{width:700},
            render: data => {
                let text = data.holiday_description;
                if(text.length > 100){
                    text = text.substring(0,90) + "...";
                } return text
            }
        }
    ];

    if(permissionCheck(userInfo, "settings", "delete") && permissionCheck(userInfo, "settings", "update")){
        columns.push({
            id: 2,
            title: 'Action',
            style:{width:100},
            render: item => {
                return (
                    <div>
                        {/*<ActionButton icon={<MdOutlineModeEdit/>} link_color="#0099C3" click_action={(e) => navigate(`/business-hours-form/${item.id}`)}/>*/}
                        <ActionButton icon={<BsTrashFill/>} link_color="#FF4833" click_action={(e) => onRemove(item.business_hour_id, item.holiday)}/>
                    </div>
                );
            },
        });
    }

    const showAddButton = (access) => {
        if(access){
            if(access.settings){
                if(access.settings.can_view) return true;
            }
        }
        return false;
    }

    const tableGetData = (role_name) => {
        return (params) => getAllHolidays(bh_id, params);
    }

    const genTableColumns = (role_name) => {
        return columns;
    }

    const getTableWidth = (role_name) =>{
         return "100%"
    }

    const isStickyEnd = (role_name) =>{
        return false;
    }

    const onCloseModal = (e) => {
        reset({holiday_description: ""});
        setHoliday("");
        $('#modal-holiday').modal('hide');
    }

    const onFormSubmit = (data) => {
        const user_input = Object.assign({}, data, {holiday:moment(holiday,"DD/MM/YYYY").format("YYYY-MM-DD")}, {business_hour_id:bh_id});
        setState({...state, processing:true});
        createHoliday(user_input).then(res => {
            //(res);
            if(res.data.status == 200){
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: "A new business holiday has been created!"
                 }).then( () => {
                    setState({...state, processing:false});
                    reset({holiday_description: ""});
                    setHoliday("");
                    tableAgent.current.refresh();
                    $("#modal-holiday").modal('hide');
                 });
            }else {
                
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: res.data.message
                 }).then(_ => {
                    setState({...state, processing:false});
                 })
            }
        }).catch(err => {
            let msg = "There's an error in processing your request. Please try again or contact support";
            if(err.response && err.response.data && err.response.data.message) msg = err.response.data.message;
            Swal.fire({
                icon: 'error',
                title: "error",
                text: msg
             }).then(_ => {
                setState({...state, processing:false});
             });
        });
    }

    const propsTable = { columns: genTableColumns(userInfo.role_name), getData: tableGetData(userInfo.role_name), showIndex: false, showAddButton: showAddButton(userInfo.access), addButtonText: "Business Holiday", onAddData, order: 'holiday', direction: 'asc', showCheckbox: false, minTableWidth:getTableWidth(userInfo.role_name), stickyEnd: isStickyEnd(userInfo.role_name)};

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6" style={{display:"flex", columnGap:"10px"}}>
                            <div>
                                <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/business-hours')}>arrow_back</span>
                            </div>
                            <div>
                                <h2 className="title-breadcrum fw-500">Business Holidays</h2>
                                <h6>List of business holidays for this business hour</h6>
                            </div>
                        </div>
                        {/*<div className="col-sm-6 right">
                            <button type="button" class="btn btn-outline-dark right" style={{padding: "0.5em 1em", margin:"0 5px"}}>
                                <div style={{display: "flex", alignItems:"center"}}>
                                    <div><img src={data_update_dark}/></div>
                                    <div style={{marginLeft: "10px"}}>Import Data</div>
                                </div>
                            </button>
                           
                        </div>*/}
                    </div>
                </div>
            </div>
            <section className="content">
                <div className="container-fluid">
                    <div className="card shadow mb-4">
                        <div className="card-body">
                            <Overlay display={state.processing} />
                            <div style={{borderBottom:"1px solid black", marginBottom:"20px"}}>
                                <div id="po-table-header-text" style={{fontSize: "14px", paddingTop:"10px", width: "50%"}}>
                                        <div className='po-table-header-content'>
                                            <span className='bold black'>Business Hour: </span>
                                            <span>&nbsp;{bh_info && bh_info.business_hour}</span>
                                        </div>
                                        <div className='po-table-header-content'>
                                            <span className='bold black'>Business Hour Description: </span>
                                            <br/>
                                            <p style={{marginTop:"5px"}}>{bh_info && bh_info.business_hour_description}</p>
                                        </div>
                                    </div>
                                </div>
                            <div>
                                <MTable {...propsTable} ref={tableAgent} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div id="modal-holiday" className='modal fade'>
                                <form name="form-holiday" onSubmit={handleSubmit(onFormSubmit)}> 
                                    <div className='modal-dialog modal-dialog-centered modal-xl'>
                                        <div className='modal-content'>
                                            <div className='modal-header'>
                                                <h5 className="modal-title black bold">Add A New Holiday</h5>
                                                <button type="button" className="close" onClick={onCloseModal}>
                                                    <span aria-hidden="true">×</span>
                                                </button>
                                            </div>
                                            <div className='modal-body'>
                                                <div className="row">
                                                    <div className='full-width' style={{padding: "0 20px"}}>
                                                        <Overlay display={state.processing} />
                                                        <div>
                                                            <div className='form-group'>
                                                                <label className="bold black"> Holiday Date</label>
                                                                <div>
                                                                    <DatePicker onChange={(time) => setHoliday(time)} selected={holiday} name={"holiday"}      
                                                                        autoComplete="off"
                                                                        dateFormat="dd/MM/yyyy"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className='form-group'>
                                                                <label className="bold black"> Description</label>
                                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <textarea {...register('holiday_description', { required: { value: true, message: 'Description is required' } })} className='inputLogin' />
                                                                </div>
                                                                {errors.holiday_description && <span className='text-danger'>{errors.holiday_description.message}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='form-group'>
                                                    <div style={{ marginTop: "100px" }}>
                                                    <button type='submit' className='btn btn-block btn-b2b btn-lg' style={{fontSize:"1em"}}><span className="bold">Save</span></button>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </form>
                </div>
        </div>
    );

};

export default BusinessHolidays;