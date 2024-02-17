import React, {useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import {BiSolidSelectMultiple} from 'react-icons/bi';
import { capitalize } from 'lodash';
import Swal from 'sweetalert2';
import ReactHtmlParser from 'react-html-parser';
import { useNavigate } from 'react-router-dom';
import { MdOutlineModeEdit } from 'react-icons/md';
import { BsFillPlusCircleFill, BsTrashFill } from 'react-icons/bs';
import { IoListCircle } from "react-icons/io5";


let item_search_timer_id = -1;
const LESSON_DEPTH = 2;

const ItemTree = ({ items, sendItem, item_depth, item_name_key, item_class, on_delete, item_child_class=null, child_items=[], item_child_name_key, onDeleteChild= null, onDeleteQuiz=null}) => {
    return (
      <ul className="categories-list">
        {items && items.length > 0 && items.map((item, i) => (
          <Item key={`${item_class}-${i}`} item={item} deliverItem={sendItem} item_depth={item_depth} item_name_key={item_name_key} item_class={item_class} on_delete={on_delete} item_child_class={item_child_class} child_items={child_items} item_child_name_key={item_child_name_key} onDeleteChild={onDeleteChild} onDeleteQuiz={onDeleteQuiz}/>
        ))}
      </ul>
    );
  };

const Item = ({ item, deliverItem, item_depth, item_name_key, item_class, on_delete, item_child_class, child_items, item_child_name_key, onDeleteChild= null, onDeleteQuiz=null}) => {
    const navigate = useNavigate();
    const course_id = item.CourseID;
    const [clicked, setClicked] = useState(false);
    const [children, setChildren] = useState([]);
    const [processing, setProcessing] = useState(false);
    const item_child_class_name = capitalize(item_child_class);
    const onItemClick = (e, click_status) => {
        setClicked(click_status)
        if(click_status){
            setProcessing(true);
        } else{
            setProcessing(false);
            setChildren([]);
        }
    }

  
  
    return (
      <li style={{cursor:"pointer", marginBottom:"15px"}}>
        <div onClick={(e) => onItemClick(e, !clicked)} style={{ display:"flex", columnGap:"10px", marginTop:"10px"}}>
        <div>{!clicked ? <span>&#128193;</span>: <span>&#128194;</span>}{item[item_name_key]}</div>
            <div onClick={(e) => navigate(`/${item_child_class.toLowerCase()}-form/null/${item.ID}/${item.CourseID}`)} style={{display: "flex"}}>
                <div style={{color:"green"}}><BsFillPlusCircleFill/>&nbsp;<span style={{fontSize:"12px"}}>Add Material</span></div>
            </div>
            <div onClick={(e) => navigate(`/quiz-form/null/${item.ID}/${item.CourseID}`)} style={{display: "flex"}}>
                <div style={{color:"green"}}><BsFillPlusCircleFill/>&nbsp;<span style={{fontSize:"12px"}}>Add Quiz</span></div>
            </div>
            <div onClick={(e) => navigate(`/chapter-form/${item.ID}/${item.CourseID}`)} style={{display: "flex"}}>
                <div style={{color:"#0099C3"}}><MdOutlineModeEdit/>&nbsp;<span style={{fontSize:"12px"}}>Edit</span></div>
            </div>
            <div onClick={(e) => on_delete(item.ID)} style={{display: "flex"}}>
                <div style={{color:"red"}}><BsTrashFill/>&nbsp;<span style={{fontSize:"12px"}}>Delete</span></div>
            </div>
            {item_depth == LESSON_DEPTH && <div onClick={(e) => {
                deliverItem(item)
            }} style={{display: "flex", alignItems:"center", columnGap:"5px"}}>
                <div style={{color:"#FAA819"}}><BiSolidSelectMultiple/></div>
                <div style={{color:"#FAA819", fontSize:"15px"}}>Pick this {item_class}</div>
            </div>}
        </div>
        {clicked && <div style={{marginTop:"1rem"}}>
                {ReactHtmlParser(item.Description)}
        </div>}
        {children && children.length > 0 && !processing && <ItemTree items={children} sendItem={deliverItem} item_depth={item_depth + 1}/>}
        {(!children || children.length <= 0) && !processing && clicked && <div>No {item_class}s</div>}
        {clicked && <div style={{marginTop:"1.2rem"}}>
            <h6 className="bold black">{capitalize(item_child_class)}s List</h6>
            </div>}
        {/*processing &&<div>
            <span>Fetching...</span>
        </div>*/}
        {clicked && item[`${item_child_class_name}s`] && item[`${item_child_class_name}s`].length > 0 && item[`${item_child_class_name}s`].map(item =>  {
        return (
            <div style={{marginBottom:"10px", display:"flex", marginLeft:"20px", columnGap:"3px"}}>
                <div><span>&#128213;</span>{item[item_child_name_key]}</div>
                <div onClick={(e) => navigate(`/material-form/${item.ID}/${item.CourseChapterID}/${course_id}`)}>
                    <div style={{color:"#0099C3"}}><MdOutlineModeEdit/><span style={{fontSize:"12px"}}>Edit</span></div>
                </div>
                &nbsp;
                <div onClick={(e) => onDeleteChild(item.ID)} style={{display: "flex"}}>
                <div style={{color:"red"}}><BsTrashFill/><span style={{fontSize:"12px"}}>Delete</span></div>
            </div>
            </div>
        )})}
        {clicked && <div style={{marginTop:"1.2rem"}}>
            <h6 className="bold black">Quizzes List</h6>
            </div>}
            {clicked && item[`Quizzes`] && item[`Quizzes`].length > 0 && item[`Quizzes`].map(item =>  {
        return (
            <div style={{marginBottom:"10px", display:"flex", marginLeft:"20px", columnGap:"3px"}}>
                <div><span>&#x1F3C6;</span>{item[item_child_name_key]}</div>
                <div onClick={(e) => navigate(`/quiz-form/${item.ID}/${item.CourseChapterID}/${course_id}`)}>
                    <div style={{color:"#0099C3"}}><IoListCircle /><span style={{fontSize:"12px"}}>Setup Questions</span></div>
                </div>
                <div onClick={(e) => navigate(`/quiz-form/${item.ID}/${item.CourseChapterID}/${course_id}`)}>
                    <div style={{color:"#0099C3"}}><MdOutlineModeEdit/><span style={{fontSize:"12px"}}>Edit</span></div>
                </div>
                &nbsp;
                <div onClick={(e) => onDeleteQuiz(item.ID)} style={{display: "flex"}}>
                <div style={{color:"red"}}><BsTrashFill/><span style={{fontSize:"12px"}}>Delete</span></div>
            </div>
            </div>
        )})}
        {child_items?.length > 0 && child_items.map(item => <div>{<span>&#128213;</span>}{item[item_name_key]}</div>)}
      </li>
    );
  };

const CourseDropdowns = forwardRef(({sendItemToParent = null, item_class, item_depth, item_name_key, no_title = false, getAllItemsFunc = null, static_items = [], on_delete=null, item_child_class=null, static_child_items_list=[], item_child_name_key=null, onDeleteChild=null, onDeleteQuiz=null}, ref) => {
    useImperativeHandle(ref, () => {
        return { setStaticItems: (items) => setItemsList(items) }
    })
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
                                {(item_search_results.length <= 0 || item_search === "") && items_list?.length > 0 && <ItemTree items={items_list} sendItem={setItem} item_depth={1} item_name_key={item_name_key} item_class={item_class} on_delete={on_delete} item_child_class={item_child_class} item_child_name_key={item_child_name_key} onDeleteChild={onDeleteChild} onDeleteQuiz={onDeleteQuiz}/>}
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
})

export default CourseDropdowns;