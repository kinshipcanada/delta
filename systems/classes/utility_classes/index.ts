import { Donation } from "../donation/Donation";
import { Stripe } from "stripe"

export interface KinshipPaymentMethod {
    type: PaymentMethods,
    card_brand?: string,
    card_last_four?: string,
    card_exp_month?: number,
    card_exp_year?: number,
    created_at?: Date,
    checks?: {
        address_line1_check_passed: boolean,
        address_postal_code_check_passed: boolean,
        cvc_check_passed: boolean
    }
}

export const enum DeliveryMethod {
    EMAIL,
    PHONE
}

export interface donor_details {
    first_name: string,
    last_name: string,
    stripe_cus_id: string,
    email: string,
    phone_number?: number
    address: {
        line_address: string,
        postal_code: string,
        city: string,
        state: string,
        country: CountryList | string,
    },
    payment_methods?: any[],
}

export interface FormattedCart {
    total_amount_paid_in_cents: number
    causes: string[]
}

export const enum EventTypes {
    REPORT_GENERATED,
    NOTIFICATION,
    DONATION,
    RECEIPT_ISSUED,
    USER_UPDATED,
    INTERNAL_ERROR,
    STRIPE_CUSTOMER_CREATED,
    STRIPE_PAYMENT_METHOD_ATTACHED,
}

export const enum NotificationType {
    PROOF_AVAILABLE,
    DONATION_MADE,
    REFUND_PROCESSING,
    REFUND_ISSUED,
    REPORT_GENERATED,
    DONATION_SENT
}

