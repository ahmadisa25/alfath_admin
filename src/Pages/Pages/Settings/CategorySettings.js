import React, {useState, useEffect} from 'react';
import Swal from 'sweetalert2';
import Overlay from '../../../Components/Overlay';
import {getCategories, deleteCategory, getAllCategories} from '../../../Service/CategoryService';
import {
    useNavigate
} from "react-router-dom";
import {MdOutlineModeEdit} from 'react-icons/md';
import { useSelector } from 'react-redux';
import AddButton from '../../../Components/MTable/AddButton';
import {BsFillPlusCircleFill, BsTrashFill} from 'react-icons/bs';
import { current } from '@reduxjs/toolkit';

const CategoryTree = ({ categories, category_depth }) => {
    return (
      <ul className='categories-list'>
        {categories && categories.length > 0 && categories.map((category) => (
          <Category key={category.id} category={category} category_depth={category_depth} />
        ))}
      </ul>
    );
  };

const Category = ({ category, category_depth}) => {
    //const hasChildren = category.categories && Object.keys(category.categories).length > 0;
    const navigate = useNavigate();
    const [clicked, setClicked] = useState(false);
    const [children, setChildren] = useState([]);
    const [processing, setProcessing] = useState(false);
    const incident_category_depth = process.env.REACT_APP_INCIDENT_CATEGORY_DEPTH;
    const service_category_depth = process.env.REACT_APP_SERVICE_CATEGORY_DEPTH;

    const onCategoryClick = (e, click_status, category_id) => {
        setClicked(click_status)
        if(click_status){
            setProcessing(true);
            getCategories(category_id, {mode:"master"}).then(res => {
                if(res.status == 200){
                    if(res.data && res.data.length > 0) setChildren(res.data);
                    setProcessing(false);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "Failed to get category data due to an unknown error. Please try to refresh the page or contact support!"
                     }).then(setProcessing(false));
                }
            })
        } else{
            setChildren([]);
        }
    }

    const onRemove = (category_id) => {
        const swalWithBootstrapButtons = Swal.mixin({
        })
          
          swalWithBootstrapButtons.fire({
            icon: 'info',
            title: 'Delete Category',
            text: "Are you sure you want to delete this Category?",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              deleteCategory(category_id).then(res => {
                if(res.status == 200){
                    swalWithBootstrapButtons.fire(
                        'Deleted!',
                        'Category has been deleted.',
                        'success'
                    ).then(_ => navigate(0));
                } else {
                    swalWithBootstrapButtons.fire(
                        'Error',
                        'Category deletion Failed.',
                        'error'
                    ) 
                }
              })
              
            } else if (
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire(
                'Cancelled',
                'Category deletion cancelled',
                'error'
              )
            }
          })
    };

    const checkDepth = (category_type, category_depth) => {
        if(category_type == "incident"){
            if(category_depth < incident_category_depth) return true;
        } else if(category_type == "service request"){
            if(category_depth < service_category_depth) return true;
        }
        return false;
    }
  
    return (
      <li style={{cursor:"pointer", marginBottom:"10px", marginTop:"10px"}}>
        <div onClick={(e) => onCategoryClick(e, !clicked, category.id)} style={{ display:"flex", columnGap:"10px"}}>
            <div>{!clicked && checkDepth(category.type, category_depth) ? <span>&#128193;</span>: <span>&#128194;</span>}{category.category_name}</div>
            {checkDepth(category.type, category_depth) && <div onClick={(e) => navigate(`/category-form/null/${category.id}/${category_depth+1}`)} style={{display: "flex"}}>
                <div style={{color:"green"}}><BsFillPlusCircleFill/></div>
            </div>}
            <div onClick={(e) => navigate(`/category-form/${category.id}/${category.parent_category_id}/${category_depth+1}`)} style={{display: "flex"}}>
                <div style={{color:"#0099C3"}}><MdOutlineModeEdit/></div>
            </div>
            <div onClick={(e) => onRemove(category.id)} style={{display: "flex"}}>
                <div style={{color:"red"}}><BsTrashFill/></div>
            </div>
        </div>
        {checkDepth(category.type, category_depth) && children && children.length > 0 && !processing && <CategoryTree categories={children} category_depth={category_depth + 1} />}
        {checkDepth(category.type, category_depth) && (!children || children.length <= 0) && !processing && clicked && <div>No service item for this category</div>}
        {checkDepth(category.type, category_depth) && processing && <span>Fetching...</span>}
      </li>
    );
  };

    let incident_search_timer_id = -1;
