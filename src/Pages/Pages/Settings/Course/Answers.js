import React, { useEffect } from 'react';
import MTable from '../../../../Components/MTable/MTable';
import {getAllAnswers} from '../../../../Service/AnswerService';
import { useNavigate, useParams } from 'react-router-dom';
import ActionButton from '../../../../Components/MTable/ActionButton';
import { FaEye } from 'react-icons/fa';

const Answers = () => {
    const {quiz_id} = useParams();
    const navigate = useNavigate();

    const tableGetData = () => {
        return (params) => getAllAnswers({...params, filter:`quiz_id:${quiz_id}`});
    }

    const columns = [
        { id: 1, title: 'Student Name', field: 'name', sortable: true},
        { id: 2, title: 'Student E-mail', field: 'email', sortable: true},
    ]

    columns.push({
        id: 3,
        title: 'Action',
        style: {width:200},
        render: item => {
            return (
                <div>
                        <ActionButton icon={<FaEye/>} link_color="#0099C3" click_action={() => navigate(`/answer/${item.quiz_id}/${item.student_id}`)} text="View"/>
                </div>
            );
        },
    });

    const propsTable = { columns: columns, getData: tableGetData(), order: 'name', direction: 'asc', showCheckbox: false, showIndex: false, minTableWidth:"80%"};
    return (
        <>
            <div className="content-wrapper">
                <div className="content-header">
                        <div className="container-fluid">
                            <div className="row mb-2">
                                <div className="col-sm-6">
                                <h2 className="title-breadcrum fw-500">Answers</h2>
                                    <h6>List of Quiz Answers</h6>
                                </div>
                            </div>
                        </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div>
                            <div className="card shadow mb-4">
                                <div className="card-body">
                                    <MTable {...propsTable} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

export default Answers;