import { Button, ButtonSize, ButtonStyle } from "@components/primitives";
import { Heading, Text } from "@radix-ui/themes";
import Link from "next/link";

type DonationOption = {
    title: string;
    buttonName: string;
    link: string;
    description: string;
}
export default function Donate2() {
    const donationOptions: DonationOption[] = [
        { title: "Where Most Needed", buttonName: "Where Most Needed", link: "https://give-can.keela.co/where-most-needed", description: "Allow Kinship to allocate your donation to where its most needed right now" },
        { title: "Remembrance Of Loved Ones, Qurbani, Fidya, Sadaqa", buttonName: "Remembrance", link: "https://give-can.keela.co/remembrance", description: "Donations to Kinship Canada are charitable gifts made for loved ones who have passed away or have difficulty with the request that they be remembered through Quranic recitations($30), yearly prayers ($300), or fasting ($200) in their honour. For those that want to slaughter/qurbani a goat to donate the meat ($200), fidya ($60 per month), sadaqa ($open dollar amount). Please specify in description the details of what the intention is." },
        { title: "Threads Of Opportunity Initiative", buttonName: "Threads Of Opportunity", link: "https://give-can.keela.co/threads-of-opportunity", description: "We want to break the cycle of poverty and are trying to get families to sustain themselves. Projects like sewing machines ($200), vegetabele/food carts ($235), scholarship/Education aid($334 per course), battery rickshaw/taxi ($2835), bicycle for students($100), Water pumps for home($350) water pump for public place ($650)." },
        { title: "Housing, Schools, And Community Centers", buttonName: "Housing, Schools, And Community Centers", link: "https://give-can.keela.co/housing-schools-and-community-centers", description: "These are big projects that usually require pooling of donors. If you have a desire to build something, please contact us and will pool with others on the same wish list. We have build many schools, houses and community centres over the years in the memory of lost ones or as a legacy." },
        { title: "Poverty Relief", buttonName: "Poverty Relief", link: "https://give-can.keela.co/poverty-relief", description: "Covers general needs of those in poverty or in extreme situation of needs, such as emergency such as medical relief, food & water, and more." },
        { title: "Orphans", buttonName: "Orphans", link: "https://give-can.keela.co/orphans", description: "Orphans are in supported many regions. Costs vary according the locale. We try to pool the monies and support as many as we can. This gives you the opportunity to do as much as you can afford whilst collectively having maximum impact. Typical cost per student per year is $1400 which includes education, lodging, etc" },
    ]
    return (
        <div className="flex flex-col items-center justify-center py-8 space-y-8 px-8">
            <Heading>Choose A Cause To Donate To</Heading>
            <p className="text-center text-gray-600">Choose one of the below causes to donate to. For support please contact us at <Link href="mailto:dh151214@gmail.com"><span className="text-blue-500 underline">dh151214@gmail.com</span></Link>. If you can prefer to donate by etransfer, please send the etransfer to <Link href="mailto:info@kinshipcanada.com"><span className="text-blue-500 underline">info@kinshipcanada.com</span></Link>, and email dh151214@gmail.com or info@kinshipcanada.com specifying where you want your donation to go.</p>
            {donationOptions.map((option) => (
                <div className="w-full" key={option.title}>
                    <div className="flex justify-between items-center w-full">
                        <span className="flex flex-col space-y-4 max-w-[50%]">
                            <Text size={"5"}>{option.title}</Text>
                            <Text className="line-clamp-3">{option.description}</Text>
                        </span>
                        <span className="flex items-center flex-1 ml-8">
                            <div className="border-t-2 border-dashed border-gray-300 w-full" />
                            <span className="ml-4 cursor-pointer flex whitespace-nowrap">
                                <Button
                                    text = {option.buttonName}
                                    href = {option.link}
                                    style={ButtonStyle.Primary}
                                    size={ButtonSize.Standard}
                                />
                            </span>
                        </span>
                    </div>
                </div>
            ))}

            
        </div>
    )
}