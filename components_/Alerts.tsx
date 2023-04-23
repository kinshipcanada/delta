import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { LargeIconSizing, AlertType, AlertProps } from "./types";
import React from "react";

export const Alert: React.FC<AlertProps> = ({ type, title, message }) => {

    const alertStyle = 
        type === AlertType.Success ? "bg-green-50 text-green-800" : 
        type === AlertType.Error ? "bg-red-50 text-red-800" : 
        type === AlertType.Warning ? "bg-yellow-50 text-yellow-800" : 
        type === AlertType.Info ? "bg-blue-50 text-blue-800" : 
        "text-white bg-slate-600";
    
    const alertSecondaryTextStyle = 
        type === AlertType.Success ? "text-green-700" :
        type === AlertType.Error ? "text-red-700" :
        type === AlertType.Warning ? "text-yellow-700" :
        type === AlertType.Info ? "text-blue-700" :
        "text-white";


    return (
        <div className={`rounded-md p-4 ${alertStyle}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    { type === AlertType.Success ? (
                        <CheckCircleIcon className={`${LargeIconSizing}`} />
                    ) : type === AlertType.Error ? (
                        <XCircleIcon className={`${LargeIconSizing}`} />
                    ) : type === AlertType.Warning ? (
                        <ExclamationTriangleIcon className={`${LargeIconSizing}`} />
                    ) : type === AlertType.Info ? (
                        <InformationCircleIcon className={`${LargeIconSizing}`} />
                    ) : (
                        <InformationCircleIcon className={`${LargeIconSizing}`} />
                    )}
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium">{ title ? title : "Error"}</h3>
                    <div className={`mt-2 text-sm ${alertSecondaryTextStyle}`}>
                        <p>{ message ? message : null }</p>
                    </div>
                </div>
            </div>
        </div>
    )
}