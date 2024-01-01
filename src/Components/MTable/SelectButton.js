import React from 'react'

const SelectButton = ({ button_text }) => {
    return (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div className='form-group'>
                    <div style={{ border: 'solid 1px #ccc', borderRadius: 4 }}>
                        <select className="form-select" aria-label="Default select example" style={{borderRadius: "0.35rem", padding: "5px"}}>
                            <option selected>{button_text}</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                        </select>
                    </div>
                </div>
            </div>
    )
}

export default SelectButton