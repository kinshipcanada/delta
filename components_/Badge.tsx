import { EventColors, BadgeProps, Style } from "./types";
import React from "react";

export const Badge: React.FC<BadgeProps> = ({ color, style, text }) => {

    const badgeColor = 
        color === EventColors.Success ? 
            ( style === Style.Filled ? "bg-green-50 text-green-700 ring-green-600/20" : "gap-x-1.5 text-gray-900 ring-gray-200") : 
        color === EventColors.Error ? 
            ( style === Style.Filled ? "bg-red-50 text-red-700 ring-red-600/10" : "gap-x-1.5 text-gray-900 ring-gray-200") :
        color === EventColors.Warning ? 
            ( style === Style.Filled ? "bg-yellow-50 text-yellow-800 ring-yellow-600/20" : "gap-x-1.5 text-gray-900 ring-gray-200") : 
        color === EventColors.Info ? 
            ( style === Style.Filled ? "bg-blue-50 text-blue-700 ring-blue-600/20" : "gap-x-1.5 text-gray-900 ring-gray-200") : 
        ( style === Style.Filled ? "bg-gray-50 text-gray-600 ring-gray-500/10" : "gap-x-1.5 text-gray-900 ring-gray-200");
    
    const badgeDotColor =
        color === EventColors.Success ? "fill-green-500" :
        color === EventColors.Error ? "fill-red-500" :
        color === EventColors.Warning ? "fill-yellow-500" :
        color === EventColors.Info ? "fill-blue-500" :
        "fill-gray-500";

    return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${badgeColor}`}>
            { style === Style.Outlined ? (
                <svg className={`h-1.5 w-1.5 ${badgeDotColor}`} viewBox="0 0 6 6" aria-hidden="true">
                    <circle cx={3} cy={3} r={3} />
                </svg>
            ) : null }
            { text }
        </span>
    )
}