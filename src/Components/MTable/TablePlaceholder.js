import react from 'react';

const TablePlaceholder = ({title, text, icon, coin_style}) => {
    return (
    <>
            <div style={{display: "flex", alignItems:"center", flexDirection:"column", rowGap: "2px"}}>
                <div className={coin_style? coin_style + "-coin" : 'warning-coin'} style={{display:"flex", alignItems:"center", justifyContent:"center"}}>
                    <div><span class="material-icons" style={{fontSize:"30px"}}>{icon}</span></div>
                </div>  
                <div>
                <span className='black bold'> {title} </span>
                </div>
                <div style={{width: "20%"}}>
                <p style={{textAlign: "center"}}> {text}</p>
                </div>
            </div>
        </>
    )
}

export default TablePlaceholder;