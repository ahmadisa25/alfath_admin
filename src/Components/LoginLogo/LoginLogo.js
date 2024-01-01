import { modena } from '../../Images';

const LoginLogo = () => {
    return (
        <div className='d-flex' style={{ height: '100%', flexDirection: 'column', justifyContent: "center" }}>
            <div className='text-center' style={{ color: 'white', width: "100%", position: "static"}}>
                <img src={modena} style={{ opacity: 0.85, width: '30%', filter: "invert(100%)"}} />
                <div style={{marginTop: "12px", display: "inline", borderLeft:"3px solid black", color: "black", marginLeft:"10px", padding: "16px 0 16px 10px"}}>
                    <i>Servicedesk Proxy</i>
                </div>
            </div>
            <div className='text-center' style={{ color: 'white', width: "60%", margin: "30px auto 0px auto", position: "static"}}>
            </div>
        </div>
    )
}

export default LoginLogo;