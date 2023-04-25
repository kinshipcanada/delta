import React, { useState } from "react";
import { ButtonProps, ButtonStyle, LoadingColors, StandardIconSizing } from "./types";
import { Loading } from "./Loading";
import Link from "next/link";

const Button: React.FC<ButtonProps> = ({ text, style, onClick, href, isLoading = false, icon }) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const buttonStyle = style === ButtonStyle.Primary ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-200";

  const Component = href ? Link : "button";
  const handleClick = async () => {
    if (!isDisabled) {
      setIsDisabled(true);
      await onClick();
      setIsDisabled(false);
    }
  };

  return (
    <Component 
        href={href ? href : undefined}
        onClick={href ? undefined : handleClick} 
        disabled={isLoading || isDisabled}
    >
        <span className={`${buttonStyle} cursor-pointer flex justify-center transition delay-50 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}>
            {(icon && !isLoading) && <span className={StandardIconSizing}>{icon}</span>}
            {isLoading ? <Loading color = {style === ButtonStyle.Primary ? LoadingColors.White : LoadingColors.Slate} /> : null}
            {text}
        </span>
    </Component>
  );
};

export default Button;
