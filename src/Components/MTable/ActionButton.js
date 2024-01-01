import React from 'react';

const ActionButton = ({icon, link_color, click_action, text=""}) => {
    return (
        <a                      
                                onClick={click_action}
                                className={!text?'rounded-circle':''}
                                style={!text? {
                                    width:'24px',
                                    height: '24px',
                                    background:"#f5f5f5",
                                    cursor: 'pointer',
                                    color: link_color,
                                    marginRight:2,
                                    marginLeft:2,
                                    display: 'inline-block',
                                   
                                }: {
                                    background:"#f5f5f5",
                                    cursor: 'pointer',
                                    color: link_color,
                                    display: 'inline-block',
                                    marginRight:2,
                                    marginLeft:2,
                                    borderRadius:"8px",
                                    padding:"0px 8px"
                                }}
                            >
                            {!text &&
                                <div style={{display:"flex", alignItems:"center", justifyContent:"center", paddingTop:"4px"}}>                                
                                    {icon}
                                </div>
                            }
                            {text &&
                                <div style={{display:"flex", alignItems:"center", columnGap:"5px", padding:"1px 0", verticalAlign:"middle"}}>                                
                                    <div style={{paddingBottom:"2px"}}>{icon}</div>
                                    <div>{text}</div>
                                </div>
                            }
                            </a>
    )
}

export default ActionButton;