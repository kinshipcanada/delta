import Link from "next/link";
import React from "react";
import { InlineLinkProps } from "./types";

export const InlineLink: React.FC<InlineLinkProps> = ({ href, text }) => {
    return <Link href={href}><span className="cursor-pointer hover:underline text-blue-600 font-medium hover:text-blue-800 delay-50">{ text }</span></Link>
}