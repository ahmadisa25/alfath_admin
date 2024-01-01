import { useEffect, useRef, useState } from 'react';
import {
    NavLink,
    useNavigate
} from "react-router-dom";
import { useSelector } from 'react-redux';
import Overlay from '../../Components/Overlay';
import moment from 'moment';
import {IoMdCart} from 'react-icons/io';
import {RiAttachment2} from 'react-icons/ri';
import {FaPencilAlt, FaListUl, FaEdit, FaRegHandshake, FaEye, FaUpload} from 'react-icons/fa';
import 'moment/locale/id';
import { AiOutlineArrowDown, AiOutlineArrowUp } from 'react-icons/ai';
import { BiRefresh, BiSolidCircle } from 'react-icons/bi';
import { BsChevronDoubleUp } from 'react-icons/bs';
import {MdOutlineModeEdit} from 'react-icons/md';
import { InputSwitch } from 'primereact/inputswitch';
import ActionButton from '../../Components/MTable/ActionButton';
import MTable from '../../Components/MTable/MTable';
import { includes } from 'lodash';

import {
    useParams
} from "react-router-dom";
import { capitalize } from 'lodash';
import Swal from 'sweetalert2';
import { chrome_tote, incident } from '../../Images';
import { isAdmin, isObjectEmpty, isValidEmail } from '../../Utils/Utils';
import { forwardIncident, getIncident, resolveIncident, updateIncident } from '../../Service/IncidentService';
import { automateReplies, createConversations, insertFileToConversations } from '../../Service/TicketConversationService';
import { getAllStatus } from '../../Service/StatusService';
import { getModenaUserByEmail } from '../../Service/UserService';
import { getSLAMonitoring } from '../../Service/SLAService';
import { filter } from 'lodash';
import StatusBadge from '../../Components/MTable/StatusBadge';
import { getAllGroups } from '../../Service/GroupService';
import { getAllAgents } from '../../Service/AgentService';
import GroupMembers from '../Pages/GroupMembers';

