import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { LargeIconSizing, EventColors, AlertProps } from "./types";
import React from "react";

export const Alert: React.FC<AlertProps> = ({ type, title, message }) => {

    const alertStyle = 
        type === EventColors.Success ? "bg-green-50 text-green-800" : 
        type === EventColors.Error ? "bg-red-50 text-red-800" : 
        type === EventColors.Warning ? "bg-yellow-50 text-yellow-800" : 
        type === EventColors.Info ? "bg-blue-50 text-blue-800" : 
        "text-white bg-slate-600";
    
    const alertSecondaryTextStyle = 
        type === EventColors.Success ? "text-green-700" :
        type === EventColors.Error ? "text-red-700" :
        type === EventColors.Warning ? "text-yellow-700" :
        type === EventColors.Info ? "text-blue-700" :
        "text-white";


    return (
        <div className={`rounded-md p-4 ${alertStyle}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    { type === EventColors.Success ? (
                        <CheckCircleIcon className={`${LargeIconSizing}`} />
                    ) : type === EventColors.Error ? (
                        <XCircleIcon className={`${LargeIconSizing}`} />
                    ) : type === EventColors.Warning ? (
                        <ExclamationTriangleIcon className={`${LargeIconSizing}`} />
                    ) : type === EventColors.Info ? (
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