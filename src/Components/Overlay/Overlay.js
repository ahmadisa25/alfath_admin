import React from 'react'

export default function Overlay({ display }) {
    if (display) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                background: '#ffffff99',
                zIndex: 100000,
                top: 0,
                left: 0, position: 'absolute'
            }}>
                <i className="fas fa-2x fa-sync-alt fa-spin"></i>
                <span style={{ marginTop: 10, fontWeight: 500 }}>Processing, please wait . . .</span>
            </div>
        );
    } else {
        return '';
    }
}
