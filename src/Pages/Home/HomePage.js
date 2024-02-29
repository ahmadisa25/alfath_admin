
import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { isObjectEmpty, permissionCheck, truncateToEllipsis } from '../../Utils/Utils';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { logoutUser } from '../../Service/UserService';

import DashboardCard from '../../Components/DashboardCard';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    ArcElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
import { group, mailbox, pending } from '../../Images';
import { capitalize } from 'lodash';
import moment from 'moment';


  
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    ArcElement,
    Tooltip,
    Legend
);

const { $ } = window;
function HomePage() {
    const navigate = useNavigate();
    let { userInfo } = useSelector(state => state.auth);
    const [selected_category, setSelectedCategory] = useState({});
    const [selected_type, setSelectedType] = useState("");
    const [table_data, setTableData] = useState([]);

    const [overdue_tickets_list, setOverdueTicketsList] = useState([])

    const [top_cards_state, setTopCardsState] = useState({
        pending: 0,
        new: 0,
        unresolved: 0
    })

    const [new_tickets, setNewTickets] = useState([]);
    const [this_week_resolved, setThisWeekResolved] = useState([]);
    const [achievement_data, setAchievementData] = useState({
        labels: ['Resolve SLA Achieved', 'Resolve SLA Undone',],
        datasets: [
          {
            data: [12, 19],
            backgroundColor: [
              'rgba(54, 162, 235, 0.2)',
              'rgba(75, 192, 192, 0.2)',
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(75, 192, 192, 1)',
            ],
            borderWidth: 1,
          },
        ],
      });
    const [incident_data, setIncidentData] = useState({
        labels: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
        datasets: [
          {
            label: 'Top 5 Incident Categories',
            data: [40, 25, 15, 30, 48], // Provide your data values here
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)', // Color for Category A
              'rgba(54, 162, 235, 0.6)', // Color for Category B
              'rgba(75, 192, 192, 0.6)', // Color for Category C
              'rgba(255, 206, 86, 0.6)', 
              'rgba(0, 0, 0, 0.6)'// Color for Category D
            ], // Customize the bar color
          },
        ],
      });

      const [request_data, setRequestData] = useState({
        labels: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
        datasets: [
          {
            data: [40, 25, 15, 30, 48], // Provide your data values here
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)', // Color for Category A
              'rgba(54, 162, 235, 0.6)', // Color for Category B
              'rgba(75, 192, 192, 0.6)', // Color for Category C
              'rgba(255, 206, 86, 0.6)', 
              'rgba(0, 0, 0, 0.6)'// Color for Category D
            ], // Customize the bar color
          },
        ],
      });

    const [show_incident_chart, setShowIncidentChart] = useState(false);
    const selectRef = useRef(null);

    const [show_request_chart, setShowRequestChart] = useState(false);
    const [show_achievement_chart, setShowAchievementChart] = useState(true);
    const incident_options = {
       plugins: {
        legend: {
            display: false, // Turn off the labels for datasets
        },
      },
      scales: {
        x: {
          reverse: true, // Reverse the x-axis
          ticks: {
            callback: function (value, index, values) {
              // Custom label rendering function that wraps long labels
              const maxLength = 10; // Set the maximum label length
              return incident_data.labels[index].length > maxLength ? incident_data.labels[index].substring(0, maxLength) + '...' : incident_data.labels[index];
            },
          },
        },
        y: {
          beginAtZero: true, // Start y-axis at zero
        },
      },
      responsive:true,
    };

    const achievement_options = {
        maintainAspectRatio: false,
        responsive: true,
        height: 257
    }

    const request_options = {
        plugins: {
            legend: {
                display: false, // Turn off the labels for datasets
            },
        },
        scales: {
          x: {
            reverse: true, // Reverse the x-axis
            ticks: {
              callback: function (value, index, values) {
                // Custom label rendering function that wraps long labels
                const maxLength = 10; // Set the maximum label length
                return request_data.labels[index].length > maxLength ? request_data.labels[index].substring(0, maxLength) + '...' : request_data.labels[index];
              },
            },
          },
          y: {
            beginAtZero: true, // Start y-axis at zero
          },
        },
        responsive:true,
      };
    

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
                    
                    <div className="col-xl-4 col-md-4 mb-4">
                        <div className="card  h-100 py-2">
                            <DashboardCard card_title="New Courses"  stats={top_cards_state.new} explanation_text={"* Newly made lessons by our instructors"} icon={mailbox}/>
                        </div>
                    </div>
                    <div className="col-xl-4 col-md-4 mb-4">
                        <div className="card  h-100 py-2">
                             <DashboardCard card_title="Total Students"  stats={top_cards_state.pending} explanation_text={"* Number of students enrolled in the system"} icon={group} />
                        </div>
                    </div>

                    <div className="col-xl-4 col-md-4 mb-4">
                        <div className="card  h-100 py-2">
                                <DashboardCard card_title="% Enrollments Completed"  stats={50} explanation_text={"* Percentage of completed course enrollments"} icon={pending} icon_width={120}/>
                        </div>
                    </div>
                    {/*<div className="col-xl-3 col-md-3 mb-3">
                        <div className="card  h-100 py-2">
                                <DashboardCard card_title="Overdue Tickets" stats={top_cards_state.overdue} explanation_text={"* Incidents or requests still needing help from agents"} icon={overdue} icon_width={120}/>
                        </div>
                    </div>*/}
                        </div>
                    </div>

                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card mb-4" style={{border:"none"}}>
                                <div
                                    className="card-header py-3 d-flex flex-row align-items-center justify-content-between svc-card-header">
                                    <h5 className="m-0 fw-500 color-black43">Top 5 Enrolled Courses</h5>
                                    {/*<div className="dropdown no-arrow">
                                        <select name='ppn' className='form-control ps-0'>
                                            <option>Select One</option>
                                        </select>
</div>*/}
                                </div>
                                <div className="card-body">
                                    <div className='border-round-light-gray'>
                                    {show_incident_chart && <Bar data={incident_data} options={incident_options} />}
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card mb-4" style={{border:"none"}}>
                                <div
                                    className="card-header py-3 d-flex flex-row align-items-center justify-content-between svc-card-header">
                                    <h5 className="m-0 fw-500 color-black43">Top 5 Finished Courses</h5>
                                    {/*<div className="dropdown no-arrow">
                                        <select name='ppn' className='form-control ps-0'>
                                            <option>Select One</option>
                                        </select>
</div>*/}
                                </div>
                                <div className="card-body">
                                    <div className='border-round-light-gray'>
                                    {show_request_chart && <Bar data={request_data} options={request_options} />}
                                    </div>

                                </div>
                            </div>
                        </div>
                        {/*<div className="col-md-4">
                            <div className="card mb-4" style={{border:"none"}}>
                                <div
                                    className="card-header py-3 d-flex flex-row align-items-center justify-content-between svc-card-header">
                                    <h5 className="m-0 fw-500 color-black43">Today's Achievement</h5>
                                </div>
                                <div className="card-body">
                                    <div style={{height:"257px"}}>
                                    {show_achievement_chart && <Pie data={achievement_data} options={achievement_options}/>}
                                    </div>

                                </div>
                            </div>
</div>*/}
                    </div>
                    <div className="row">
                        <div className="col-md-3">
                            <div className="card mb-4" style={{border:"none"}}>
                                <div
                                    className="card-header py-3 d-flex flex-row align-items-center justify-content-between svc-card-header">
                                    <h5 className="m-0 fw-500 color-black43">New Tickets</h5>
                                    {/*<div className="dropdown no-arrow">
                                        <select name='ppn' className='form-control ps-0'>
                                            <option>Select One</option>
                                        </select>
</div>*/}
                                </div>
                                <div className="card-body">
                                    <div>
                                        <table className="table table-condensed" style={{borderRadius:0, marginBottom: 0, padding: "0.4rem", fontSize:"16px"}}>
                                                    <thead>
                                                        <tr>
                                                            <th className='b2b-th'>No</th>
                                                            <th className='b2b-th'>Title</th>
                                                            <th className='b2b-th'>Type</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {new_tickets.map((item, index) => {
                                                            let to = item.type == "incident"? "/incident/": "/service-request/";
                                                            return(
                                                                <tr className="tr-dashboard" onClick={() => navigate(`${to}${item.ticket_id}`)}>
                                                                    <td>{index +1}</td>
                                                                    <td>{truncateToEllipsis(item.title)}</td>
                                                                    <td>{capitalize(item.type)}</td>
                                                                </tr>
                                                            )
                                                        })}
                                                       
                                                    </tbody>
                                            </table>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card mb-4" style={{border:"none"}}>
                                <div
                                    className="card-header py-3 d-flex flex-row align-items-center justify-content-between svc-card-header">
                                    <h5 className="m-0 fw-500 color-black43">Resolved Tickets This Week</h5>
                                </div>
                                <div className="card-body">
                                    <div>
                                        <table className="table table-condensed" style={{borderRadius:0, marginBottom: 0, padding: "0.4rem", fontSize:"16px"}}>
                                                    <thead>
                                                        <tr>
                                                            <th className='b2b-th'>No</th>
                                                            <th className='b2b-th'>Ticket</th>
                                                            <th className='b2b-th'>Type</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {this_week_resolved.map((item, index) => {
                                                            let to = item.type == "incident"? "/incident/": "/service-request/";
                                                            return(
                                                                <tr className="tr-dashboard" onClick={() => navigate(`${to}${item.ticket_id}`)}>
                                                                    <td>{index +1}</td>
                                                                    <td>{truncateToEllipsis(item.title)}</td>
                                                                    <td>{capitalize(item.type)}</td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                            </table>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card mb-4" style={{border:"none"}}>
                                <div
                                    className="card-header py-3 d-flex flex-row align-items-center justify-content-between svc-card-header">
                                    <h5 className="m-0 fw-500 color-black43">Overdue Tickets</h5>
                                    {/*<div className="dropdown no-arrow">
                                        <select name='ppn' className='form-control ps-0'>
                                            <option>Select One</option>
                                        </select>
</div>*/}
                                </div>
                                <div className="card-body">
                                    <div>
                                        <table className="table table-condensed" style={{borderRadius:0, marginBottom: 0, padding: "0.4rem", fontSize:"16px"}}>
                                                    <thead>
                                                        <tr>
                                                            <th className='b2b-th'>No</th>
                                                            <th className='b2b-th'>Title</th>
                                                            <th className='b2b-th'>Type</th>
                                                        </tr>   
                                                    </thead>
                                                    <tbody>
                                                        {overdue_tickets_list.map((item, index) => {
                                                            let to = item.type == "incident"? "/incident/": "/service-request/";
                                                            return(
                                                                <tr className="tr-dashboard" onClick={() => navigate(`${to}${item.ticket_id}`)}>
                                                                    <td>{index +1}</td>
                                                                    <td>{truncateToEllipsis(item.subject || item.category_name)}</td>
                                                                    <td>{capitalize(item.ticket_type)}</td>
                                                                </tr>
                                                            )
                                                        })}
                                                       
                                                    </tbody>
                                            </table>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card mb-4" style={{border:"none"}}>
                                <div
                                    className="card-header py-3 d-flex flex-row align-items-center justify-content-between svc-card-header">
                                    <h5 className="m-0 fw-500 color-black43">Ticket By Category</h5>
                                    <div className="dropdown no-arrow">
                                            <select name='type-selector' id ="type-selector" className='sd-form-control ps-0' onChange={(e) => setSelectedType(e.target.value)} ref={selectRef} style={{fontSize:"0.65rem"}}>
                                                <option value="">Select Type</option>
                                                <option value="incident">Incident</option>
                                                <option value="service-request">Service Request</option>
                                            </select>
                                        </div>
                                </div>
                                <div className="card-body">
                                    <div>
                                        {isObjectEmpty(selected_category) && table_data.length <=0 && <div>
                                            <div style={{textAlign:"center", marginTop:"50px"}}>Please select ticket type first.</div>
                                        </div>}
                                        {!isObjectEmpty(selected_category) && table_data.length <=0 && <div>
                                            <div style={{textAlign:"center", marginTop:"50px"}}>No data for this category.</div>
                                        </div>}
                                       {table_data.length > 0 && <table className="table table-condensed" style={{borderRadius:0, marginBottom: 0, padding: "0.4rem", fontSize:"16px"}}>
                                                    <thead>
                                                        <tr>
                                                            <th className='b2b-th'>No</th>
                                                            <th className='b2b-th'>Ticket</th>
                                                            <th className='b2b-th'>Requested Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {table_data.map((item, index) => {
                                                            let to = item.type == "incident"? "/incident/": "/service-request/";
                                                            return(
                                                                <tr className="tr-dashboard" onClick={() => navigate(`${to}${item.id}`)}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{item.subject ? `${truncateToEllipsis(item.subject)} - ${item.category_name}` : `${item.category_name}`}</td>
                                                                    <td style={{fontSize:"13px"}}>{moment(item.requested_date).format('DD-MM-YYYY HH:mm')}</td>
                                                                </tr>
                                                            )
                                                        })
                                                           
                                                        }
                                                    </tbody>
                                            </table>}
                                    </div>

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