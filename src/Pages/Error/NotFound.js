import React from 'react'
import { NavLink } from 'react-router-dom';
import styles from "./NotFound.module.css";

const NotFound = () => {
  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className={styles.error_template}>
                <h1>
                  Oops!</h1>
                <h2>
                  404 Not Found</h2>
                <div className={styles.error_details}>
                  Sorry, an error has occured, Requested page not found!
                </div>
                <div className={styles.error_actions}>
                  <NavLink to="/dashboard" className="btn btn-warning btn-lg">
                    <span className="glyphicon glyphicon-home"></span>
                    Take Me Home
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default NotFound