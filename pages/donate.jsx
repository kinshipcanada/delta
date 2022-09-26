import { RadioGroup } from "@headlessui/react";
import { ChevronRightIcon, LockClosedIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { PrimaryButton } from "../components/core/Buttons";
import Loading from "../components/core/Loading";

const causes = [
    {
        cause_id: 0,
        name: "Anywhere",
        description: "I'd like my donation to be allocated wherever it's needed most right now.",
        default_selected: true
    },
    {
        cause_id: 1,
        name: "Complete Care For Orphan",
        description: "Provide shelter, meals, and education for an orphan",
        default_selected: false
    },
    {
        cause_id: 2,
        name: "Education",
        description: "Help a deserving child afford their tuition",
        default_selected: false
    }
]

const countries = [
  {"name": "Canada", "code": "CA"}, 
  {"name": "United States", "code": "US"}, 
  {"name": "Afghanistan", "code": "AF"}, 
  {"name": "land Islands", "code": "AX"}, 
  {"name": "Albania", "code": "AL"}, 
  {"name": "Algeria", "code": "DZ"}, 
  {"name": "American Samoa", "code": "AS"}, 
  {"name": "AndorrA", "code": "AD"}, 
  {"name": "Angola", "code": "AO"}, 
  {"name": "Anguilla", "code": "AI"}, 
  {"name": "Antarctica", "code": "AQ"}, 
  {"name": "Antigua and Barbuda", "code": "AG"}, 
  {"name": "Argentina", "code": "AR"}, 
  {"name": "Armenia", "code": "AM"}, 
  {"name": "Aruba", "code": "AW"}, 
  {"name": "Australia", "code": "AU"}, 
  {"name": "Austria", "code": "AT"}, 
  {"name": "Azerbaijan", "code": "AZ"}, 
  {"name": "Bahamas", "code": "BS"}, 
  {"name": "Bahrain", "code": "BH"}, 
  {"name": "Bangladesh", "code": "BD"}, 
  {"name": "Barbados", "code": "BB"}, 
  {"name": "Belarus", "code": "BY"}, 
  {"name": "Belgium", "code": "BE"}, 
  {"name": "Belize", "code": "BZ"}, 
  {"name": "Benin", "code": "BJ"}, 
  {"name": "Bermuda", "code": "BM"}, 
  {"name": "Bhutan", "code": "BT"}, 
  {"name": "Bolivia", "code": "BO"}, 
  {"name": "Bosnia and Herzegovina", "code": "BA"}, 
  {"name": "Botswana", "code": "BW"}, 
  {"name": "Bouvet Island", "code": "BV"}, 
  {"name": "Brazil", "code": "BR"}, 
  {"name": "British Indian Ocean Territory", "code": "IO"}, 
  {"name": "Brunei Darussalam", "code": "BN"}, 
  {"name": "Bulgaria", "code": "BG"}, 
  {"name": "Burkina Faso", "code": "BF"}, 
  {"name": "Burundi", "code": "BI"}, 
  {"name": "Cambodia", "code": "KH"}, 
  {"name": "Cameroon", "code": "CM"}, 
  {"name": "Cape Verde", "code": "CV"}, 
  {"name": "Cayman Islands", "code": "KY"}, 
  {"name": "Central African Republic", "code": "CF"}, 
  {"name": "Chad", "code": "TD"}, 
  {"name": "Chile", "code": "CL"}, 
  {"name": "China", "code": "CN"}, 
  {"name": "Christmas Island", "code": "CX"}, 
  {"name": "Cocos (Keeling) Islands", "code": "CC"}, 
  {"name": "Colombia", "code": "CO"}, 
  {"name": "Comoros", "code": "KM"}, 
  {"name": "Congo", "code": "CG"}, 
  {"name": "Congo, The Democratic Republic of the", "code": "CD"}, 
  {"name": "Cook Islands", "code": "CK"}, 
  {"name": "Costa Rica", "code": "CR"}, 
  {"name": "Cote D'Ivoire", "code": "CI"}, 
  {"name": "Croatia", "code": "HR"}, 
  {"name": "Cuba", "code": "CU"}, 
  {"name": "Cyprus", "code": "CY"}, 
  {"name": "Czech Republic", "code": "CZ"}, 
  {"name": "Denmark", "code": "DK"}, 
  {"name": "Djibouti", "code": "DJ"}, 
  {"name": "Dominica", "code": "DM"}, 
  {"name": "Dominican Republic", "code": "DO"}, 
  {"name": "Ecuador", "code": "EC"}, 
  {"name": "Egypt", "code": "EG"}, 
  {"name": "El Salvador", "code": "SV"}, 
  {"name": "Equatorial Guinea", "code": "GQ"}, 
  {"name": "Eritrea", "code": "ER"}, 
  {"name": "Estonia", "code": "EE"}, 
  {"name": "Ethiopia", "code": "ET"}, 
  {"name": "Falkland Islands (Malvinas)", "code": "FK"}, 
  {"name": "Faroe Islands", "code": "FO"}, 
  {"name": "Fiji", "code": "FJ"}, 
  {"name": "Finland", "code": "FI"}, 
  {"name": "France", "code": "FR"}, 
  {"name": "French Guiana", "code": "GF"}, 
  {"name": "French Polynesia", "code": "PF"}, 
  {"name": "French Southern Territories", "code": "TF"}, 
  {"name": "Gabon", "code": "GA"}, 
  {"name": "Gambia", "code": "GM"}, 
  {"name": "Georgia", "code": "GE"}, 
  {"name": "Germany", "code": "DE"}, 
  {"name": "Ghana", "code": "GH"}, 
  {"name": "Gibraltar", "code": "GI"}, 
  {"name": "Greece", "code": "GR"}, 
  {"name": "Greenland", "code": "GL"}, 
  {"name": "Grenada", "code": "GD"}, 
  {"name": "Guadeloupe", "code": "GP"}, 
  {"name": "Guam", "code": "GU"}, 
  {"name": "Guatemala", "code": "GT"}, 
  {"name": "Guernsey", "code": "GG"}, 
  {"name": "Guinea", "code": "GN"}, 
  {"name": "Guinea-Bissau", "code": "GW"}, 
  {"name": "Guyana", "code": "GY"}, 
  {"name": "Haiti", "code": "HT"}, 
  {"name": "Heard Island and Mcdonald Islands", "code": "HM"}, 
  {"name": "Holy See (Vatican City State)", "code": "VA"}, 
  {"name": "Honduras", "code": "HN"}, 
  {"name": "Hong Kong", "code": "HK"}, 
  {"name": "Hungary", "code": "HU"}, 
  {"name": "Iceland", "code": "IS"}, 
  {"name": "India", "code": "IN"}, 
  {"name": "Indonesia", "code": "ID"}, 
  {"name": "Iran, Islamic Republic Of", "code": "IR"}, 
  {"name": "Iraq", "code": "IQ"}, 
  {"name": "Ireland", "code": "IE"}, 
  {"name": "Isle of Man", "code": "IM"}, 
  {"name": "Israel", "code": "IL"}, 
  {"name": "Italy", "code": "IT"}, 
  {"name": "Jamaica", "code": "JM"}, 
  {"name": "Japan", "code": "JP"}, 
  {"name": "Jersey", "code": "JE"}, 
  {"name": "Jordan", "code": "JO"}, 
  {"name": "Kazakhstan", "code": "KZ"}, 
  {"name": "Kenya", "code": "KE"}, 
  {"name": "Kiribati", "code": "KI"}, 
  {"name": "Korea, Democratic Peoples Republic of", "code": "KP"}, 
  {"name": "Korea, Republic of", "code": "KR"}, 
  {"name": "Kuwait", "code": "KW"}, 
  {"name": "Kyrgyzstan", "code": "KG"}, 
  {"name": "Lao Peoples Democratic Republic", "code": "LA"}, 
  {"name": "Latvia", "code": "LV"}, 
  {"name": "Lebanon", "code": "LB"}, 
  {"name": "Lesotho", "code": "LS"}, 
  {"name": "Liberia", "code": "LR"}, 
  {"name": "Libyan Arab Jamahiriya", "code": "LY"}, 
  {"name": "Liechtenstein", "code": "LI"}, 
  {"name": "Lithuania", "code": "LT"}, 
  {"name": "Luxembourg", "code": "LU"}, 
  {"name": "Macao", "code": "MO"}, 
  {"name": "Macedonia, The Former Yugoslav Republic of", "code": "MK"}, 
  {"name": "Madagascar", "code": "MG"}, 
  {"name": "Malawi", "code": "MW"}, 
  {"name": "Malaysia", "code": "MY"}, 
  {"name": "Maldives", "code": "MV"}, 
  {"name": "Mali", "code": "ML"}, 
  {"name": "Malta", "code": "MT"}, 
  {"name": "Marshall Islands", "code": "MH"}, 
  {"name": "Martinique", "code": "MQ"}, 
  {"name": "Mauritania", "code": "MR"}, 
  {"name": "Mauritius", "code": "MU"}, 
  {"name": "Mayotte", "code": "YT"}, 
  {"name": "Mexico", "code": "MX"}, 
  {"name": "Micronesia, Federated States of", "code": "FM"}, 
  {"name": "Moldova, Republic of", "code": "MD"}, 
  {"name": "Monaco", "code": "MC"}, 
  {"name": "Mongolia", "code": "MN"}, 
  {"name": "Montenegro", "code": "ME"},
  {"name": "Montserrat", "code": "MS"},
  {"name": "Morocco", "code": "MA"}, 
  {"name": "Mozambique", "code": "MZ"}, 
  {"name": "Myanmar", "code": "MM"}, 
  {"name": "Namibia", "code": "NA"}, 
  {"name": "Nauru", "code": "NR"}, 
  {"name": "Nepal", "code": "NP"}, 
  {"name": "Netherlands", "code": "NL"}, 
  {"name": "Netherlands Antilles", "code": "AN"}, 
  {"name": "New Caledonia", "code": "NC"}, 
  {"name": "New Zealand", "code": "NZ"}, 
  {"name": "Nicaragua", "code": "NI"}, 
  {"name": "Niger", "code": "NE"}, 
  {"name": "Nigeria", "code": "NG"}, 
  {"name": "Niue", "code": "NU"}, 
  {"name": "Norfolk Island", "code": "NF"}, 
  {"name": "Northern Mariana Islands", "code": "MP"}, 
  {"name": "Norway", "code": "NO"}, 
  {"name": "Oman", "code": "OM"}, 
  {"name": "Pakistan", "code": "PK"}, 
  {"name": "Palau", "code": "PW"}, 
  {"name": "Palestinian Territory, Occupied", "code": "PS"}, 
  {"name": "Panama", "code": "PA"}, 
  {"name": "Papua New Guinea", "code": "PG"}, 
  {"name": "Paraguay", "code": "PY"}, 
  {"name": "Peru", "code": "PE"}, 
  {"name": "Philippines", "code": "PH"}, 
  {"name": "Pitcairn", "code": "PN"}, 
  {"name": "Poland", "code": "PL"}, 
  {"name": "Portugal", "code": "PT"}, 
  {"name": "Puerto Rico", "code": "PR"}, 
  {"name": "Qatar", "code": "QA"}, 
  {"name": "Reunion", "code": "RE"}, 
  {"name": "Romania", "code": "RO"}, 
  {"name": "Russian Federation", "code": "RU"}, 
  {"name": "RWANDA", "code": "RW"}, 
  {"name": "Saint Helena", "code": "SH"}, 
  {"name": "Saint Kitts and Nevis", "code": "KN"}, 
  {"name": "Saint Lucia", "code": "LC"}, 
  {"name": "Saint Pierre and Miquelon", "code": "PM"}, 
  {"name": "Saint Vincent and the Grenadines", "code": "VC"}, 
  {"name": "Samoa", "code": "WS"}, 
  {"name": "San Marino", "code": "SM"}, 
  {"name": "Sao Tome and Principe", "code": "ST"}, 
  {"name": "Saudi Arabia", "code": "SA"}, 
  {"name": "Senegal", "code": "SN"}, 
  {"name": "Serbia", "code": "RS"}, 
  {"name": "Seychelles", "code": "SC"}, 
  {"name": "Sierra Leone", "code": "SL"}, 
  {"name": "Singapore", "code": "SG"}, 
  {"name": "Slovakia", "code": "SK"}, 
  {"name": "Slovenia", "code": "SI"}, 
  {"name": "Solomon Islands", "code": "SB"}, 
  {"name": "Somalia", "code": "SO"}, 
  {"name": "South Africa", "code": "ZA"}, 
  {"name": "South Georgia and the South Sandwich Islands", "code": "GS"}, 
  {"name": "Spain", "code": "ES"}, 
  {"name": "Sri Lanka", "code": "LK"}, 
  {"name": "Sudan", "code": "SD"}, 
  {"name": "Suriname", "code": "SR"}, 
  {"name": "Svalbard and Jan Mayen", "code": "SJ"}, 
  {"name": "Swaziland", "code": "SZ"}, 
  {"name": "Sweden", "code": "SE"}, 
  {"name": "Switzerland", "code": "CH"}, 
  {"name": "Syrian Arab Republic", "code": "SY"}, 
  {"name": "Taiwan, Province of China", "code": "TW"}, 
  {"name": "Tajikistan", "code": "TJ"}, 
  {"name": "Tanzania, United Republic of", "code": "TZ"}, 
  {"name": "Thailand", "code": "TH"}, 
  {"name": "Timor-Leste", "code": "TL"}, 
  {"name": "Togo", "code": "TG"}, 
  {"name": "Tokelau", "code": "TK"}, 
  {"name": "Tonga", "code": "TO"}, 
  {"name": "Trinidad and Tobago", "code": "TT"}, 
  {"name": "Tunisia", "code": "TN"}, 
  {"name": "Turkey", "code": "TR"}, 
  {"name": "Turkmenistan", "code": "TM"}, 
  {"name": "Turks and Caicos Islands", "code": "TC"}, 
  {"name": "Tuvalu", "code": "TV"}, 
  {"name": "Uganda", "code": "UG"}, 
  {"name": "Ukraine", "code": "UA"}, 
  {"name": "United Arab Emirates", "code": "AE"}, 
  {"name": "United Kingdom", "code": "GB"}, 
  {"name": "United States Minor Outlying Islands", "code": "UM"}, 
  {"name": "Uruguay", "code": "UY"}, 
  {"name": "Uzbekistan", "code": "UZ"}, 
  {"name": "Vanuatu", "code": "VU"}, 
  {"name": "Venezuela", "code": "VE"}, 
  {"name": "Viet Nam", "code": "VN"}, 
  {"name": "Virgin Islands, British", "code": "VG"}, 
  {"name": "Virgin Islands, U.S.", "code": "VI"}, 
  {"name": "Wallis and Futuna", "code": "WF"}, 
  {"name": "Western Sahara", "code": "EH"}, 
  {"name": "Yemen", "code": "YE"}, 
  {"name": "Zambia", "code": "ZM"}, 
  {"name": "Zimbabwe", "code": "ZW"} 
]

const canadian_states = [
	{
		"name": "Alberta",
		"code": "CA-AB",
		"subdivision": "province",
		"native": "Alberta"
	},
	{
		"name": "British Columbia",
		"code": "CA-BC",
		"subdivision": "province",
		"native": "Colombie-Britannique"
	},
	{
		"name": "Manitoba",
		"code": "CA-MB",
		"subdivision": "province",
		"native": "Manitoba"
	},
	{
		"name": "New Brunswick",
		"code": "CA-NB",
		"subdivision": "province",
		"native": "Nouveau-Brunswick"
	},
	{
		"name": "Newfoundland and Labrador",
		"code": "CA-NL",
		"subdivision": "province",
		"native": "Terre-Neuve-et-Labrador"
	},
	{
		"name": "Nova Scotia",
		"code": "CA-NS",
		"subdivision": "province",
		"native": "Nouvelle-Écosse"
	},
	{
		"name": "Ontario",
		"code": "CA-ON",
		"subdivision": "province",
		"native": "Ontario"
	},
	{
		"name": "Prince Edward Island",
		"code": "CA-PE",
		"subdivision": "province",
		"native": "Île-du-Prince-Édouard"
	},
	{
		"name": "Quebec",
		"code": "CA-QC",
		"subdivision": "province",
		"native": "Québec"
	},
	{
		"name": "Saskatchewan",
		"code": "CA-SK",
		"subdivision": "province",
		"native": "Saskatchewan"
	},
	{
		"name": "Northwest Territories",
		"code": "CA-NT",
		"subdivision": "territory",
		"native": "Territoires du Nord-Ouest"
	},
	{
		"name": "Nunavut",
		"code": "CA-NU",
		"subdivision": "territory",
		"native": "Nunavut"
	},
	{
		"name": "Yukon",
		"code": "CA-YT",
		"subdivision": "territory",
		"native": "Yukon"
	}
]

export default function Donate() {

    const [active_step, set_active_step] = useState(0)
    const [loading, setLoading] = useState(false)
    const [stepError, setStepError] = useState(null)

    const [amount, set_amount] = useState(0.00)
    const [amountError, setAmountError] = useState(null)

    const [email, set_email] = useState(null)
    const [name_on_card, set_name_on_card] = useState(null)
    const [address, set_address] = useState(null)
    const [suite, set_suite] = useState(null)
    const [country, set_country] = useState(countries[0])
    const [city, set_city] = useState(null)
    const [state_or_province, set_state_or_province] = useState(canadian_states[6])

    const [selected_causes, set_selected_causes] = useState([causes[0]])

    const steps = [
        { name: 'Choose Amount', href: '#' },
        { name: 'Billing Information', href: '#' },
        { name: 'Confirmation', href: '#' },
    ]

    function process_step_completion() {
        setLoading(true)

        switch (active_step) {
            case 0: 
                if (selected_causes.length > 0 && amount > 0) {
                    setStepError(null)
                    set_active_step(1)
                } else {

                    if (!(amount > 0)) {
                        setStepError("Donation needs to be at least $0.01")
                    } else if (selected_causes.length == 0) {
                        setStepError("Please select at least one cause to donate to")
                    } else {
                        setStepError("Unknown error, please contact info@kinshipcanada.com")
                    }
                }
                break;
            case 1:
                console.log("Second")
                break;
            default:
                break;
        }
        setLoading(false)
    }

    return (
        <div className="bg-white">

            <header className="relative border-b border-gray-200 bg-white text-sm font-medium text-gray-700 z-10">
                <div className="mx-auto max-w-7xl py-4 px-4 sm:px-6 lg:px-8">
                <div className="relative flex justify-end sm:justify-center">
                    <nav aria-label="Progress" className="hidden sm:block">
                    <ol role="list" className="flex space-x-4">
                        {steps.map((step, stepIdx) => (
                        <li key={step.name} className="flex items-center">
                            {stepIdx == active_step ? (
                            <a href={step.href} aria-current="page" className="text-blue-600">
                                {step.name}
                            </a>
                            ) : (
                            <a href={step.href}>{step.name}</a>
                            )}

                            {stepIdx !== steps.length - 1 ? (
                            <ChevronRightIcon className="ml-4 h-5 w-5 text-gray-300" aria-hidden="true" />
                            ) : null}
                        </li>
                        ))}
                    </ol>
                    </nav>
                    <p className="sm:hidden">Step 2 of 4</p>
                </div>
                </div>
            </header>
            <div className="fixed left-0 hidden h-full w-1/2 bg-white lg:block" aria-hidden="true" />
            <div className="fixed right-0 top-0 z-5 hidden h-full w-1/2 bg-blue-900 lg:block" aria-hidden="true" />
    
            <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8 lg:pt-16">
            <h1 className="sr-only">Donate</h1>

            

            <section
                aria-labelledby="summary-heading"
                className="bg-blue-900 py-12 text-blue-300 md:px-10 lg:col-start-2 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:bg-transparent lg:px-0 lg:pt-0"
            >
                <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
                <dl>
                    <dt className="text-sm font-medium">Your Donation</dt>
                    <dd className="mt-1 text-3xl font-bold tracking-tight text-white">{ amount ? <>${amount}</> : "$0.00" }</dd>
                    <dd className="flex text-white text-base font-medium my-4">Donating:
                    <p className="text-blue-300">
                        {selected_causes.map((cause, cause_index)=>(<>{cause_index === 0 ? <span className="ml-2">{cause.name}</span> : <span>, {cause.name}</span> }</>))}
                    </p>
                    </dd>
                </dl>
    

                <dl className="space-y-6 border-t border-white border-opacity-10 pt-6 text-sm font-medium">
                    <div className="flex items-center justify-between">
                    <dt>Subtotal</dt>
                    <dd>{ amount ? <>${amount}</> : "$0.00" }</dd>
                    </div>

                    <div className="flex items-center justify-between">
                    <dt>Eligible For Tax Receipt</dt>
                    <dd>{ amount ? <>${amount}</> : "$0.00" }</dd>
                    </div>
    
                    <div className="flex items-center justify-between">
                    <dt>Fees Covered</dt>
                    <dd>$0.00</dd>
                    </div>
    
                    <div className="flex items-center justify-between border-t border-white border-opacity-10 pt-6 text-white">
                        <dt className="text-base">Total</dt>
                        <dd className="text-base">{ amount ? <>${amount}</> : "$0.00" }</dd>
                    </div>
                </dl>
                </div>
            </section>
    
            <section
                className="py-16 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:pt-0 "
            >
                

                <form onSubmit={(e)=>{
                    e.preventDefault();
                    process_step_completion()
                }}>
                <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
                    {
                        active_step == 0 ?

                        <AmountStep set_amount = {set_amount} amountError={amountError} setAmountError={setAmountError} selected_causes={selected_causes} set_selected_causes={set_selected_causes} />

                        : active_step == 1 ?
                        
                        <BillingStep country={country} set_country={set_country} email={email} set_email={set_email} state_or_province={state_or_province} set_state_or_province={set_state_or_province} />

                        :

                        null
                    }
    

                    <div className="mt-10 flex border-t border-gray-200 pt-6 justify-between items-center">
                        <div>
                            { stepError ? <p className="text-sm font-semibold text-red-600">{ stepError }</p> : null}
                        </div>
                        <button
                            type="submit"
                            className="flex items-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none "
                        >
                            {
                                active_step == 0 ?

                                <>Continue To Payment { loading ? <><Loading show = {loading} /> </>: <>&rarr;</> }</>

                                : active_step == 1?

                                <>Donate ${amount} { loading ? <><Loading show = {loading} /> </>: <>&rarr;</> }</>

                                : active_step == 2?

                                <>Close Page</>

                                : <>Error</>

                            }
                        </button>
                    </div>
                    <div className="flex justify-center mt-6">
                        { active_step == 1 ? 
                        
                            <span className="flex ml-2 text-slate-500 items-center" ><LockClosedIcon className="h-4 w-4 mr-1 items-center" /> Payment Handled By Stripe</span>

                            : null 

                        }
                    </div>
                    </div>
                </form>
            </section>
            </div>
        </div>
        
    )
}

export function AmountStep({ set_amount, amountError, setAmountError, selected_causes, set_selected_causes }) {


    function validate_amount_input(event) {
        const target = parseFloat(event.target.value).toFixed(2)

        if (isNaN(target)) {
            setAmountError("Amount to donate needs to be a number")
            set_amount(0.00)
        } else {
            setAmountError(null)
            set_amount(target)
        }
    }

    return (
        <div>
            <div className="my-10 flex">
                <h2 className="text-2xl font-bold leading-7 text-slate-800 sm:truncate sm:text-3xl sm:tracking-tight">
                    Make A Donation
                </h2>
            </div>
                
            <form>
                {/* Let donor choose an amount, and then validate the amount */}

                <label htmlFor="amount" className="text-regular font-semibold text-slate-700">
                    Choose Amount To Donate
                </label>
                            
                <div>
                    <div className="relative mt-4 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="text"
                            name="amount"
                            id="amount"
                            className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="0.00"
                            onChange={(e)=>{validate_amount_input(e)}}
                            aria-describedby="price-currency"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm" id="price-currency">
                            CAD
                        </span>
                        </div>
                    </div>

                    { amountError ? <p className="text-red-600 font-semibold">{amountError}</p> : null }
                </div>

                <div className="my-8" />


                {/* Let donor choose where they want their donation to go */}
                
                <div>
                    <label htmlFor="amount" className="text-regular font-semibold text-slate-700">
                        If you prefer your donation go to specific causes, choose those causes here
                    </label>
                    
                    <fieldset className="space-y-5 mt-4">
                        {causes.map((cause) => (
                            <PreferredCauseCheckbox key={cause.cause_id} cause_object = {cause} default_selected={cause.default_selected} selected_causes = {selected_causes} set_selected_causes = {set_selected_causes} />
                        ))}
                    </fieldset>
                </div>

            </form>
        </div>
    )
}

export function PreferredCauseCheckbox({ cause_object, selected_causes, set_selected_causes }) {

    function handle_selection(event, cause_object) {
        const checked = event.target.checked
        if (checked === true) {
            // Add cause to selected_causes
            if (!selected_causes.some(causes => causes.caues_id === cause_object.cause_id)) {
                set_selected_causes(selected_causes => [...selected_causes, cause_object])
            }
        } else if (checked == false) {
            // Remove caused from selected_causes
            const new_selected_causes = selected_causes.filter(cause => cause.cause_id != cause_object.cause_id)
            set_selected_causes(new_selected_causes)
        }
    }

    return (
        <div className="relative flex items-start">
            <div className="flex h-5 items-center">
            <input
                id={cause_object.cause_id}
                aria-describedby="cause-description"
                name={cause_object.cause_id}
                type="checkbox"
                defaultChecked={cause_object.default_selected}
                onChange={(e)=>{handle_selection(e, cause_object)}}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            </div>
            <label htmlFor={cause_object.cause_id} className="cursor-pointer ml-3 text-sm">
                <p className="font-medium text-gray-700">
                    { cause_object.name }
                </p>
                <p id="cause-description" className="text-gray-500">
                    { cause_object.description }
                </p>
            </label>
        </div>
    )
}

function BillingStep({ country, set_country, state_or_province, set_state_or_province }) {
    return (
        <div>
            <section aria-labelledby="contact-info-heading">
              <h2 id="contact-info-heading" className="text-lg font-medium text-gray-900">
                Contact information
              </h2>

              <div className="mt-6">
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="email-address"
                    name="email-address"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </section>

            <section aria-labelledby="payment-heading" className="mt-10">
              <h2 id="payment-heading" className="text-lg font-medium text-gray-900">
                Payment details
              </h2>

              <div className="mt-6 grid grid-cols-3 gap-y-6 gap-x-4 sm:grid-cols-4">
                <div className="col-span-3 sm:col-span-4">
                  <label htmlFor="name-on-card" className="block text-sm font-medium text-gray-700">
                    Name on card
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="name-on-card"
                      name="name-on-card"
                      autoComplete="cc-name"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="col-span-3 sm:col-span-4">
                  <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 flex items-center ">
                    Card number 
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="card-number"
                      name="card-number"
                      autoComplete="cc-number"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

              </div>
            </section>

            <section aria-labelledby="shipping-heading" className="mt-10">
              <h2 id="shipping-heading" className="text-lg font-medium text-gray-900">
                Billing Address
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="address"
                      name="address"
                      autoComplete="street-address"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">
                    Apartment, suite, etc.
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="apartment"
                      name="apartment"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <div className="mt-1">

                    <select
                      id="location"
                      name="location"
                      className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      defaultValue={country}
                      onChange={(e)=>{
                        set_country(countries[e.target.value])
                      }}
                    >
                      {countries.map((country, countryIdx)=>(
                        <option value={countryIdx}>{country.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="city"
                      name="city"
                      autoComplete="address-level2"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State / Province
                  </label>
                  <div className="mt-1">
                    { country.code == "CA" ?

                      <select
                        id="state"
                        name="state"
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        defaultValue={state_or_province}
                        >
                          {canadian_states.map((state)=>(
                            <option>{state.name}</option>
                          ))}
                      </select>

                      : 

                      <input
                        type="text"
                        id="region"
                        name="region"
                        autoComplete="address-level1"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    }
                  </div>
                </div>

                <div>
                  <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700">
                    Postal code
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="postal-code"
                      name="postal-code"
                      autoComplete="postal-code"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section aria-labelledby="billing-heading" className="mt-10">
              <h2 id="billing-heading" className="text-lg font-medium text-gray-900">
                Receipt Information
              </h2>

              <div className="mt-6 flex items-center">
                <input
                  id="same-as-shipping"
                  name="same-as-shipping"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-2">
                  <label htmlFor="same-as-shipping" className="text-sm font-medium text-gray-900">
                    Same as shipping information
                  </label>
                </div>
              </div>
            </section>
        </div>
    )
}

function TextInput({ label, type, required, defaultValue, setter }) {
  return (
    <div className="mt-6">
      <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
        { label }
      </label>
      <div className="mt-1">
        { required ?
        
          <input
            type={ type }
            id={ label }
            name={ label }
            autoComplete={ type }
            required
            defaultValue={defaultValue}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />

          :

          <input
            type={ type }
            id={ label }
            name={ label }
            autoComplete={ type }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        }
      </div>
    </div>
  )
}