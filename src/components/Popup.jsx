import React from 'react'

function Popup(props) {
    return (props.trigger) ? (
            <div className="popup">
                <div className='popup-inner'>
                    {props.children}
                    <button className='close-btn' onClick={()=>props.setTrigger(false)}>close</button>
                </div>
            </div>
    ) :"";
}

export default Popup