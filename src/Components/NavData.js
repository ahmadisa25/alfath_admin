import {FaChalkboardTeacher, FaHome} from 'react-icons/fa';
import { PiStudentBold } from "react-icons/pi";
import { BiChalkboard } from 'react-icons/bi';
import { GrAnnounce } from "react-icons/gr";

export const navData = [
    {
        id: 1,
        icon: <FaHome/>,
        text: "Home",
        permission: "dashboard",
        link: "/"
    },
    {
                id: 8,
                icon: <GrAnnounce/>,
                text: "Announcements",
                link: "/announcements",
                permission: ""
    },
    {
        id: 3,
        icon: <BiChalkboard/>,
        text: "Courses",
        link: "/courses",
        permission: ""
    },
    {
                id: 7,
                icon: <FaChalkboardTeacher/>,
                text: "Instructors",
                permission: "",
                link: "/instructors"
    },
  {
                id: 66,
                icon: <PiStudentBold/>,
                text: "Students",
                link: "students",
                permission: ""
            },
]
