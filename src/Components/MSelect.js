import { React, Component } from 'react';
import Select from "react-select";

const MSelect = ({ options, label, value, onChange, disabled, error }) => {
  return (
    <div>
      <label>{label}</label>
      <Select options={options}
        onChange={onChange}
        isDisabled={disabled}
        value={options.filter(function (option) {
          return option.value === value;
        })}

      />
      <span className='text-danger' style={{ fontSize: 10 }}>{error}</span>
    </div>
  );
};
export default MSelect;