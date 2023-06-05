import * as dotenv from 'dotenv'
import { Donation } from '../classes/donation'
import { DonationIdentifiers } from '../classes/utils'
import { formatDonationForDatabase } from './formatting'
import { DatabaseTable } from './constants'

dotenv.config()

function _createDatabase() {
  const database = require('knex')({
    client: "pg",
    connection: process.env.DATABASE_URL
  })

  return database
}
export function uploadDonationToDatabase(donation: Donation): Promise<any> {
  const database = _createDatabase()
  try {
    return database('donations').insert(formatDonationForDatabase(donation))
  } catch (error) {
    throw new Error(error)
  } finally {
    (destoryFunc => database.destroy())
  }
}

export function fetchDonationFromDatabase(donation_identifiers: DonationIdentifiers): Promise<any> {
  const database = _createDatabase()
  try {
    const allowedIdentifiers = ['donation_id', 'stripe_charge_id', 'stripe_payment_intent_id'];

    for (const identifier of allowedIdentifiers) {
      if (donation_identifiers[identifier]) {
        return database('donations').where(identifier == "donation_id" ? "id" : identifier, donation_identifiers[identifier]).first();
      }
    }

    throw new Error('No valid identifiers provided. You must provide at least one of the following: donation_id, stripe_charge_id, stripe_payment_intent_id.')

  } catch (error) {
    throw new Error(error)
  } finally {
    (destoryFunc => database.destroy())
  }
}

export function fetchDonorFromDatabase(donorId?: string, donorEmail?: string): Promise<any> {
  if (donorId == null && donorEmail == null) {
    throw new Error('No valid identifiers provided. You must provide at least one of the following: donor_id, donor_email.')
  }

  const database = _createDatabase()

  try {
    return donorId ? database('donor_profiles').where('id', donorId).first() : database('donor_profiles').where('donor_email', donorEmail).first()
  } catch (error) {
    throw new Error(error)
  } finally {
    (destoryFunc => database.destroy())
  }
}

export async function parameterizedDatabaseQuery(table: DatabaseTable, params, limitToFirstResult: boolean): Promise<any> {
  const columns = Object.keys(params)
  const database = _createDatabase()
  let result;

  try {
    const parameterizedQuery = (query) => {
      for (const column of columns) {
        if (params[column] != null) { query.andWhere(`${table}.${column}`, `${params[column]}`); }
      }
    }

    if (limitToFirstResult) {
      result = database(table).where(parameterizedQuery).first()
    } else {
      result = database(table).where(parameterizedQuery)
    }

  } catch (error) {
    throw new Error(error)
  } finally {
    (destoryFunc => database.destroy())
  }

  return result
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]
  | any

