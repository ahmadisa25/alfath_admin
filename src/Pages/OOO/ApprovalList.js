import { useRef, useState } from 'react';
import {
    useNavigate
} from "react-router-dom";
import { useSelector } from 'react-redux';
import MTable from '../../Components/MTable/MTable';
import Swal from 'sweetalert2';
import Overlay from '../../Components/Overlay';
import moment from 'moment';
import {BsTrashFill} from 'react-icons/bs';
import ActionButton from '../../Components/MTable/ActionButton';
import StatusBadge from '../../Components/MTable/StatusBadge';
import 'moment/locale/id';
import { serious_warning } from '../../Images';
import { FaEye } from  'react-icons/fa';
import { getAllOOO, deleteOOO } from '../../Service/OutOfOfficeService';

const { $ } = window;   
const ApprovalList = () => {
    let { userInfo } = useSelector(state => state.auth);
    moment.locale('id');
    const navigate = useNavigate();
    const tableSO = useRef();
    const [state, setState] = useState({ processing : false });

    const onAddData = () => {
        navigate('/incident-form');
    }

    const onEdit = item => () => {
        navigate("/salesorder/edit/" + item.id);
    };

    const onRemove = (e, ooo_id) => {
        const swalWithBootstrapButtons = Swal.mixin({
          })
          
          swalWithBootstrapButtons.fire({
            title: 'Delete OOO',
            text: "Are you sure you want to delete this OOO data?",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
                deleteOOO(ooo_id).then(res => {
                    if(res.data.status == 200){
                        swalWithBootstrapButtons.fire(
                            'Deleted!',
                            'OOO has been deleted.',
                            'success'
                        ).then(_ => tableSO.current.refresh())
                    } else {
                        let message = res.data.message || "Failed to delete OOO. Please try again or contact support";
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: message
                         })
                    }
                }).catch(err => {
                    let message = err.response.data.message || "Failed to delete OOO. Please try again or contact support";
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: message
                     })
                })
            
            }
          })
    };

    const columns = [
        { id: 1, title: 'Agent', field: 'agent_name', sortable: true, style:{width:"5%"},
        render: data => {
            return(<b>{data.agent_name}</b>)
        }
        },
        { id: 2, title: 'Start Date', field: 'ooo_start_date', sortable: true, style:{width:"2%"},
        filter_text: "Please type in YYYY-MM-DD format. This should filter OOOs with start date equal or greater than your inputted",
            render: data => {
            return moment(data.ooo_start_date).format('DD MMM YYYY')
        }},
        { id: 3, title: 'End Date', field: 'ooo_end_date', sortable: true, style:{width:"2%"},
        filter_text: "Please type in YYYY-MM-DD format. This should filter OOOs with end date equal or greater than your inputted",
            render: data => {
                return moment(data.ooo_end_date).format('DD MMM YYYY')
            }
        },
        { id: 4, title: 'Created At', field: 'created_at', sortable: true, style:{width:"2%"},
        filter_text: "Please type in YYYY-MM-DD format. This should filter OOOs with created date equal or greater than your inputted",
            render: data => {
                return moment(data.created_at).format('DD MMM YYYY')
            }
        },
        { id: 5, title: 'Status', field: 'status', sortable: true, style:{width:"1%"},
        render: data => {
            if (data.status == 'Waiting Approval') {
                return <StatusBadge bg_color={"b2b-badge-warning"} text={"Waiting Approval"}/>;
            } else if (data.status == 'Rejected') {
                return <StatusBadge bg_color={"b2b-badge-danger-alt"} text={"Rejected"}/>;
            } else if (data.status == 'Approved') {
                return <StatusBadge bg_color={"b2b-badge-success"} text={"Approved"}/>;
            }
        },
        },
        {
            id: 6,
            title: 'Action',
            style:{width:"2%"},
            render: item => {
                return (
                    <div style={{display:"flex", alignItems:"center"}}>
                        <ActionButton icon={<FaEye/>} link_color="#0099C3" click_action={() => navigate(`/ooo-approval-form/${item.id}`)} text="View"/>
                        {/*<ActionButton icon={<MdOutlineModeEdit/>} link_color="#0099C3"/>*/}
                        <ActionButton icon={<BsTrashFill/>} link_color="#FF4833" click_action={(e) => onRemove(e, item.id)}/>
                     
                    </div>
                );
            },
        }
    ];

    const showAddButton = (role_name) => {
        if(!role_name || role_name !== "Requester") return false;
        else return true;
    }

    const tableGetData = (userInfo) => {
        if(userInfo){
            if(userInfo.role_name == "Administrator"){
                return (params) => getAllOOO({...params});
            } else if(userInfo.role_name == "Agent Supervisor") {
                if(userInfo.agent_groups && userInfo.agent_groups.length > 0){
                    return (params) => getAllOOO({...params, filterOr:`agent_id:${userInfo.agent_id},group_id:${userInfo.agent_groups[0].group_id}`});
                } else {
                    return (params) => getAllOOO({...params, filter:`agent_id:${userInfo.agent_id}`});
                }
            }
        }
    }

    const genTableColumns = (role_name) => {
        return columns;
    }

    const getTableWidth = (role_name) =>{
        return "100%";
    }

    const isStickyEnd = (role_name) =>{
        return true;
    }

    const propsTable = { columns: genTableColumns(userInfo.role_name), getData: tableGetData(userInfo), showIndex: false, showAddButton: showAddButton(userInfo.role_name), addButtonText: "OOO", onAddData, order: 'created_at', direction: 'desc', showCheckbox: true, minTableWidth:getTableWidth(userInfo.role_name), stickyEnd: isStickyEnd(userInfo.role_name)};

    return (
        <div className="content-wrapper">
            <section className="content">
                <div className="container-fluid">
                    <div className="card shadow mb-4" style={{borderRadius:"0"}}>
                        <div className="card-body">
                            <Overlay display={state.processing} />
                            <div>
                                <MTable {...propsTable} ref={tableSO} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

};

export default ApprovalList;