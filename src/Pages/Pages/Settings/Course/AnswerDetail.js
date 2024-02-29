import React, { useEffect } from 'react';
import {getAllAnswers} from '../../../../Service/AnswerService';
import { useNavigate, useParams } from 'react-router-dom';

const AnswerDetail = () => {
    const navigate = useNavigate();

    const {quiz_id, student_id} = useParams();
    

    useEffect(() => {
        getAllAnswers({filter:`quiz_id:${quiz_id},student_id:${student_id}`}).then(res => {
            console.log(res);
        })
    }, []);
    return (
        <>
            <div className="content-wrapper">
                <div className="content-header">
                        <div className="container-fluid">
                            <div className="row mb-2">
                                <div className="col-sm-6">
                                <h2 className="title-breadcrum fw-500">Answers Detail</h2>
                                </div>
                            </div>
                        </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div>
                            <div className="card shadow mb-4">
                                <div className="card-body">
                                    
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