export const enum CountryList {
    CANADA = 'ca',
    UNITED_STATES = 'us',
    AFGHANISTAN = 'af',
    LAND_ISLANDS = 'ax',
    ALBANIA = 'al',
    ALGERIA = 'dz',
    AMERICAN_SAMOA = 'as',
    ANDORRA = 'ad',
    ANGOLA = 'ao',
    ANGUILLA = 'ai',
    ANTARCTICA = 'aq',
    ANTIGUA_AND_BARBUDA = 'ag',
    ARGENTINA = 'ar',
    ARMENIA = 'am',
    ARUBA = 'aw',
    AUSTRALIA = 'au',
    AUSTRIA = 'at',
    AZERBAIJAN = 'az',
    BAHAMAS = 'bs',
    BAHRAIN = 'bh',
    BANGLADESH = 'bd',
    BARBADOS = 'bb',
    BELARUS = 'by',
    BELGIUM = 'be',
    BELIZE = 'bz',
    BENIN = 'bj',
    BERMUDA = 'bm',
    BHUTAN = 'bt',
    BOLIVIA = 'bo',
    BOSNIA_AND_HERZEGOVINA = 'ba',
    BOTSWANA = 'bw',
    BOUVET_ISLAND = 'bv',
    BRAZIL = 'br',
    BRITISH_INDIAN_OCEAN_TERRITORY = 'io',
    BRUNEI_DARUSSALAM = 'bn',
    BULGARIA = 'bg',
    BURKINA_FASO = 'bf',
    BURUNDI = 'bi',
    CAMBODIA = 'kh',
    CAMEROON = 'cm',
    CAPE_VERDE = 'cv',
    CAYMAN_ISLANDS = 'ky',
    CENTRAL_AFRICAN_REPUBLIC = 'cf',
    CHAD = 'td',
    CHILE = 'cl',
    CHINA = 'cn',
    CHRISTMAS_ISLAND = 'cx',
    COCOS__ISLANDS = 'cc',
    COLOMBIA = 'co',
    COMOROS = 'km',
    CONGO = 'cg',
    CONGO_THE_DEMOCRATIC_REPUBLIC_OF_THE = 'cd',
    COOK_ISLANDS = 'ck',
    COSTA_RICA = 'cr',
    COTE_DIVOIRE = 'ci',
    CROATIA = 'hr',
    CUBA = 'cu',
    CYPRUS = 'cy',
    CZECH_REPUBLIC = 'cz',
    DENMARK = 'dk',
    DJIBOUTI = 'dj',
    DOMINICA = 'dm',
    DOMINICAN_REPUBLIC = 'do',
    ECUADOR = 'ec',
    EGYPT = 'eg',
    EL_SALVADOR = 'sv',
    EQUATORIAL_GUINEA = 'gq',
    ERITREA = 'er',
    ESTONIA = 'ee',
    ETHIOPIA = 'et',
    FALKLAND_ISLANDS_ = 'fk',
    FAROE_ISLANDS = 'fo',
    FIJI = 'fj',
    FINLAND = 'fi',
    FRANCE = 'fr',
    FRENCH_GUIANA = 'gf',
    FRENCH_POLYNESIA = 'pf',
    FRENCH_SOUTHERN_TERRITORIES = 'tf',
    GABON = 'ga',
    GAMBIA = 'gm',
    GEORGIA = 'ge',
    GERMANY = 'de',
    GHANA = 'gh',
    GIBRALTAR = 'gi',
    GREECE = 'gr',
    GREENLAND = 'gl',
    GRENADA = 'gd',
    GUADELOUPE = 'gp',
    GUAM = 'gu',
    GUATEMALA = 'gt',
    GUERNSEY = 'gg',
    GUINEA = 'gn',
    GUINEA_BISSAU = 'gw',
    GUYANA = 'gy',
    HAITI = 'ht',
    HEARD_ISLAND_AND_MCDONALD_ISLANDS = 'hm',
    HOLY_SEE_ = 'va',
    HONDURAS = 'hn',
    HONG_KONG = 'hk',
    HUNGARY = 'hu',
    ICELAND = 'is',
    INDIA = 'in',
    INDONESIA = 'id',
    IRAN_ISLAMIC_REPUBLIC_OF = 'ir',
    IRAQ = 'iq',
    IRELAND = 'ie',
    ISLE_OF_MAN = 'im',
    ISRAEL = 'il',
    ITALY = 'it',
    JAMAICA = 'jm',
    JAPAN = 'jp',
    JERSEY = 'je',
    JORDAN = 'jo',
    KAZAKHSTAN = 'kz',
    KENYA = 'ke',
    KIRIBATI = 'ki',
    KOREA_DEMOCRATIC_PEOPLES_REPUBLIC_OF = 'kp',
    KOREA_REPUBLIC_OF = 'kr',
    KUWAIT = 'kw',
    KYRGYZSTAN = 'kg',
    LAO_PEOPLES_DEMOCRATIC_REPUBLIC = 'la',
    LATVIA = 'lv',
    LEBANON = 'lb',
    LESOTHO = 'ls',
    LIBERIA = 'lr',
    LIBYAN_ARAB_JAMAHIRIYA = 'ly',
    LIECHTENSTEIN = 'li',
    LITHUANIA = 'lt',
    LUXEMBOURG = 'lu',
    MACAO = 'mo',
    MACEDONIA_THE_FORMER_YUGOSLAV_REPUBLIC_OF = 'mk',
    MADAGASCAR = 'mg',
    MALAWI = 'mw',
    MALAYSIA = 'my',
    MALDIVES = 'mv',
    MALI = 'ml',
    MALTA = 'mt',
    MARSHALL_ISLANDS = 'mh',
    MARTINIQUE = 'mq',
    MAURITANIA = 'mr',
    MAURITIUS = 'mu',
    MAYOTTE = 'yt',
    MEXICO = 'mx',
    MICRONESIA_FEDERATED_STATES_OF = 'fm',
    MOLDOVA_REPUBLIC_OF = 'md',
    MONACO = 'mc',
    MONGOLIA = 'mn',
    MONTENEGRO = 'me',
    MONTSERRAT = 'ms',
    MOROCCO = 'ma',
    MOZAMBIQUE = 'mz',
    MYANMAR = 'mm',
    NAMIBIA = 'na',
    NAURU = 'nr',
    NEPAL = 'np',
    NETHERLANDS = 'nl',
    NETHERLANDS_ANTILLES = 'an',
    NEW_CALEDONIA = 'nc',
    NEW_ZEALAND = 'nz',
    NICARAGUA = 'ni',
    NIGER = 'ne',
    NIGERIA = 'ng',
    NIUE = 'nu',
    NORFOLK_ISLAND = 'nf',
    NORTHERN_MARIANA_ISLANDS = 'mp',
    NORWAY = 'no',
    OMAN = 'om',
    PAKISTAN = 'pk',
    PALAU = 'pw',
    PALESTINIAN_TERRITORY_OCCUPIED = 'ps',
    PANAMA = 'pa',
    PAPUA_NEW_GUINEA = 'pg',
    PARAGUAY = 'py',
    PERU = 'pe',
    PHILIPPINES = 'ph',
    PITCAIRN = 'pn',
    POLAND = 'pl',
    PORTUGAL = 'pt',
    PUERTO_RICO = 'pr',
    QATAR = 'qa',
    REUNION = 're',
    ROMANIA = 'ro',
    RUSSIAN_FEDERATION = 'ru',
    RWANDA = 'rw',
    SAINT_HELENA = 'sh',
    SAINT_KITTS_AND_NEVIS = 'kn',
    SAINT_LUCIA = 'lc',
    SAINT_PIERRE_AND_MIQUELON = 'pm',
    SAINT_VINCENT_AND_THE_GRENADINES = 'vc',
    SAMOA = 'ws',
    SAN_MARINO = 'sm',
    SAO_TOME_AND_PRINCIPE = 'st',
    SAUDI_ARABIA = 'sa',
    SENEGAL = 'sn',
    SERBIA = 'rs',
    SEYCHELLES = 'sc',
    SIERRA_LEONE = 'sl',
    SINGAPORE = 'sg',
    SLOVAKIA = 'sk',
    SLOVENIA = 'si',
    SOLOMON_ISLANDS = 'sb',
    SOMALIA = 'so',
    SOUTH_AFRICA = 'za',
    SOUTH_GEORGIA_AND_THE_SOUTH_SANDWICH_ISLANDS = 'gs',
    SPAIN = 'es',
    SRI_LANKA = 'lk',
    SUDAN = 'sd',
    SURINAME = 'sr',
    SVALBARD_AND_JAN_MAYEN = 'sj',
    SWAZILAND = 'sz',
    SWEDEN = 'se',
    SWITZERLAND = 'ch',
    SYRIAN_ARAB_REPUBLIC = 'sy',
    TAIWAN_PROVINCE_OF_CHINA = 'tw',
    TAJIKISTAN = 'tj',
    TANZANIA_UNITED_REPUBLIC_OF = 'tz',
    THAILAND = 'th',
    TIMOR_LESTE = 'tl',
    TOGO = 'tg',
    TOKELAU = 'tk',
    TONGA = 'to',
    TRINIDAD_AND_TOBAGO = 'tt',
    TUNISIA = 'tn',
    TURKEY = 'tr',
    TURKMENISTAN = 'tm',
    TURKS_AND_CAICOS_ISLANDS = 'tc',
    TUVALU = 'tv',
    UGANDA = 'ug',
    UKRAINE = 'ua',
    UNITED_ARAB_EMIRATES = 'ae',
    UNITED_KINGDOM = 'gb',
    UNITED_STATES_MINOR_OUTLYING_ISLANDS = 'um',
    URUGUAY = 'uy',
    UZBEKISTAN = 'uz',
    VANUATU = 'vu',
    VENEZUELA = 've',
    VIET_NAM = 'vn',
    VIRGIN_ISLANDS_BRITISH = 'vg',
    VIRGIN_ISLANDS_US = 'vi',
    WALLIS_AND_FUTUNA = 'wf',
    WESTERN_SAHARA = 'eh',
    YEMEN = 'ye',
    ZAMBIA = 'zm',
    ZIMBABWE = 'zw'
}


