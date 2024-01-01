import React from 'react'

const AddButton = ({ onAddDataClick, addButtonText }) => {
    return (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div>
                    <button
                        style={{display:"flex", alignItems:"center", fontSize: "16px"}}
                        type="button"
                        className="btn btn-block b2b-btn-add"
                        onClick={onAddDataClick} >
                        <i className="fa fa-plus" /> &nbsp;{addButtonText? addButtonText: "Add"}
                    </button>
                </div>
            </div>
    )
}

export default AddButton