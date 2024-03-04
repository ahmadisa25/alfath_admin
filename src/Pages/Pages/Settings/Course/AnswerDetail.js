import React, { useEffect, useState } from 'react';
import {getAllAnswers, getStudentQuiz, submitFinalGrade} from '../../../../Service/AnswerService';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { urlEncodeData } from '../../../../Utils/Utils';

const AnswerDetail = () => {
    const navigate = useNavigate();
    let { userInfo } = useSelector(state => state.auth);
    const {quiz_id, student_id} = useParams();
    const [answers, setAnswers] = useState([]);
    const [final_grade, setFinalGrade] = useState(0);
    const [quiz_data, setQuizData] = useState(null);
    const [state, setState] = useState({ 
        processing : false, 
    });

    const onSubmitGrade = () => {
        if(final_grade < 0 || final_grade > 100) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "Final grade must be between 0 and 100!"
             })
            return;
        }

        let user_input = Object.assign({}, {StudentID:student_id, QuizID:quiz_id, FinalGrade:final_grade, GradedByID:userInfo.id});
        user_input = urlEncodeData(user_input);
        submitFinalGrade(user_input).then(res => {
            if(res.status == 201){
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: "Grade data has successfully been submitted!"
                 }).then(_ => {
                    navigate(`/answers/${quiz_id}`);
                 })
             
            }
        }).catch(({response: {data}}) => {
            setState({...state, processing: false})
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: data && data.Message || "There's an error with your request. Please try again or contact support!"
             }).then(_ => {
                setState({...state, processing: false})
             })
        })
    }

    useEffect(() => {
        getAllAnswers({filter:`quiz_id:${quiz_id},student_id:${student_id}`}).then(res => {
            if(res.data.Status == 200) {
                setAnswers(res.data.Data)
            }

        }).catch(err => {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "Failed to get answers data!"
             })
        })

        getStudentQuiz(student_id).then(res => {
            if(res.data.Status == 200){
                setFinalGrade(res.data.Data.FinalGrade)
                setQuizData(res.data.Data)
            }
        }).catch(err => {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "Failed to get quiz data!"
             })
        })
    }, []);
    return (
        <>
            <div className="content-wrapper">
                <div className="content-header">
                        <div className="container-fluid">
                            {/*<div className="row mb-2">
                                <div className="col-sm-6">
                                <h2 className="title-breadcrum fw-500">Answers Detail</h2>
                                </div>
    </div>*/}
                        </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div>
                            <div className="card shadow mb-4">
                                <div className="card-body">
                                <div style={{display:"flex", alignItems:"center", cursor: "pointer", marginBottom:"10px", fontSize:"16px", color:"#CD5700"}} onClick={() => navigate(`/answers/${quiz_id}`)}>
                                        <div><span class="material-icons" style={{fontSize:"18px", marginTop:"5px"}}>arrow_back</span></div>
                                        <div>&nbsp; Back to Answers List</div>
                                </div>
                                <h5 className="black bold">List of Answers</h5>
                                {answers?.length > 0 && <div>Student: {answers[0].name}</div>}
                                <table className="table table-condensed" style={{ marginTop: 16, borderBottom:"1px solid black", marginBottom:35}}>
                                    <thead>
                                        <tr>
                                            <th className='b2b-th'>No.</th>
                                            <th className='b2b-th'>Question</th>
                                            <th className='b2b-th'>Answer</th>
                                        </tr>
                                    </thead>   
                                    <tbody>
                                    {answers?.map((item, index) => 
                                            <tr>
                                                <td>{index +1}</td>
                                                <td>{item.title}</td>
                                                <td>{item.answer}</td>
                                            </tr>
                                            
                                       
                                    )}
                                    </tbody>
                                    </table>
                                    <div style={{marginLeft:"6px", marginTop:"40px"}}>
                                        <div className='form-group' style={{display:"flex", columnGap:"15px", alignItems:"center", marginBottom:0}}>
                                            <label htmlFor='FinalGrade' className="black" style={{marginBottom:0}}><b>Final Grade</b> <span style={{color:"red"}}>*</span></label>
                                            <div className='d-flex align-items-center' style={{columnGap:"20px"}}>
                                                <div>
                                                    <input type="number" className="form-control" style={{width:"100%", fontSize:"0.2rem !important"}} id="FinalGrade" min="0" max="100" autoComplete="off" onChange={(e) => setFinalGrade(e.target.value)} value={final_grade} disabled={quiz_data && quiz_data.FinalGrade}/>
                                                </div>
                                            </div>
                                        </div>
                                            <button onClick={onSubmitGrade} className="btn tawny" style={{color:"white", fontSize:"0.65rem", marginTop:"10px"}} disabled={quiz_data && quiz_data.FinalGrade}>Submit</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

export default AnswerDetail;