export const enum CurrencyList {
    CANADIAN_DOLLAR = 'cad',
    UNITED_STATES_DOLLAR = 'usd'
}

export const enum RegionList {
    AFRICA = "AF",
    INDIA = "IN",
    MIDDLE_EAST = "ME",
    CANADA = "CA"
}

export const enum STATE_LIST {
    AB = "Alberta",
    BC = "British Columbia",
    MB = "Manitoba",
    NB = "New Brunswick",
    NL = "Newfoundland and Labrador",
    NT = "Northwest Territories",
    NS = "Nova Scotia",
    NU = "Nunavut",
    ON = "Ontario",
    PE = "Prince Edward Island",
    QC = "Quebec",
    SK = "Saskatchewan",
    YT = "Yukon"
}

export type AmountForRegion = {
    [region_id in RegionList] : number
}

export interface BaseApiResponse {
    status: 200 | 400 | 500,
    endpoint_called: string
}

export interface SimpleMessageResponse extends BaseApiResponse {
    message: string
}

export interface DonorResponse extends BaseApiResponse {
    donor: donor_details
}

export interface DonationResponse extends BaseApiResponse {
    donation: Donation
}

export interface BatchedDonationResponse extends BaseApiResponse {
    donations: Donation[]
}

export interface BatchedSimpleDonationResponse extends BaseApiResponse {
    donations: any[]
}