let service_search_timer_id = -1;
const CategorySettings = () => {
    const navigate = useNavigate();
    let { userInfo } = useSelector(state => state.auth);
    const [state, setState] = useState({
        processing:false
    });

    const incident_category_depth = process.env.REACT_APP_INCIDENT_CATEGORY_DEPTH;
    const service_category_depth = process.env.REACT_APP_SERVICE_CATEGORY_DEPTH;

    const [categories_list, setCategoriesList] = useState([]);

    const [service_category_search, setServiceCategorySearch] = useState("");
    const [incident_category_search, setIncidentCategorySearch] = useState("");
    const [service_category_search_results, setServiceCategorySearchResults] = useState([]);
    const [incident_category_search_results, setIncidentCategorySearchResults] = useState([]);

    const [incident_categories_list, setIncidentCategoriesList] = useState([]);
    const [service_categories_list, setServiceCategoriesList] = useState([]);

    const onRemove = (category_id) => {
        const swalWithBootstrapButtons = Swal.mixin({
        })
          
          swalWithBootstrapButtons.fire({
            icon: 'info',
            title: 'Delete Category',
            text: "Are you sure you want to delete this Category?",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              deleteCategory(category_id).then(res => {
                if(res.status == 200){
                    swalWithBootstrapButtons.fire(
                        'Deleted!',
                        'Category has been deleted.',
                        'success'
                    ).then(_ => navigate(0));
                } else {
                    swalWithBootstrapButtons.fire(
                        'Error',
                        'Category deletion Failed.',
                        'error'
                    ) 
                }
              })
              
            } else if (
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire(
                'Cancelled',
                'Category deletion cancelled',
                'error'
              )
            }
          })
    };

    //const [category_refs, setCategoryRefs] = useState({});

    useEffect(() => {
        if(incident_category_search){
            clearTimeout(incident_search_timer_id);
            incident_search_timer_id = setTimeout(() => getAllCategories({filter:`category_name:${incident_category_search},category_depth:${incident_category_depth},type:incident`}).then(res => {
                if(res.status == 200){
                    setIncidentCategorySearchResults(res.data.data);
                }
            }), 300);
        }
    }, [incident_category_search])

    useEffect(() => {
        if(service_category_search){
            clearTimeout(service_search_timer_id);
            service_search_timer_id = setTimeout(() => getAllCategories({filter:`category_name:${service_category_search},category_depth:${service_category_depth},type:service`}).then(res => {
                if(res.status == 200){
                    setServiceCategorySearchResults(res.data.data);
                }
            }), 300);
        }
    }, [service_category_search])

    useEffect(() => {
        if(userInfo.access){
            if(userInfo.access.settings){
                if(!userInfo.access.settings.can_view) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "You're not allowed to access that page!"
                     })
                    navigate('/');
                }

                getCategories(null, {mode:"master"}).then(res => {
                    if(res.status == 200){
                        const incident_categories = [];
                        const service_categories = [];

                        if(res.data && res.data.length > 0){
                            res.data.forEach(item => {
                                if(item.type == "incident") incident_categories.push(item);
                                else if(item.type == "service request") service_categories.push(item);

                                setIncidentCategoriesList(incident_categories);
                                setServiceCategoriesList(service_categories);
                            })
                        }
                        //setCategoriesList(res.data);
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Get category data failed!"
                         });
                    }
                })
            }
        }
        
    },[]);

    return(
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                            <h2 className="title-breadcrum fw-500">Categories</h2>
                                <h6>List of Categories</h6>
                            </div>
                            <div className="col-sm-6 right">
                                {userInfo.access.settings.can_create && <div style={{float:"right"}}> <AddButton onAddDataClick={() => navigate('/category-form')} addButtonText="Category"/></div>}
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="card shadow mb-4">
                            <div className="card-body">
                               
                                <Overlay display={state.processing} />
                                <div style={{display:"flex"}}>
                                    <h5 className="black bold"> Incident Categories </h5>
                                    <div style={{marginLeft:"auto"}}>
                                        <div style={{display:"flex", justifyContent:"flex-end", columnGap:"10px"}}>
                                            <input placeholder="Search for a incident item" onChange={(e) => setIncidentCategorySearch(e.target.value)} style={{borderRadius:"8px", padding:"0 10px", fontSize:"14px", width:"220px"}}/>
                                            <button class="btn" style={{padding:"0 !important", fontSize:"14px",background:"#FAA819", color:"white"}}>
                                                Search 
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {(incident_category_search_results.length <= 0 || incident_category_search === "") && incident_categories_list && Object.keys(incident_categories_list).length > 0 && <CategoryTree categories={incident_categories_list} category_depth={1}/>}
                                {incident_category_search_results.length > 0 && incident_category_search !== "" &&  <div>
                                    <ul>
                                        {incident_category_search_results.map(category => 
                                            <li style={{cursor:"pointer", marginBottom:"10px", marginTop:"10px"}}>
                                            <div style={{ display:"flex", columnGap:"10px"}}>
                                                <div>{category.category_name}</div>
                                                <div onClick={(e) => navigate(`/category-form/${category.id}/${category.parent_category_id}/${category.category_depth+1}`)} style={{display: "flex"}}>
                                                    <div style={{color:"#0099C3"}}><MdOutlineModeEdit/></div>
                                                </div>
                                                <div onClick={(e) => onRemove(category.id)} style={{display: "flex"}}>
                                                    <div style={{color:"red"}}><BsTrashFill/></div>
                                                </div>
                                            </div>
                                          </li>
                                        )}
                                    </ul>    
                                </div>}

                                <div style={{display:"flex"}}>
                                    <h5 className="black bold"> Service Request Categories </h5>
                                    <div style={{marginLeft:"auto"}}>
                                        <div style={{display:"flex", justifyContent:"flex-end", columnGap:"10px"}}>
                                            <input placeholder="Search for a service item" onChange={(e) => setServiceCategorySearch(e.target.value)} style={{borderRadius:"8px", padding:"0 10px", fontSize:"14px", width:"220px"}}/>
                                            <button class="btn" style={{padding:"0 !important", fontSize:"14px",background:"#FAA819", color:"white"}}>
                                                Search 
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {(service_category_search_results.length <= 0 || service_category_search === "") && service_categories_list && Object.keys(service_categories_list).length > 0 && <CategoryTree categories={service_categories_list} category_depth={1}/>}
                                {service_category_search_results.length > 0 && service_category_search !== "" && <div>
                                    <ul>
                                        {service_category_search_results.map(category => 
                                            <li style={{cursor:"pointer", marginBottom:"10px", marginTop:"10px"}}>
                                            <div style={{ display:"flex", columnGap:"10px"}}>
                                                <div>{category.category_name}</div>
                                                <div onClick={(e) => navigate(`/category-form/${category.id}/${category.parent_category_id}/${category.category_depth+1}`)} style={{display: "flex"}}>
                                                    <div style={{color:"#0099C3"}}><MdOutlineModeEdit/></div>
                                                </div>
                                                <div onClick={(e) => onRemove(category.id)} style={{display: "flex"}}>
                                                    <div style={{color:"red"}}><BsTrashFill/></div>
                                                </div>
                                            </div>
                                          </li>
                                        )}
                                    </ul>    
                                </div>}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
    )
}

export default CategorySettings;