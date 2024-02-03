import { useEffect, useRef, useState } from 'react';
import {
    NavLink,
    useNavigate
} from "react-router-dom";
import { useSelector } from 'react-redux';
import Overlay from '../../../../Components/Overlay';
import moment from 'moment';
import {IoMdCart} from 'react-icons/io';
import {RiAttachment2} from 'react-icons/ri';
import {FaPencilAlt, FaListUl, FaEdit, FaRegHandshake, FaEye, FaUpload} from 'react-icons/fa';
import 'moment/locale/id';
import { BiRefresh, BiSolidCircle } from 'react-icons/bi';
import {MdOutlineModeEdit} from 'react-icons/md';
import { InputSwitch } from 'primereact/inputswitch';
import { includes } from 'lodash';

import {
    useParams
} from "react-router-dom";
import { capitalize } from 'lodash';
import Swal from 'sweetalert2';
import { chrome_tote } from '../../../../Images';
import { isAdmin, isObjectEmpty, isValidEmail } from '../../../../Utils/Utils';
import { filter } from 'lodash';

let email_timer_id = -1;
const { $ } = window;
const CLOSED_STATUS = 4;
const RESOLVED_STATUS = 3;
const CourseDetail = () => {
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
    const [enable_edit_urgency, setEnableEditUrgency] = useState(false);

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
                
            }
        }
    }, [])

    
    return (
        <div className="content-wrapper">
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
                                        <div className='col-md-12 col-sm-12'>
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
                                                    </div>}
                                                   
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

export default CourseDetail;