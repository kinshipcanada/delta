import { classNames } from "../../system/utils/helpers"
import { Tab } from '@headlessui/react'
import { Fragment } from "react";
import { TabsProps } from "./types";

export const Tabs: React.FC<TabsProps> = ({ tabs }) => {
    return (
        <Tab.Group>
        <Tab.List className="flex space-x-4">
            {tabs.map((tab, tabIdx)=>(
                <Tab as={Fragment} key={tabIdx}>
                    {({ selected }) => (
                        <button
                            className={
                                classNames(
                                    selected ? 'outline-none bg-gray-100 text-gray-700 border' : 'text-gray-500 hover:text-gray-700',
                                    'rounded-md px-3 py-2 text-sm font-medium'
                                )
                            }
                        >
                            {tab.name}
                        </button>
                    )}
                </Tab>
            ))}
        </Tab.List>
        <Tab.Panels>
            {tabs.map((tab, tabIdx)=>(
                <Tab.Panel key={tabIdx}>
                    {tab.component}
                </Tab.Panel>
            ))}
        </Tab.Panels>
        </Tab.Group>
    )
}