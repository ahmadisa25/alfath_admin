import React, {useState, forwardRef, useImperativeHandle} from 'react'

const Filter = forwardRef(({
    mTableId,
    closeFilter,
    filter,
    filters,
    onFilterFieldChange,
    columns,
    onFilterValueChange,
    onValueEnter,
    onAddFilter,
    onRemoveFilter,
    onResetFilter,
    hideFilter,
    openFilter
}, ref) => {
    const[filter_text, setFilterText] = useState("");
    useImperativeHandle(ref, () => {
        return { changeFilterText: (text) => setFilterText(text) }
    })
    return (
        <div className="col-md-4">
            <div id={`${mTableId}_filter`} className="filterContainer">
                <div className="card" style={{ height: '100%' }}>
                    <div className="card-header" style={{ height: 40, paddingTop: 7 }}>
                        <div
                            className="card-title"
                            style={{ fontSize: "0.8rem" }} >
                            <i className="fa fa-filter" /> Filter
                        </div>
                        <div className="card-tools" style={{ marginTop: -7 }}>
                            <button
                                type="button"
                                className="btn btn-outline filter-close-btn"
                                onClick={closeFilter} >
                                <i className="fa fa-times" />
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <div
                            className="d-flex"
                            style={{ justifyContent: 'space-between' }} >
                            <div style={{ flex: 1 }}>
                                <select
                                    className="form-control rounded-0"
                                    name="filter_field"
                                    value={filter.field}
                                    onChange={onFilterFieldChange} >
                                    <option value={''}>Select field</option>
                                    {columns
                                        .filter(item => item.field)
                                        .filter(
                                            e =>
                                                filters
                                                    .map(d => d.field)
                                                    .join()
                                                    .indexOf(e.field) == -1
                                        )
                                        .map((col, i) => (
                                            <option key={`key-option-${i}`} value={col.field} data-filter-text={col.filter_text}>
                                                {col.title}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div style={{ width: 10 }} />
                            <div style={{ flex: 1 }}>
                                <input
                                    name="filter_value"
                                    className="form-control"
                                    placeholder="Filter value"
                                    value={filter.value}
                                    onChange={onFilterValueChange}
                                    onKeyDown={onValueEnter}
                                />
                            </div>
                            <div style={{ width: 10 }} />
                            <div>
                                <button
                                    type="button"
                                    className="btn  btn-outline-warning"
                                    onClick={onAddFilter} >
                                    <i className="fa fa-plus" />
                                </button>
                            </div>
                        </div>
                        <div style={{marginTop: "20px"}}><span><i>{filter_text}</i></span></div>
                        <div
                            style={{ height: 1, background: '#ccc', margin: '10px 0' }}
                        />
                        <div
                            className="hideScrollbar"
                            style={{
                                height: "64%",
                                overflowY: 'scroll',
                                border: 'solid 0px #ccc',
                            }} >
                            <div className="d-flex" style={{ flexDirection: 'column' }}>
                                <div>
                                    {filters.map((item, i) => (
                                        <div
                                            key={`item_filter_${i}`}
                                            className="d-flex"
                                            style={{ flexDirection: 'column' }} >
                                            <div
                                                key={`key-item-filter-${i}`}
                                                className="d-flex"
                                                style={{
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }} >
                                                <div style={{ flex: 1 }}>{item.title}</div>
                                                <div style={{ margin: '0 10px', color: 'orangered' }}>
                                                    contains
                                                </div>
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        color: 'darkblue',
                                                        fontStyle: 'italic',
                                                    }} >
                                                    {item.value}
                                                </div>
                                                <div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline"
                                                        onClick={onRemoveFilter(item)} >
                                                        <i className="fa fa-times" style={{ color: 'red' }} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    height: 1,
                                                    background: '#ccc',
                                                    margin: '6px 0',
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="d-flex mt-3" style={{ justifyContent: 'center' }}>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={onResetFilter}
                                style={{ width: 100 , fontSize:"0.8rem"}} >
                                <i className="fa fa-times" /> Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {
                !hideFilter && (
                    <div id={`buttonFilter_${mTableId}`} style={{ width: 200}}>
                        <button
                            type="button"
                            className="btn btn-block btn-outline-dark btn-mtable-filter"
                            onClick={openFilter} 
                            style={{fontSize:"0.8rem"}}>
                            <i className="fa fa-filter" /> Filter {filters.length > 0 &&
                                <span className="badge badge-danger">{filters.length}</span>}
                        </button>
                    </div>
                )
            }

        </div>
    )
})

export default Filter