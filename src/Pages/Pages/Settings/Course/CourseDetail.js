import { useEffect, useState } from 'react';
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
import CourseContents from './CourseContents';

const { $ } = window;
const CourseDetail = () => {
    const UPLOAD_DIR = process.env.REACT_APP_IMAGE_URL;
    let { userInfo } = useSelector(state => state.auth);
    const { course_id } = useParams();
    moment.locale('id');
    const navigate = useNavigate();
    const [course_data, setCourseData] = useState({});
    const [current_page, setCurrentPage] = useState("Detail");
    const [state, _] = useState({ processing : false });

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
                            console.log(res.data.Data.Instructors)
                            setCourseData(res.data.Data)
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
                    <div className="card shadow mb-4" style={{height:"85vh"}}>
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
                                <CourseContents/>
                            }
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

};

export default CourseDetail;