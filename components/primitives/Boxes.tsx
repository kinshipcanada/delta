import React, { FC } from "react"

export const Box: FC<{ children: React.ReactNode}> = ({ children }) => {
    return <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">{ children }</div>
}

export const CenterOfPageBox: FC<{ children: React.ReactNode }> = ({ children }) => {
    return <div className="flex items-center justify-center">{ children }</div>
}