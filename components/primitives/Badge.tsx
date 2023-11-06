import { EventColors, BadgeProps, Style, BadgeSize } from "./types";
import React from "react";

export const Badge: React.FC<BadgeProps> = ({ color, style, text, borderEnabled = false, size = BadgeSize.Small }) => {

    const badgeColor = 
        color === EventColors.Success ? 
            ( style === Style.Filled ? "bg-green-50 text-green-700 ring-green-600/20" : "gap-x-1.5 text-gray-900 ring-gray-200") : 
        color === EventColors.Error ? 
            ( style === Style.Filled ? "bg-red-50 text-red-700 ring-red-600/10" : "gap-x-1.5 text-gray-900 ring-gray-200") :
        color === EventColors.Warning ? 
            ( style === Style.Filled ? "bg-yellow-50 text-yellow-800 ring-yellow-600/20" : "gap-x-1.5 text-gray-900 ring-gray-200") : 
        color === EventColors.Info ? 
            ( style === Style.Filled ? "bg-blue-100 text-blue-800 ring-blue-600/20" : "gap-x-1.5 text-gray-900 ring-gray-200") : 
        ( style === Style.Filled ? "bg-gray-50 text-gray-600 ring-gray-500/10" : "gap-x-1.5 text-gray-900 ring-gray-200");
    
    const badgeDotColor =
        color === EventColors.Success ? "fill-green-500" :
        color === EventColors.Error ? "fill-red-500" :
        color === EventColors.Warning ? "fill-yellow-500" :
        color === EventColors.Info ? "fill-blue-500" :
        "fill-gray-500";

    const badgeSize = size === BadgeSize.Small ? "px-2 py-1" : size === BadgeSize.Standard ? "px-2.5 py-0.5" : BadgeSize.Large ? "px-3 py-1" : "px-2 py-1";
    const badgeBorder = borderEnabled ? "border" : "";

    return (
        <span className={`inline-flex items-center rounded-md text-xs font-medium ring-1 ring-inset ${borderEnabled} ${badgeSize} ${badgeColor}`}>
            { style === Style.Outlined ? (
                <svg className={`h-1.5 w-1.5 ${badgeDotColor}`} viewBox="0 0 6 6" aria-hidden="true">
                    <circle cx={3} cy={3} r={3} />
                </svg>
            ) : null }
            { text }
        </span>
    )
}