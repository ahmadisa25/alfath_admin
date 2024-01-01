import React, {useState, useEffect, useRef} from 'react';
import Swal from 'sweetalert2';
import Overlay from '../../../Components/Overlay';
import {getAllFields, deleteField} from '../../../Service/FieldService';
import { InputSwitch } from 'primereact/inputswitch';

import {
    useNavigate
} from "react-router-dom";
import {MdOutlineModeEdit} from 'react-icons/md';
import { useSelector } from 'react-redux';
import AddButton from '../../../Components/MTable/AddButton';
import {BsTrashFill} from 'react-icons/bs';
import {datetime_input} from '../../../Images';
import MTable from '../../../Components/MTable/MTable';
import { permissionCheck } from '../../../Utils/Utils';
import ActionButton from '../../../Components/MTable/ActionButton';
import { renderFields } from '../../../Utils/Utils';

const IncidentFields = () => {
    const tableAgent = useRef();
    const navigate = useNavigate();
    let { userInfo } = useSelector(state => state.auth);
    const [state, setState] = useState({
        processing:false
    });

    const [fields, setFields] = useState([]);

    const removeStuffAndCapitalize = (text) => {
        text = text.trim();
        text = text.replace("_", " ");
        let text_array = text.split(" ");
        let text_result = "";
        text_array.forEach(item => {
            let res = item[0].toUpperCase() + item.substring(1, item.length);
            text_result += res + " ";
        })
        text = text.trim();
        text = text_result;
        return text;
    }

    
    const onRemove = (field_id) => {
        const swalWithBootstrapButtons = Swal.mixin({
        })
          
          swalWithBootstrapButtons.fire({
            icon: 'info',
            title: 'Delete Field',
            text: "Are you sure you want to delete this field?",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              deleteField(field_id).then(res => {
                if(res.status == 200){
                    swalWithBootstrapButtons.fire(
                        'Deleted!',
                        'Field has been deleted.',
                        'success'
                    ).then(_ => {
                        /*getAllFields(`incident`).then(res => {
                            if(res.data.status == 200){
                                if(res.data.data && res.data.data.length > 0){
                                   t
                                }
                                //setCategoriesList(res.data);
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error!',
                                    text: "Get category data failed!"
                                 });
                            }
                        })*/
                        tableAgent.current.refresh();
                    });
                } else {
                    swalWithBootstrapButtons.fire(
                        'Error',
                        'Field deletion Failed.',
                        'error'
                    ) 
                }
              })
              
            } else if (
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire(
                'Cancelled',
                'Field deletion cancelled',
                'error'
              )
            }
          })
    };

    const columns = [
        { id: 1, title: 'Field Name', field: 'field_name', sortable: true,
            render:item => {
                return removeStuffAndCapitalize(item.field_name)
            } },
        { id: 4, title: 'Field Type', field: 'field_type', sortable: true, 
            render: item => {
                return <div>
                    {renderFields(item.field_type)}
                </div>
            } },
        { id: 3, title: 'Active Status', field: 'field_enabled', sortable: true,
        filter_text: "Please type in lower case: 'true' for active, 'false' for inactive",
        render: item => {
            return <InputSwitch checked={item.field_enabled == true} disabled/>
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
                            <ActionButton icon={<MdOutlineModeEdit/>} link_color="#0099C3" click_action={(e) => navigate(`/field-properties/${item.id}`)}/>
                            <ActionButton icon={<BsTrashFill/>} link_color="#FF4833" click_action={(e) => onRemove(item.id)}/>
                    </div>
                );
            },
        });
    }

    
    const onAddData = () => {
        //$('#modal-document').modal();
        navigate('/field-properties');
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
        return (params) => getAllFields("Incident", params);
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

    const propsTable = { columns: genTableColumns(userInfo.role_name), getData: tableGetData(userInfo.role_name), showIndex: false, showAddButton: showAddButton(userInfo.access), addButtonText: "Incident Field", onAddData, order: 'id', direction: 'desc', showCheckbox: true, minTableWidth:getTableWidth(userInfo.role_name), stickyEnd: isStickyEnd(userInfo.role_name)};

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

                /*getAllFields({filter:`field_identifier:incident`}).then(res => {
                    if(res.data.status == 200){
                        if(res.data.data && res.data.data.length > 0){
                           setFields(res.data.data);
                        }
                        //setCategoriesList(res.data);
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Get category data failed!"
                         });
                    }
                })*/
            }
        }
        
    },[]);

    return(
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                            <h2 className="title-breadcrum fw-500">Incident Fields</h2>
                                <h6>List of Incident Fields</h6>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="card shadow mb-4">
                            <div className="card-body" style={{overflowY:"scroll"}}>
                               
                                <Overlay display={state.processing} />
                                <div>
                                    <MTable {...propsTable} ref={tableAgent} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
    )
}

export default IncidentFields;