let email_timer_id = -1;
const { $ } = window;
let agent_timer_id = -1;
const CLOSED_STATUS = 4;
const RESOLVED_STATUS = 3;
const IncidentDetail = () => {
    const PHOTO_BASE_URL = process.env.REACT_APP_IMAGE_URL;
    let { userInfo } = useSelector(state => state.auth);
    const { incident_id } = useParams();
    moment.locale('id');
    const navigate = useNavigate();
    const tableGroup = useRef();
    const [conversation_state, setConversationState] = useState("Replies");
    const [statuses, setStatuses] = useState([]);
    const [incident_data, setIncidentData] = useState({});
    const [current_page, setCurrentPage] = useState("Detail");
    const [new_conversation, setNewConversation] = useState("");
    const [state, setState] = useState({ processing : false, agents: [],
        isAgentFocus: false });
    const {isAgentFocus, agents} = state;
    const [selected_helper, setSelectedHelper] = useState({});
    const [refresh, setRefresh] = useState(false);
    const [sla_monitoring, setSLAMonitoring] = useState({});
    const [sla_response, setSLAResponse] = useState("");
    const [till_sla_response_due, setTillSLAResponseDue] = useState("");
    const [sla_resolve, setSLAResolve] = useState("");
    const [till_sla_resolve_due, setTillSLAResolveDue] = useState("");
    const [enable_edit_urgency, setEnableEditUrgency] = useState(false);
    const [group_modal_state, setGroupModalState] = useState("groups_list");
    const [selected_group, setSelectedGroup] = useState({});
    const [edit_group, setEditGroup] = useState(false);
    const [edit_agent, setEditAgent] = useState(false);
    /*const [info, setInfo] = useState({
        detail:[{
            file_name: "M16A2 Rifle",
            created_date: "26/04/1995",
            created_by: "B1G P41N"
        }]
    })*/

    const renderPriority = urgency => {
        let color = "";
        let icon = "";
        if (urgency == 'low') {
            color = "#39E3A7";
        } else if(urgency == "medium"){
            color= "#FFC300";
        }
        else if(urgency == "high"){
            color = "#FF7F50";
        }
        else {
            color = "#FF2400";
        }
        return <div style={{display:"flex", color, fontWeight:"700", columnGap:"5px"}}>
            <div>
                <div style={{fontSize:"12px", paddingTop:"2px"}}><BiSolidCircle/></div>
            </div>
            <div>{capitalize(urgency)}</div>
        </div>;
        
    }

    useEffect(() => {
        if(refresh) {
            setEnableEditUrgency(false);
            getAllStatus().then(res => {
                if(res.status == 200){
                    setStatuses(res.data.data);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "Failed in getting data!"
                     })
                }
            })
            
            getIncident(incident_id).then(res => {
                if(res.status == 200){
                    setIncidentData(res.data);
                } else{
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "Failed to get incident data. Please try again or contact support"
                    }).then(() => navigate('/incidents'));
                }
            });

            getSLAMonitoring(incident_id).then(res => {
                if(res.status == 200){
                    let sla_resolve = res.data.resolve.end_time_duration
                    if(res.data.resolve.sla_comparison_result == "Within SLA"){
                        let till_resolve = `${res.data.resolve.sla_remaining_time.days} day ${res.data.resolve.sla_remaining_time.hours} hours ${res.data.resolve.sla_remaining_time.minutes} minutes`; 
                        setTillSLAResolveDue(till_resolve);
                    } else {
                        let remaining_time = parseInt(res.data.resolve.sla_elapsed_time_minute)-parseInt(res.data.resolve.sla_standard_minute);
                        let till_resolve = `${remaining_time} minutes`; 
                        setTillSLAResolveDue(till_resolve);
                    }
        
                    let sla_response = res.data.response.end_time_duration;
                    if(res.data.response.sla_comparison_result == "Within SLA"){
                        let till_response = `${res.data.response.sla_remaining_time.days} day ${res.data.response.sla_remaining_time.hours} hours ${res.data.response.sla_remaining_time.minutes} minutes`; 
                        setTillSLAResponseDue(till_response);
                    } else {
                        let remaining_time = parseInt(res.data.response.sla_elapsed_time_minute)-parseInt(res.data.response.sla_standard_minute);
                        let till_response = `${remaining_time} minutes`; 
                        setTillSLAResponseDue(till_response);
                    }
                    setSLAResolve(sla_resolve);
                    setSLAMonitoring(res.data);
                    setSLAResponse(sla_response);
                } else{
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "Failed to get incident data. Please try again or contact support"
                    }).then(() => navigate('/incidents'))
                }
            }).catch(err => {
                if(userInfo.role_name != "Requester"){
                    let msg = "There's an error in processing your request. Please try again or contact support";
                    msg = err.response.data.message;
                    if(err.response && err.response.data && err.response.data.message){
                        if(err.response.data.message == "SLA Not Set"){
                            Swal.fire({
                                icon: 'info',
                                title: msg,
                            });
                            return;
                        }
                        
                        Swal.fire({
                            icon: 'error',
                            title: "error",
                            text: msg
                        });
                    } 
                    
                }
            });
            setState({...state, processing:false})
            setRefresh(false);
        }
    }, [refresh])

    useEffect(() => {
        if(userInfo.access){
            if(userInfo.access.incidents){
                if(!userInfo.access.incidents.can_view) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "You're not allowed to access that page!"
                     })
                    navigate('/');
                }
                getAllStatus().then(res => {
                    if(res.status == 200){
                        setStatuses(res.data.data);
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed in getting data!"
                         })
                    }
                })
                
                getIncident(incident_id).then(res => {
                    if(res.status == 200){
                            if(userInfo.role_name == "Requester"){
                                if(userInfo.email !== res.data.requester_email && userInfo.email !== res.data.requested_for_email &&  userInfo.email !== res.data.forward_to_email){
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error!',
                                        text: "You can only access your own tickets!"
                                    }).then(() => navigate('/incidents'));
                                }
                            }
                            
                            if(userInfo.role_name == "Agent Supervisor"){
                                if(userInfo.email !== res.data.forward_to_email){
                                    if(!userInfo.agent_groups || userInfo.agent_groups[0].group_id !== res.data.group_id){
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Error!',
                                            text: "You can only access your own or your group tickets!"
                                        }).then(() => navigate('/incidents'));
                                    }
                                }
                                
                                /*else if(userInfo.agent_id !== res.data.agent_id){
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error!',
                                        text: "You can only access your own or your group tickets!"
                                    }).then(() => navigate('/incidents'));
                                }*/
                            }
                            if(userInfo.role_name == "Agent"){
                                if(userInfo.email !== res.data.forward_to_email){
                                    if(userInfo.agent_id !== res.data.agent_id){
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Error!',
                                            text: "You can only access your own tickets!"
                                        }).then(() => navigate('/incidents'));
                                    }
                                }
                            }
                        setIncidentData(res.data);
                    } else{
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed to get incident data. Please try again or contact support"
                        });
                    }
                });

                getSLAMonitoring(incident_id).then(res => {
                    if(res.status == 200){
                        let sla_resolve = res.data.resolve.end_time_duration;
                        if(res.data.resolve.sla_comparison_result == "Within SLA"){
                            let till_resolve = `${res.data.resolve.sla_remaining_time.days} day ${res.data.resolve.sla_remaining_time.hours} hours ${res.data.resolve.sla_remaining_time.minutes} minutes`; 
                            setTillSLAResolveDue(till_resolve);
                          
                        } else {
                            let remaining_time = parseInt(res.data.resolve.sla_elapsed_time_minute)-parseInt(res.data.resolve.sla_standard_minute);
                            let till_resolve = `${remaining_time} minutes`; 
                            setTillSLAResolveDue(till_resolve);
                        }
            
                        let sla_response = res.data.response.end_time_duration;
                        if(res.data.response.sla_comparison_result == "Within SLA"){
                            let till_response = `${res.data.response.sla_remaining_time.days} day ${res.data.response.sla_remaining_time.hours} hours ${res.data.response.sla_remaining_time.minutes} minutes`; 
                            setTillSLAResponseDue(till_response);
                        } else {
                            let remaining_time = parseInt(res.data.response.sla_elapsed_time_minute)-parseInt(res.data.response.sla_standard_minute);
                            let till_response = `${remaining_time} minutes`; 
                            setTillSLAResponseDue(till_response);
                        }
                        setSLAResolve(sla_resolve);
                        setSLAMonitoring(res.data);
                        setSLAResponse(sla_response);
                    } else{
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed to get incident data. Please try again or contact support"
                        }).then(() => navigate('/incidents'))
                    }
                }).catch(err => {
                    if(userInfo.role_name != "Requester"){
                        let msg = "There's an error in processing your request. Please try again or contact support";
                        msg = err.response.data.message;
                        if(err.response && err.response.data && err.response.data.message){
                          
                            if(err.response.data.message == "SLA Not Set"){
                                Swal.fire({
                                    icon: 'info',
                                    title: msg,
                                });
                                return;
                            }
                           
                            Swal.fire({
                                icon: 'error',
                                title: "error",
                                text: msg
                            });
                        } 
                        
                    }
                })
            }
        }
    }, [])

    const [photo_upload, setPhotoUpload] = useState({
        img_upload:"",
        File:""
    });

    const onImageChange = (e) => {
        setState({...state, processing:true});
        const [file] = e.target.files;
        const allowed_file_types = [
            "image/png",
            "image/jpg",
            "image/jpeg",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/pdf",
            "video/mp4", 
            "message/rfc822"
        ];
        if (file) {
            //bikin logic untuk allowed file types
            if(!includes(allowed_file_types, file.type)){
                Swal.fire({
                    icon: 'error',
                    title: "That file extension is not allowed (only .png, .jpeg, .jpg, excel files, .eml, mp4 and pdf)"
                });
                return;
            } 
            if(file.size <=1000000){
                let photo_obj = {};
                //photo_obj.File = file;
                //photo_obj.img_upload = URL.createObjectURL(file);
                //setPhotoUpload(photo_obj);

                const formData = new FormData();
                formData.append("ticket_id", incident_data.ticket_id);
                formData.append("File", file);

                insertFileToConversations(formData).then(res => {
                    if(res.status == 200){
                        setState({...state, processing:false})
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: "A new file has been uploaded!"
                            }).then( () => setRefresh(true));
                        }
                })
            } else{
                Swal.fire({
                    icon: 'error',
                    title: "The file size is too large"
                }).then(() => {
                    setState({...state, processing:false})
                });
            }

        }
    }
    
    const submitConversation = (e) => {
        e.preventDefault();
        setState({...state, processing:true});
        const body_data = {
            conversation_remark: new_conversation,
            ticket_id: incident_id,
            conversation_from: userInfo.fullname,
            conversation_from_email: userInfo.email,
            conversation_date: moment().format("YYYY-MM-DD HH:mm:ss"),
            performer_type: userInfo.role_name
        }
        createConversations(body_data).then(res => {
            if(res.status == 200){
                setState({...state, processing:false});
                    setNewConversation("");
                    getIncident(incident_id).then(res => {
                        if(res.status == 200){
                            setIncidentData(res.data);
                        } else{
                            Swal.fire({
                                icon: 'error',
                                title: 'Error!',
                                text: "Failed to get incident data. Please try again or contact support"
                            });
                        }
                    });
            } else {
                let message = res.data.message || "Please try again or contact support!";
                setState({...state, processing:false});
                Swal.fire({
                    icon: 'error',
                    title: 'Conversation creation failed!',
                    text: message
                 });
            }
        }).catch(err => {
            let message = err.response.data.errors && err.response.data.errors.conversation_remark? err.response.data.errors.conversation_remark :  err.response.data.message ?  err.response.data.message:  "Please try again or contact support!";
                setState({...state, processing:false});
                Swal.fire({
                    icon: 'error',
                    title: 'Conversation creation failed!',
                    text: message
                 });
        }) 
    }

    const onChangeAgent = (e) => {
        if (e.target.value.length) {
            clearTimeout(agent_timer_id);
            agent_timer_id = setTimeout(() => getAllAgents({search:e.target.value, filter:`group_id:${incident_data.group_id}`}).then((res) => {
            setState({ ...state, isAgentFocus: true, agents: res.data.data });
            }), 500);
        } else {
            clearTimeout(agent_timer_id);
            /*agent_timer_id = setTimeout(() => {
                setValue("assigned_agent", null); 
                setValue("assigned_agent_name", null);
            }, 500);*/
            //reset({ agent_supervisor_id: null});
            //setValue('assigned_agent', "");
            //setValue('assigned_agent_name', "");
            setState({ ...state, isAgentFocus: true, agents: [] });
        }
    }

    const onSelectAgent = (item) => {
        updateIncident(incident_id, {
            agent_id: item.id
        }).then(res => {
            let stats = res.status
            if(stats == 200){
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: "An incident has been updated!"
                    }).then( () => navigate('/incidents'));
                
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Incident update failed!',
                    text: res.data.message
                    });
            } 
        })
    };

    const onChangeEmail = (e) => {
        if (e.target.value.length >= 3) {
          clearTimeout(email_timer_id);
          email_timer_id = setTimeout(() => getModenaUserByEmail(e.target.value).then((res) => {
            let data = res.data.data;
            data = filter(data, (item) => {
                return item.employee_status == "Active"
            });
            setState({ ...state, isEmailFocus: true, users: data });
          }), 500);
        } else {
            clearTimeout(email_timer_id);
            //reset({ agent_name: '', agent_user_id: "", agent_work_phone: ''});
            setState({ ...state, isEmailFocus: true, users: [] });
        }
    }

    const onCloseModal = (e) => {
        e.preventDefault();
        setSelectedHelper({});
        $("#modal-help").modal('hide');
    }
    
    const onCloseGroupModal = (e) => {
        e.preventDefault();
        setSelectedGroup({});
        $("#modal-group").modal('hide');
    }

    const onSelectEmail = (item) => {
        setSelectedHelper({
            recipient_email: item.email,
            recipient_name: item.employe_name
        })
        setState({ ...state, isEmailFocus: false });
    };

    const {isEmailFocus, users} = state;

    const refreshConversations = () => {
        setState({...state, processing: true});
        automateReplies().then(res => {
            if(res.data.status == 200) {
               setRefresh(true);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "Fail to pull email data. Please try again in a few seconds"
                }).then(_ => {
                    setState({...state, processing:false})
                });
                
            }
        }).catch(err => {
            let msg = "There's an error in processing your request. Please try again or contact support";
            if(err.response && err.response.data && err.response.data.message) msg = err.response.data.message;
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: msg
            }).then(_ => {
                setState({...state, processing:false})
            });
        })
    }


    const renderStatusBadge = (status) => {
        if (status == 'Pending') {
            return <StatusBadge bg_color={"b2b-badge-warning"} text={"Pending"}/>;
        } else if (status == 'Open') {
            return <StatusBadge bg_color={"b2b-badge-info"} text={"Open"}/>;
        } else if (status == 'Resolved') {
            return <StatusBadge bg_color={"b2b-badge-success"} text={"Resolved"}/>;
        }else if (status == 'Closed') {
            return <StatusBadge bg_color={"b2b-badge-secondary"} text={"Closed"}/>;
        }
    }

    const disableStatusChange = (user_info, ticket_data) => {
        if(ticket_data.status == CLOSED_STATUS){
            if(user_info.role_name == "Agent" || user_info.role_name == "Agent Supervisor") return true;
        } 
        if(user_info.role_name == "Requester") {
            return true;
        }
        return false;
    }

    
    const onChangeData = (field_name, value) => {
        if(field_name == "status" && value == RESOLVED_STATUS){
            Swal.fire({
                title: 'Please enter a remark/message about the resolution',
                input: 'textarea', // Specify the input type as "textarea"
                inputPlaceholder: 'Put remark here',
                allowOutsideClick:false,
                inputAttributes: {
                  rows: 4, // Number of rows for the textarea
                  required:true 
                },
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                allowOutsideClick: () => !Swal.isLoading(), // Prevent closing during async work
              }).then((result) => {
                if (result.isConfirmed) {
                  // The user confirmed, and you can access the textarea value
                  const textarea_value = result.value;
                  resolveIncident(incident_id, {agent_remark: textarea_value}).then(res => {
                    if(res.data.status == 200) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: "Incident has been resolved and notified to user!"
                         }).then(() =>{
                            navigate('/incidents');
                         })
                    } else{
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed to resolve incident. Please try again or contact support"
                        });
                    }
                  })
                }
              });
        } else {
            incident_data[field_name] = value;
            updateIncident(incident_id, incident_data).then(res => {
                let stats = res.status
                if(stats == 200){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "An incident has been updated!"
                        }).then( () => setRefresh(true));
                    
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Incident update failed!',
                        text: res.data.message
                        });
                } 
            })
        }
       
    }

    const onForwardTicket = (e) => {
        if(!selected_helper || isObjectEmpty(selected_helper)){
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "Please select helper name from the dropdown!"
            })
            return;
        }

        if(!isValidEmail(selected_helper.recipient_email)){
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "Please select helper name from the dropdown!"
            })
            return;
        }
        forwardIncident(incident_id, selected_helper).then(res => {
            if(res.status == 200){
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: "Ticket has been forwarded!"
                 }).then(() =>{
                    setSelectedHelper({});
                    $('#modal-help').modal('hide');
                    setRefresh(true);
                 })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "An unknown error has occured. Please try again or contact support!"
                 })
            }
        })
    }

    const onShowModal = (e) => {
        $('#modal-help').modal('show');
    }
    const onSelectGroup = () =>{
        $("#modal-group").modal('hide');
        setGroupModalState("groups_list");
        setSelectedGroup({});
        setEditGroup(false);
        updateIncident(incident_id, {
            group_id: selected_group.group_id, agent_id: null
        }).then(res => {
            let stats = res.status
                if(stats == 200){
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: "An incident has been updated!"
                        }).then( () =>navigate('/incidents'));
                    
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Incident update failed!',
                        text: res.data.message
                        });
                } 
        })
        //onChangeData("group_id", selected_group.group_id)
        //to do: ganti groupnya jangan pake on change data tapi pake updateIncident aja
    }
    const group_columns = [
        { id: 1, title: 'Group Name', field: 'group_name', sortable: true },
        { id: 3, title: 'Active Status', field: 'group_enabled', sortable: true,
        filter_text: "Please type in lower case: 'true' for active, 'false' for inactive",
        render: item => {
            return <InputSwitch checked={item.group_enabled == true} disabled/>
        },
        },
        {
            id: 2,
            title: 'Action',
            style:{width:200},
            render: item => {
                return (
                    <div style={{display:"flex", alignItems:"center"}}>
                            <ActionButton icon={<FaEye/>} link_color="#0099C3" click_action={() => {
                                setSelectedGroup({
                                    group_id: item.id,
                                    group_name:item.group_name    
                                })
                                setGroupModalState("groups_members")
                            }} text="Members"/>
                    </div>
                );
            },
        }
    ];
    const propsGroup = { columns: group_columns, getData: getAllGroups, showIndex: true };

    return (
        <div className="content-wrapper">
                {userInfo.role_name !== "Requester" && <div id="modal-group" className="modal fade">
                        <div className="modal-dialog modal-lg" style={{ maxWidth: 1000 }}>
                            <div className="modal-content" style={{width:"120%"}}>
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {group_modal_state !== "groups_list" &&  
                                            <>
                                                <i className="fa fa-arrow-left" style={{cursor: "pointer"}} onClick={() => {
                                                    //tableBizHours.current.refresh();
                                                    setGroupModalState("groups_list");
                                                    setSelectedGroup(null);
                                                }}></i>  
                                                &nbsp;
                                            </>
                                        }
                                        {group_modal_state == "groups_list" ? "Groups List": "Group Members"}
                                    </h5>
                                    <button type="button" className="close" onClick={onCloseGroupModal} aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {group_modal_state == "groups_list" && <MTable ref={tableGroup} {...propsGroup} />}
                                    {group_modal_state == "groups_members" &&
                                        <GroupMembers id_group={selected_group.group_id}/>
                                    }
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-outline-dark" type='button' style={{ width: 150 }}  onClick={onCloseGroupModal}><i className="fa fa-times"></i> Close</button>{group_modal_state === "groups_members" && 
                                        <>
                                            <button className="btn btn-success" type='button' style={{ width: 150 }} onClick={onSelectGroup}><i className="fa fa-check"></i> Pick This</button>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                </div>}
                <div id="modal-help" className='modal fade'>
                                    <div className='modal-dialog modal-dialog-centered modal-xl'>
                                        <div className='modal-content'>
                                            <div className='modal-header'>
                                                <h5 className="modal-title black bold">Ask For Help</h5>
                                                <button type="button" className="close" onClick={onCloseModal}>
                                                    <span aria-hidden="true">×</span>
                                                </button>
                                            </div>
                                           
                                            <div className='modal-body'>
                                                <div className="row">
                                                                <Overlay display={state.processing} />
                                                                
                                                                <div className='full-width' style={{padding:"0 20px"}}>
                                                                    <div className='form-group'>
                                                                        <label htmlFor='agent_email' className="black"><b>Helper E-mail (From HRIS Sunfish, type in lowercase only)</b> <span style={{color:"red"}}>*</span><i style={{fontSize:"16px"}}>type in lowercase only</i></label>
                                                                        <input maxLength="500" onClick={() => setState({ ...state, isEmailFocus: true})} id="helper_email" placeholder="Type min 3 char" className='form-control' value={selected_helper.recipient_email} onChange={onChangeEmail} autoComplete="off"/>

                                                                

                                                                        {users && users.length > 0 && isEmailFocus &&
                                                                        <div className='mt-1 p-2' style={{ zIndex: 1, position: 'absolute', background: '#fff', border: '1px solid #ccc', borderRadius: 5, width: '97.2%', maxHeight: '375px', overflow: "auto", overflowY: "scroll" }}>
                                                                            {
                                                                            users.map((item, i) =>
                                                                                <div onClick={() => onSelectEmail(item)} key={i} className='d-flex align-items-center w-100 p-1 mb-1' style={{ border: '1px solid #ccc', borderRadius: 5, cursor: 'pointer' }}>
                                                                                <span className='ml-2'>{item.employe_name} <b>({item.email})</b></span>
                                                                                </div>
                                                                            )
                                                                            }
                                                                        </div>
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div className='full-width' style={{padding:"0 20px"}}>
                                                                    <i style={{color:"black"}}>* Please select e-mails only from the list shown. </i>
                                                                </div>
                                                </div>

                                                <div className='form-group'>
                                                    <div style={{ marginTop: "30px" }}>
                                                    <button type='submit' className='btn btn-block btn-lg' onClick={onForwardTicket} style={{fontSize:"1em", background:"black", color:"white"}} disabled={(!selected_helper || isObjectEmpty(selected_helper))}><span className="bold"> Send</span></button>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                </div>
            <div className="content-header">
                
            </div>
            <section className="content">

                <div className="container-fluid">
                    <div className="card shadow mb-4">
                        <div className='card-header po-card-header'>
                            <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <div style={{display:"flex", alignItems:"center", cursor: "pointer", marginBottom:"10px", fontSize:"16px", color:"#FAA819"}} onClick={() => navigate('/incidents')}>
                                        <div><span class="material-icons" style={{fontSize:"18px", marginTop:"5px"}}>arrow_back</span></div>
                                        <div>&nbsp; Back to Incidents List</div>
                                </div>
                                <div style={{display: "flex", columnGap: "20px"}}>
                                    <div>
                                        <span className="ticket-title fw-500 black" style={{display: "block"}}>Ticket #{incident_data.ticket_number}</span>
                                        <span style={{fontSize: "14px !important", display: "block"}}>Requested Date: {moment(incident_data.requested_date).format('ll')}</span>
                                    </div>
                                    <div>
                                    <div>
                                        {renderStatusBadge(incident_data.status_name)}
                                    </div>
                                    </div>
                                </div>
                                
                            </div>
                            {/*<div className="col-sm-6 right">
                                <button type="button" class="btn btn-outline-dark right" style={{padding: "0.5em 1em", margin:"0 5px"}}>
                                    <div style={{display: "flex", alignItems:"center"}}>
                                        <div style={{marginLeft: "10px"}}>Email</div>
                                    </div>
                                </button>
                                <button type="button" class="btn btn-outline-dark right" style={{padding: "0.5em 1em", margin:"0 5px"}}>
                                    <div style={{display: "flex", alignItems:"center"}}>
                                        <div><img src={data_update_dark} style={{transform: "scaleY(-1)"}}/></div>
                                        <div style={{marginLeft: "10px"}}>Print</div>
                                    </div>
                                </button>
    </div>*/}
                        </div>
                        <hr/>
                        <div className='row'>
                            <div className='col-md-12 d-flex' style={{margin: "12px 0 2em 0", columnGap: "5px"}}>
                                <div className={current_page == "Detail"? "b2b-badge-modena": "b2b-badge-neutral"} onClick={() => setCurrentPage("Detail")} style={{cursor: "pointer"}}>
                                        <IoMdCart/>
                                        <span style={{fontSize:"16px"}}>Detail</span>
                                </div>
                                <div className={current_page == "Activities"? "b2b-badge-modena": "b2b-badge-neutral"} onClick={() => setCurrentPage("Activities")} style={{cursor: "pointer"}}>
                                        <div style={{fontSize:"14px"}}><FaListUl/></div>
                                        <span style={{fontSize:"16px"}}>Activities</span>
                                </div>
                                <div className={current_page == "Attachment"? "b2b-badge-modena": "b2b-badge-neutral"} onClick={() => setCurrentPage("Attachment")} style={{cursor: "pointer"}}>
                                        <div style={{fontSize:"14px"}}><RiAttachment2/></div>
                                        <span style={{fontSize:"16px"}}>Attachments</span>
                                </div>
                            </div>
                        </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <Overlay display={state.processing} />
                            {current_page === "Detail" &&
                                <>
                                    <div className='row' style={{marginBottom: "20px", width: "100%"}}>
                                        <div className='col-md-9 col-sm-12'>
                                            <div style={{fontSize: "16px", paddingTop:"10px", width: "95%"}}>
                                                <div className="row">
                                                    <div className={userInfo.role_name !== "Administrator" ? 'col-md-4' : 'col-md-5'}>
                                                        <div className="ticket-detail" style={{display:"flex", flexDirection:"column", rowGap:"5px"}}>
                                                            <div className="bold black">Subject:</div>
                                                            <div>{incident_data.subject}</div>
                                                        </div>
                                                        <div className="ticket-detail" style={{display:"flex", flexDirection:"column", rowGap:"5px"}}>
                                                            <div className="bold black">Description:</div>
                                                            <div>{incident_data.description? JSON.parse(incident_data.description).description: ""}</div>
                                                        </div>
                                                        <div className="ticket-detail" style={{display:"flex", flexDirection:"column", rowGap:"5px"}}>
                                                            <div className="bold black">Category:</div>
                                                            <div>{incident_data.category_name}</div>
                                                        </div>
                                                    </div>
                                                    <div className={userInfo.role_name !== "Administrator" ? 'col-md-4' : 'col-md-5'}>
                                                        <div className="ticket-detail" style={{display:"flex", flexDirection:"column", rowGap:"5px"}}>
                                                            <div className="bold black">Requester:</div>
                                                            <div>{incident_data.requester} ({incident_data.requester_email})</div>
                                                        </div>
                                                        <div className="ticket-detail" style={{display:"flex", flexDirection:"column", rowGap:"5px"}}>
                                                            <div className="bold black">Requested For:</div>
                                                            <div>{incident_data.requested_for ?`${incident_data.requested_for} (${incident_data.requested_for_email})` : "-"}</div>
                                                        </div>
                                                    </div>
                                                    {userInfo.role_name !== "Administrator" && incident_data.status !== CLOSED_STATUS && <div className='col-md-4' style={{display:"flex", flexDirection:"column", alignItems:"flex-end", rowGap:"5px"}}>
                                                        <div style={{display:"flex", color:"#FAA819", alignItems:"center", columnGap:"5px", float:"right", cursor:"pointer"}} onClick={()=> navigate(`/incident-form/${incident_id}`)}>
                                                            <div><FaEdit/></div>
                                                            <div>Edit Ticket Detail</div>
                                                        </div>
                                                        {(userInfo.role_name == "Agent" || userInfo.role_name == "Agent Supervisor") && 
                                                        <div id ="ask-for-help" style={{display:"flex", color:"#FAA819", alignItems:"center", columnGap:"5px", float:"right", cursor:"pointer"}} onClick={onShowModal}>
                                                            <div><FaRegHandshake/></div>
                                                            <div>Ask For Help</div>
                                                        </div>}
                                                    </div>}
                                                   
                                                </div>
                                                <div style={{marginBottom:"40px", marginTop:"20px"}}>
                                                    <div style={{display:"flex"}}>
                                                        <div style={{display: "flex", alignItems:"center", columnGap: "10px", justifyContent: "flex-start"}}>
                                                            <FaPencilAlt/>
                                                            <div style={{paddingTop:"0.5em"}}><h6 className='black'>Reply to a conversation...</h6></div>
                                                        </div>
                                                        <div style={{marginLeft:"auto", display: "flex", alignItems:"center", color:"#FAA819", columnGap:"5px", cursor: "pointer"}} onClick={refreshConversations}>
                                                            <div style={{fontSize:"20px"}}><BiRefresh/></div>
                                                            <div>Refresh Conversations</div>
                                                        </div>
                                                    </div>
                                                    <textarea placeholder="Enter a message.." maxLength="500" style={{border: "1px solid #D0D5DD", borderRadius: "4px", width: "100%", height: "10vh"}} value={new_conversation} onChange={(e) => setNewConversation(e.target.value)}/>
                                                    <div style={{float:"right"}}>
                                                        <button class="btn right" style={{padding:"0 !important", fontSize:"14px",background:"#FAA819", color:"white"}} onClick={submitConversation} disabled={(incident_data.status === CLOSED_STATUS || new_conversation.length == 0)}>
                                                            Submit
                                                        </button>
                                                    </div>
                                                    <div style={{display: "flex", alignItems:"center", columnGap: "10px", justifyContent: "flex-start", marginTop:"60px"}}>
                                                            <div style={{display: "flex", alignItems:"center", columnGap: "10px"}}>
                                                                <FaUpload/>
                                                                <div style={{paddingTop:"0.5em"}}><h6 className='black'>Upload a File To Conversation</h6></div>
                                                            </div>
                                                            <div style={{display: "flex", alignItems:"center", columnGap: "10px"}}>
                                                                <button class="btn right" style={{padding:"0 !important", fontSize:"14px",background:"#FAA819", color:"white"}} onClick={()=> $('#attachment-incident-upload').click()} disabled={incident_data.status === CLOSED_STATUS}>
                                                                    Browse Files
                                                                </button>
                                                                <input id="attachment-incident-upload" type="file" accept="image/png, image/jpg, image/jpeg, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .pdf, video/mp4, message/rfc822" className='d-none' onChange={(e) =>onImageChange(e)}/>
                                                            </div>
                                                    </div>
                                                    <div className="font-italic text-muted mb-4" style={{marginTop:"5px", width:"45%"}}>File must not be larger than 1 MB. Allowed types: jpg, png, pdf, xls, xlsx, mp4, .eml (email files)</div>
                                                </div>
                                                <div>

                                                    {/* Comment list code (HTML & CSS) is using Nath Ryuzaki's code at codepen*/}
                                                <div style={{marginTop:"10px"}}>
                                                    <ul className="nav nav-tabs" style={{margin:"20px 30px 0px 0px"}}>
                                                        <li className="nav-item">
                                                            <a className={conversation_state === "Replies" ? "nav-link active bold b2b-tab-nav-link-inactive": "nav-link b2b-tab-nav-link"} aria-current="page" href="#" onClick={()=> setConversationState("Replies")}>Conversation Replies</a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a className={conversation_state === "Files" ? "nav-link active bold b2b-tab-nav-link-inactive": "nav-link b2b-tab-nav-link"} aria-current="page" href="#" onClick={()=> setConversationState("Files")}>Conversation Files</a>
                                                        </li> 
                                                    </ul>
                                                </div>
                                                <ul id="list_comment" class="col-md-12" style={{marginLeft:"10px"}}>
                                           
                                                {/*<div class="avatar_comment col-md-1">
                                                    <img src="https://static.xx.fbcdn.net/rsrc.php/v1/yi/r/odA9sNLrE86.jpg" alt="avatar"/>
                                                </div>*/}
                                                {conversation_state === "Replies" && incident_data.ticket_conversations && incident_data.ticket_conversations.length > 0 && incident_data.ticket_conversations.map(item => {
                                                    let mail_link = `mailto: ${item.conversation_from_email}`;
                                                    return (
                                                        <li class="box_result row">
                                                            <div className="result_comment col-md-12" style={{paddingLeft:"10px"}}>
                                                            <a href={mail_link}><h4 className="ticket-commenter">{item.conversation_from}</h4></a>
                                                            <>
                                                                 {item.reference_email_id && item.original_html && item.original_html !== "" ? 
                                                            
                                                                <div>
                                                                    {item.conversation_remark? <div>{item.conversation_remark}<br/></div>: ""}
                                                                    <NavLink to={`/conversation-content/incident/${item.conversation_id}`}>Link to email excerpt</NavLink>
                                                                </div>
                                                                : <p>{item.conversation_remark}</p>}
                                                            </>
                                                            <div class="tools_comment">
                                                                <span>{item.conversation_date? moment(item.conversation_date).fromNow(): ""}</span>
                                                            </div>
                                                            </div>
                                                        </li>
                                                    )
                                                })}

                                                {conversation_state === "Files" && incident_data.ticket_files && incident_data.ticket_files.length > 0 && incident_data.ticket_files.map(item => {
                                                    return(
                                                        <li class="box_result row">
                                                            <div class="result_comment col-md-12" style={{paddingLeft:"10px"}}>
                                                                <a target="_blank" href={`${PHOTO_BASE_URL}incident_attachments/${item.file_name}`}>{item.file_name}</a>
                                                            <div class="tools_comment">
                                                                <span>{item.created_date? moment(item.created_date).add(7, 'hours').fromNow(): ""}</span>
                                                            </div>
                                                            </div>
                                                        </li>
                                                    )
                                                }) }
                                               
                                            
                                        </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='col-md-3 col-sm-12' style={{borderLeft: "1px solid #D0D5DD", borderRadius: "4px"}}>
                                                {/*<div className="bold black" style={{marginBottom: "10px"}}>Ticket Properties</div>*/}
                                                <div className='card' style={{marginBottom:"20px"}}>
                                                    <div className='card-body'>
                                                        <div>
                                                            {/*<div style={{marginBottom:"20px"}}><b className="black" style={{fontSize:"18px"}}>Service-level Agreement</b></div>*/}
                                                            <div style={{marginBottom:"16px"}}>
                                                                <div className='black' style={{fontSize:"0.85em", display:"flex"}}>
                                                                    <div className="urgency-title"><b>Urgency:</b></div>
                                                                    {enable_edit_urgency === false && isAdmin(userInfo) && <div style={{display:"flex", marginLeft:"auto", cursor:"pointer", alignItems:"center", columnGap:"5px", color: "#FAA819"}} onClick={() => setEnableEditUrgency(true)}>
                                                                        <div><MdOutlineModeEdit/></div>
                                                                        <div style={{fontSize:"14px"}}>Edit</div>
                                                                    </div>}
                                                                    {enable_edit_urgency === true && isAdmin(userInfo) && <div style={{display:"flex", marginLeft:"auto", cursor:"pointer", alignItems:"center", columnGap:"5px", color: "red"}} onClick={() => setEnableEditUrgency(false)}>
                                                                        <div style={{fontSize:"14px"}}>Cancel Edit</div>
                                                                    </div>}
                                                                </div>
                                                                {enable_edit_urgency === false && <div>{incident_data.urgency? renderPriority(incident_data.urgency): "Unassigned"}</div>}

                                                                <br/>
                                                                <div style={{display:"flex"}}>
                                                                    <div>
                                                                        <div className='black' style={{fontSize:"0.8em"}}><b>Standard SLA Response:</b></div>
                                                                        <div className='standard-time black' style={{fontSize:"0.8em", display:"flex", columnGap:"10px"}}>
                                                                            {sla_monitoring && sla_monitoring.response && sla_monitoring.response.sla_standard && sla_monitoring.response.sla_standard !== "null" && <div>{sla_monitoring.response.sla_standard} {sla_monitoring.response.sla_standard_unit}</div>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div style={{display:"flex", marginTop:"10px"}}>
                                                                    <div>
                                                                        <div className='black' style={{fontSize:"0.8em"}}><b>Standard SLA Resolve:</b></div>
                                                                        <div className='standard-time black' style={{fontSize:"0.8em", display:"flex", columnGap:"10px"}}>
                                                                            {sla_monitoring && sla_monitoring.resolve && sla_monitoring.resolve.sla_standard && sla_monitoring.resolve.sla_standard !== "null" && <div>{sla_monitoring.resolve.sla_standard} {sla_monitoring.resolve.sla_standard_unit}</div>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {enable_edit_urgency === true &&  <select className="form-select" style={{padding:"10px", marginTop:"10px"}} aria-label="Default select example" disabled={userInfo.role_name =="Requester"} onChange={(e) => onChangeData("urgency", e.target.value)}>
                                                                    <option selected={incident_data.priority == "urgent"} value="urgent">Urgent</option>
                                                                    <option selected={incident_data.priority == "high"} value="high">High</option>
                                                                    <option selected={incident_data.priority == "medium"} value="medium">Medium</option>
                                                                    <option selected={incident_data.priority == "low"} value="low">Low</option>
                                                                </select>}
                                                            </div>
                                                            <div style={{display:"flex"}}>
                                                                
                                                                <div>
                                                                    <div className='black' style={{fontSize:"0.8em"}}><b>First Response Due Estimation:</b></div>
                                                                    <div className='estimation-time black' style={{fontSize:"0.8em", display:"flex", columnGap:"10px", alignItems:"center"}}>
                                                                        <div style={{paddingTop:"1px"}}>{sla_response ? moment(sla_response).format("DD MMM YYYY HH:mm"): "--"}</div>
                                                                        <div>
                                                                            {incident_data.is_overdue_response === false && (sla_monitoring && sla_monitoring.response &&  sla_monitoring.response.sla_comparison_result == "Within SLA")&&<span className= "badge badge-success">Within SLA</span>}
                                                                            {(incident_data.is_overdue_response === true || (sla_monitoring && sla_monitoring.response &&  sla_monitoring.response.sla_comparison_result == "Overdue" && !incident_data.is_overdue_response))&&  <span className= "badge badge-danger">Overdue</span>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                            </div>
                                                            <div style={{display:"flex", marginBottom:"20px", marginTop:"10px"}}>
                                                                <div>
                                                                    <div className='black' style={{fontSize:"0.8em"}}><b>Till First Response Due Estimation:</b></div>
                                                                    <div className='estimation-time black' style={{fontSize:"0.8em", display:"flex", columnGap:"10px"}}>
                                                                    <div>
                                                                        {sla_monitoring && sla_monitoring.response && sla_monitoring.response.sla_comparison_result == "Within SLA" && till_sla_response_due != "0 day 0 hours 0 minutes" && <div className="bold" style={{color:"#1cc88a"}}>
                                                                            +{till_sla_response_due}
                                                                        </div>}

                                                                        {sla_monitoring && sla_monitoring.response && sla_monitoring.response.sla_comparison_result == "Within SLA" && till_sla_response_due == "0 day 0 hours 0 minutes" && <div style={{color:"black"}}>
                                                                            {till_sla_response_due}
                                                                        </div>}
                                                                        {sla_monitoring && sla_monitoring.response && sla_monitoring.response.sla_comparison_result == "Overdue" && !incident_data.overdue_response_duration && <div className="bold" style={{color:"#e74a3b"}}>
                                                                            -{till_sla_response_due}
                                                                        </div>}

                                                                        {sla_monitoring && sla_monitoring.response && sla_monitoring.response.sla_comparison_result == "Overdue" && incident_data.overdue_response_duration && <div className="bold" style={{color:"#e74a3b"}}>
                                                                            -{incident_data.overdue_response_duration} minutes
                                                                        </div>}
                                                                    </div>

                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{display:"flex"}}>
                                                                <div>
                                                                    <div className='black' style={{fontSize:"0.8em"}}><b>Resolve Due Estimation:</b></div>
                                                                    <div className='black' style={{fontSize:"0.8em", display:"flex", columnGap:"10px"}}>
                                                                    <div style={{paddingTop:"1px"}}>{sla_resolve ? moment(sla_resolve).format("DD MMM YYYY HH:mm"): "--"}</div>
                                                                            <div>
                                                                                {!incident_data.is_overdue_resolve && <span className= "badge badge-success">Within SLA</span>}
                                                                                {incident_data.is_overdue_resolve === true && <span className= "badge badge-danger">Overdue</span>}
                                                                            </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{display:"flex"}}>
                                                         
                                                                <div style={{marginTop:"10px"}}>
                                                                    <div className='black' style={{fontSize:"0.8em"}}><b>Till Resolve Due Estimation:</b></div>
                                                                    <div className='estimation-time black' style={{fontSize:"0.8em", display:"flex", columnGap:"10px"}}>
                                                                    <div>
                                                                        {sla_monitoring && sla_monitoring.resolve && sla_monitoring.resolve.sla_comparison_result == "Within SLA" && till_sla_resolve_due != "0 day 0 hours 0 minutes" &&  <div className="bold" style={{color:"#1cc88a"}}>
                                                                            +{till_sla_resolve_due}
                                                                        </div>}
                                                                        {sla_monitoring && sla_monitoring.resolve && sla_monitoring.resolve.sla_comparison_result == "Within SLA" && till_sla_resolve_due == "0 day 0 hours 0 minutes" &&  <div style={{color:"black"}}>
                                                                            {till_sla_resolve_due}
                                                                        </div>}
                                                                        {sla_monitoring && sla_monitoring.resolve && sla_monitoring.resolve.sla_comparison_result == "Overdue" && <div className="bold" style={{color:"#e74a3b"}}>
                                                                            -{till_sla_resolve_due}
                                                                        </div>}
                                                                    </div>

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {(userInfo.role_name == "Agent" || userInfo.role_name == "Agent Supervisor" || userInfo.email == incident_data.forward_to_email) && sla_monitoring && sla_monitoring.resolve && <div style={{display:"flex"}}>
                                                         
                                                                <div style={{marginTop:"10px"}}>
                                                                    <div className='black' style={{fontSize:"0.8em"}}><b>2nd Layer Resolution Timer:</b></div>
                                                                    <div className='estimation-time black' style={{fontSize:"0.8em", display:"flex", columnGap:"10px"}}>
                                                                    <div>
                                                                        {sla_monitoring.resolve.pending_elapsed_time_minute} Minutes
                                                                    </div>

                                                                    </div>
                                                                </div>
                                                            </div>}
                                                            
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='card'>
                                                    <div className='card-body'>
                                                        <div className='form-group full-width sd-form-group' style={{fontSize:"16px"}}>
                                                            <label className="bold black">Status</label>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <select className="form-select inputLogin" aria-label="Default select example" value={incident_data.status} onChange={(e) => onChangeData("status", e.target.value)} disabled={disableStatusChange(userInfo, incident_data)}>
                                                                    {statuses && statuses.length > 0 && statuses.map(item => {
                                                                        if(item.status_name == "Closed" && (userInfo.role_name == "Agent" || userInfo.role_name == "Agent Supervisor") && incident_data.status !== CLOSED_STATUS) {
                                                                            return null;
                                                                        }
                                                                        else return(<option selected={incident_data.status == item.id} value={item.id}>{item.status_name}</option>)
                                                                    }) }
                                                                </select>
                                                            </div>
                                                        <div className='form-group full-width sd-form-group' style={{fontSize:"16px"}}>
                                                            <label className="bold black">Impact</label>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <select className="form-select inputLogin" aria-label="Default select example" disabled={userInfo.role_name =="Requester"} onChange={(e) => onChangeData("impact", e.target.value)}>
                                                                    <option selected={incident_data.impact == "high"} value="high">High</option>
                                                                    <option selected={incident_data.impact == "medium"} value="medium">Medium</option>
                                                                    <option selected={incident_data.impact == "low"} value="low">Low</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className='form-group full-width sd-form-group' style={{fontSize:"16px"}}>
                                                            <label className="bold black">Priority</label>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <select className="form-select inputLogin" aria-label="Default select example" disabled={userInfo.role_name =="Requester"} onChange={(e) => onChangeData("priority", e.target.value)}>
                                                                    <option selected={incident_data.priority == "high"} value="high">High</option>
                                                                    <option selected={incident_data.priority == "medium"} value="medium">Medium</option>
                                                                    <option selected={incident_data.priority == "low"} value="low">Low</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        {/*Katak Select2 di SFA Mobile*/}
                                                        <div className='form-group full-width sd-form-group' style={{fontSize:"16px", }}>
                                                            <div style={{display:"flex", alignItems:"center", marginBottom:"10px", cursor:"pointer"}}>
                                                                <div className="bold black">Group Agent</div>
                                                                {/*edit_group == false && userInfo.role_name !== "Requester" && <div style={{display:"flex", color:"#FAA819", alignItems:"center", marginLeft:"auto", columnGap:"5px"}} onClick={() => setEditGroup(true)}>
                                                                    <div><MdOutlineModeEdit/></div>
                                                                    <div style={{fontSize:"14px"}}>Edit</div>
                                                                </div>*/}
                                                                {/*edit_group == true && 
                                                                <div style={{display:"flex", color:"red", alignItems:"center", marginLeft:"auto", columnGap:"5px", cursor:"pointer"}} onClick={() => setEditGroup(false)}>
                                                                    <div style={{fontSize:"14px"}}>Cancel Edit</div>
                                                                </div>
                                                            */}
                                                            </div>
                                                            {incident_data.group_id && edit_group == false && <div style={{border:"1px solid rgb(182, 199, 206)", borderRadius:"4px", padding:"10px"}}>{incident_data.group_name}</div>}
                                                            {/*edit_group == true && <button type='button' className="btn" onClick={() => $('#modal-group').modal('show')} style={{cursor:"pointer", border:"1px solid black", background:"black", color:"white", borderRadius:"8px", fontSize:"16px"}}>+ Select Group Agent</button>*/}
                                                        </div>
                                                        {edit_agent === false && <div className='form-group full-width sd-form-group' style={{fontSize:"16px"}}>
                                                            <div style={{display:"flex", alignItems:"center", marginBottom:"10px", cursor:"pointer"}}>
                                                                <div className="bold black">Agent</div>
                                                                {edit_agent == false && userInfo.role_name !== "Requester" && <div style={{display:"flex", color:"#FAA819", alignItems:"center", marginLeft:"auto", columnGap:"5px"}} onClick={() => setEditAgent(true)}>
                                                                    <div><MdOutlineModeEdit/></div>
                                                                    <div style={{fontSize:"14px"}}>Edit</div>
                                                                </div>}
                                                                {edit_agent == true && 
                                                                <div style={{display:"flex", color:"red", alignItems:"center", marginLeft:"auto", columnGap:"5px", cursor:"pointer"}} onClick={() => setEditAgent(false)}>
                                                                    <div style={{fontSize:"14px"}}>Cancel Edit</div>
                                                                </div>
                                                                }
                                                            </div>
                                                            <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                                                                <input className='inputLogin' value={incident_data.agent_name} disabled/>
                                                            </div>
                                                        </div>}
                                                        {edit_agent === true && <div className="form-group" style={{marginTop:"10px"}}>
                                                            <div style={{display:"flex", alignItems:"center", marginBottom:"10px", cursor:"pointer"}}>
                                                                <div className="bold black">Agent</div>
                                                                {edit_agent == true && 
                                                                <div style={{display:"flex", color:"red", alignItems:"center", marginLeft:"auto", columnGap:"5px", cursor:"pointer"}} onClick={() => setEditAgent(false)}>
                                                                    <div style={{fontSize:"14px"}}>Cancel Edit</div>
                                                                </div>
                                                                }
                                                            </div>
                                                            <input onClick={() => setState({ ...state, isAgentFocus: true})} id="assigned_agent_name"  placeholder="Type min 3 char" className='form-control' onKeyUp={onChangeAgent} autoComplete="off" disabled={userInfo.role_name == "Requester"} style={{fontSize:"16px"}}/>
                                                            <div style={{marginTop:"5px"}}>
                                                                <i>* Pick anyone from {`${incident_data.group_name}`}</i>
                                                            </div>
                                                            {agents && agents.length > 0 && isAgentFocus &&
                                                                <div className='mt-1 p-2' style={{ zIndex: 1, position: 'absolute', background: '#fff', border: '1px solid #ccc', borderRadius: 5, width: '97.2%', maxHeight: '375px', overflow: "auto", overflowY: "scroll" }}>
                                                                    {
                                                                        agents.map((item, i) =>
                                                                            <div onClick={() => onSelectAgent(item)} key={i} className='d-flex align-items-center w-100 p-1 mb-1' style={{ border: '1px solid #ccc', borderRadius: 5, cursor: 'pointer' }}>
                                                                            <span className='ml-2'>{item.agent_name}</span>
                                                                            </div>
                                                                        )
                                                                    }
                                                                </div>
                                                            }
                                                        </div>}
                                                    </div>
                                                </div>
                                                </div>
                                        </div>
                                    </div>
                                </>
                            }
                            {current_page === "Activities" &&
                                <>
                                                                  {/* Comment list code (HTML & CSS) is using Jullen Mellsas's code at codepen*/}
                                    <div>
                                        <h4 className="black bold">Activity Feed</h4>
                                        <ol class="activity-feed">
                                            {incident_data.ticket_logs && incident_data.ticket_logs.length > 0 && incident_data.ticket_logs.map(item => {
                                                if(item.log && item.log !== "null")
                                                return(
                                                    <li class="feed-item">
                                                        <time class="date" datetime="9-25">{moment(item.log_date).format("ll LTS")}</time>
                                                        <span class="text">{item.log? JSON.parse(item.log).log: ""}</span>
                                                    </li>
                                                )
                                            })}
                                           
                                        </ol>
                                    </div>
                                </>
                            }
                            {current_page === "Attachment" &&
                                <>
                                    <div className='row' style={{marginBottom: "20px", border: "1px solid #D0D5DD", borderRadius: "4px", width: "100%"}}>
                                        <div className='col-md-12 col-sm-12'>
                                            <div className="col-lg-12 col-md-12 col-12" id="po-table"> 
                                            {incident_data.ticket_attachment && 
                                                <table className="table table-condensed" style={{ marginTop: 16}}>
                                                    <thead>
                                                        <tr>
                                                            <th className='b2b-th'>File Name</th>
                                                            <th className='b2b-th'>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                           
                                                            <>
                                                            <td>{incident_data.ticket_attachment}</td>
                                                            <td>
                                                                    <a href={`${PHOTO_BASE_URL}incident_attachments/${incident_data.ticket_attachment}`} className='download-attachment' style={{display: "flex", alignItems: "center", columnGap: "10px", cursor:"pointer"}} download>
                                                                        <img src={chrome_tote}/>
                                                                        <div>Download</div>
                                                                    </a>
                                                            </td>
                                                            </>
                                                        </tr>
                                                        
                                                    </tbody>
                                                </table>
                                                }
                                                    {!incident_data.ticket_attachment && 
                                                            <div style={{textAlign:"center"}}> No Attachments Uploaded</div>}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

};

export default IncidentDetail;