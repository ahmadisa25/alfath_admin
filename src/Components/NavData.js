import {FaHome} from 'react-icons/fa';
import {MdOutlineFollowTheSigns, MdTrolley} from 'react-icons/md';
import {BsGearWideConnected} from 'react-icons/bs';
import {CgDanger} from 'react-icons/cg';

export const navData = [
    {
        id: 1,
        icon: <FaHome/>,
        text: "Home",
        permission: "dashboard",
        link: "/"
    },
    {
                id: 2,
                icon: <FaHome/>,
                text: "Home",
                permission: "requester-home",
                link: "/requester-home"
    },
    {
        id: 3,
        icon: <CgDanger/>,
        text: "Incidents",
        link: "incidents",
        permission: "incidents"
        /*child: [
                {
                        id: 3,
                        text: "Vendor/Supplier List",
                        link: "vendor",
                },
                {
                                id: 3,
                                text: "Selection",
                                link: "settings",
                },
                {
                                id: 3,
                                text: "Evaluation",
                                link: "settings",
                        },
                {
                                id: 3,
                                text: "Purchase Order",
                                link: "vendor-purchase",
                },
                {
                                id: 3,
                                text: "Goods Receive",
                                link: "good-receives",
                        },
                {
                                id: 3,
                                text: "AP Invoice",
                                link: "settings",
                },
                {
                                id: 3,
                                text: "Outgoing Payment",
                                link: "settings",
                }
        ]*/
    },
    {
                id: 7,
                icon: <MdTrolley/>,
                text: "Service Requests",
                permission: "services",
                link: "/service-requests"
    },
  {
                id: 66,
                icon: <MdOutlineFollowTheSigns/>,
                text: "Out of Office",
                link: "out-of-office",
                permission: "ooo"
            },
    {
        id: 3,
        icon: <BsGearWideConnected/>,
        text: "Configuration Setting",
        permission: "settings",
        child: [
                {
                                id: 4,
                                text: "Agent Management",
                                link: "agent-settings",
                },
                {
                                id: 5,
                                text: "Group Management",
                                link: "group-settings",
                },
                {
                                id: 26,
                                text: "SLA Management",
                                link: "sla-settings",
                },
                {
                                id: 15,
                                text: "Business Hours",
                                link: "business-hours",
                },
                {
                                id: 9,
                                text: "Categories",
                                link: "category-settings",
                },
                {
                                id: 16,
                                text: "Service Request Fields",
                                link: "service-request-fields",
                }
        ]
    }
]

export const guestNavData = [
            {
                id: 0,
                icon: <FaHome/>,
                text: "Home",
                link: "/"
            },
            {
                id: 1,
                icon: <CgDanger/>,
                text: "Incidents",
                link: "incidents"
                /*child: [
                        {
                                id: 3,
                                text: "Vendor/Supplier List",
                                link: "vendor",
                        },
                        {
                                        id: 3,
                                        text: "Selection",
                                        link: "settings",
                        },
                        {
                                        id: 3,
                                        text: "Evaluation",
                                        link: "settings",
                                },
                        {
                                        id: 3,
                                        text: "Purchase Order",
                                        link: "vendor-purchase",
                        },
                        {
                                        id: 3,
                                        text: "Goods Receive",
                                        link: "good-receives",
                                },
                        {
                                        id: 3,
                                        text: "AP Invoice",
                                        link: "settings",
                        },
                        {
                                        id: 3,
                                        text: "Outgoing Payment",
                                        link: "settings",
                        }
                ]*/
            },
        ]