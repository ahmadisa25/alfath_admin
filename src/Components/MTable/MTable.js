import React, { Component, useEffect, useState, forwardRef, useRef, useImperativeHandle } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import Overlay from '../Overlay/Overlay'
import NavPagination from './NavPagination';
import PagingInfo from './PagingInfo';
import Search from './Search';
import Filter from './Filter';
import TableData from './TableData';
import AddButton from './AddButton';
import PropertiesButton from './PropertiesButton';
import SelectButton from './SelectButton';
import {TiWarningOutline} from 'react-icons/ti';
import TablePlaceholder from './TablePlaceholder';

const $ = window.$;
let timeoutId = 0;

//This source code is made by the 2022-2024 Modena Satrio Software Development Team

const MTable = forwardRef(({ columns, onAddData, showIndex, showPaginationCounter = true, showPropertiesButton = false, onPropertiesSelect, showAddButton, order, direction, getData, hideFilter, id, perpage, rowClick, rowSelector, searchBarWidth, addButtonText, minTableWidth, stickyEnd, showMoreActions, showCheckbox=false, tableId=null}, ref) => {
  const [state, setCurrentState] = useState({
    data: [],
    total: 0,
    filters: [],
    filter: { field: '', value: '', title: '' },
    search: '',
    processing: false,
    mTableId: id || `mTableId_${parseInt(Math.random() * 10000000)}`
  });
  const [paginator, setPaginator] = useState({
    page: 1,
    perpage: perpage || 10,
    search: '',
    filter: '',
    order: order ? order +":" + direction: (columns && columns.length > 0 ? columns[0].field + ":" + direction : ''),
    //direction: direction ? direction : 'asc',
    refresh: false
  });

  const setState = value => {
    setCurrentState({ ...state, ...value });
  }


  useEffect(
    () => {
      let loadTimeout = setTimeout(() => {
        setState({ processing: true });
      }, 150);
      const _paginatpr = { ...paginator };
      if (!_paginatpr.filter) {
        delete _paginatpr.filter;
      }
      delete _paginatpr.refresh;
      getData && getData(_paginatpr).then(res => {
        clearTimeout(loadTimeout);
        const { data: { Data, Total } } = res;
        setState({ data: Data, total: Total, processing: false });
      }).catch(err => {
        clearTimeout(loadTimeout);
        setState({ processing: false, data: [], total: 0 });
      });

      attachDocumentCLick(mTableId);
    },
    [paginator]
  );

  useImperativeHandle(ref, () => ({
    refresh: () => {
      setPaginator({ ...paginator, refresh: !paginator.refresh });
    },
    reset: () => {
      setState({ ...state, filter: { field: '', value: '', title: '' }, filters: [], search: '' });
      setPaginator({ ...paginator, refresh: !paginator.refresh, search: '', filter: '' });
    }
  }));

  const onPageChange = e => {
    setPaginator({ ...paginator, perpage: paginator.perpage, page: e.target.value });
  };

  const onPerPageChange = e => {
    setPaginator({ ...paginator, perpage: e.target.value, page: 1 });
  };

  const onFirst = () => {
    setPaginator({ ...paginator, page: 1 });
  };

  const onLast = () => {
    setPaginator({ ...paginator, page: lastPage });
  };

  const onNext = () => {
    setPaginator({ ...paginator, page: paginator.page + 1 });
  };

  const onPrev = () => {
    setPaginator({ ...paginator, page: paginator.page - 1 });
  };

  const setPage = (page_number) => {
    setPaginator({ ...paginator, page: page_number });
  };

  const onSort = field => () => {
    const direction = paginator.direction == 'asc' ? 'desc' : 'asc';
    setPaginator({ ...paginator, order: `${field}:${direction}` });
  };

  const onSearchChange = e => {
    const value = e.target.value;
    setState({ search: value });
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      setPaginator({ ...paginator, search: value, page: 1 });
    }, 500);
  };

  const onClear = () => {
    setState({ search: '' });
    setPaginator({ ...paginator, search: '' });
  };

  const openFilter = () => {
    $(`#${mTableId}_filter`).animate(
      {
        height: 400,
        opacity: 1,
      },
      150
    );
  };

  const closeFilter = () => {
    $(`#${mTableId}_filter`).animate(
      {
        height: 0,
        opacity: 0,
      },
      150
    );
  };

  const onApplyFilter = () => {
    const _filter = filters.map(e => `${e.field}:${e.value}`).join();
    setPaginator({ ...paginator, filter: _filter });
  };

  const onAddFilter = () => {
    if (filter.field && filter.value) {
      filter.value = filter.value.trim();
      const _filters = [...filters, filter];
      setState({ filters: _filters, filter: { field: '', value: '', title: '' } });
      //do filtered request
      const _filter = _filters.map(e => `${e.field}:${e.value}`).join();
      setPaginator({ ...paginator, page: 1, filter: _filter });
    }
  };

  const onValueEnter = e => {
    if (e.key == "Enter") {
      onAddFilter();
    }
  }

  const onRemoveFilter = item => () => {
    const _filters = filters.filter(e => e.field != item.field);
    setState({ filters: _filters });
    //do filtered request
    const _filter = _filters.map(e => `${e.field}:${e.value}`).join();
    setPaginator({ ...paginator, filter: _filter });
  };

  const onFilterFieldChange = e => {
    if(e.target[e.target.selectedIndex].getAttribute('data-filter-text')){
      filterRef.current.changeFilterText(e.target[e.target.selectedIndex].getAttribute('data-filter-text'));
    } else {
      filterRef.current.changeFilterText("");
    }
    const select = e.target;
    const title = select.options[select.selectedIndex].text;
    const _filter = { ...filter, field: select.value, title };
    setState({ filter: _filter });
  };

  const onFilterValueChange = e => {
    const _filter = { ...filter, value: e.target.value };
    setState({ filter: _filter });
  };

  const onResetFilter = () => {
    setState({ filters: [] });
    setPaginator({ ...paginator, filter: '' });
    closeFilter();
  };

  const onAddDataClick = () => {
    if (onAddData) {
      onAddData();
    }
  }
  const onPropertiesClick = () => {
    if (onPropertiesSelect) {
      onPropertiesSelect();
    }
  }

  const attachDocumentCLick = (id) => {
    const onCLick = e => {
      const filterButton = document.getElementById('buttonFilter_' + id);
      const filterContainer = document.getElementById(`${id}_filter`);
      if ((filterButton && filterButton.contains(e.target)) || (filterContainer && filterContainer.contains(e.target))) { } else {
        if ($(`#${id}_filter`).css('opacity') == '1') {
          $(`#${id}_filter`).animate({ height: 0, opacity: 0, }, 100);
        }
      }
    }
    const root = document.getElementById('root');
    root.removeEventListener('click', onCLick);
    root.addEventListener('click', onCLick);
  }

  const filterRef = useRef(null);
  const { data, total, filters, filter, search, processing, mTableId } = state;
  const totalPage = Math.ceil(total / paginator.perpage);
  const lastPage = totalPage >= 15 ? 15 : totalPage;
  const startRow = (paginator.page - 1) * paginator.perpage + 1;
  const _endRow = paginator.page * paginator.perpage;
  const endRow = _endRow >= total ? total : _endRow;

  const tableProps = { showIndex, columns, data, paginator, startRow, onSort, rowClick, rowSelector, searchBarWidth, minTableWidth, stickyEnd, showMoreActions, showCheckbox, tableId};
  const filterProps = {
    mTableId, filter, filters, hideFilter, columns,
    openFilter, closeFilter, onAddFilter, onFilterFieldChange,
    onFilterValueChange, onRemoveFilter, onResetFilter, onValueEnter
  };
  const navPaginationProps = { paginator, lastPage, totalPage, onPrev, onNext, onFirst, onLast, setPage, total:state.total };

  return (
    <div className="" id={mTableId}>
      {getData && <Overlay display={processing} />}
      <div className="row">
        <Search search={search} onClear={onClear} onSearchChange={onSearchChange} searchBarWidth={searchBarWidth}/>
        <Filter {...filterProps} ref={filterRef} />
        <div className="col-md-2" />
        <div className="col-md-3">
          <div style={{display: "flex", justifyContent: "flex-end", columnGap: "10px"}}>
              {showMoreActions && (
                <SelectButton button_text="More Actions"/>
              )}
              {showAddButton && (
                <AddButton onAddDataClick={onAddDataClick} addButtonText={addButtonText}/>
              )}
               {showPropertiesButton && (
                <PropertiesButton onDataClick={onPropertiesClick}/>
              )}
          </div>
        </div>
      </div>
      {/**Table data component, display data  */}
        <TableData {...tableProps} />
      {totalPage > 0 && <div className="mb-3 mt-3" style={{ height: 1, background: '#ccc' }} />}
      {showPaginationCounter && <div className="row" style={{marginBottom: "15px"}}>
        {/*<div className="col-lg-2 col-md-3 col-sm-12" >
          <div className='mt-2' style={{ minWidth: 180 }}>{`Showing ${startRow} - ${endRow} of ${total || 0}`}</div>
        </div>*/}
        {totalPage > 0 && 
          <>
              <div className="col-lg-6 col-md-6 col-sm-12">
                  <PagingInfo paginator={paginator} onPageChange={onPageChange} onPerPageChange={onPerPageChange} totalPage={totalPage} />
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12">
                  <div className="row justify-content-end" >
                    {/**Paging info, display paging info and do the onchange page */}
                  
                    {/**Paging navigation compoennt, render paging navigation button */}
                    <NavPagination {...navPaginationProps} />
                  </div>
            </div>
          </>
          }
      </div> }
      {totalPage <= 0 && state.search !== "" && 
              <TablePlaceholder text={"Your search did not match any data. Please try again or create new ones "} title="No data found!" icon="search"/>
          }
      {totalPage <= 0 && state.search == "" && 
              <TablePlaceholder text={"You don't have data yet. You can add a new one"} title="No data found"
              icon="do_not_disturb_on_total_silence" coin_style="neutral"/>
      }
    </div>
  );
});

export default MTable;