import React, { useEffect } from 'react';
import MTable from '../../../../Components/MTable/MTable';
import {getAllAnswers} from '../../../../Service/AnswerService';
import { useParams } from 'react-router-dom';

const Answers = () => {
    const {quiz_id} = useParams();

    const tableGetData = () => {
        return (params) => getAllAnswers({...params, filter:`quiz_id:${quiz_id}`});
    }

    const columns = [
        { id: 1, title: 'Name', field: 'Name', sortable: true},
        { id: 2, title: 'Email', field: 'Email', sortable: true},
    ]

    columns.push({
        id: 3,
        title: 'Action',
        render: item => {
            return (
                <div>
                        {/*<ActionButton icon={<FaEye/>} link_color="#0099C3" click_action={() => navigate(`/course/${item.id}`)} text="View"/>
                        <ActionButton icon={<BsTrashFill/>} link_color="#FF4833" click_action={(e) => onRemove(item.id)}/>*/}
                        Wavebird test
                </div>
            );
        },
    });

    const propsTable = { columns: columns, getData: tableGetData, onAddData, order: 'name', direction: 'asc', showCheckbox: true, minTableWidth:"80%"};
    return (
        <>
        <div className="content-wrapper"></div>
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
                        <MTable {...propsTable} />
                </div>
                </div>
            </section>
        </div>
        </>
    )
}

export default Answers;