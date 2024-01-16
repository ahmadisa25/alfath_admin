import React, { useState, useImperativeHandle, forwardRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import PropTypes from 'prop-types';


const WysiwygText = forwardRef(({label, required}, ref) => {
 
    const [value, setValue] = useState("");
    //const [error, setError] = useState("");
    const handleWysiwygChange = (content, _, source, editor) => {
            setValue(content);
    }
    useImperativeHandle(ref, () => {
        return { getValue: () => value, setText: (text) => setValue(text)}
    })
    return (
        <div className='form-group'>
            <label htmlFor={label} className="black"><b>{label}</b> {required && <span style={{color:"red"}}>*</span>}</label>
            <ReactQuill theme="snow" value={value} onChange={handleWysiwygChange} />
            {/*error && <span className='text-danger'>{error}</span>*/}
        </div>
    )
})

WysiwygText.propTypes = {
    label: PropTypes.string.isRequired,
    required: PropTypes.bool
}

export default WysiwygText;