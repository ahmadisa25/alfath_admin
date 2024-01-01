import React, {useState, useEffect} from 'react';
import Swal from 'sweetalert2';
import Overlay from '../../Components/Overlay';
import {getCategories, getAllCategories} from '../../Service/CategoryService';
import {
    useNavigate
} from "react-router-dom";
import { useSelector } from 'react-redux';

let category_timer_id = -1;
const Services = () => {
    const navigate = useNavigate();
    let { userInfo } = useSelector(state => state.auth);
    const [state, setState] = useState({
        processing:false
    });

    const [prev_element, setPrevElement] = useState(null);
    const [service_categories_list, setServiceCategoriesList] = useState([]);
    const [service_categories_children_list, setServiceCategoriesChildrenList] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [search_results, setSearchResults] = useState([]);
    const service_category_depth = process.env.REACT_APP_SERVICE_CATEGORY_DEPTH;

    const onCategoryClick = (e, category_id) => {
        setPrevElement(e.target);
        if(e.target.getAttribute('class') == "catalog-parent-link"){
            e.target.setAttribute('class', "catalog-parent-link-active");
            if(prev_element)prev_element.setAttribute('class', "catalog-parent-link");
        } 
        getCategories(category_id).then(res => {   
            if(res.status == 200){
                if(res.data) setServiceCategoriesChildrenList(res.data);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "Failed to get category data due to an unknown error. Please try to refresh the page or contact support!"
                    })
            }
        })
    }

    
    useEffect(() => {
        clearTimeout(category_timer_id);
        category_timer_id = setTimeout(() => getAllCategories({filter:`category_name:${keyword},category_depth:${service_category_depth},type:service`}).then(res => {
            if(res.status == 200){
                setSearchResults(res.data.data);
            }
        }), 300);
    }, [keyword])

    useEffect(() => {
        if(userInfo.access){
            if(userInfo.access.services){
                if(!userInfo.access.services.can_view) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "You're not allowed to access that page!"
                     })
                    navigate('/');
                }

                getCategories().then(res => {
                    if(res.status == 200){
                        const service_categories = [];

                        if(res.data && res.data.length > 0){
                            res.data.forEach(item => {
                                if(item.type == "service request") service_categories.push(item);
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
                            <div className="col-sm-6" style={{display:"flex", columnGap:"15px"}}>
                                <div>
                                    <span class="material-icons" style={{fontSize:"30px", color: "black", cursor: "pointer"}} onClick={() => navigate('/service-requests')}>arrow_back</span>
                                </div>
                                <div>
                                    <h2 className="title-breadcrum fw-500">Service Catalog</h2>
                                    <h6>List of Services Available For Requests</h6>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="card shadow mb-4">
                            <div className="card-body">
                               
                                <Overlay display={state.processing} />
                                {/*<div style={{marginBottom:"20px"}}>
                                                <i>Click on the service name to show service items. Click the service item to create a new request</i>
                                </div>*/}
                                <div style={{display:"flex", justifyContent:"space-between"}}>
                                    <div>
                                        <i>Click on the service name to show service items. Click on the service item to create a new service request.</i>
                                    </div>
                                    <div style={{display:"flex", justifyContent:"flex-end", columnGap:"10px"}}>
                                        <input placeholder="Search for a category or item" style={{borderRadius:"8px", padding:"0 10px", fontSize:"14px", width:"220px"}} onChange={(e) => setKeyword(e.target.value)}/>
                                        <button class="btn" style={{padding:"0 !important", fontSize:"14px",background:"#FAA819", color:"white"}}>
                                            Search 
                                        </button>
                                    </div>
                                </div>
                                {service_categories_list && Object.keys(service_categories_list).length > 0 && !keyword &&
                                    <div className='row' style={{marginTop:"25px"}}>

                                        <div className='col-md-2'>
                                            <div style={{background:"#FAA819", padding:"0 10px", borderTopLeftRadius:"8px", borderTopRightRadius:"8px", textAlign:"center"}}>
                                                <span className='bold' style={{marginBottom:"15px", color:"white", fontSize:"14px"}}>Service Categories</span>
                                            </div>
                                            {/*<div style={{marginBottom:"15px"}}>
                                                <i>Click on the service name to show service items</i>
                                            </div>*/}
                                            <ul className="services-list">
                                            {service_categories_list.map(item => {
                                                return(
                                                <li style={{cursor:"pointer", marginBottom:"10px",marginTop:"10px"}} onClick={(e) => onCategoryClick(e, item.id)} >
                                                        <a className="catalog-parent-link" style={{ display:"flex", columnGap:"10px", alignItems:"center"}}>
                                                            <span>&#128193;</span>&nbsp; {item.category_name}
                                                        </a>
                                                </li>
                                                )
                                            })}
                                            </ul>
                                        </div>
                                        <div className='col-md-10' style={{paddingLeft:"30px"}}>
                                            <div style={{background:"#FAA819", padding:"0 10px", borderTopLeftRadius:"8px", borderTopRightRadius:"8px", textAlign:"center"}}>
                                            <span className='bold' style={{marginBottom:"15px", color:"white", fontSize:"14px"}}>Service Items</span>
                                            </div>
                                            {/*<div style={{marginBottom:"30px"}}>
                                                <i>Click on the service item to create a new service request</i>
                                            </div>*/}
                                            {service_categories_children_list && service_categories_children_list.length > 0 && !keyword &&
                                                <div style={{display:"flex", columnGap:"20px", flexWrap:"wrap"}}>
                                                {service_categories_children_list.map(item => {
                                                    return(
                                                    <div style={{cursor:"pointer", marginBottom:"10px",marginTop:"10px"}} onClick={() => navigate(`/service-form/create/${item.id}`)}>
                                                            <div style={{ display:"flex", columnGap:"10px", alignItems:"center"}}>
                                                                <div>
                                                                    <span style={{fontSize:"48px"}}>&#x1F9E9;</span> &nbsp;
                                                                </div>
                                                                <div style={{paddingTop:"1rem"}}>
                                                                    <h6 className="black bold" style={{marginBottom:"0.2rem"}}>{item.category_name}</h6>
                                                                    <p style={{fontSize:"14px"}}>{item.category_description}</p>
                                                                </div>
                                                            </div>
                                                    </div>
                                                    )
                                                })}
                                                </div>
                                            }

                                            {(!service_categories_children_list || service_categories_children_list.length <= 0) && !keyword &&
                                                <div style={{marginTop:"15px", textAlign:"center"}}>No service item for this category</div>
                                            }
                                        </div>
                                    </div>
                                }
                                {keyword && <div>
                                    {search_results.length > 0 && search_results.map(item => 
                                         <div style={{cursor:"pointer", marginBottom:"10px",marginTop:"10px"}}  onClick={() => navigate(`/service-form/create/${item.id}`)}>
                                            <div style={{ display:"flex", columnGap:"10px", alignItems:"center"}}>
                                                <div>
                                                    <span style={{fontSize:"48px"}}>&#x1F9E9;</span> &nbsp;
                                                </div>
                                                <div style={{paddingTop:"1rem"}}>
                                                    <h6 className="black bold" style={{marginBottom:"0.2rem", fontSize:"16px"}}>{item.category_name}</h6>
                                                    <p style={{fontSize:"14px"}}>{item.category_description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {search_results.length <= 0 && <div style={{textAlign:"center", marginTop:"20px"}}>No Service item with that name was found</div>}   
                                </div>}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
    )
}

export default Services;