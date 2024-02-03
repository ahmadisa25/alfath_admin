import { useEffect, useRef, useState } from 'react';
import {
    useNavigate
} from "react-router-dom";
import { useSelector } from 'react-redux';
import MTable from '../../../../Components/MTable/MTable';
import Swal from 'sweetalert2';
import Overlay from '../../../../Components/Overlay';
import moment from 'moment';
import {MdOutlineModeEdit} from 'react-icons/md';
import {BsTrashFill} from 'react-icons/bs';
import ActionButton from '../../../../Components/MTable/ActionButton';
import 'moment/locale/id';
import {FaEye} from 'react-icons/fa';
import { permissionCheck } from '../../../../Utils/Utils';
import { deleteCourse, getAllCourses } from '../../../../Service/CourseService';


const { $ } = window;   
const CourseSettings = () => {
    let { userInfo } = useSelector(state => state.auth);
    moment.locale('id');
    const navigate = useNavigate();
    const courses_table = useRef();
    const [state, setState] = useState({ processing : false });

    const editCourse = (course_id) => {
        navigate(`/course-form/${course_id}`)
    }

    const onAddData = () => {
        //$('#modal-document').modal();
        navigate('/course-form');
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
            title: 'Delete Course',
            text: "Are you sure you want to delete this course?",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
                setState({...state, processing:true});
              deleteCourse(id).then(res => {
                if(res.data.Status == 200){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "Course data has successfully been deleted!"
                     }).then(_ => {
                        setState({...state, processing:false});
                        courses_table.current.refresh();
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
                'Course deletion cancelled',
                'error'
              )
            }
          })
    };

    const columns = [
        { id: 1, title: 'Title', field: 'name', sortable: true, style:{width:300}},
        { id: 3, title: 'Duration', field: 'duration', style:{width:200}, sortable: true,
        filter_text: "Please type in lower case: 'true' for active, 'false' for inactive",
        render: item => {
            return <span>{item.duration} Minutes</span>
        },
        }
    ];

        columns.push({
            id: 2,
            title: 'Action',
            style:{width:50},
            render: item => {
                return (
                    <div>
                            <ActionButton icon={<MdOutlineModeEdit/>} link_color="#0099C3" click_action={(e) => editCourse(item.id)}/>
                            <ActionButton icon={<BsTrashFill/>} link_color="#FF4833" click_action={(e) => onRemove(item.id)}/>
                            <ActionButton icon={<FaEye/>} link_color="#0099C3" click_action={() => navigate(`/course/${item.id}`)} text="View"/>
                    </div>
                );
            },
        });
    //}

    const showAddButton = (access) => {
        return true;
    }

    const tableGetData = (role_name) => {
        return (params) => {
            let filter = "deleted_at:null";
            if(params.filter) filter += "," + params.filter;
            return getAllCourses({...params, filter});
        }
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

    const propsTable = { columns: genTableColumns(userInfo.role_name), getData: tableGetData(userInfo.role_name), showIndex: false, showAddButton: showAddButton(userInfo.access), addButtonText: "Course", onAddData, order: 'name', direction: 'asc', showCheckbox: true, minTableWidth:getTableWidth(userInfo.role_name), stickyEnd: isStickyEnd(userInfo.role_name)};

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                        <h2 className="title-breadcrum fw-500">Courses</h2>
                            <h6>List of Courses</h6>
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
                                <MTable {...propsTable} ref={courses_table} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

};

export default CourseSettings;