import { Button, Heading } from "@radix-ui/themes";
import Link from "next/link";
export default function Donate2() {
    return (
        <div className="flex flex-col items-center justify-center py-8 space-y-8">
            <Heading>Choose A Cause To Donate To</Heading>
            <p className="text-center text-gray-600">Choose one of the below causes to donate to. For support please contact us at <Link href="mailto:dh151214@gmail.com"><span className="text-blue-500 underline">dh151214@gmail.com</span></Link></p>
                <Button>
                    <Link href="https://give-can.keela.co/where-most-needed">
                        Where Most Needed
                    </Link>
                </Button>
                <Button>
                    <Link href="https://give-can.keela.co/remembrance">
                        Donations For The Remembrance Of Loved Ones, Qurbani, Fidya, Sadaqa
                    </Link>
                </Button>
                <Button>
                    <Link href="https://give-can.keela.co/threads-of-opportunity">
                        Threads Of Opportunity Initiative
                    </Link>
                </Button>
                <Button>
                    <Link href="https://give-can.keela.co/housing-schools-and-community-centers">
                        Housing, Schools, And Community Centers
                    </Link>
                </Button>
                <Button>
                    <Link href="https://give-can.keela.co/poverty-relief">
                        Poverty Relief
                    </Link>
                </Button>
                <Button>
                    <Link href="https://give-can.keela.co/orphans">
                        Orphans
                    </Link>
                </Button>
        </div>
    )
}