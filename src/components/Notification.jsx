import $ from "jquery";
import "bootstrap-notify";
import "animate.css";
import { 
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    BellIcon 
} from "@heroicons/react/24/outline";
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const Notification = {
    success: (message) => notify(message, "success", "check"),
    error: (message) => notify(message, "danger", "x"),
    warning: (message) => notify(message, "warning", "exclamation"),
    info: (message) => notify(message, "info", "bell"),
}

const notify = (message, type, iconName)=> {
    const colors = {
        success: {
            shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',  // green-500
            icon: 'text-green-500',
            border: 'border-green-500'
        },
        danger: {
            shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',  // red-500
            icon: 'text-red-500',
            border: 'border-red-500'
        },
        warning: {
            shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]',  // orange-500
            icon: 'text-orange-500',
            border: 'border-orange-500'
        },
        info: {
            shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',  // blue-500
            icon: 'text-blue-500',
            border: 'border-blue-500'
        }
    };

    $.notify(
        {
            icon: `heroicon-outline-${iconName}`,
            message: message,
        },
        {
            type: type,
            allow_dismiss: true,
            newest_on_top: true,
            z_index: 9999,
            placement: {
                from: "bottom",
                align: "right"
            },
            template: `
                <div class="fixed bottom-5 right-5 max-w-sm w-full">
                    <div class="flex items-center p-4 bg-white rounded-lg ${colors[type].shadow}">
                        <div class="flex-shrink-0 mr-3">
                             <i class="flex items-center justify-center w-8 h-8 rounded-full bg-white ${colors[type].icon} border-2 ${colors[type].border}" data-notify="icon"></i>
                        </div>
                        <div class="flex-1 text-sm font-medium text-gray-800" data-notify="message">{2}</div>
                    </div>
                </div>
            `,
            animate: {
                enter: "animate__animated animate__fadeInUp",
                exit: "animate__animated animate__fadeOutDown"
            },
            delay: 3000,
            spacing: 10,
            icon_type: "class",
            offset: 20,
            mouse_over: 'pause',
        }
    );
};

export default Notification;