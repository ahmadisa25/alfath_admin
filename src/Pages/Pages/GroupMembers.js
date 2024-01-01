import React, {useState, useEffect} from 'react';
import Swal from 'sweetalert2';
import { getGroup } from '../../Service/GroupService';
import {
    useNavigate,
    useParams
} from "react-router-dom";

const GroupMembers = ({id_group = null}) => {
    const navigate = useNavigate();
    const { group_id } = useParams();
    const [group_info, setGroupInfo] = useState({});
    useEffect(() => {
        let id = group_id? group_id: id_group? id_group:"";
        if(id){
            getGroup(id).then(res => {
                if(res.status == 200){
                    setGroupInfo(res.data);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "Member data retrieval failed. Please try again or contact support!"
                     }).then(() => navigate('/group-settings'))
                }
            }).catch(err => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "Member data retrieval failed. Please try again or contact support!"
                 }).then(() => navigate('/group-settings'))
            })
        }
 
    },[])
    return(
       <>
            <div className="content-wrapper" style={{height:"120vh"}}>
                <div className="row" style={{marginBottom:"40px", paddingBottom:"10px", borderBottom:"1px solid black"}}>
                    <div className="col-md-6">
                        <div style={{display:"flex"}}>
                            {!id_group &&<div>
                                <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/group-settings')}>arrow_back</span>
                            </div>}
                            <div>
                                <h4 className='fw-500' style={{paddingLeft: 25, color:"black"}}>Group Members</h4>
                                <h6 style={{paddingLeft: 25, color:"black"}}>People involved in {group_info.group_name}</h6>
                            </div>
                        </div>
                    </div>
                </div>
               
                <table className="table table-condensed" style={{borderRadius:0, marginBottom: 0, padding: "0.4rem"}}>
                        <thead>
                            <tr>
                                <th className='b2b-th'>Agent Name</th>
                                <th className='b2b-th'>Role in Group</th>
                            </tr>
                        </thead>
                        <tbody>
                            {group_info.group_agents && group_info.group_agents.map((item, i) => 
                                    <tr style={{borderBottom:"1px solid black"}}>
                                        <td>
                                            {item.agent_name}
                                        </td>
                                        <td>
                                            {item.agent_id == group_info.agent_supervisor.id ? "Supervisor": "Member"}
                                        </td>
                                    </tr> 
                            )}
                            
                                
                        </tbody>
                    </table>
            </div>
        </>
    );
}

export default GroupMembers;