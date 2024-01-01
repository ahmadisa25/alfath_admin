import React, { useState } from 'react'

const TableData = ({ showIndex, columns, data, paginator, startRow, onSort,rowClick, rowSelector, minTableWidth, stickyEnd, tableId}) => {
    const [rowSelect, setRowSelect] = useState(0);
    const selector = rowSelector ? rowSelector : 'id';

    const onRowClick = (item) => {
        if(item[selector] == rowSelect){
            setRowSelect(0)
            rowClick(item)
        }else{
            setRowSelect(item[selector]);
            rowClick(item)
        }
    }

    return (
        <div className="row">
            <div className="col-lg-12 col-md-12 col-12 mtable-container">
                <div className="mtable-container" style={{overflowX: (parseFloat(minTableWidth)/100) > 1 ? "scroll": "hidden"}}>
                    <table className="table table-condensed" id={tableId || ""} style={{ marginTop: 16, minWidth: minTableWidth? minTableWidth: "100%" }}>
                        <thead>
                            <tr>
                                {showIndex && (<th className='b2b-th' style={{ width: 60 }}>No</th>)}
                                {columns.map((item, i) => {
                                    if(item.sortable) 
                                        if(i!==columns.length-1)
                                        return(
                                            <th className='b2b-th' key={'key-' + i} style={item.style || {}}>
                                                <div
                                                    className="d-flex"
                                                    style={{
                                                        //justifyContent: 'space-between',
                                                        justifyContent: '',
                                                        alignItems: 'center',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={onSort(item.field)} >
                                                    <span className="d-block mr-2 flex-1">{item.title}</span>
                                                    {paginator.order == item.field &&
                                                        <i
                                                            className={
                                                                paginator.direction == 'asc'
                                                                    ? 'fa fa-arrow-down'
                                                                    : 'fa fa-arrow-up'
                                                            }
                                                        />}
                                                </div>
                                            </th>
                                        )
                                        else 
                                        return(
                                            <th className={ ((stickyEnd && item.setAsSticky == true)? 'b2b-sticky-column-head': 'b2b-th')} key={'key-' + i} style={item.style || {}}>
                                                <div
                                                    className="d-flex"
                                                    style={{
                                                        //justifyContent: 'space-between',
                                                        justifyContent: '',
                                                        alignItems: 'center',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={onSort(item.field)} >
                                                    <span className="d-block mr-2 flex-1">{item.title}</span>
                                                    {paginator.order == item.field &&
                                                        <i
                                                            className={
                                                                paginator.direction == 'asc'
                                                                    ? 'fa fa-arrow-down'
                                                                    : 'fa fa-arrow-up'
                                                            }
                                                        />}
                                                </div>
                                            </th> 
                                        )
                                    else return(<th className={ (stickyEnd && item.setAsSticky == true? 'b2b-sticky-column-head': 'b2b-th')} key={'key-' + i} style={{...item.style} || {}}>{item.title}</th>);
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {(data || []).map((item, i) => {
                                const newStyle = rowClick ? { cursor: "pointer" } : {};
                                const selectStyle = rowSelect == item[selector] ? { backgroundColor: '#ffe99b' } : {};
                                if (rowClick) {
                                    return (
                                        <tr key={'key-' + i} style={{ ...selectStyle, ...newStyle }}>
                                            {showIndex === true && (<td>{i + startRow}</td>)}
                                            {columns.map((col, j) => {
                                                if (col.clickable) {
                                                    return (
                                                        <td className='b2b-td' key={'key_col' + j} style={col.style ? col.style : {}} onClick={() => onRowClick(item)}>
                                                            {col.render ? col.render(item) : item[col.field]}
                                                        </td>
                                                    );
                                                }else{
                                                    return (
                                                        <td className='b2b-td' key={'key_col' + j} style={col.style ? { ...col.style } : {}}>
                                                        {col.render ? col.render(item) : item[col.field]}
                                                        </td>
                                                    );
                                                }
                                            })}
                                        </tr>
                                    )
                                }else{
                                    return (
                                        <tr key={'key-' + i} style={{ ...selectStyle }}>
                                        {showIndex && (<td>{i + startRow}</td>)}
                                        {columns.map((col, j) => {
                                            if(j !== columns.length-1)
                                            return (
                                            <td className='b2b-td' key={'key_col' + j} style={col.style ? { ...col.style } : {}} >
                                                {col.render ? col.render(item) : item[col.field]}
                                            </td>
                                            );
                                            else 
                                            return (
                                                <td className={'b2b-td ' + (stickyEnd && col.setAsSticky == true? 'b2b-sticky-column': '')} key={'key_col' + j} style={col.style ? { ...col.style } : {}} >
                                                    {col.render ? col.render(item) : item[col.field]}
                                                </td>
                                            )
                                        })}
                                        </tr>
                                    )
                                }
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default TableData