import React, {useState, useEffect} from 'react';
import Swal from 'sweetalert2';
import {getCategories, getAllCategories} from '../../Service/CategoryService';
import {
    useNavigate
} from "react-router-dom";
import {BiSolidSelectMultiple} from 'react-icons/bi';

const incident_category_depth = process.env.REACT_APP_INCIDENT_CATEGORY_DEPTH;

const CategoryTree = ({ categories, sendCategory }) => {
    return (
      <ul className="categories-list">
        {categories && categories.length > 0 && categories.map((category) => (
          <Category key={category.id} category={category} deliverCategory={sendCategory}/>
        ))}
      </ul>
    );
  };

const Category = ({ category, deliverCategory}) => {
    //const hasChildren = category.categories && Object.keys(category.categories).length > 0;
    const navigate = useNavigate();
    const [clicked, setClicked] = useState(false);
    const [children, setChildren] = useState([]);
    const [processing, setProcessing] = useState(false);
    const onCategoryClick = (e, click_status, category_id, category_depth) => {
        setClicked(click_status)
        if(click_status){
            setProcessing(true);
            getCategories(category_id,{mode:"master"}).then(res => {
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
  
    return (
      <li style={{cursor:"pointer", marginBottom:"15px"}}>
        <div onClick={(e) => onCategoryClick(e, !clicked, category.id, category.category_depth)} style={{ display:"flex", columnGap:"10px", marginTop:"10px"}}>
        <div>{!clicked ? <span>&#128193;</span>: <span>&#128194;</span>}{category.category_name}</div>
            {(category.category_depth == incident_category_depth) && <div onClick={(e) => {
                deliverCategory({
                    id:category.id,
                    name:category.category_name
                })
            }} style={{display: "flex", alignItems:"center", columnGap:"5px"}}>
                <div style={{color:"#FAA819"}}><BiSolidSelectMultiple/></div>
                <div style={{color:"#FAA819", fontSize:"14px"}}>Pick this category</div>
            </div>}
        </div>
        {children && children.length > 0 && !processing && <CategoryTree categories={children} sendCategory={deliverCategory}/>}
        {(!children || children.length <= 0) && !processing && clicked && <div>No service item for this category</div>}
        {processing && <span>Fetching...</span>}
      </li>
    );
  };
  let incident_search_timer_id = -1;
const CategoryContents = ({sendCategoryToParent}) => {

    const [incident_categories_list, setIncidentCategoriesList] = useState([]);
    const [incident_category_search, setIncidentCategorySearch] = useState("");
    const [incident_category_search_results, setIncidentCategorySearchResults] = useState([]);

    const setCategory = (category_obj) => {
        sendCategoryToParent(category_obj)
    }

    
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
        getCategories(null, {mode:"master"}).then(res => {
            if(res.status == 200){
                const incident_categories = [];

                if(res.data && res.data.length > 0){
                    res.data.forEach(item => {
                        if(item.type == "incident") incident_categories.push(item);
                        setIncidentCategoriesList(incident_categories);
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
        
    },[]);

    return(
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="card shadow mb-4">
                            <div className="card-body">
                                <div style={{display:"flex"}}>
                                    <h5 className="black bold"> List of Incident Categories </h5>
                                    <div style={{marginLeft:"auto"}}>
                                        <div style={{display:"flex", justifyContent:"flex-end", columnGap:"10px"}}>
                                            <input placeholder="Search for a incident item" onChange={(e) => setIncidentCategorySearch(e.target.value)} style={{borderRadius:"8px", padding:"0 10px", fontSize:"14px", width:"220px"}}/>
                                            <button class="btn" style={{padding:"0 !important", fontSize:"14px",background:"#FAA819", color:"white"}}>
                                                Search 
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {(incident_category_search_results.length <= 0 || incident_category_search === "") && incident_categories_list && Object.keys(incident_categories_list).length > 0 && <CategoryTree categories={incident_categories_list} sendCategory={setCategory}/>}
                                {incident_category_search_results.length > 0 && incident_category_search !== "" && <div>
                                    <ul>
                                        {incident_category_search_results.map(category => 
                                            <li style={{cursor:"pointer", marginBottom:"10px", marginTop:"10px"}}>
                                            <div style={{ display:"flex", columnGap:"10px"}}>
                                                <div>{category.category_name}</div>
                                                <div onClick={(e) => {
                                                    setCategory({
                                                        id:category.id,
                                                        name:category.category_name
                                                    })
                                                }} style={{display: "flex", alignItems:"center", columnGap:"5px"}}>
                                                    <div style={{color:"#FAA819"}}><BiSolidSelectMultiple/></div>
                                                    <div style={{color:"#FAA819", fontSize:"14px"}}>Pick this category</div>
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

export default CategoryContents;