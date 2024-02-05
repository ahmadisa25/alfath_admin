import React, {useState, useEffect} from 'react';
import {BiSolidSelectMultiple} from 'react-icons/bi';
import { capitalize } from 'lodash';
import Swal from 'sweetalert2';

let item_search_timer_id = -1;

const ItemTree = ({ items, sendItem, item_depth, item_name_key, item_class}) => {
    return (
      <ul className="categories-list">
        {items && items.length > 0 && items.map((item, i) => (
          <Item key={`${item_class}-${i}`} item={item} deliverItem={sendItem} item_depth={item_depth} item_name_key={item_name_key} item_class={item_class}/>
        ))}
      </ul>
    );
  };

const Item = ({ item, deliverItem, item_depth, item_name_key, item_class}) => {
    const [clicked, setClicked] = useState(false);
    const [children, setChildren] = useState([]);
    const [processing, setProcessing] = useState(false);
    const onItemClick = (e, click_status) => {
        setClicked(click_status)
        if(click_status){
            setProcessing(true);
        } else{
            setChildren([]);
        }
    }
  
    return (
      <li style={{cursor:"pointer", marginBottom:"15px"}}>
        <div onClick={(e) => onItemClick(e, !clicked)} style={{ display:"flex", columnGap:"10px", marginTop:"10px"}}>
        <div>{!clicked ? <span>&#128193;</span>: <span>&#128194;</span>}{item[item_name_key]}</div>
            <div onClick={(e) => {
                deliverItem(item)
            }} style={{display: "flex", alignItems:"center", columnGap:"5px"}}>
                <div style={{color:"#FAA819"}}><BiSolidSelectMultiple/></div>
                <div style={{color:"#FAA819", fontSize:"14px"}}>Pick this {item_class}</div>
            </div>
        </div>
        {children && children.length > 0 && !processing && <ItemTree items={children} sendItem={deliverItem}/>}
        {(!children || children.length <= 0) && !processing && clicked && <div>No {item_class}s</div>}
        {processing && <span>Fetching...</span>}
      </li>
    );
  };

const TreeDropdowns = ({sendItemToParent, item_class, item_depth, item_name_key, no_title = false, getAllItemsFunc = null, static_items = []}) => {
    const [items_list, setItemsList] = useState(static_items);
    const [item_search, setItemSearch] = useState("");
    const [item_search_results, setItemSearchResults] = useState([]);

    const setItem = (item_obj) => {
        sendItemToParent(item_obj)
    }

    
    useEffect(() => {
        if(item_search){
            clearTimeout(item_search_timer_id);
            item_search_timer_id = setTimeout(() => {});
        }
    }, [item_search])

    useEffect(() => {
        if(getAllItemsFunc){
            getAllItemsFunc().then(res => {
                if(res.status == 200){
                    const items = [];
    
                    if(res.data?.Data?.length > 0){
                        res.data.Data.forEach(item => {
                            items.push(item)
                        })
                        setItemsList(items);
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "Get items failed!"
                        });
                }
            })
        }
       
        
    },[]);


    return(
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                                <div style={{display:"flex"}}>
                                    {!no_title && <h5 className="black bold"> List of {capitalize(item_class)}s </h5>}
                                    <div style={{marginLeft:"auto"}}>
                                        <div style={{display:"flex", justifyContent:"flex-end", columnGap:"10px"}}>
                                            <input placeholder={`Look for a specific ${item_class} item`} onChange={(e) => setItemSearch(e.target.value)} style={{borderRadius:"8px", padding:"0 10px", fontSize:"13px", width:"220px"}}/>
                                            <button class="btn" style={{padding:"0 !important", fontSize:"14px",background:"#CD5700", color:"white"}}>
                                                Search 
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {(item_search_results.length <= 0 || item_search === "") && items_list?.length > 0 && <ItemTree categories={items_list} sendItem={setItem} item_depth={item_depth} item_name_key={item_name_key} item_class={item_class}/>}
                                {(item_search_results.length <= 0 || item_search === "") && items_list.length == 0 && <div>
                                    <h6 style={{textAlign:"center", marginTop:"2rem"}}>No items yet. Maybe you wanna add a new one?</h6>
                                </div> }
                                {item_search_results.length > 0 && item_search !== "" && <div>
                                    <ul>
                                        {item_search_results.map(elem => 
                                            <li style={{cursor:"pointer", marginBottom:"10px", marginTop:"10px"}}>
                                            <div style={{ display:"flex", columnGap:"10px"}}>
                                                <div>{elem[item_name_key]}</div>
                                                <div onClick={(_) => {
                                                    setItem(elem)
                                                }} style={{display: "flex", alignItems:"center", columnGap:"5px"}}>
                                                    <div style={{color:"#FAA819"}}><BiSolidSelectMultiple/></div>
                                                    <div style={{color:"#FAA819", fontSize:"14px"}}>Pick this {item_class}</div>
                                                </div>
                                            </div>
                                          </li>
                                        )}
                                    </ul>    
                                </div>}
                    </div>
                </section>
            </div>
    )
}

export default TreeDropdowns;