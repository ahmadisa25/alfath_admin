import React, {Component} from 'react';

export default class Footer extends Component {
    render(){
        return (
            <footer className="sticky-footer bg-white">
                <div className="container my-auto">
                    <div className="copyright text-center my-auto">
                        <span>Copyright &copy; Modena 2023</span>
                    </div>
                </div>
            </footer>
            )
    }
}