export interface DonationSummaryResponse extends BaseApiResponse {
    summary: SummaryStatement
}

export interface SummaryStatement {
    /**
     * This interface defines the structure of a donation summary object.
     * 
     * @property {string} donor_email - The email of the donor
     * @property {number} total_donated - The total amount donated by the donor, in CAD cents
     * @property {total_eligible_estimate} total_eligible_estimate - The total amount eligible for tax receipt, in CAD cents
     * @property {donations} donations - An array of donation objects
     **/
    donor_email: string,
    total_donated: number,
    total_eligible_estimate: number,
    donations: UserFormattedDonation[]
}

export interface DonorAddress {
    line_address: string,
    state: string,
    city: string,
    postal_code: string,
    country: CountryList | string
}

export interface DatabaseDonation {
    donation_created?: string,
    donor?: string | null,
    email?: string,
    phone_number?: number,
    amount_in_cents?: number,
    native_currency?: CurrencyList,
    fees_covered?: number,
    fees_charged_by_stripe?: number,
    transaction_successful?: boolean,
    transaction_refunded?: boolean,
    payment_method?: KinshipPaymentMethod,
    donation_causes?: FormattedCart,
    stripe_payment_intent_id?: string,
    stripe_charge_id?: string,
    stripe_balance_transaction_id?: string,
    stripe_customer_id?: string,
    livemode?: boolean,
    address_line_address?: DonorAddress["line_address"],
    address_country?: DonorAddress["country"],
    address_postal_code?: DonorAddress["postal_code"],
    address_city?: DonorAddress["city"],
    address_state?: DonorAddress["state"]
}

export interface UserFormattedDonation {
    id: string,
    donation_created: string,
    // Update this
    donor: string | null,
    email: string,
    phone_number: number,
    amount_in_cents: number,
    native_currency: CurrencyList,
    fees_covered: number,
    fees_charged_by_stripe: number,
    // Hardcoding true for now, later we will log attempted txns too
    transaction_successful: true,
    // Need to add this
    transaction_refunded: false,
    address_line_address: string,
    address_country: CountryList | string,
    address_postal_code: string,
    address_city: string,
    address_state: string,
    proof_available: boolean,
    livemode: boolean,
}

export const enum PaymentMethods {
    CARD = 'card',
    AFFIRM = 'affirm',
    ACSS_DEBIT = 'acss_debit',
    CUSTOMER_BALANCE = 'customer_balance'
}

/**
 * @section interfaces: these form templates for responses from stripe
 */
export interface StripeTags {
    payment_intent_id?: string,
    charge_id?: string,
    balance_transaction_id?: string,
    customer_id?: string,
    payment_method_id?: string
}


export interface raw_stripe_transaction_object {
    payment_intent_object: Stripe.PaymentIntent,
    charge_object: Stripe.Charge,
    balance_transaction_object: Stripe.BalanceTransaction,
    customer: Stripe.Customer,
    payment_method: Stripe.PaymentMethod
}

export interface DonationIdentifiers {
    payment_intent_id?: string,
    charge_id?: string,
    kinship_donation_id?: string
}