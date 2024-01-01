import React from 'react'

const NavPagination = ({ onFirst, onPrev, onNext, totalPage, onLast, paginator, lastPage, setPage, total}) => {
    return (
        <div style={{display: "flex", alignItems: "center"}}>
                <div>Total Item: {total}</div>
                {/*<button type='button' className='btn btn-sm' onClick={onFirst} style={{ minWidth: 60 }}>
                    <i className='material-icons' style={{ fontSize: 30 }} >first_page</i>
                </button>*/}
                <button type='button' className='btn btn-sm btn-paging-nav' onClick={onPrev} disabled={paginator.page == 1}>
                    <i className='material-icons' style={{ fontSize: 30 }} >navigate_before</i>
                </button>
                <button type='button' className='btn btn-sm btn-paging-num' disabled={paginator.page == 1} onClick={() => setPage(1)}>
                   1
                </button>
                {totalPage > 1 &&
                    <>
                    <button type='button' className='btn btn-sm btn-paging-num' onClick={() => setPage(2)} disabled={paginator.page == 2}>
                    2
                    </button>
                    </>
                }
                {totalPage > 2 &&
                    <>
                    <button type='button' className='btn btn-sm btn-paging-num' onClick={() => setPage(3)} disabled={paginator.page == 3}>
                    3
                    </button>
                    </>
                }
                {totalPage > 3 &&
                    <>
                        <button type='button' className='btn btn-sm btn-paging-num' onClick={() => ""}>
                            {"..."}
                        </button>
                        <button type='button' className='btn btn-sm btn-paging-num' onClick={() => setPage(totalPage-1)} disabled={paginator.page == 2}>
                            {totalPage-1}
                        </button>
                        <button type='button' className='btn btn-sm btn-paging-num' onClick={() => setPage(totalPage)} disabled={paginator.page == totalPage}>
                        {totalPage}
                        </button>
                   </>
                }
                <button type='button' className='btn btn-sm btn-paging-nav' onClick={onNext} disabled={paginator.page == lastPage}>
                    <i className='material-icons' style={{ fontSize: 30 }} >navigate_next</i>
                </button>
                {/*<button type='button' className='btn btn-sm' onClick={onLast} style={{ minWidth: 60 }}>
                    <i className='material-icons' style={{ fontSize: 30 }} >last_page</i>
                </button>*/}
        </div>
    )
}

export default NavPagination