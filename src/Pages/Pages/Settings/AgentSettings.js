import { useEffect, useRef, useState } from 'react';
import {
    useNavigate
} from "react-router-dom";
import { useSelector } from 'react-redux';
import MTable from '../../../Components/MTable/MTable';
import {deleteAgent, getAllAgents} from '../../../Service/AgentService';
import Swal from 'sweetalert2';
import { InputSwitch } from 'primereact/inputswitch';
import Overlay from '../../../Components/Overlay';
import moment from 'moment';
import {MdOutlineModeEdit} from 'react-icons/md';
import {BsTrashFill} from 'react-icons/bs';
import ActionButton from '../../../Components/MTable/ActionButton';
import 'moment/locale/id';
import { permissionCheck } from '../../../Utils/Utils';
import { data_update_dark } from '../../../Images';


const { $ } = window;   
const UserSettings = () => {
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
        navigate('/agent-form');
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

    const onRemove = (agent_id) => {
        const swalWithBootstrapButtons = Swal.mixin({
        })
          
          swalWithBootstrapButtons.fire({
            icon: 'info',
            title: 'Delete Agent',
            text: "Are you sure you want to delete this agent?",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              deleteAgent(agent_id).then(res => {
                if(res.status == 200){
                    swalWithBootstrapButtons.fire(
                        'Deleted!',
                        'Agent has been deleted.',
                        'success'
                    ).then(_ => tableAgent.current.refresh());
                } else {
                    swalWithBootstrapButtons.fire(
                        'Error',
                        'Agent deletion Failed.',
                        'error'
                    ) 
                }
              })
              
            } else if (
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire(
                'Cancelled',
                'Agent deletion cancelled',
                'error'
              )
            }
          })
    };

    const columns = [
        { id: 1, title: 'Agent Name', field: 'agent_name', sortable: true },
        { id: 4, title: 'Agent NIK', field: 'agent_user_id', sortable: true },
        { id: 3, title: 'Active Status', field: 'agent_enabled', sortable: true,
        filter_text: "Please type in lower case: 'true' for active, 'false' for inactive",
        render: item => {
            return <InputSwitch checked={item.agent_enabled == true} disabled/>
        },
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
                            <ActionButton icon={<MdOutlineModeEdit/>} link_color="#0099C3" click_action={(e) => editAgent(item.id)}/>
                            <ActionButton icon={<BsTrashFill/>} link_color="#FF4833" click_action={(e) => onRemove(item.agent_user_id)}/>
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
        return getAllAgents;
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

    const propsTable = { columns: genTableColumns(userInfo.role_name), getData: tableGetData(userInfo.role_name), showIndex: false, showAddButton: showAddButton(userInfo.access), addButtonText: "Agent", onAddData, order: 'agent_name', direction: 'asc', showCheckbox: true, minTableWidth:getTableWidth(userInfo.role_name), stickyEnd: isStickyEnd(userInfo.role_name)};

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                        <h2 className="title-breadcrum fw-500">Agents</h2>
                            <h6>List of Agents</h6>
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
                                <MTable {...propsTable} ref={tableAgent} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

};

export default UserSettings;