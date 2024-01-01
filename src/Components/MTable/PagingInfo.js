import { Dropdown } from 'primereact/dropdown'
import React from 'react';
import { range } from 'lodash';

const PagingInfo = ({ paginator, onPageChange, totalPage, onPerPageChange }) => {
    return (
        <div className="" style={{}}>
            <div style={{display: "flex", alignItems: "center", columnGap: "5px"}}>
                <div style={{display:"flex", flexDirection:"column"}}>
                    <div className='black' id="go-to-page" style={{textAlign:"center"}}>
                        GO TO PAGE
                    </div>
                    <div>
                        <input type="number" min="1" max={totalPage} value={paginator.page} onChange={onPageChange} style={{fontSize: "12px" }} className="form-control"/>
                        {/*range(1,totalPage+1).map((item,i) => (<option value={item}>{item}</option>))*/}
                    </div>
                    
                </div>
                <div style={{display: "flex", alignItems: "center", columnGap: "5px"}}>
                    <div style={{display:"flex", flexDirection:"column"}}>
                        <div className='black' id="go-to-page" style={{textAlign:"center"}}>
                            SHOW / PAGE
                        </div>
                        <div>
                            <select value={paginator.perpage} onChange={onPerPageChange} style={{ fontSize: "12px" }} className="form-control">
                                {[5, 10, 25, 50, 100].map((item, i) => (<option key={`option-${i}`} value={item}>Show {item}</option>))}
                            </select>
                        </div>
                    </div>
                </div>
                <div style={{display: "flex", alignItems: "center", columnGap: "5px"}}>
                    <div style={{display:"flex", flexDirection:"column"}}>
                        <div className='black' id="go-to-page" style={{textAlign:"center"}}>
                            TOTAL PAGE
                        </div>
                        <div className="black" style={{fontSize:"14px", padding:"7px"}}>
                            {totalPage} Pages
                        </div>
                    </div>
                </div>
                {/*<div style={{ lineHeight: 2.5, width: 100, textAlign: 'center' }}>
                    {`Page ${paginator.page} of ${totalPage || 0}`}
                </div>*/}
            </div>
        </div>
    )
}

export default PagingInfo