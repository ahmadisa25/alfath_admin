import React, { useEffect, useState } from 'react';
import {getAllAnswers} from '../../../../Service/AnswerService';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const AnswerDetail = () => {
    const navigate = useNavigate();

    const {quiz_id, student_id} = useParams();
    const [answers, setAnswers] = useState([]);

    useEffect(() => {
        getAllAnswers({filter:`quiz_id:${quiz_id},student_id:${student_id}`}).then(res => {
            setAnswers(res.data.Data)
        }).catch(err => {
            //setState({...state, processing: false})
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "Failed to get answers data!"
             })/*.then(_ => {
                setState({...state, processing: false})
             })*/
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
                                <h5 className="black bold" style={{marginBottom:"30px"}}>List of Answers</h5>
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
                                    <div style={{display:"flex", marginLeft:"6px"}}>
                                        <div className='form-group' style={{width:"30%", display:"flex", columnGap:"15px"}}>
                                            <label htmlFor='FinalGrade' className="black"><b>Final Grade</b> <span style={{color:"red"}}>*</span></label>
                                            <div className='d-flex align-items-center' style={{columnGap:"20px"}}>
                                                <div>
                                                    <input type="number" className="form-control" style={{width:"25%"}} id="FinalGrade" placeholder="60" max="100" autoComplete="off"/>
                                                </div>
                                            </div>
                                        </div>
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