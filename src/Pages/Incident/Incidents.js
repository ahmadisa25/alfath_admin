import { useRef, useState } from 'react';
import {
    useNavigate
} from "react-router-dom";
import { useSelector } from 'react-redux';
import MTable from '../../Components/MTable/MTable';
import {getAll, deleteIncident} from '../../Service/IncidentService';
import Swal from 'sweetalert2';
import Overlay from '../../Components/Overlay';
import moment from 'moment';
import ActionButton from '../../Components/MTable/ActionButton';
import StatusBadge from '../../Components/MTable/StatusBadge';
import 'moment/locale/id';
import { useForm } from 'react-hook-form';
import { serious_warning } from '../../Images';
import { FaDownload, FaEye } from 'react-icons/fa';
import {BiSolidCircle} from 'react-icons/bi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { isObjectEmpty } from '../../Utils/Utils';
import { capitalize } from 'lodash';
import { getTicketReporting } from '../../Service/DashboardService';
import { InputSwitch } from 'primereact/inputswitch';

const { $ } = window;   
const Incidents = () => {
    let { userInfo } = useSelector(state => state.auth);
    const incident_fields = [
        'ticket_number',
        'subject',
        'description',
        'urgency',
        'impact',
        'priority',
        'agent_email',
        'agent_name',
        'status',
        'requester',
        'requester_email',
        'requested_for',
        'requested_for_email'
    ]
    const [selected_export_fields, setSelectedExportFields] = useState(null);
    const [filter_from_date, setFilterFromDate] = useState(null);
    const [filter_to_date, setFilterToDate] = useState(null);
    const [filter_date_by, setFilterDateBy] = useState(null);
    const [select_fields_active, setSelectFieldsActive] = useState(false);
    moment.locale('id');
    const { formState: { errors } } = useForm({ defaultValues: { company_name: '', company_address: "", mobile_number: '', phone_number: '', note:'', email:'', cp_name:''} });
    const navigate = useNavigate();
    const tableSO = useRef();
    const [state, setState] = useState({ processing : false });

    const onAddData = () => {
        navigate('/incident-form');
    }

    const onEdit = item => () => {
        navigate("/salesorder/edit/" + item.id);
    };

    const onRemove = (e, incident_id) => {
        const swalWithBootstrapButtons = Swal.mixin({
          })
          
          swalWithBootstrapButtons.fire({
            title: 'Delete Incident',
            html: '<span class="b2b-swal-delete-text">Are you sure you want to delete this incident?</span>',
            iconHtml: `<img src="${serious_warning}"/>`,
            customClass: {
                title: 'b2b-swal-title',
                confirmButton: 'btn btn-danger b2b-swal-danger-btn',
                cancelButton: 'btn b2b-swal-cancel-btn',
                icon: 'b2b-swal-icon',
                actions: 'b2b-swal-actions'
            },
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
                deleteIncident(incident_id).then(res => {
                    if(res.status == 200){
                        swalWithBootstrapButtons.fire(
                            'Deleted!',
                            'Incident has been deleted.',
                            'success'
                        ).then(_ => tableSO.current.refresh())
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed to delete incident. Please try again or contact support"
                         })
                    }
                })
            
            }
          })
    };

    const columns = [
        { id: 1, title: 'Ticket Number', field: 'ticket_number', sortable: true, style:{width:"13%"}, render: data => {
            let text = data.ticket_number;
            return(
                <b>{text}</b>
            )
        }},
        { id: 2, title: 'Subject', field: 'subject', sortable: true, style:{width:"11%"},
            render: data => {
            let text = data.subject;
            if(text && text.length > 30){
                text = text.substring(0,20) + "...";
            } return text
        }},
        { id: 3, title: 'Requested For', field: 'requested_for', sortable: true, style:userInfo.role_name == "Requester" ? {width:"9%"}: {width:"10%"},
        render: data => {
            if(data.requested_for_email){
                let requester_email = `mailto: ${data.requested_for_email}`;
                
                return <a href={requester_email}>{data.requested_for}</a>
            } else return <></>
          
        }
        },
        { id: 13, title: 'Category', field: 'category_name', sortable: true, style:{width:"12%"}},
        { 
            id: 4, title: 'Requested Date', field: 'requested_date', sortable: true, style:{width:"10%"},
            render: data => {
                return moment(data.requested_date).format('DD MMM YYYY HH:mm')
            }
        },
      
        { id: 7, title: 'Agent', field: 'agent_name', sortable: true, style:{width:"10%"}},
        { id: 99, title: 'Group', field: 'group_name', sortable: true, style:{width:"10%"}},
        {
            id: 5,
            title: 'Status',
            field: 'status',
            style:{width:"5%"},
            sortable: false,
            clickable: false,
            setAsSticky: false,
            render: data => {
                if (data.status == 'Pending') {
                    return <StatusBadge bg_color={"b2b-badge-warning"} text={"Pending"}  custom_width={"100%"}/>;
                } else if (data.status == 'Open') {
                    return <StatusBadge bg_color={"b2b-badge-info"} text={"Open"} custom_width={"80%"}/>;
                } else if (data.status == 'Resolved') {
                    return <StatusBadge bg_color={"b2b-badge-success"} text={"Resolved"}/>;
                }else if (data.status == 'Closed') {
                    return <StatusBadge bg_color={"b2b-badge-secondary"} text={"Closed"} custom_width={"90%"}/>;
                }
            },
        },
        //{ id: 2, title: 'Priority', field: 'priority', sortable: true},

       
    ];

    const showAddButton = (role_name) => {
        if(!role_name || role_name !== "Requester") return false;
        else return true;
    }

    const tableGetData = (role_name) => {
        if(role_name == "Agent Supervisor" || role_name == "Agent") {
            let filter = {filterOr:`agent_id:${userInfo.agent_id}`, filter:"is_deleted:false,ticket_type:incident"};
            if(userInfo.agent_groups && userInfo.agent_groups.length > 0 && userInfo.agent_groups[0]){
                filter.filterOr += `,group_id:${userInfo.agent_groups[0].group_id},forward_to_email:${userInfo.email}`;
            }

            return (params) => getAll({...filter, ...params});
        }
        else if(role_name == "Requester") {
            let filter = {filterOr:`requester_email:${userInfo.email},forward_to_email:${userInfo.email}`, filter:"is_deleted:false,ticket_type:incident"};
            return (params) => getAll({...filter, ...params});
        }
        else return (params) => getAll({ ...params, filter:`is_deleted:false,ticket_type:incident,${params.filter||""}`});
    }

    const genTableColumns = (role_name) => {
        if(role_name !=="Requester") {
            columns.push(
                /*{ id: 3, title: 'Requester', field: 'requester', sortable: true, style:{width:"7%"},
                render: data => {
                    let requester_email = `mailto: ${data.requester_email}`;
                    return <a href={requester_email}>{data.requester}</a>
                }
                },*/
                /*{
                    id: 8,
                    title: 'Urgency',
                    field: 'urgency',
                    sortable: true,
                    clickable: false,
                    style:{width:"10%"},
                    render: data => {
                        let color = "";
                        let icon = "";
                        if (data.urgency == 'Low') {
                            color = "#39E3A7";
                            icon = <FaThermometerQuarter/>;
                        } else if(data.urgency == "Medium"){
                            icon = <FaThermometerHalf/>
                            color= "#FFE900";
                        }
                        else if(data.urgency == "High"){
                            color = "red";
                            icon = <FaThermometerFull/>
                        }
                        else color = "#FF0000";
                        return <div style={{display:"flex", color, fontWeight:"700"}}>
                            <div>
                                {icon}
                            </div>
                            <div>{data.urgency}</div>
                        </div>;
                    },
                },*/
                {
                    id: 9,
                    title: 'Urgency',
                    field: 'urgency',
                    style:{width:"8%"},
                    sortable: true,
                    clickable: false,
                    render: data => {
                        let color = "";
                        let icon = "";
                        if (data.urgency == 'low') {
                            color = "#39E3A7";
                        } else if(data.urgency == "medium"){
                            color= "#FFC300";
                        }
                        else if(data.urgency == "high"){
                            color = "#FF7F50";
                        }
                        else {
                            color = "#FF2400";
                        }
                        return <div style={{display:"flex", color, fontWeight:"700", columnGap:"5px"}}>
                            <div>
                                <div style={{fontSize:"12px", paddingTop:"2px"}}><BiSolidCircle/></div>
                            </div>
                            <div>{capitalize(data.urgency)}</div>
                        </div>;
                    },
                },
                {
                    id: 6,
                    title: '',
                    style:{width:"12%"},
                    setAsSticky: true,
                    render: item => {
                        return (
                            <div style={{display:"flex", alignItems:"center"}}>
                                    {/*<ActionButton icon={<MdOutlineModeEdit/>} link_color="#0099C3"/>*/}
                                    <ActionButton icon={<FaEye/>} link_color="#0099C3" click_action={() => navigate(`/incident/${item.id}`)} text="View"/>
                                    {/*<ActionButton icon={<BsTrashFill/>} link_color="#FF4833" click_action={(e) => onRemove(e, item.id)}/>*/}

                            </div>
                        );
                    },
                })
            return columns;
        }
        else {
            columns.push( {
                id: 6,
                title: 'Action',
                style:{width:"10%"},
                render: item => {
                    return (
                        <div style={{display:"flex", alignItems:"center"}}>
                            <ActionButton icon={<FaEye/>} link_color="#0099C3" click_action={() => navigate(`/incident/${item.id}`)} text="View"/>
                            {/*<ActionButton icon={<MdOutlineModeEdit/>} link_color="#0099C3"/>*/}
                            {/*<ActionButton icon={<BsTrashFill/>} link_color="#FF4833" click_action={(e) => onRemove(e, item.id)}/>*/}
                         
                        </div>
                    );
                },
            });
            return columns;
        }
    }

    const getTableWidth = (role_name) =>{
        if(role_name !== "Requester") return "100%";
        else return "100%"
    }

    const isStickyEnd = (role_name) =>{
        if(role_name !== "Requester") return true;
        else return false;
    }

    const propsTable = { columns: genTableColumns(userInfo.role_name), getData: tableGetData(userInfo.role_name), showIndex: false, showAddButton: showAddButton(userInfo.role_name), addButtonText: "Incident", onAddData, order: 'requested_date', direction: 'desc', showCheckbox: true, minTableWidth:getTableWidth(userInfo.role_name), stickyEnd: isStickyEnd(userInfo.role_name), tableId:"table-incident"};

    const getReport = () => {

        if(!filter_date_by){
            Swal.fire({
                icon: 'error',
                title: "Error",
                text: "Please select filter!"
            });

            return;
        }

        if(filter_date_by && !filter_from_date){
            Swal.fire({
                icon: 'error',
                title: "Error",
                text: "Please select from date!"
            });

            return;
        }

        if(filter_date_by && !filter_to_date){
            Swal.fire({
                icon: 'error',
                title: "Error",
                text: "Please select to date!"
            });

            return;
        }

        let args = {filter_from_date: moment(filter_from_date).format("YYYY-MM-DD"), filter_to_date: moment(filter_to_date).format("YYYY-MM-DD"), filter_date_by, type: "incident"}
        if(selected_export_fields && !isObjectEmpty(selected_export_fields)){
            let result = [];
            Object.keys(selected_export_fields).forEach(item => {
                result.push(item)
            })

            args.selected_fields = result;
        }
        getTicketReporting(args).then(res => {
            if(res.status == 200){
                if(!res.data.file){
                    Swal.fire({
                        icon: 'info',
                        title: "No report found",
                        text: "Please pick another incident category and filter"
                    });

                    return;
                }
                const link = document.createElement('a');
                link.href = `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_SFTP_REPORT_FOLDER}${res.data.file}`;
                link.target = "_blank";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        })
    }

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6" style={{paddingLeft:"20px"}}>
                            <h2 className="title-breadcrum fw-500">Incidents</h2>
                            <h6>List of Incidents</h6>
                        </div>
                       {userInfo.role_name !== "Requester" && <div className="col-sm-6 right">
                            {/* <button type="button" class="btn btn-outline-dark right" style={{padding: "0.5em 1em", margin:"0 5px"}}>
                                <div style={{display: "flex", alignItems:"center"}}>
                                    <div><img src={data_update_dark}/></div>
                                    <div style={{marginLeft: "10px"}}>Import Data</div>
                                </div>
                            </button>*/}
                            <button type="button" class="btn btn-outline-dark btn-outline-modena right" style={{padding: "0.5em 1em", margin:"0 5px"}} onClick={() => $('#modal-export').modal('show')}>
                                <div style={{display: "flex", alignItems:"center"}}>
                                    <div><FaDownload/></div>
                                    <div style={{marginLeft: "10px"}}>Export Data</div>
                                </div>
                            </button>
                         </div>}
                    </div>
                </div>
            </div>
            <section className="content">
            <div class="modal right" id="modal-export" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document" style={{maxHeight:"100vh", height:"100vh"}}>
                    <div class="modal-content" style={{height:"100vh"}}>
                        <div className="modal-header">
                            <h5 className="modal-title black">
                                Export Incidents Data
                            </h5>
                            <button type="button" className="close" onClick={() => $("#modal-export").modal('hide')} aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div>
                                <>
                                    <div className="ticket-date-filter" style={{display:"flex", flexDirection:"column", rowGap:"5px"}}>
                                        <div className="bold black">Filter Ticket By:</div>
                                        <div className="row" style={{marginTop:"5px"}}>
                                            <div className="col-md-6">
                                                <select className="form-select servicedesk-input" aria-label="Default select example" style={{border:"1px solid black"}} onChange={(e) => setFilterDateBy(e.target.value)}>
                                                    <option value="">Select Filter</option>
                                                    <option value="created date">Created Time</option>
                                                    <option value="resolved date">Resolved Time</option>
                                                    <option value="closed date">Closed Time</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <DatePicker onChange={(time) => setFilterFromDate(time)} name={"filter_from_date"}      
                                                                selected={filter_from_date}
                                                                autoComplete="off"
                                                                dateFormat="dd/MM/yyyy"
                                                                placeholderText="&#128197; From"
                                                                className="servicedesk-export-datepicker"
                                                                disabled={!filter_date_by}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <DatePicker onChange={(time) => setFilterToDate(time)} name={"filter_to_date"}      
                                                                selected={filter_to_date}
                                                                autoComplete="off"
                                                                dateFormat="dd/MM/yyyy"
                                                                placeholderText="&#128197; To"
                                                                className="servicedesk-export-datepicker"
                                                                disabled={!filter_date_by}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{marginTop:"20px", columnGap:"20px"}} className="d-flex align-items-center">
                                            <div>
                                                <b className="black">Select Fields To Export</b>
                                            </div>
                                            <div style={{paddingTop:"10px"}}>
                                                <InputSwitch checked={select_fields_active} onChange={(e) => setSelectFieldsActive(!select_fields_active)}/>
                                            </div>
                                        </div>
                                        {select_fields_active && <div>
                                            <div style={{display:"flex", marginTop:"10px", flexWrap:"wrap", gap:"20px"}}>
                                                {incident_fields && incident_fields.map(item => {
                                                    return(
                                                    <div className="form-check flex-export-checkbox" style={{display: "flex", alignItems: "center", columnGap: "10px"}}>
                                                        <input className="b2b-checkbox" type="checkbox" value={item.toLowerCase()} onChange={(e) => {
                                                            let result = selected_export_fields ? {...selected_export_fields} : {};
                                                            if(e.target.checked){
                                                                result[e.target.value] = e.target.value;
                                                            } else {
                                                                delete result[e.target.value];
                                                            }
                                                            setSelectedExportFields(result);
                                                        }}/>
                                                        <label className="form-check-label" style={{fontWeight:"400"}}>
                                                            {capitalize(item.replace(/_/g, " "))}
                                                        </label>
                                                    </div>
                                                    )
                                                })}

                                                <div>
                                                    <b>Permanent Fields:</b>
                                                    <ul style={{marginTop:"10px"}}>
                                                        <li>Ticket Type</li>
                                                        <li>Incident Category</li>
                                                        <li>Incident Subcategory</li>
                                                        <li>Incident Item</li>
                                                        <li>Is Overdue Response</li>
                                                        <li>Is Overdue Resolve</li>
                                                        <li>Operational Hours</li>
                                                        <li>Response Time Duration</li>
                                                        <li>Resolve Time Duration</li>
                                                    </ul>
                                                </div>
                                                
                                            </div>
                                        </div>}
                                    </div>
                                </>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button className="btn btn-outline-dark" type='button' style={{ width: 150 }}  onClick={() => $('#modal-export').modal('hide')}><i className="fa fa-times"></i> Close</button> 

                            <button className="btn" type='button' style={{ width: 150, background:"#FAA819", color:"white" }} onClick={() => getReport()}><i className="fa fa-check"></i> Export</button>

                        </div>
                    </div>
                </div>
            </div>
                <div className="container-fluid">
                    <div className="card shadow mb-4">
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

export default Incidents;