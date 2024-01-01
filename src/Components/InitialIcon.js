import React from 'react';

const InitialIcon = ({ name, icon_width, icon_height, icon_radius, text_size}) => {
  const nameSplitter = (str) => {
    let result = "";
    const string_array = str.split(" ");
    let i = 0;
    string_array.forEach(item => {
        if(i < 2) {
          result+=item[0].toUpperCase();
          i++;
        }
    })
    return result;
  }
  return (
    <div
      style={{
        backgroundColor: '#FAA819',
        color:"white",
        display:"flex",
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: icon_radius || 100,
        width: icon_width || 120,
        height: icon_height || 120,
      }}>
      <span style={{ color: 'white', fontSize: text_size || 60}}>{name? nameSplitter(name): ""}</span>
    </div>
  );
};

export default InitialIcon;