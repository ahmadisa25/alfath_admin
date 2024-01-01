import { useEffect, useRef, useState } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useNavigate
} from "react-router-dom";
import MTable from '../../Components/MTable/MTable';
import { InputSwitch } from 'primereact/inputswitch';
import { Checkbox } from 'primereact/checkbox';
import { createUserV2, getRoles, getUserAll, getUserBranch, getUserById, getUserByUserIdV2, getUsersMI, getUsersSAP, getUserV2, updateUserV2 } from '../../Service/UserService';
import { useForm, Controller } from 'react-hook-form';
import Overlay from '../../Components/Overlay';
import Swal from 'sweetalert2';
import Select from "react-select";

const date = new Date();
const { $, setupDigitInput } = window;
const User = () => {

    const navigate = useNavigate();
    const { register, getValues, handleSubmit, reset, setValue, watch, control, formState: { errors }, clearErrors } = useForm({
        values: {
            user_id: (date.getYear() - 100) + ('' + (date.getMonth() + 1)).padStart(2, '0') + '.E_ _ _ _',
            user_sap_code: 2,
            user_name: '',
            user_password: '',
            user_branch: '',
            user_branch_name: '',
            user_role: '',
            user_role_name: '',
            user_email: '',
            user_enabled: true,
            job_title: '',
            work_location: '',
            supervisorid: '',
            organization_unit: '',
            job_status: '',
            cost_center: '',
            gender: '',
            phone: ''
        }
    });
    const tableUsers = useRef();
    const tableUser = useRef();
    const tableMHC = useRef();
    const user_password = useRef({});
    user_password.current = watch("user_password", "");
    const [state, setStates] = useState({
        id: 0,
        processing: false,
        isSelected: true,
        roles: [],
        supervisors: [],
        user_sap_code: '',
        user_sap_code_mhc: '',
        usersSAP: [],
        usersMI: [],
        user_id: (date.getYear() - 100) + ('' + (date.getMonth() + 1)).padStart(2, '0') + '.E_ _ _ _',
        isNew: false,
    })

    useEffect(() => {
        const requests = [
            getRoles({ perpage: 100, select: '_id,name', filter: 'is_active:true' }),
            getUsersMI({ perpage: 200 }).then(res => res.data),
            getUsersSAP({ perpage: 500 }).then(res => res.data)
        ];

        Promise.all(requests).then(response => {
            const [roleResponse, _usrMI, _usrSAP ] = response;
            const { data: { data } } = roleResponse;

            let _newUsrSAP = [];
            if(_usrSAP && _usrSAP.length)
                _newUsrSAP = _usrSAP.map(item => {
                    return {
                        label: item.SlpName,
                        value: item.SlpCode
                    }
                })

            let _newUsrMI = _usrMI.map(item => {
                return {
                    label: item.SlpName,
                    value: item.SlpCode
                }
            })

            setState({ roles: data, usersMI: _newUsrMI, usersSAP: _newUsrSAP });
        });
        setupDigitInput();
    }, [])

    const setState = value => {
        setStates({ ...state, ...value });
    }

    const onAddData = () => {
        reset({
            user_id: (date.getYear() - 100) + ('' + (date.getMonth() + 1)).padStart(2, '0') + '.E_ _ _ _',
            // user_sap_code: '',
            // user_sap_code_mhc: '',
            user_name: '',
            user_password: '',
            user_branch: '',
            user_branch_name: '',
            user_role: '',
            user_role_name: '',
            user_email: '',
            user_enabled: true,
            job_title: '',
            work_location: '',
            supervisorid: '',
            organization_unit: '',
            job_status: '',
            cost_center: '',
            gender: '',
            phone: ''
        });
        setState({ isNew: true });
        $("#modal-form").modal();
    }

    const onEdit = item => () => {
        getUserByUserIdV2(item.user_id).then(response => {
            setState({ id: item._id, isNew: false, 
                user_sap_code: response.data.user_sap_code, 
                user_sap_code_mhc: response.data.user_sap_code_mhc 
            });
            reset(response.data);
            $("#modal-form").modal();
        });
    };

    const onRoleChange = e => {
        const selectedRole = roles.find(x => x._id == e.target.value);
        setValue('user_role_name', selectedRole.name);
    };

    const onSelectSupervisor = item => () => {
        setValue('supervisorid', item.user_id);
        clearErrors('supervisorid');
        $('#modal-user').modal('hide');
    }

    const onSelectMHC = item => () => {
        setValue('user_branch', item.BPLId);
        setValue('user_branch_name', item.BPLFrName);
        clearErrors('user_branch_name');
        $('#modal-mhc').modal('hide');
    }

    const onShowUsersModal = () => {
        $('#modal-user').modal();
        tableUser.current.reset();
    }

    const onShowNHCModal = () => {
        $('#modal-mhc').modal();
        tableMHC.current.reset();
    }

    const onSubmit = (data) => {
        const {
            user_id, user_name, user_password, user_branch, user_branch_name,
            user_role, user_role_name, user_email, user_enabled, job_title,
            work_location, supervisorid, job_status, cost_center, gender, phone
        } = data;

        if(user_sap_code == ""){
            Swal.fire({
                icon: 'error',
                title: 'User SAP Required',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            return;
        }

        const payload = {
            user_id, user_sap_code,user_sap_code_mhc, user_name, user_password, user_branch, user_branch_name,
            user_role, user_role_name, user_email, user_enabled, job_title,
            work_location, supervisorid, job_status, cost_center, gender, phone
        };
        const request = isNew ? createUserV2(payload) : updateUserV2(id, payload);
        request.then(res => {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `${(isNew ? 'Create' : 'Update')} user success!`
            }).then(res => {
                $('#modal-form').modal('hide');
                tableUsers.current.refresh();

            });
        }).catch(({ response }) => {
            const { message } = response?.data;
            Swal.fire({
                icon: 'error',
                title: `${(isNew ? 'Create' : 'Update')} user error!`,
                text: message
            });
        }).finally(() => {
            setState({ processing: false })
        })
    }


    const columns = [
        { id: 1, title: 'User ID', field: 'user_id', sortable: true },
        { id: 2, title: 'Username', field: 'user_name', sortable: true },
        { id: 3, title: 'Email', field: 'user_email', sortable: true },
        { id: 4, title: 'Role', field: 'user_role_name', sortable: true },
        {
            id: 5,
            title: 'Active',
            field: 'user_enabled',
            sortable: true,
            options: [
                {
                    label: 'Active',
                    value: true
                },
                {
                    label: 'Inactive',
                    value: false
                }
            ],
            render: data => {
                return <InputSwitch checked={data.user_enabled} />;
            },
        },
        {
            id: 6,
            title: 'Action',
            render: item => {
                return (
                    <div style={{width:100}}>
                        <a
                            onClick={onEdit(item)}
                            style={{
                                cursor: 'pointer',
                                color: 'green',
                                display: 'inline-block',
                                marginRight: 20
                            }}
                        >
                            <i className="fas fa-edit" />
                            <span style={{ marginLeft: 10 }}>View</span>
                        </a>
                    </div>
                );
            },
        },
    ];

    const columnsUser = [
        { id: 1, title: 'User ID', field: 'user_id', sortable: true },
        { id: 2, title: 'Username', field: 'user_name', sortable: true },
        { id: 3, title: 'Email', field: 'user_email', sortable: true },
        { id: 4, title: 'Branch', field: 'user_branch_name', sortable: true },
        {
            id: 5,
            title: 'Action',
            render: item => {
                return (
                    <div>
                        <a
                            onClick={onSelectSupervisor(item)}
                            style={{
                                cursor: 'pointer',
                                color: 'green',
                                display: 'inline-block',
                                marginRight: 20
                            }}
                        >
                            <i className="fas fa-check" />
                            <span style={{ marginLeft: 10 }}>Select</span>
                        </a>
                    </div>
                );
            },
        },
    ];

    const columnsMHC = [
        { id: 2, title: 'MHC Name', field: 'BPLName', sortable: true },
        { id: 3, title: 'MHC Full Name', field: 'BPLFrName', sortable: true },
        { id: 4, title: 'City', field: 'City', sortable: true },
        {
            id: 5,
            title: 'Action',
            render: item => {
                return (
                    <div>
                        <a
                            onClick={onSelectMHC(item)}
                            style={{
                                cursor: 'pointer',
                                color: 'green',
                                display: 'inline-block',
                                marginRight: 20
                            }}
                        >
                            <i className="fas fa-check" />
                            <span style={{ marginLeft: 10 }}>Select</span>
                        </a>
                    </div>
                );
            },
        },
    ];
    
    const onChangeSAPCode = (e) => {
        setState({...state, user_sap_code_mhc: e.value})
    }

    const propsTable = { columns, getData: getUserV2, showIndex: true, showAddButton: true, onAddData };
    const propsTableUser = { columns: columnsUser, getData: getUserV2, showIndex: true };
    const propsTableMHC = { columns: columnsMHC, getData: getUserBranch, showIndex: true };
    const { roles, user_id, processing, id, isNew, usersMI, usersSAP, user_sap_code, user_sap_code_mhc } = state;

    return (
        <div className="content-wrapper">
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h2 className="title-breadcrum"> List User</h2>
                        </div>
                    </div>
                </div>
            </div>
            <section className="content">
                <div className="container-fluid">
                    <div className="card shadow mb-4">
                        <div className="card-body">
                            <div className='table-responsive'>
                                <MTable ref={tableUsers} {...propsTable} />
                            </div>
                        </div>
                    </div>

                    <div id="modal-form" className='modal fade'>
                        <Overlay display={state.processing} />
                        <form name="form-customer" onSubmit={handleSubmit(onSubmit)}>
                            <div className='modal-dialog modal-dialog-centered modal-lg' style={{ maxWidth: 1200 }}>
                                <div className='modal-content'>
                                    <div className='modal-header'>
                                        <h5 className="modal-title"> New User</h5>
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">×</span>
                                        </button>
                                    </div>
                                    <div className='modal-body' style={{ paddingLeft: 40 }}>
                                        <div className="row">
                                            <div className="col-md-5" >
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="form-group" >
                                                            <label htmlFor="">User ID</label>
                                                            <div className="form-control">{getValues('user_id')}</div>
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                            <div className="col-md-1"></div>
                                            <div className="col-md-5" >
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="form-group">
                                                            <label htmlFor="">Role</label>
                                                            <select className="form-control" {...register('user_role', { required: 'User role is required', onChange: onRoleChange })}>
                                                                <option value=''>--Select Role--</option>
                                                                {
                                                                    roles.map((item, i) => (<option key={`role-#${i}`} value={item._id} >{item.name}</option>))
                                                                }
                                                            </select>
                                                            {errors.user_role && <span className='text-danger' style={{ fontSize: 12 }}>{errors.user_role.message}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-5" >
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="form-group" >
                                                            <label htmlFor="">SAP Code (MHC)</label>
                                                            <Select
                                                                options={usersSAP}
                                                                onChange={onChangeSAPCode}
                                                                value={usersSAP.filter(function (option) {
                                                                    return option.value === user_sap_code_mhc;
                                                                })} />
                                                            
                                                            {errors.user_sap_code && <span className='text-danger' style={{ fontSize: 12 }}>{errors.user_sap_code.message}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-1"></div>
                                            <div className="col-md-5" >
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="form-group" >
                                                            <label htmlFor="">SAP Code (MODENA)</label>
                                                            <Select
                                                                options={usersMI}
                                                                onChange={(e) => setState({...state, user_sap_code: e.value})}
                                                                value={usersMI.filter(function (option) {
                                                                    return option.value === user_sap_code;
                                                                })} />
                                                            {errors.user_sap_code_mhc && <span className='text-danger' style={{ fontSize: 12 }}>{errors.user_sap_code_mhc.message}</span>}
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-5">
                                                <div className="form-group">
                                                    <label htmlFor="">User Name</label>
                                                    <input {...register('user_name', { required: 'User name is required' })} className="form-control" />
                                                    {errors.user_name && <span className='text-danger' style={{ fontSize: 12 }}>{errors.user_name.message}</span>}
                                                </div>
                                            </div>
                                            <div className="col-md-1"></div>
                                            <div className="col-md-5" >
                                                <div className="form-group">
                                                    <label htmlFor="">Supervisor</label>
                                                    <div className="input-group mb-3">
                                                        <input type="text" className="form-control" readOnly={true} {...register('supervisorid', { required: 'Supervisor is required' })} />
                                                        <div className="input-group-append">
                                                            <button className="btn btn-outline-secondary" type="button" onClick={onShowUsersModal}><i className="fa fa-search"></i></button>
                                                        </div>
                                                    </div>
                                                    {errors.supervisorid && <span className='text-danger' style={{ fontSize: 12 }}>{errors.supervisorid.message}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-5">
                                                <div className="form-group">
                                                    <label htmlFor="">Email</label>
                                                    <input {...register('user_email', { required: 'Email is required' })} className="form-control" />
                                                    {errors.user_email && <span className='text-danger' style={{ fontSize: 12 }}>{errors.user_email.message}</span>}
                                                </div>
                                            </div>
                                            <div className="col-md-1"></div>
                                            <div className="col-md-5" >
                                                <div className="form-group">
                                                    <label htmlFor="">Modena Home Center</label>
                                                    <div className="input-group mb-3">
                                                        <input type="text" className="form-control" readOnly={true} {...register('user_branch_name', { required: 'User branch is required' })} />
                                                        <div className="input-group-append">
                                                            <button className="btn btn-outline-secondary" type="button" onClick={onShowNHCModal}><i className="fa fa-search"></i></button>
                                                        </div>
                                                    </div>
                                                    {errors.user_branch_name && <span className='text-danger' style={{ fontSize: 12 }}>{errors.user_branch_name.message}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            isNew && (
                                                <div className="row">
                                                    <div className="col-md-5">
                                                        <div className="form-group">
                                                            <label htmlFor="">Password</label>
                                                            <input type="password" {...register('user_password', { required: 'Password is required' })} className="form-control" />
                                                            {errors.user_password && <span className='text-danger' style={{ fontSize: 12 }}>{errors.user_password.message}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-1"></div>
                                                    <div className="col-md-5">
                                                        <div className="form-group">
                                                            <label htmlFor="">Confirm Password</label>
                                                            <input type="password" {...register('confirm_password', { required: 'Confirm Passowrd is required', validate: val => val == user_password.current || 'Password is not match' })} className="form-control" />
                                                            {errors.confirm_password && <span className='text-danger' style={{ fontSize: 12 }}>{errors.confirm_password.message}</span>}
                                                        </div>
                                                    </div>

                                                </div>
                                            )
                                        }
                                        <div className="row">
                                            <div className="col-md-5">
                                                <div className="form-group">
                                                    <label htmlFor="">Gender</label>
                                                    <select name="gender" {...register('gender')} className="form-control">
                                                        <option>--Select MHC--</option>
                                                        <option value="MALE">MALE</option>
                                                        <option value="FEMALE">FEMALE</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-1"></div>
                                            <div className="col-md-5">
                                                <div className="form-group">
                                                    <label htmlFor="">Work Location</label>
                                                    <div>
                                                        <input name="work_location" {...register('work_location', { required: 'Work location is required' })} className="form-control" />
                                                        {errors.work_location && <span className='text-danger' style={{ fontSize: 12 }}>{errors.work_location.message}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                        <div className="row">
                                            <div className="col-md-5">
                                                <div className="form-group">
                                                    <label htmlFor="">Job Title</label>
                                                    <input {...register('job_title', { required: 'Job title is required' })} name="job_title" className="form-control" />
                                                    {errors.job_title && <span className='text-danger' style={{ fontSize: 12 }}>{errors.job_title.message}</span>}
                                                </div>
                                            </div>
                                            <div className="col-md-1"></div>
                                            <div className="col-md-5">
                                                <div className="form-group">
                                                    <label htmlFor="">Default Warehouse</label>
                                                    <div className="form-control">Warehouse Stock</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-5">
                                                <div className="form-group">
                                                    <label htmlFor="">Job Status</label>
                                                    <input name="job_status" {...register('job_status')} className="form-control" />
                                                </div>
                                            </div>
                                            <div className="col-md-1"></div>
                                            <div className="col-md-5">
                                                <div className="form-group">
                                                    <label htmlFor="">Cost Center</label>
                                                    <div>
                                                        <input name="cost_center" {...register('cost_center')} className="form-control" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">

                                            <div className="col-md-5">
                                                <div className="form-group">
                                                    <label htmlFor="">Phone</label>
                                                    <div>
                                                        <input name="phone" {...register('phone')} className="form-control" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-1"></div>
                                            <div className="col-md-5">
                                                <div className="form-group">
                                                    <label htmlFor="">Active</label>
                                                    <div>
                                                        <Controller name="user_enabled" control={control} render={({ field }) => { return (<InputSwitch {...field} checked={field.value} />) }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="modal-footer">
                                        <button type='button' className='btn btn-outline-secondary' style={{ width: 150 }} data-dismiss="modal"><i className="fa fa-times"></i> Cancel</button>
                                        {
                                            (!false) && <button className='btn btn-dark' style={{ width: 150 }}><i className="fa fa-save"></i> Save</button>
                                        }
                                    </div>

                                </div>
                            </div>
                        </form>
                    </div>

                    {/***Modal Select User */}
                    <div id="modal-user" className='modal fade'>
                        <div className="modal-dialog modal-lg" style={{ maxWidth: 1000 }}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title"> Select Supervisor</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <MTable ref={tableUser} {...propsTableUser} />
                                </div>
                                <div className="modal-footer">
                                    <button type='button' className='btn btn-outline-secondary' style={{ width: 150 }} data-dismiss="modal"><i className="fa fa-times"></i> Close</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/***Modal Select MHC */}
                    <div id="modal-mhc" className='modal fade'>
                        <div className="modal-dialog modal-lg" style={{ maxWidth: 1000 }}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title"> Select MHC</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <MTable ref={tableMHC} {...propsTableMHC} />
                                </div>
                                <div className="modal-footer">
                                    <button type='button' className='btn btn-outline-secondary' style={{ width: 150 }} data-dismiss="modal"><i className="fa fa-times"></i> Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

};

export default User;