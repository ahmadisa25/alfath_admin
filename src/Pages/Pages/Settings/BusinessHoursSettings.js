import { useEffect, useRef, useState } from 'react';
import {
    useNavigate
} from "react-router-dom";
import { useSelector } from 'react-redux';
import MTable from '../../../Components/MTable/MTable';
import { deleteHour, getAllHours } from '../../../Service/BusinessHoursService';
import Swal from 'sweetalert2';
import { InputSwitch } from 'primereact/inputswitch';
import Overlay from '../../../Components/Overlay';
import moment from 'moment';
import {MdOutlineModeEdit} from 'react-icons/md';
import {BsTrashFill} from 'react-icons/bs';
import ActionButton from '../../../Components/MTable/ActionButton';
import {FaEye} from 'react-icons/fa';
import 'moment/locale/id';
import { permissionCheck } from '../../../Utils/Utils';


const { $ } = window;   
const BusinessHoursSettings = () => {
    let { userInfo } = useSelector(state => state.auth);
    moment.locale('id');
    const [modal_state, setModalState] = useState("add");
    const navigate = useNavigate();
    const tableAgent = useRef();
    const [state, setState] = useState({ processing : false });

    const editAgent = (agent_id) => {
        navigate(`/agent-form/${agent_id}`)
    }

    const onAddData = () => {
        //$('#modal-document').modal();
        navigate('/business-hours-form');
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
    },[])

    const onRemove = (hour_id) => {
        const swalWithBootstrapButtons = Swal.mixin({
        })
          
          swalWithBootstrapButtons.fire({
            icon: 'info',
            title: 'Delete Business Hours',
            text: "Are you sure you want to delete this business hours?",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              deleteHour(hour_id).then(res => {
                //console.log(res);
                if(res.data.status == 200){
                    swalWithBootstrapButtons.fire(
                        'Deleted!',
                        'Business hour has been deleted.',
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
                'Business hour deletion cancelled',
                'error'
              )
            }
          })
    };

    const columns =  [
        { id: 1, title: 'Business Hour Name', field: 'business_hour', sortable: true, style:{width:300}  },
        { id: 2, title: 'Business Hour Description', field: 'business_hour_description', sortable: false, style:{width:700},
            render: data => {
                let text = data.business_hour_description;
                if(text.length > 100){
                    text = text.substring(0,90) + "...";
                } return text
            }
        },
        { id: 3, title: 'Active Status', field: 'business_hour_enabled', sortable: true,
            filter_text: "Please type in lower case: 'true' for active, 'false' for inactive",
            render: item => {
                return <InputSwitch checked={item.business_hour_enabled == true} disabled/>
            }
        }
    ];

    if(permissionCheck(userInfo, "settings", "delete") && permissionCheck(userInfo, "settings", "update")){
        columns.push({
            id: 2,
            title: 'Action',
            style:{width:200},
            render: item => {
                return (
                    <div>
                        <ActionButton icon={<MdOutlineModeEdit/>} link_color="#0099C3" click_action={(e) => navigate(`/business-hours-form/${item.id}`)}/>
                        <ActionButton icon={<BsTrashFill/>} link_color="#FF4833" click_action={(e) => onRemove(item.id)}/>
                        <ActionButton icon={<FaEye/>} link_color="#0099C3" click_action={() => navigate(`/business-holidays/${item.id}`)} text="Holidays"/>
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
        return getAllHours;
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

    const propsTable = { columns: genTableColumns(userInfo.role_name), getData: tableGetData(userInfo.role_name), showIndex: false, showAddButton: showAddButton(userInfo.access), addButtonText: "Business Hour", onAddData, order: 'business_hour', direction: 'asc', showCheckbox: false, minTableWidth:getTableWidth(userInfo.role_name), stickyEnd: isStickyEnd(userInfo.role_name)};

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                        <h2 className="title-breadcrum fw-500">Business Hours</h2>
                            <h6>List of Business Hours</h6>
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
                            <div>
                                <MTable {...propsTable} ref={tableAgent} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

};

export default BusinessHoursSettings;