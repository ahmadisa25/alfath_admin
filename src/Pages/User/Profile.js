
import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import InitialIcon from '../../Components/InitialIcon';
import { uploadProfilePhoto } from '../../Service/UserService';
import { updateImage } from '../../Redux/Action/AuthAction';
import { useDispatch } from 'react-redux';
import { includes } from 'lodash';

const { $ } = window;
function Profile() {
    const dispatch = useDispatch();
    let { userInfo } = useSelector(state => state.auth);
    const is_null_url = includes(userInfo.profpic, "profpic/null");
    const [photo_upload, setPhotoUpload] = useState({
        img_upload:"",
        File:""
    });
    
    const onImageChange = (e) => {
        const [file] = e.target.files;
        
        if (file) {
            if((file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/jpg")){
                Swal.fire({
                    icon: 'error',
                    title: "That file extension is not allowed (only .png, .jpeg, or .jpg)"
                });
                return;
            } 
            if(file.size <=1000000){
                //listPayment.img_upload = URL.createObjectURL(file);
                //listPayment.File = file;
                let photo_obj = {};
                photo_obj.File = file;
                photo_obj.img_upload = URL.createObjectURL(file);
                setPhotoUpload(photo_obj);
                const formData = new FormData();
            formData.append("File", file);
                formData.append("img_upload", photo_obj.img_upload);
                uploadProfilePhoto(formData).then(res => {
                    if(res.status == 200){
                        Swal.fire({
                            icon: 'success',
                            title: "File upload success!"
                        }).then(() => {
                           dispatch(updateImage(res.data.data.image_url));
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: "File upload error. Please recheck your file type or file size!"
                        }); 
                    }
                }).catch(err => {
                    Swal.fire({
                        icon: 'error',
                        title: "File upload error"
                    }); 
                });
            } else{
                Swal.fire({
                    icon: 'error',
                    title: "The image size is too large"
                });
            }

        }
    }

    return (
        <div className="content-wrapper">
            <div className="row">
                <div className="col-lg-7" style={{marginBottom:"20px"}}>
                    <h4 className="page-title" style={{paddingLeft: 25}}>Profile</h4>
                </div>
                
            </div>
            <section className="content">
                <div className="container-fluid">
                <div className="row">
                            <div className="col-xl-4">
                                <div className="card mb-4 mb-xl-0" style={{border:"1px solid black"}}>
                                    <div className="card-header" style={{background:"#FAA819", color: "white"}}>Profile Picture</div>
                                    <div className="card-body text-center">
                                        {!photo_upload.img_upload && (!userInfo.profpic || is_null_url) && <div style={{display:"flex", justifyContent:"center", marginBottom:"30px"}}>
                                            <InitialIcon name={userInfo.fullname}></InitialIcon>
                                        </div>}
                                        {(photo_upload.img_upload || userInfo.profpic) && <img className="img-account-profile rounded-circle mb-2" src={photo_upload.img_upload || userInfo.profpic} alt="" />}
                                        <div className="small font-italic text-muted mb-4">JPG or PNG no larger than 1 MB</div>
                                        <button className="btn b2b-btn-add" type="button" onClick={()=> $('#profpic-upload').click()}>
                                                Upload a new image
                                        </button>
                                        <input id="profpic-upload" type="file" accept="image/png, image/jpg, image/jpeg" className='d-none'  onChange={(e) =>onImageChange(e)} required/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-8">
                                <div className="card mb-4" style={{border:"1px solid black"}}>
                                    <div className="card-header" style={{background:"#FAA819", color: "white"}}>Account Details</div>
                                    <div className="card-body">
                                        <form>
 
                                            <div className="row gx-3 mb-3">
                                                <div className="col-md-6">
                                                    <label className="small mb-1" for="user_id">Employee Number</label>
                                                    <input className="form-control" id="user_id" type="text" placeholder="" value={userInfo.userid || "--"} readOnly />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="small mb-1" for="inputUsername">Full Name</label>
                                                    <input className="form-control" id="inputUsername" type="text" placeholder="" value={userInfo.fullname} readOnly />
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="small mb-1" for="inputEmailAddress">Email address</label>
                                                <input className="form-control" id="inputEmailAddress" type="email" placeholder="" value={userInfo.email} readOnly />
                                            </div>
                                            <div className="row gx-3 mb-3">
                                                <div className="col-md-12">
                                                    <label className="small mb-1" for="inputPhone">Role</label>
                                                    <input className="form-control" id="inputPhone" type="tel" placeholder="" value={userInfo.role_name} readOnly/>
                                                </div>
                                            </div>
                                            {/* <button className="btn btn-primary" type="button">Save changes</button> */}
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>
            </section>
        </div>
    )
}

export default Profile