export interface DatabaseTypings {
  public: {
    Tables: {
      donations: {
        Row: {
          address_city: string | null
          address_country: DatabaseTypings["public"]["Enums"]["country"] | null
          address_line_address: string | null
          address_postal_code: string | null
          address_state: string | null
          amount_in_cents: number | null
          donation_causes: Json | null
          donation_created: string | null
          donation_logged: string | null
          donation_method: DatabaseTypings["public"]["Enums"]["method"]
          donor: string | null
          donor_object: Json | null
          email: string | null
          fees_charged_by_stripe: number | null
          fees_covered: number | null
          id: string
          livemode: boolean | null
          payment_method: Json | null
          phone_number: number | null
          proof_available: boolean | null
          stripe_balance_transaction_id: string | null
          stripe_charge_id: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          transaction_refunded: boolean | null
          transaction_successful: boolean | null
        }
        Insert: {
          address_city?: string | null
          address_country?: DatabaseTypings["public"]["Enums"]["country"] | null
          address_line_address?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          amount_in_cents?: number | null
          donation_causes?: Json | null
          donation_created?: string | null
          donation_logged?: string | null
          donation_method?: DatabaseTypings["public"]["Enums"]["method"]
          donor?: string | null
          donor_object?: Json | null
          email?: string | null
          fees_charged_by_stripe?: number | null
          fees_covered?: number | null
          id?: string
          livemode?: boolean | null
          payment_method?: Json | null
          phone_number?: number | null
          proof_available?: boolean | null
          stripe_balance_transaction_id?: string | null
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          transaction_refunded?: boolean | null
          transaction_successful?: boolean | null
        }
        Update: {
          address_city?: string | null
          address_country?: DatabaseTypings["public"]["Enums"]["country"] | null
          address_line_address?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          amount_in_cents?: number | null
          donation_causes?: Json | null
          donation_created?: string | null
          donation_logged?: string | null
          donation_method?: DatabaseTypings["public"]["Enums"]["method"]
          donor?: string | null
          donor_object?: Json | null
          email?: string | null
          fees_charged_by_stripe?: number | null
          fees_covered?: number | null
          id?: string
          livemode?: boolean | null
          payment_method?: Json | null
          phone_number?: number | null
          proof_available?: boolean | null
          stripe_balance_transaction_id?: string | null
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          transaction_refunded?: boolean | null
          transaction_successful?: boolean | null
        }
      }
      donor_profiles: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_line_address: string | null
          address_postal_code: string | null
          address_state: string | null
          admin: boolean | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          partner: boolean | null
          payment_methods: Json | null
          phone_number: number | null
          stripe_customer_ids: Json | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_line_address?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          admin?: boolean | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          partner?: boolean | null
          payment_methods?: Json | null
          phone_number?: number | null
          stripe_customer_ids?: Json | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_line_address?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          admin?: boolean | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          partner?: boolean | null
          payment_methods?: Json | null
          phone_number?: number | null
          stripe_customer_ids?: Json | null
        }
      }
      events: {
        Row: {
          created_at: string | null
          event_type: string | null
          id: number
          identifiers: Json | null
          message: string | null
        }
        Insert: {
          created_at?: string | null
          event_type?: string | null
          id?: number
          identifiers?: Json | null
          message?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string | null
          id?: number
          identifiers?: Json | null
          message?: string | null
        }
      }
      kinship_carts: {
        Row: {
          address_city: string | null
          address_country: DatabaseTypings["public"]["Enums"]["country"] | null
          address_line_address: string | null
          address_postal_code: string | null
          address_state: string | null
          amount_in_cents: number | null
          donation_causes: Json | null
          donation_created: string | null
          donation_logged: string | null
          donor: string | null
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          livemode: boolean | null
          phone_number: number | null
        }
        Insert: {
          address_city?: string | null
          address_country?: DatabaseTypings["public"]["Enums"]["country"] | null
          address_line_address?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          amount_in_cents?: number | null
          donation_causes?: Json | null
          donation_created?: string | null
          donation_logged?: string | null
          donor?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          livemode?: boolean | null
          phone_number?: number | null
        }
        Update: {
          address_city?: string | null
          address_country?: DatabaseTypings["public"]["Enums"]["country"] | null
          address_line_address?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          amount_in_cents?: number | null
          donation_causes?: Json | null
          donation_created?: string | null
          donation_logged?: string | null
          donor?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          livemode?: boolean | null
          phone_number?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      country:
        | "ca"
        | "us"
        | "af"
        | "ax"
        | "al"
        | "dz"
        | "as"
        | "ad"
        | "ao"
        | "ai"
        | "aq"
        | "ag"
        | "ar"
        | "am"
        | "aw"
        | "au"
        | "at"
        | "az"
        | "bs"
        | "bh"
        | "bd"
        | "bb"
        | "by"
        | "be"
        | "bz"
        | "bj"
        | "bm"
        | "bt"
        | "bo"
        | "ba"
        | "bw"
        | "bv"
        | "br"
        | "io"
        | "bn"
        | "bg"
        | "bf"
        | "bi"
        | "kh"
        | "cm"
        | "cv"
        | "ky"
        | "cf"
        | "td"
        | "cl"
        | "cn"
        | "cx"
        | "cc"
        | "co"
        | "km"
        | "cg"
        | "cd"
        | "ck"
        | "cr"
        | "ci"
        | "hr"
        | "cu"
        | "cy"
        | "cz"
        | "dk"
        | "dj"
        | "dm"
        | "do"
        | "ec"
        | "eg"
        | "sv"
        | "gq"
        | "er"
        | "ee"
        | "et"
        | "fk"
        | "fo"
        | "fj"
        | "fi"
        | "fr"
        | "gf"
        | "pf"
        | "tf"
        | "ga"
        | "gm"
        | "ge"
        | "de"
        | "gh"
        | "gi"
        | "gr"
        | "gl"
        | "gd"
        | "gp"
        | "gu"
        | "gt"
        | "gg"
        | "gn"
        | "gw"
        | "gy"
        | "ht"
        | "hm"
        | "va"
        | "hn"
        | "hk"
        | "hu"
        | "is"
        | "in"
        | "id"
        | "ir"
        | "iq"
        | "ie"
        | "im"
        | "il"
        | "it"
        | "jm"
        | "jp"
        | "je"
        | "jo"
        | "kz"
        | "ke"
        | "ki"
        | "kp"
        | "kr"
        | "kw"
        | "kg"
        | "la"
        | "lv"
        | "lb"
        | "ls"
        | "lr"
        | "ly"
        | "li"
        | "lt"
        | "lu"
        | "mo"
        | "mk"
        | "mg"
        | "mw"
        | "my"
        | "mv"
        | "ml"
        | "mt"
        | "mh"
        | "mq"
        | "mr"
        | "mu"
        | "yt"
        | "mx"
        | "fm"
        | "md"
        | "mc"
        | "mn"
        | "me"
        | "ms"
        | "ma"
        | "mz"
        | "mm"
        | "na"
        | "nr"
        | "np"
        | "nl"
        | "an"
        | "nc"
        | "nz"
        | "ni"
        | "ne"
        | "ng"
        | "nu"
        | "nf"
        | "mp"
        | "no"
        | "om"
        | "pk"
        | "pw"
        | "ps"
        | "pa"
        | "pg"
        | "py"
        | "pe"
        | "ph"
        | "pn"
        | "pl"
        | "pt"
        | "pr"
        | "qa"
        | "re"
        | "ro"
        | "ru"
        | "rw"
        | "sh"
        | "kn"
        | "lc"
        | "pm"
        | "vc"
        | "ws"
        | "sm"
        | "st"
        | "sa"
        | "sn"
        | "rs"
        | "sc"
        | "sl"
        | "sg"
        | "sk"
        | "si"
        | "sb"
        | "so"
        | "za"
        | "gs"
        | "es"
        | "lk"
        | "sd"
        | "sr"
        | "sj"
        | "sz"
        | "se"
        | "ch"
        | "sy"
        | "tw"
        | "tj"
        | "tz"
        | "th"
        | "tl"
        | "tg"
        | "tk"
        | "to"
        | "tt"
        | "tn"
        | "tr"
        | "tm"
        | "tc"
        | "tv"
        | "ug"
        | "ua"
        | "ae"
        | "gb"
        | "um"
        | "uy"
        | "uz"
        | "vu"
        | "ve"
        | "vn"
        | "vg"
        | "vi"
        | "wf"
        | "eh"
        | "ye"
        | "zm"
        | "zw"
      currencies: "cad" | "usd"
      method: "cash" | "etransfer" | "card"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
