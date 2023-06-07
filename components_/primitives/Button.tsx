import React, { useState } from "react";
import { ButtonProps, ButtonSize, ButtonStyle, LoadingColors, SpacerSize, StandardIconSizing } from "./types";
import { Loading } from "./Loading";
import Link from "next/link";
import { HorizontalSpacer } from "./Spacer";

const Button: React.FC<ButtonProps> = ({ text, style, onClick, href, isLoading = false, icon, setter, size }) => {
  const [isDisabled, setIsDisabled] = useState(false);

  const buttonSizing = 
    size === ButtonSize.Small ? "px-2.5 py-1.5 text-xs" : 
    size === ButtonSize.Large ? "px-3 py-2 text-sm" : 
    "px-4 py-2 text-sm"
  
  const filledButtonStyling = `${buttonSizing} justify-center transition delay-50 inline-flex border border-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
  const outlinedButtonStyling = "group px-3 py-2.5"

  const buttonStyle = 
    style === ButtonStyle.Primary ? ("border-blue-600 bg-blue-600 text-white hover:bg-blue-700 " + filledButtonStyling) :
    style === ButtonStyle.Secondary ? ("bg-white border-slate-300 text-slate-700 hover:bg-slate-200 " + filledButtonStyling) : 
    style == ButtonStyle.Disabled ? ("bg-gray-200 border-slate-300 text-slate-700 hover:bg-slate-200 " + filledButtonStyling) :
    style === ButtonStyle.OutlineSelected ? ("border border-slate-200 bg-slate-50 text-slate-800 " + outlinedButtonStyling) :
    ("text-gray-600 hover:bg-slate-50 hover:text-gray-900 " + outlinedButtonStyling)

  const Component = href ? Link : "button";
  const handleClick = async () => {
    if (!isDisabled) {
        if (setter) { setter(true) }
        setIsDisabled(true);
        await onClick();
        setIsDisabled(false);
        if (setter) { setter(false) }
    }
  };

  return (
    <Component 
      href={href ? href : undefined}
      onClick={href ? undefined : handleClick} 
      disabled={isLoading || isDisabled}
      className="inline-block"
    >
      <span className={`flex cursor-pointer items-center rounded-md font-medium text-sm ${buttonStyle}`}>
          {(icon && !isLoading) && <><span className={StandardIconSizing}>{icon}</span><HorizontalSpacer size={SpacerSize.Small} /></>}
          {isLoading ? <><Loading color = {style === ButtonStyle.Primary ? LoadingColors.White : LoadingColors.Slate} />{(icon || isLoading) && <HorizontalSpacer size={SpacerSize.Small} />}</> : null}
          { text }
      </span>
    </Component>
  );
};

export default Button;