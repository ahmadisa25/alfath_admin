import React from 'react'

const PropertiesButton = ({ onDataClick}) => {
    return (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div>
                    <button
                        style={{display:"flex", alignItems:"center", fontSize: "16px"}}
                        type="button"
                        className="btn btn-block b2b-btn-add"
                        onClick={onDataClick} >
                        <i className="fa fa-cog" /> &nbsp; Properties...
                    </button>
                </div>
            </div>
    )
}

export default PropertiesButton