import { useEffect, useState } from 'react';
import {
    useNavigate
} from "react-router-dom";
import { useSelector } from 'react-redux';
import Overlay from '../../../../Components/Overlay';
import moment from 'moment';
import 'moment/locale/id';
import { MdOutlineModeEdit } from 'react-icons/md';
import Select from 'react-select';
import {
    useParams
} from "react-router-dom";
import Swal from 'sweetalert2';
import { getQuiz } from '../../../../Service/QuizService';
import { deleteQuestion } from '../../../../Service/QuestionService';
import { capitalize } from 'lodash';
import { BsTrashFill } from 'react-icons/bs';

const { $ } = window;
const QuizDetail = () => {
    let { userInfo } = useSelector(state => state.auth);
    const { quiz_id, course_id } = useParams();
    moment.locale('id');
    const navigate = useNavigate();
    const [quiz_data, setQuizData] = useState({});
    const [state, setState] = useState({ processing : false });
    const [refresh, setRefresh] = useState(false);

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

                getQuiz(quiz_id).then(res => {
                    if(res.data.Status == 200){
                        setQuizData(res.data.Data)
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: "Failed to get quiz data!"
                         })
                        navigate(`/course/${course_id}`);
                    }
                })
                
            //}
        //}
    }, [])

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
                if(refresh === true){
                    getQuiz(quiz_id).then(res => {
                        if(res.data.Status == 200){
                            setQuizData(res.data.Data)
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error!',
                                text: "Failed to get quiz data!"
                             })
                            navigate(`/course/${course_id}`);
                        }
                    })
                }
                
                
            //}
        //}
    }, [refresh])

    const onRemoveQuestion = (question_id) => {
        const swalWithBootstrapButtons = Swal.mixin({
        })
          
          swalWithBootstrapButtons.fire({
            icon: 'info',
            title: 'Delete Question',
            text: "Are you sure you want to delete this Question?",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              deleteQuestion(question_id).then(res => {
                if(res.status == 200){
                    swalWithBootstrapButtons.fire(
                        'Deleted!',
                        'Question is successfully deleted.',
                        'success'
                    ).then(_ => setRefresh(true));
                } else {
                    swalWithBootstrapButtons.fire(
                        'Error',
                        'Question deletion Failed.',
                        'error'
                    ) 
                }
              })
              
            } else if (
              result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire(
                'Cancelled',
                'Question deletion cancelled',
                'error'
              )
            }
          })
    };

    const renderQuestion = (question, index) => {
        let question_rendered = null;
        if(question.Type == "single-text") {
            question_rendered = 
            <div className='form-group' style={{width:"70%"}}>
                <label className="black"><b>{index}. {capitalize(question.Title)}</b></label>
                <input maxLength={question.Length} className='form-control' autoComplete="off" placeholder={"Jawab disini"}/>
            </div>;
        } else if(question.Type == "multiple-text") {
            question_rendered = 
            <div className='form-group' style={{width:"70%"}}>
                <label className="black"><b>{index}. {capitalize(question.Title)}</b></label>
                <textarea maxLength={question.Length} className='form-control' autoComplete="off" placeholder={"Jawab disini"} rows="10"/>
            </div>;
        } else if(question.Type == "multiple-choices") {
            let choices = [];
            if(question.Choices){
                let split_choices = question.Choices.split(",")
                split_choices.forEach((item) => choices.push({label:item, value:item}))
            }

            question_rendered = 
            <div className='form-group'>
                <label className="black"><b>{index}. {capitalize(question.Title)}</b></label>
                <Select
                    options={choices}
                    placeholder={"Select One"}
                    isMulti
                />
            </div>;
        } else if(question.Type == "single-choices") {
            let choices = [];
            if(question.Choices){
                choices = question.Choices.split(",");
            }

            question_rendered = 
            <div className='form-group'>
                <label className="black"><b>{index}. {capitalize(question.Title)}</b></label>
                <div style={{display:"flex", flexDirection:"column"}}>{choices?.length > 0 && choices.map(item => <label><input className="radio-label" type="radio" id="html" name="fav_language" value={item}/>{item}</label>)}</div>
            </div>;
        }
        return (
            <>
                <div style={{display:"flex", justifyContent:"space-between"}}>
                    {question_rendered}
                    <div style={{display:"flex", columnGap:"15px"}}>
                        <div style={{display: "flex", cursor:"pointer"}} onClick={(e) => navigate(`/question-form/${question.ID}/${quiz_id}/${course_id}`)}>
                            <div style={{color:"#0099C3"}}><MdOutlineModeEdit/>&nbsp;<span style={{fontSize:"12px"}}>Edit</span></div>
                        </div>
                        <div onClick={(e) => onRemoveQuestion(question.ID)} style={{display: "flex", cursor:"pointer"}}>
                            <div style={{color:"red"}}><BsTrashFill/>&nbsp;<span style={{fontSize:"12px"}}>Delete</span></div>
                        </div>
                    </div>
                </div>
            </>
        )
       
    }

    
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
                                <div style={{display:"flex", alignItems:"center", cursor: "pointer", marginBottom:"10px", fontSize:"16px", color:"#CD5700"}} onClick={() => navigate(`/course/${course_id}`)}>
                                        <div><span class="material-icons" style={{fontSize:"18px", marginTop:"5px"}}>arrow_back</span></div>
                                        <div>&nbsp; Back to Course</div>
                                </div>
                                <div style={{display: "flex", columnGap: "20px"}}>
                                    <div>
                                        <span className="course-title fw-500 black" style={{display: "block"}}>{quiz_data.Name}</span>
                                        <span className="course-date" style={{display: "block"}}>Created Date: {moment(quiz_data.CreatedAt).format('ll')}</span>
                                    </div>
                                    <div>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        <hr/>
                            </div>
                        </div>
                        <div className="card-body" style={{padding:"0 1.5rem 1.5rem"}}>
                            <Overlay display={state.processing} />
                            <div className="d-flex" style={{justifyContent:"space-between"}}>
                                <h5 className="black bold">List of Questions</h5>
                                <div style={{display:"flex", color:"#CD5700", columnGap:"5px", cursor:"pointer", fontSize:"1rem", margin:"0 1.5rem 0.9rem 0rem"}} onClick={()=> navigate(`/question-form/${null}/${quiz_id}/${course_id}`)}>
                                            <div style={{marginLeft:"auto"}}><b>+</b> Add a new question</div>
                                </div>
                            </div>
                            <div style={{marginTop:"15px"}}>
                                {quiz_data?.Questions && quiz_data.Questions.map((item, index) => renderQuestion(item, index+1))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

};

export default QuizDetail;