import { useRef, useState } from 'react';
import {
    useNavigate
} from "react-router-dom";
import { useSelector } from 'react-redux';
import MTable from '../../Components/MTable/MTable';
import {getAll} from '../../Service/IncidentService';
import Swal from 'sweetalert2';
import Overlay from '../../Components/Overlay';
import moment from 'moment';
import ActionButton from '../../Components/MTable/ActionButton';
import StatusBadge from '../../Components/MTable/StatusBadge';
import 'moment/locale/id';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm } from 'react-hook-form';
import { serious_warning } from '../../Images';
import { FaDownload, FaEye } from 'react-icons/fa';
import {AiOutlineArrowUp, AiOutlineArrowDown, AiFillCloseCircle} from 'react-icons/ai';
import {BiSolidCircle, BiSolidSelectMultiple} from 'react-icons/bi';
import ServiceCategories from '../Pages/Settings/CategoryContents';
import { isObjectEmpty } from '../../Utils/Utils';
import { capitalize } from 'lodash';
import {getTicketReporting} from '../../Service/DashboardService';
import {RiArrowUpDoubleFill} from 'react-icons/ri';

const { $ } = window;   
const ServiceRequests = () => {
    let { userInfo } = useSelector(state => state.auth);
    moment.locale('id');
    const {  formState: { errors } } = useForm();
    const [filter_from_date, setFilterFromDate] = useState(null);
    const [filter_to_date, setFilterToDate] = useState(null);
    const [filter_date_by, setFilterDateBy] = useState(null);
    const incident_fields = [
        'ticket_number',
        'service_item',
        'description',
        'category',
        'urgency',
        'impact',
        'priority',
        'assigned_group',
        'assigned_agent',
        'ticket_requested_time',
        'first_response_time',
        'resolved_time',
        'status'
    ]
    const navigate = useNavigate();
    const tableSO = useRef();
    const [state, setState] = useState({ processing : false });

    const onAddData = () => {
        navigate('/services');
    }

    const onEdit = item => () => {
        navigate("/salesorder/edit/" + item.id);
    };

    const onRemove = () => {
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
              swalWithBootstrapButtons.fire(
                'Deleted!',
                'Your file has been deleted.',
                'success'
              )
            } else if (
              /* Read more about handling dismissals below */
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire(
                'Cancelled',
                'Your imaginary file is safe :)',
                'error'
              )
            }
          })
    };

    const columns = [
        { id: 1, title: 'Ticket Number', field: 'ticket_number', sortable: true, style:{width:"10%"},render: data => {
            return(
                <b>{data.ticket_number}</b>
            )
        }},
        { id: 2, title: 'Service Item', field: 'category_name', sortable: true, style:{width:"11%"}},
        { id: 3, title: 'Requested For', field: 'requested_for', sortable: true, style:userInfo.role_name == "Requester" ? {width:"7%"}: {width:"10%"},
        render: data => {
            if(data.requested_for_email){
                let requester_email = `mailto: ${data.requested_for_email}`;
                return <a href={requester_email}>{data.requested_for}</a>
            } else return <></>
          
        }
        },
        { 
            id: 4, title: 'Requested Date', field: 'requested_date', sortable: true, style:{width:"7%"},
            render: data => {
                return moment(data.requested_date).format('DD MMM YYYY HH:mm')
            }
        },
      
        { id: 7, title: 'Agent', field: 'agent_name', sortable: true, style:{width:"7%"}},
        {
            id: 5,
            title: 'Status',
            field: 'status',
            style:{width:"2%"},
            sortable: false,
            clickable: false,
            setAsSticky: false,
            render: data => {
                if (data.status == 'Pending') {
                    return <StatusBadge bg_color={"b2b-badge-warning"} text={"Pending"}  custom_width={"75%"}/>;
                } else if (data.status == 'Open') {
                    return <StatusBadge bg_color={"b2b-badge-info"} text={"Open"} custom_width={"60%"}/>;
                } else if (data.status == 'Resolved') {
                    return <StatusBadge bg_color={"b2b-badge-success"} text={"Resolved"} custom_width={"80%"}/>;
                }else if (data.status == 'Closed') {
                    return <StatusBadge bg_color={"b2b-badge-secondary"} text={"Closed"} custom_width={"70%"}/>;
                }
            },
        },
    ];

    const showAddButton = (role_name) => {
        if(!role_name || role_name !== "Requester") return false;
        else return true;
    }

    const tableGetData = (role_name) => {
        if(role_name == "Agent Supervisor" || role_name == "Agent") {
            let filter = {filterOr:`agent_id:${userInfo.agent_id}`, filter:"is_deleted:false,ticket_type:service request"};
            if(userInfo.agent_groups && userInfo.agent_groups.length > 0 && userInfo.agent_groups[0]){
                filter.filterOr += `,group_id:${userInfo.agent_groups[0].group_id},forward_to_email:${userInfo.email}`;
            }

            return (params) => getAll({...filter, ...params});
        }
        else if(role_name == "Requester") {
            let filter = {filterOr:`requester_email:${userInfo.email},forward_to_email:${userInfo.email}`, filter:"is_deleted:false,ticket_type:service request"};
            return (params) => getAll({...filter, ...params});
        }
        else return (params) => getAll({ ...params, filter:`is_deleted:false,ticket_type:service request,${params.filter||""}`});
    }

    const genTableColumns = (role_name) => {
        if(role_name !=="Requester") {
            columns.push(
                { id: 3, title: 'Requester', field: 'requester', sortable: true, style:{width:"10%"},
                render: data => {
                    let requester_email = `mailto: ${data.requester_email}`;
                    return <a href={requester_email}>{data.requester}</a>
                }
                },
                { id: 19, title: 'Group', field: 'group_name', sortable: true, style:{width:"10%"}},
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
                    title: 'Action',
                    style:{width:"5%"},
                    setAsSticky: true,
                    render: item => {
                        return (
                            <div style={{display:"flex", alignItems:"center"}}>
                                    {/*<ActionButton icon={<BsTrashFill/>} link_color="#FF4833" click_action={onRemove}/>*/}
                                    <ActionButton icon={<FaEye/>} link_color="#0099C3" click_action={() => navigate(`/service-request/${item.id}`)} text="View"/>
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
                style:{width:"5%"},
                render: item => {
                    return (
                        <div style={{display:"flex", alignItems:"center"}}>
                            {/*<ActionButton icon={<BsTrashFill/>} link_color="#FF4833" click_action={onRemove}/>*/}
                            <ActionButton icon={<FaEye/>} link_color="#0099C3" click_action={() => navigate(`/service-request/${item.id}`)} text="View"/>
                        </div>
                    );
                },
            });
            return columns;
        }
    }

    const getTableWidth = (role_name) =>{
        //if(role_name !== "Requester") return "110%";
        //else 
        return "100%"
    }

    const isStickyEnd = (role_name) =>{
        //if(role_name !== "Requester") return true;
       //else 
        return false;
    }

    const propsTable = { columns: genTableColumns(userInfo.role_name), getData: tableGetData(userInfo.role_name), showIndex: false, showAddButton: showAddButton(userInfo.role_name), addButtonText: "Service Request", onAddData, order: 'requested_date', direction: 'desc', showCheckbox: true, minTableWidth:getTableWidth(userInfo.role_name), stickyEnd: isStickyEnd(userInfo.role_name)};

    const [selected_category, setSelectedCategory] = useState({});

    const onCloseServiceCategory = (e) => {
        e.preventDefault();
        setSelectedCategory({});
        $("#modal-service-category").modal('hide');
    }

    const onShowServiceCategoryModal = () => {
        $('#modal-service-category').modal('show');
    }

    const onSetCategory = (category_obj) => {
        setSelectedCategory(category_obj);
        $("#modal-service-category").modal('hide');
    }

    const getReport = (category) => {
        if(!category || !category.id){
            Swal.fire({
                icon: 'error',
                title: "Error",
                text: "Please select a service item!"
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


        getTicketReporting({category_id: category.id, filter_from_date: moment(filter_from_date).format("YYYY-MM-DD"), filter_to_date: moment(filter_to_date).format("YYYY-MM-DD"), filter_date_by, type: "service request"}).then(res => {
            if(res.status == 200){
                if(!res.data.file){
                    Swal.fire({
                        icon: 'info',
                        title: "No report found",
                        text: "Please pick another service item and filter"
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
              <div id="modal-service-category" className="modal fade" style={{zIndex:"9999"}}>
                                        <div className="modal-dialog modal-lg" style={{ maxWidth: 1000 }}>
                                            <div className="modal-content" style={{width:"120%"}}>
                                                <div className="modal-header">
                                                    <h5 className="modal-title">
                                                        Select Service Category
                                                    </h5>
                                                    <button type="button" className="close" onClick={onCloseServiceCategory} aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div className="modal-body">
                                                    <ServiceCategories sendCategoryToParent={onSetCategory}/>
                                                </div>
                                            </div>
                                        </div>
                    </div>
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6" style={{paddingLeft:"20px"}}>
                            <h2 className="title-breadcrum fw-500">Service Requests</h2>
                            <h6>List of Services Requested</h6>
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
            <div className="modal" id="modal-export" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document" style={{maxWidth:"700px"}}>
                    <div class="modal-content" style={{width:"40vw"}}>
                        <div className="modal-header">
                            <h5 className="modal-title black">
                                Export Service Requests Data
                            </h5>
                            <button type="button" className="close" onClick={() => $("#modal-export").modal('hide')} aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div>
                            <div className="ticket-category-filter" style={{display:"flex", flexDirection:"row", alignItems:"center", columnGap:"10px"}}>
                                    <div className="bold black">Service Item:</div>
                                    <div>
                                        {isObjectEmpty(selected_category) &&
                                        <button type='button' className="btn" onClick={onShowServiceCategoryModal} style={{cursor:"pointer", border:"1px solid black", background:"black", color:"white", borderRadius:"8px", fontSize:"16px"}}>
                                            <BiSolidSelectMultiple/> Pick an item
                                        </button>}
                                        {!isObjectEmpty(selected_category) &&
                                        <div style={{display:"flex", alignItem: "center", columnGap: "10px"}}>
                                            <div style={{color: "red", cursor:"pointer"}} onClick={(e) => setSelectedCategory({})}><AiFillCloseCircle/></div>
                                                <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                    <span>{selected_category.category_name}</span>
                                                </div> 
                                        </div>}
                                    </div>
                                </div>
                                {!isObjectEmpty(selected_category) &&
                                    <div className="ticket-date-filter" style={{display:"flex", flexDirection:"column", rowGap:"5px",marginTop:"30px"}}>
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
                                                                placeholderText="&#128197; From Date"
                                                                className="servicedesk-export-datepicker"
                                                                disabled={!filter_date_by}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <DatePicker onChange={(time) => setFilterToDate(time)} name={"filter_to_date"}      
                                                                selected={filter_to_date}
                                                                autoComplete="off"
                                                                dateFormat="dd/MM/yyyy"
                                                                placeholderText="&#128197; To Date"
                                                                className="servicedesk-export-datepicker"
                                                                disabled={!filter_date_by}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button className="btn btn-outline-dark" type='button' style={{ width: 150 }}  onClick={() => $('#modal-export').modal('hide')}><i className="fa fa-times"></i> Close</button> 

                            <button className="btn" type='button' style={{ width: 150, background:"#FAA819", color:"white" }} onClick={() => getReport(selected_category)}>
                                <i className="fa fa-check"></i> Export
                            </button>

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

export default ServiceRequests;