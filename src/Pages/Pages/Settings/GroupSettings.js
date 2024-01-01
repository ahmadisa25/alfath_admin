import { useEffect, useRef, useState } from 'react';
import {
    useNavigate
} from "react-router-dom";
import { useSelector } from 'react-redux';
import MTable from '../../../Components/MTable/MTable';
import {getAllGroups, deleteGroup} from '../../../Service/GroupService';
import Swal from 'sweetalert2';
import { InputSwitch } from 'primereact/inputswitch';
import Overlay from '../../../Components/Overlay';
import moment from 'moment';
import {FaEye} from 'react-icons/fa';
import {MdOutlineModeEdit} from 'react-icons/md';
import {BsTrashFill} from 'react-icons/bs';
import ActionButton from '../../../Components/MTable/ActionButton';
import 'moment/locale/id';
import { useForm } from 'react-hook-form';
import { permissionCheck } from '../../../Utils/Utils';


const { $ } = window;   
const GroupSettings = () => {
    let { userInfo } = useSelector(state => state.auth);
    moment.locale('id');
    const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { company_name: '', company_address: "", mobile_number: '', phone_number: '', note:'', email:'', cp_name:''} });
    const navigate = useNavigate();
    const tableGroup = useRef();
    // const [state, setState] = useState({ processing : false });

    const onAddData = () => {
        navigate('/group-form');
    }

    const onPropertiesClick = () => {
        navigate('/group-properties');
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

    const onRemove = (group_id) => {
        const swalWithBootstrapButtons = Swal.mixin({
        })
          
          swalWithBootstrapButtons.fire({
            icon: 'info',
            title: 'Delete Group',
            text: "Are you sure you want to delete this group?",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              deleteGroup(group_id).then(res => {
                if(res.data.status == 200){
                    swalWithBootstrapButtons.fire(
                        'Deleted!',
                        'Group has been deleted.',
                        'success'
                    ).then(_ => tableGroup.current.refresh());
                } else {
                    swalWithBootstrapButtons.fire(
                        'Error',
                        res.data.message || 'Group deletion Failed.',
                        'error'
                    ) 
                }
              })
              
            } else if (
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire(
                'Cancelled',
                'Group deletion cancelled',
                'error'
              )
            }
          })
    };

    const columns = [
        { id: 1, title: 'Group Name', field: 'group_name', sortable: true },
        { id: 3, title: 'Active Status', field: 'group_enabled', sortable: true,
        filter_text: "Please type in lower case: 'true' for active, 'false' for inactive",
        render: item => {
            return <InputSwitch checked={item.group_enabled == true} disabled/>
        },
        }
    ];

    if(permissionCheck(userInfo, "settings", "delete") && permissionCheck(userInfo, "settings", "update")){
        columns.push({
            id: 2,
            title: 'Action',
            style:{width:200},
            render: item => {
                return (
                    <div style={{display:"flex", alignItems:"center"}}>
                            <ActionButton icon={<MdOutlineModeEdit/>} link_color="#0099C3" click_action={() => navigate(`/group-form/${item.id}`)}/>
                            <ActionButton icon={<BsTrashFill/>} link_color="#FF4833" click_action={(e) => onRemove(item.id)}/>
                            <ActionButton icon={<FaEye/>} link_color="#0099C3" click_action={() => navigate(`/group-members/${item.id}`)} text="Members"/>
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
        return getAllGroups;
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

    const propsTable = { columns: genTableColumns(userInfo.role_name), getData: tableGetData(userInfo.role_name), showIndex: false, showAddButton: showAddButton(userInfo.access), addButtonText: "Group", onAddData, order: 'group_name', direction: 'asc', showCheckbox: true, minTableWidth:getTableWidth(userInfo.role_name), stickyEnd: isStickyEnd(userInfo.role_name)};

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                        <h2 className="title-breadcrum fw-500">Groups</h2>
                            <h6>List of Groups</h6>
                        </div>
                    </div>
                </div>
            </div>
            <section className="content">
                <div className="container-fluid">
                    <div className="card shadow mb-4">
                        <div className="card-body">
                            {/*<Overlay display={state.processing} />*/}
                            <div>
                                <MTable {...propsTable} ref={tableGroup} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

};

export default GroupSettings;