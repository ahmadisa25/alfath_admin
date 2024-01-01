import react from 'react';

const StatusBadge = ({bg_color, text}) => {
    return (
        <span className={"badge d-flex justify-content-center " + bg_color} style={{fontSize:"0.85em", fontWeight:"700"}}> 
                <span>{text}</span>
            </span>
    )
}

export default StatusBadge;