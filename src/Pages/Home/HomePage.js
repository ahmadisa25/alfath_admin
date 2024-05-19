
import React, { useEffect, useState } from 'react'
import DashboardCard from '../../Components/DashboardCard';
import { group, course, submit } from '../../Images';
import { getDashboardData } from '../../Service/DashboardService';
import Swal from 'sweetalert2';

const { $ } = window;
function HomePage() {
    const [selected_category, setSelectedCategory] = useState({});
    const [selected_type, setSelectedType] = useState("");

    /*useEffect(()=>{
        if(userInfo && userInfo.role_name){
            if(!permissionCheck(userInfo, "dashboard", "view")){
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "You're not allowed to access that page!"
                })
                navigate('/requester-home');
            }
        } else {
            logoutUser(userInfo.role_name);
        }
    },[])*/

    const [dashboard_data, setDashboardData] = useState({
        total_students:0,
        total_courses:0,
        total_submissions:0
    });

    useEffect(() => {
        getDashboardData().then(res => {
            if(res.data.Status == 200){
                const dash_data = res.data.Data;
                setDashboardData({
                    total_students:dash_data.TotalStudents,
                    total_courses:dash_data.TotalCourses,
                    total_submissions:dash_data.TotalSubmissions
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "Failed to get dashboard data!"
                 })
            }
    })
    },[])

    const onCloseServiceCategory = (e) => {
        e.preventDefault();
        setSelectedCategory({});
        $("#modal-service-category").modal('hide');
    }

    
    const onCloseIncidentCategory = (e) => {
        e.preventDefault();
        setSelectedCategory({});
        $("#modal-incident-category").modal('hide');
    }

    const onShowServiceCategoryModal = () => {
        $('#modal-service-category').modal('show');
    }

    const onShowIncidentCategoryModal = () => {
        $('#modal-incident-category').modal('show');
    }

    const onSetCategory = (category_obj) => {
        setSelectedCategory(category_obj);
        $("#modal-service-category").modal('hide');
        $("#modal-incident-category").modal('hide');
    }

    useEffect(() => {
        if(selected_type == "service-request"){
            onShowServiceCategoryModal();
        } else if(selected_type == "incident"){
            onShowIncidentCategoryModal();
        }
    }, [selected_type])

    useEffect(() => {
       let category_name = selected_category.name ?? selected_category.category_name;
       if(selected_type == "incident"){
        } else if(selected_type == "service-request"){
        }
    }, [selected_category])


    return (
        <div className="content-wrapper">
            <section className="content" style={{background: "#FAFAFA"}}>
                <div className="container-fluid" style={{background: "white"}}>
                    <div id="modal-service-category" className="modal fade">
                                        <div className="modal-dialog modal-lg" style={{ maxWidth: 1000 }}>
                                            <div className="modal-content" style={{width:"120%"}}>
                                                <div className="modal-header">
                                                    <h5 className="modal-title">
                                                        Select Service Category
                                                    </h5>
                                                    <button type="button" className="close" onClick={onCloseServiceCategory} aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div className="modal-body">
                                                   
                                                </div>
                                            </div>
                                        </div>
                    </div>
                    <div id="modal-incident-category" className="modal fade">
                                        <div className="modal-dialog modal-lg" style={{ maxWidth: 1000 }}>
                                            <div className="modal-content" style={{width:"120%"}}>
                                                <div className="modal-header">
                                                    <h5 className="modal-title">
                                                        Select Incident Category
                                                    </h5>
                                                    <button type="button" className="close" onClick={onCloseIncidentCategory} aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div className="modal-body">
                                                </div>
                                            </div>
                                        </div>
                    </div>
                    <div>
                    <div className='card' style={{padding:"30px", marginBottom: "40px"}}>
                        <div className="row">
                                <div className="col-lg-12" style={{paddingBottom:"20px"}}>
                                    <div className='row'>
                                        <div className='col-md-6'>
                                            <h4 className='fw-500 color-black43'>Your Dashboard</h4>
                                            <h6>A brief about the current state of operations</h6>
                                        </div>
                                        {/*<div className='col-md-6'>
                                            <button type="button" class="btn btn-outline-success right" style={{padding: "0.5em 1em"}}>
                                                <div style={{display: "flex", alignItems:"center"}}>
                                                    <div><img src={data_update}/></div>
                                                    <div style={{marginLeft: "10px"}}>Import Data</div>
                                                </div>
                                            </button>
    </div>*/}
                                    </div>

                                </div>
                                
                        </div>
                        {/*<div className='row'>
                            <div className='col-md-12 mh-2 d-flex'>
                                <button type="button" class="btn btn-outline-success db-button">12 Months</button>
                                <button type="button" class="btn btn-outline-success db-button">6 Months</button>
                                <button type="button" class="btn btn-outline-success db-button">5 Months</button>
                                <button type="button" class="btn btn-outline-success db-button">4 Months</button>
                                <button type="button" class="btn btn-outline-success db-button">3 Months</button>
                                <button type="button" class="btn btn-outline-success db-button">2 Months</button>
                            </div>
    </div>*/}
    <div className="row">
         <div className="col-md-6">
                    <div className="row">
                    <div className="col-xl-6 col-md-6 mb-4">
                            <div className="card mb-4" style={{border:"none"}}>
                                <div
                                    className="card-header py-3 d-flex flex-row align-items-center justify-content-between svc-card-header">
                                    <h5 className="m-0 fw-500 color-black43">Prayer Times</h5>
                                    {/*<div className="dropdown no-arrow">
                                        <select name='ppn' className='form-control ps-0'>
                                            <option>Select One</option>
                                        </select>
</div>*/}
                                </div>
                                <div className="card-body" style={{padding:"0"}}>
                                    <div className='border-round-light-gray' style={{"padding": "0.5rem", "textAlign": "center"}}>
                                        <iframe src="https://jadwalsholat.org/jadwal-sholat/monthly.php?id=265" height="642" width="350" frameborder="0"></iframe>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="col-xl-6 col-md-6 mb-4">
                            <div className="card mb-4" style={{border:"none"}}>
                                <div
                                    className="card-header py-3 d-flex flex-row align-items-center justify-content-between svc-card-header">
                                    <h5 className="m-0 fw-500 color-black43">Qur'an Reminder</h5>
                                    {/*<div className="dropdown no-arrow">
                                        <select name='ppn' className='form-control ps-0'>
                                            <option>Select One</option>
                                        </select>
</div>*/}
                                </div>
                                <div className="card-body" style={{padding:"0"}}>
                                    <div className='border-round-light-gray' style={{padding:"1rem"}}>
                                        <div style={{"fontSize":"2rem", "color":"#cd5700", padding:"1rem", textAlign:"center"}}>يَٰٓأَيُّهَا ٱلنَّاسُ إِنَّ وَعْدَ ٱللَّهِ حَقٌّ ۖ فَلَا تَغُرَّنَّكُمُ ٱلْحَيَوٰةُ ٱلدُّنْيَا ۖ وَلَا يَغُرَّنَّكُم بِٱللَّهِ ٱلْغَرُورُ</div>

                                        <div style={{padding:"0.5rem", color:"black", textAlign:"center"}}>"Hai manusia, sesungguhnya janji Allah adalah benar, maka sekali-kali janganlah kehidupan dunia memperdayakan kamu dan sekali-kali janganlah syaitan yang pandai menipu, memperdayakan kamu tentang Allah."
                                        <br/>
                                        <br/>
                                        Referensi : https://tafsirweb.com/7871-surat-fatir-ayat-5.html</div>

                                    </div>

                                </div>
                            </div>
                        </div>
                       
                    </div>
            {/*<div className="col-xl-3 col-md-3 mb-3">
                <div className="card  h-100 py-2">
                        <DashboardCard card_title="Overdue Tickets" stats={dashboard_data.overdue} explanation_text={"* Incidents or requests still needing help from agents"} icon={overdue} icon_width={120}/>
                </div>
            </div>*/}
            </div>
                    <div className="col-md-6">
                    
                            <div className="col-xl-12 col-md-12 mb-4">
                                <div className="card  h-100 py-2">
                                    <DashboardCard card_title="Total Courses"  stats={dashboard_data.total_courses} explanation_text={"* Number of courses made by our instructors"} icon={course}/>
                                </div>
                            </div>
                            <div className="col-xl-12 col-md-12 mb-4">
                                <div className="card  h-100 py-2">
                                    <DashboardCard card_title="Total Students"  stats={dashboard_data.total_students} explanation_text={"* Number of students enrolled in the system"} icon={group} />
                                </div>
                            </div>
                            <div className="col-xl-12 col-md-12 mb-4">
                                <div className="card  h-100 py-2">
                                    <DashboardCard card_title="Quiz Submissions"  stats={dashboard_data.total_submissions} explanation_text={"* Total of times quizzes are answered"} icon={submit} />
                                </div>
                            </div>
                    {/*<div className="col-xl-3 col-md-3 mb-3">
                        <div className="card  h-100 py-2">
                                <DashboardCard card_title="Overdue Tickets" stats={dashboard_data.overdue} explanation_text={"* Incidents or requests still needing help from agents"} icon={overdue} icon_width={120}/>
                        </div>
                    </div>*/}
                    </div>
    </div>
                    </div>

                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePage