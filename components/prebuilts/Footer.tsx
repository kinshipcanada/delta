import React from 'react';
import { AnyText } from '../primitives/Typography';
import { TextColor } from '../primitives/types';

const Footer = () => {
    return (
        <footer className='z-50 bg-white bottom-0'>
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8 flex justify-center text-center">
                <div className="mt-8 md:mt-0 md:order-1 flex justify-center text-center w-full">
                    <AnyText color={TextColor.LightSlate}>
                        &copy; Kinship Canada is a registered charity. Registration Number 855070728 RR 0001
                    </AnyText>
                </div>
            </div>
        </footer>
    )
}
export default Footer;
