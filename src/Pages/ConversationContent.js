import React, { useEffect, useState } from 'react';
import ReactHtmlParser from 'react-html-parser';
import { NavLink, useParams } from 'react-router-dom';
import { getConversation } from '../Service/TicketConversationService';

const ConversationContent = () => {
    const { ticket_type,  cc_id } = useParams();
    const [conversation_content, setConversationContent] = useState("");
    useEffect(() => {
        getConversation(cc_id).then(res => {
            if(res.status == 200){
                setConversationContent(res.data)
            }
        })
    },[cc_id])

    return(
        <div>
            {conversation_content && <NavLink style={{color:"#FAA819", fontSize:"16px"}} to={`/${ticket_type}/${conversation_content.ticket_id}`}>
                <div style={{display:"flex", alignItems:"center", cursor: "pointer"}}>
                    <div><span class="material-icons" style={{fontSize:"18px", marginTop:"5px"}}>arrow_back</span></div>
                    <div>Back to Ticket</div>
                </div>
            </NavLink>}
            <div style={{marginTop:"15px"}}>
                { conversation_content && ReactHtmlParser(conversation_content.original_html) }
                { !conversation_content && <div>
                    No email content provided.
                </div> }
            </div>
        </div>
    )
}

export default ConversationContent;