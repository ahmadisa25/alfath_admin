import { useEffect, useRef, useState } from 'react';
import {
    useNavigate
} from "react-router-dom";
import { useSelector } from 'react-redux';
import Overlay from '../../../../Components/Overlay';
import moment from 'moment';
import {IoMdCart} from 'react-icons/io';
import {FaEdit, FaBook} from 'react-icons/fa';
import 'moment/locale/id';
import ReactHtmlParser from 'react-html-parser';

import {
    useParams
} from "react-router-dom";
import Swal from 'sweetalert2';
import { getCourse } from '../../../../Service/CourseService';
import { deleteChapter } from '../../../../Service/ChapterService';
import { deleteMaterial } from '../../../../Service/MaterialService';
import CourseDropdowns from './CourseDropdowns';
import { deleteQuiz } from '../../../../Service/QuizService';

const { $ } = window;
const CourseDetail = () => {
    const UPLOAD_DIR = process.env.REACT_APP_IMAGE_URL;
    let { userInfo } = useSelector(state => state.auth);
    const { course_id } = useParams();
    const tree_ref = useRef(null);
    moment.locale('id');
    const navigate = useNavigate();
    const [course_data, setCourseData] = useState({});
    const [current_page, setCurrentPage] = useState("Detail");
    const [state, _] = useState({ processing : false });
    const [refresh, setRefresh] = useState(false);
    const [chapter_data, setChapterData] = useState([]);

    useEffect(() => {
        if(refresh){    
            getCourse(course_id).then(res => {
                if(res.data.Status == 200){
                    setCourseData(res.data.Data)
                    setChapterData(res.data.Data.Chapters)
                    tree_ref.current.setStaticItems(res.data.Data.Chapters);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "Failed to get course data!"
                     })
                    navigate('/courses');
                }
        })
        }
    }, [refresh])

    const onRemoveQuiz = (quiz_id) => {
        const swalWithBootstrapButtons = Swal.mixin({
        })
          
          swalWithBootstrapButtons.fire({
            icon: 'info',
            title: 'Delete Quiz',
            text: "Are you sure you want to delete this Quiz?",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              deleteQuiz(quiz_id).then(res => {
                if(res.status == 200){
                    swalWithBootstrapButtons.fire(
                        'Deleted!',
                        'Quiz is successfully deleted.',
                        'success'
                    ).then(_ => setRefresh(true));
                } else {
                    swalWithBootstrapButtons.fire(
                        'Error',
                        'Quiz deletion Failed.',
                        'error'
                    ) 
                }
              })
              
            } else if (
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire(
                'Cancelled',
                'Quiz deletion cancelled',
                'error'
              )
            }
          })
    };

    const onRemove = (chapter_id) => {
        const swalWithBootstrapButtons = Swal.mixin({
        })
          
          swalWithBootstrapButtons.fire({
            icon: 'info',
            title: 'Delete Chapter',
            text: "Are you sure you want to delete this Chapter?",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              deleteChapter(chapter_id).then(res => {
                console.log(res)
                if(res.status == 200){
                    swalWithBootstrapButtons.fire(
                        'Deleted!',
                        'Chapter is successfully deleted.',
                        'success'
                    ).then(_ => setRefresh(true));
                } else {
                    swalWithBootstrapButtons.fire(
                        'Error',
                        'Chapter deletion Failed.',
                        'error'
                    ) 
                }
              })
              
            } else if (
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire(
                'Cancelled',
                'Chapter deletion cancelled',
                'error'
              )
            }
          })
    };

    const onRemoveMaterial = (material_id) => {
        const swalWithBootstrapButtons = Swal.mixin({
        })
          
          swalWithBootstrapButtons.fire({
            icon: 'info',
            title: 'Delete Material',
            text: "Are you sure you want to delete this Material?",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              deleteMaterial(material_id).then(res => {
                if(res.status == 200){
                    swalWithBootstrapButtons.fire(
                        'Deleted!',
                        'Material is successfully deleted.',
                        'success'
                    ).then(_ => setRefresh(true));
                } else {
                    swalWithBootstrapButtons.fire(
                        'Error',
                        'Material deletion Failed.',
                        'error'
                    ) 
                }
              })
              
            } else if (
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire(
                'Cancelled',
                'Material deletion cancelled',
                'error'
              )
            }
          })
    };

    useEffect(() => {
        /*if(userInfo.access){
            if(userInfo.access.incidents){
                if(!userInfo.access.incidents.can_view) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: "You're not allowed to access that page!"
                     })
                    navigate('/');
                }*/

                getCourse(course_id).then(res => {
                        if(res.data.Status == 200){
                            setCourseData(res.data.Data)
                            setChapterData(res.data.Data.Chapters)
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error!',
                                text: "Failed to get course data!"
                             })
                            navigate('/courses');
                        }
                })
                
            //}
        //}
    }, [])

    
    return (
        <div className="content-wrapper">
            <div className="content-header">
                
            </div>
            <section className="content">

                <div className="container-fluid">
                    <div className="card shadow mb-4">
                        <div className='card-header po-card-header' style={{borderBottom:"none"}}>
                            <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <div style={{display:"flex", alignItems:"center", cursor: "pointer", marginBottom:"10px", fontSize:"16px", color:"#CD5700"}} onClick={() => navigate('/courses')}>
                                        <div><span class="material-icons" style={{fontSize:"18px", marginTop:"5px"}}>arrow_back</span></div>
                                        <div>&nbsp; Back to Courses List</div>
                                </div>
                                <div style={{display: "flex", columnGap: "20px"}}>
                                    <div>
                                        <span className="course-title fw-500 black" style={{display: "block"}}>{course_data.Name}</span>
                                        <span className="course-date" style={{display: "block"}}>Created Date: {moment(course_data.CreatedAt).format('ll')}</span>
                                    </div>
                                    <div>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        <hr/>
                        <div className='row'>
                            <div className='col-md-12 d-flex' style={{margin: "12px 0 2em 0", columnGap: "5px"}}>
                                <div className={current_page == "Detail"? "b2b-badge-alfath": "b2b-badge-neutral"} onClick={() => setCurrentPage("Detail")} style={{cursor: "pointer"}}>
                                        <IoMdCart/>
                                        <span style={{fontSize:"16px"}}>Detail</span>
                                </div>
                                <div className={current_page == "Lessons"? "b2b-badge-alfath": "b2b-badge-neutral"} onClick={() => setCurrentPage("Lessons")} style={{cursor: "pointer"}}>
                                        <FaBook/>
                                        <span style={{fontSize:"16px"}}>Lessons</span>
                                </div>
                            </div>
                        </div>
                            </div>
                        </div>
                        <div className="card-body" style={{padding:"0 1.5rem 1.5rem"}}>
                            <Overlay display={state.processing} />
                            {current_page === "Detail" &&
                                <>
                                    <div className='row' style={{marginBottom: "20px", width: "100%"}}>
                                        <div className='col-md-10'>
                                            <div style={{fontSize: "18px", paddingTop:"10px", width: "95%"}}>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="ticket-detail" style={{display:"flex", flexDirection:"column", rowGap:"10px", marginBottom:"1.2rem"}}>
                                                            <div className="bold black">Title:</div>
                                                            <div>{course_data.Name}</div>
                                                        </div>
                                                        <div className="ticket-detail" style={{display:"flex", flexDirection:"column", rowGap:"10px"}}>
                                                            <div className="bold black">Description:</div>
                                                            <div>{ReactHtmlParser(course_data.Description)}</div>
                                                        </div>
                                                        <div className="ticket-detail" style={{display:"flex", flexDirection:"column", rowGap:"10px", marginBottom:"1.2rem"}}>
                                                            <div className="bold black">Duration:</div>
                                                            <div>{course_data.Duration} Minutes</div>
                                                        </div>
                                                        <div className="ticket-detail" style={{display:"flex", flexDirection:"column", rowGap:"10px"}}>
                                                            <div className="bold black">Instructors:</div>
                                                            <div>
                                                                <ul>
                                                                    {course_data?.Instructors?.length > 0 && course_data.Instructors.map((item, i) => {
                                                                        return <li key={i}>{item.Name}</li>
                                                                    })}
                                                                     
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="ticket-detail" style={{display:"flex", flexDirection:"column", rowGap:"5px"}}>
                                                            <div className="bold black">Course Thumbnail:</div>
                                                            <div>
                                                                <img src={`${UPLOAD_DIR}${course_data.FileUrl}`} width={"80%"}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                   
                                                </div>
                                            </div>
                                        </div>
                                        <div className='col-md-2' style={{paddingLeft:"20px"}}>
                                            <h5 className="bold black" style={{marginBottom:"15px"}}>Actions</h5>
                                            <div style={{display:"flex", color:"#CD5700", columnGap:"5px", cursor:"pointer", fontSize:"18px"}} onClick={()=> navigate(`/course-form/${course_id}`)}>
                                                <div><FaEdit/></div>
                                                <div>Edit Course Detail</div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            }
                            {current_page === "Lessons" &&
                                <>
                                    <div style={{display:"flex", color:"#CD5700", columnGap:"5px", cursor:"pointer", fontSize:"1rem", margin:"0 1.5rem 0.9rem 0rem"}} onClick={()=> navigate(`/chapter-form/${null}/${course_id}`)}>
                                            <div style={{marginLeft:"auto"}}><b>+</b> Add a new chapter</div>
                                    </div>
                                    {course_data?.Chapters?.length > 0 &&
                                        <CourseDropdowns ref={tree_ref} item_class={"lesson"} item_depth={2} item_name_key={"Name"} no_title={true} static_items={chapter_data} on_delete={onRemove} item_child_class={"material"}  item_child_name_key={"Name"} onDeleteChild={onRemoveMaterial} onDeleteQuiz={onRemoveQuiz}/>
                                    }                                  
                                </>
                            }
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

};

export default CourseDetail;