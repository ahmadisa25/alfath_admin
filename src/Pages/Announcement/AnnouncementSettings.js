import { useEffect, useRef, useState } from 'react';
import {
    useNavigate
} from "react-router-dom";
import { useSelector } from 'react-redux';
import MTable from '../../Components/MTable/MTable';
import Swal from 'sweetalert2';
import Overlay from '../../Components/Overlay';
import moment from 'moment';
import {MdOutlineModeEdit} from 'react-icons/md';
import {BsTrashFill} from 'react-icons/bs';
import ActionButton from '../../Components/MTable/ActionButton';
import 'moment/locale/id';
import { permissionCheck } from '../../Utils/Utils';
import { deleteAnnouncement, getAllAnnouncements } from '../../Service/AnnouncementService';


const { $ } = window;   
const AnnouncementSettings = () => {
    let { userInfo } = useSelector(state => state.auth);
    moment.locale('id');
    const navigate = useNavigate();
    const announcements_table = useRef();
    const [state, setState] = useState({ processing : false });

    const editInstructor = (instructor_id) => {
        navigate(`/instructor-form/${instructor_id}`)
    }

    const onAddData = () => {
        //$('#modal-document').modal();
        navigate('/announcement-form');
    }

    useEffect(() => {
        /*if(userInfo.access){
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
        }*/
    },[])

    const onRemove = (id) => {
        const swalWithBootstrapButtons = Swal.mixin({
        })
          
          swalWithBootstrapButtons.fire({
            icon: 'info',
            title: 'Delete Announcement',
            text: "Are you sure you want to delete this announcement?",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
                setState({...state, processing:true});
              deleteAnnouncement(id).then(res => {
                if(res.data.Status == 200){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "Announcement data has successfully been deleted!"
                     }).then(_ => {
                        setState({...state, processing:false});
                        announcements_table.current.refresh();
                     })
                }
              }).catch((err) => {
                setState({...state, processing:false});
              });
            } else if (
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire(
                'Cancelled',
                'Announcement deletion cancelled',
                'error'
              )
            }
          })
    };

    const columns = [
        { id: 1, title: 'Title', field: 'title', sortable: true },
        { id: 3, title: 'Created At', field: 'CreatedAt', sortable: true, filterable: false,
        render: item => {
            return <span>{moment(item.CreatedAt).format('DD MMM YYYY HH:mm')}</span>
        },
        }
    ];

    //if(permissionCheck(userInfo, "settings", "delete") && permissionCheck(userInfo, "settings", "update")){
        columns.push({
            id: 2,
            title: 'Action',
            style:{width:100},
            render: item => {
                return (
                    <div>
                            <ActionButton icon={<MdOutlineModeEdit/>} link_color="#0099C3" click_action={(e) => editInstructor(item.ID)}/>
                            <ActionButton icon={<BsTrashFill/>} link_color="#FF4833" click_action={(e) => onRemove(item.ID)}/>
                    </div>
                );
            },
        });
    //}

    const showAddButton = (access) => {
        /*if(access){
            if(access.settings){
                if(access.settings.can_view) return true;
            }
        }
        return false;*/
        return true;
    }

    const tableGetData = (role_name) => {
        return (params) => getAllAnnouncements(params);
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

    const propsTable = { columns: genTableColumns(userInfo.role_name), getData: tableGetData(userInfo.role_name), showIndex: false, showAddButton: showAddButton(userInfo.access), addButtonText: "Announcement", onAddData, order: 'title', direction: 'asc', showCheckbox: true, minTableWidth:getTableWidth(userInfo.role_name), stickyEnd: isStickyEnd(userInfo.role_name)};

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                        <h2 className="title-breadcrum fw-500">Announcements</h2>
                            <h6>List of Announcements</h6>
                        </div>
                        {/*<div className="col-sm-6 right">
                            <button type="button" class="btn btn-outline-dark right" style={{padding: "0.5em 1em", margin:"0 5px"}}>
                                <div style={{display: "flex", alignItems:"center"}}>
                                    <div><img src={data_update_dark}/></div>
                                    <div style={{marginLeft: "10px"}}>Import Data</div>
                                </div>
                            </button>
                            <button type="button" class="btn btn-outline-dark right" style={{padding: "0.5em 1em", margin:"0 5px"}}>
                                <div style={{display: "flex", alignItems:"center"}}>
                                    <div><img src={data_update_dark} style={{transform: "scaleY(-1)"}}/></div>
                                    <div style={{marginLeft: "10px"}}>Export Data</div>
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
                                <MTable {...propsTable} ref={announcements_table} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

};

export default AnnouncementSettings;