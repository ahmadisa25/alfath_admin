import React from 'react';
import { NumberFormat } from './NumberFormat';
import { ParseDecimal } from './CurrencyInput/ParseDecimal';

const DashboardCard = ({card_title, stats, icon, explanation_text, icon_width}) => {
    return (
        <div className="card-body dashboard-card">
            <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                    <div>
                        <h5 style={{display: "block", color:"#434343"}}>{card_title}</h5>
                    </div>
                    <div className="black bold" style={{marginTop:"0", fontSize:"40px"}}>{NumberFormat(ParseDecimal(stats))}</div>
                    <div style={{marginTop:"10px"}}><i>{explanation_text}</i></div>
                    {/*<div className='d-flex dashboard-card-analytics' style={{marginTop:"20px"}}>
                        {chart_direction === "down" && 
                            <>
                                <IconContext.Provider value={{color: "red", size:"20px"}}>
                                    <FaArrowDown/>
                                </IconContext.Provider>
                                <h6 className='danger-text bold' style={{marginLeft: "5px"}}>23%</h6>
                                <h6 style={{marginLeft: "10px"}}>{stats_time}</h6>
                            </>
                        }
                        {chart_direction === "up" &&
                            <>
                                <IconContext.Provider value={{color: "green", size:"20px"}}>
                                    <FaArrowUp/>
                                </IconContext.Provider>
                                <h6 className='success-text bold' style={{marginLeft: "5px"}}>23%</h6>
                                <h6 style={{marginLeft: "10px"}}>{stats_time}</h6>
                            </>
                        }
                    </div>*/}
                </div>
                <div className="col-auto">
                    <div><img style={!icon_width? {width:"150px"}: {width:icon_width}} src={icon}/></div>
                </div>
            </div>
        </div>
    )
}

export default DashboardCard;