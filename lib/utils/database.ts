import * as dotenv from 'dotenv'
import { Donation } from '../classes/donation'
import { DonationIdentifiers } from '../classes/utils'
import { formatDonationForDatabase } from './formatting'

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
    throw error
  } 
}

//todo
export interface DonationResponse {
  row_count: number
  data?: any[]
  error?: string
}

export async function fetchOpenProofFromDatabase(amount_disbursed: number) {
  const runningTotalCTEQuery = `
    WITH RunningTotalCTE AS (
        SELECT
            *,
            SUM(txn_amount_donated_cents - details_amount_distributed) OVER (ORDER BY detail_date_donated) AS running_total
        FROM
            donations
        WHERE
            details_distribution_restricted = false
    )
    SELECT *
    FROM RunningTotalCTE
    WHERE running_total <= ${amount_disbursed}
    ORDER BY
        detail_date_donated;
  `

  const database = _createDatabase()
  return database.raw(runningTotalCTEQuery)
}

export async function fetchDonationFromDatabase(donation_identifiers: DonationIdentifiers) {
  const database = _createDatabase()
  const allowedIdentifiers = ['donation_id', 'stripe_charge_id', 'stripe_payment_intent_id'];

  for (const identifier of allowedIdentifiers) {
    if (donation_identifiers[identifier as keyof DonationIdentifiers]) {
      return database('donations').where(identifier === "donation_id" ? "id_donation_id" : identifier, donation_identifiers[identifier as keyof DonationIdentifiers]).first();
    }
  }

  throw new Error('No valid identifiers provided. You must provide at least one of the following: donation_id, stripe_charge_id, stripe_payment_intent_id.')
}

export const updateDonationDistributed = async (donationId: string, amount_distributed_in_cents: number) => {
  const database = _createDatabase()

  return database('donations').where('id_donation_id', donationId).update({
    details_amount_distributed: amount_distributed_in_cents
  })
}


export async function fetchAllDonationsForEmail(donor_email: string) {
  const database = _createDatabase();

  return database('donations')
    .where('email', donor_email)
    .join('proof_donation_junction', 'donations.id', '=', 'proof_donation_junction.donation_id')
    .join('proof', 'proof_donation_junction.proof_id', '=', 'proof.id')
    .select('donations.*', database.raw('array_agg(proof.*) as proof'))
    .groupBy('donations.id');
}

export async function fetchProofFromDatabase(donation_identifiers: DonationIdentifiers) {
  if (!donation_identifiers.donation_id) {
    return []
  }

  const database = _createDatabase()

  return database('proof_donation_junction')
    .where('donation_id', donation_identifiers.donation_id)
    .join('proof', 'proof_donation_junction.proof_id', '=', 'proof.id')
    .select('proof.*');
}

export function fetchDonorFromDatabase(donorId?: string, donorEmail?: string): Promise<any> {
  if (donorId == null && donorEmail == null) {
    throw new Error('No valid identifiers provided. You must provide at least one of the following: donor_id, donor_email.')
  }

  const database = _createDatabase()

  try {
    return donorId ? database('donors').where('id', donorId).first() : database('donors').where('email', donorEmail).first()
  } catch (error) {
    throw error
  } 
}

export function updateDonorInDatabase(
  donorId: string, 
  firstName: string, 
  lastName: string, 
  email: string, 
  address_line_address: string,
  address_postal_code: string,
  address_city: string,
  address_state: string,
  address_country: string
): Promise<any> {
  const database = _createDatabase()

  return database('donors').where('id', donorId).update({
    first_name: firstName,
    last_name: lastName,
    email: email,
    address_line1: address_line_address,
    address_zip: address_postal_code,
    address_city: address_city,
    address_state: address_state,
    address_country: address_country
  })
}

export async function setupDonorInDatabase(
  donorId: string, 
  firstName: string, 
  lastName: string, 
  address_line_address: string,
  address_postal_code: string,
  address_city: string,
  address_state: string,
  address_country: string,
  stripe_customer_id: string
): Promise<any> {
  const database = _createDatabase()

  try {
    return database('donors').where('id', donorId).update({
      first_name: firstName,
      last_name: lastName,
      address_line1: address_line_address,
      address_zip: address_postal_code,
      address_city: address_city,
      address_state: address_state,
      address_country: address_country,
      set_up: true,
      stripe_customer_ids: JSON.stringify([stripe_customer_id])
    })
  } catch (error) {
    throw error
  } 
}

export async function parameterizedDatabaseQuery(table: string, params: any, limitToFirstResult: boolean): Promise<any> {
  const columns = Object.keys(params)
  const database = _createDatabase()
  let result;

  try {
    const parameterizedQuery = (query: any) => {
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
    throw error
  } 

  return result
}

export function uploadFeedbackToDatabase(feedback: string, donor_id?: string): Promise<any> {
  const database = _createDatabase()

  try {
    return database('feedback').insert({ feedback: feedback, donor_id: donor_id })
  } catch (error) {
    throw error
  } 
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface DatabaseTypings {
  public: {
    Tables: {
      donations: {
        Row: {
          detail_causes: Json | null
          detail_date_donated: string
          detail_date_logged: string
          detail_distribution_status: DatabaseTypings["public"]["Enums"]["donationstatus"]
          details_amount_distributed: number
          details_distribution_restricted: boolean
          donor_address_city: string | null
          donor_address_country: DatabaseTypings["public"]["Enums"]["country"]
          donor_address_line1: string
          donor_address_state: string | null
          donor_address_zip: string | null
          donor_contact_email: string
          donor_contact_first_name: string
          donor_contact_last_name: string
          id_donation_id: string
          id_donor_id: string | null
          id_stripe_balance_transaction: string | null
          id_stripe_charge: string | null
          id_stripe_customer: string | null
          id_stripe_payment_intent: string | null
          id_stripe_payment_method: string | null
          txn_amount_charged_cents: number
          txn_amount_donated_cents: number
          txn_currency: DatabaseTypings["public"]["Enums"]["currencies"]
          txn_payment_method: DatabaseTypings["public"]["Enums"]["method"]
          txn_processing_fee_cents: number | null
          txn_status: DatabaseTypings["public"]["Enums"]["transactionstatus"]
        }
        Insert: {
          detail_causes?: Json | null
          detail_date_donated: string
          detail_date_logged?: string
          detail_distribution_status?: DatabaseTypings["public"]["Enums"]["donationstatus"]
          details_amount_distributed?: number
          details_distribution_restricted?: boolean
          donor_address_city?: string | null
          donor_address_country: DatabaseTypings["public"]["Enums"]["country"]
          donor_address_line1: string
          donor_address_state?: string | null
          donor_address_zip?: string | null
          donor_contact_email: string
          donor_contact_first_name: string
          donor_contact_last_name: string
          id_donation_id: string
          id_donor_id?: string | null
          id_stripe_balance_transaction?: string | null
          id_stripe_charge?: string | null
          id_stripe_customer?: string | null
          id_stripe_payment_intent?: string | null
          id_stripe_payment_method?: string | null
          txn_amount_charged_cents: number
          txn_amount_donated_cents: number
          txn_currency: DatabaseTypings["public"]["Enums"]["currencies"]
          txn_payment_method: DatabaseTypings["public"]["Enums"]["method"]
          txn_processing_fee_cents?: number | null
          txn_status?: DatabaseTypings["public"]["Enums"]["transactionstatus"]
        }
        Update: {
          detail_causes?: Json | null
          detail_date_donated?: string
          detail_date_logged?: string
          detail_distribution_status?: DatabaseTypings["public"]["Enums"]["donationstatus"]
          details_amount_distributed?: number
          details_distribution_restricted?: boolean
          donor_address_city?: string | null
          donor_address_country?: DatabaseTypings["public"]["Enums"]["country"]
          donor_address_line1?: string
          donor_address_state?: string | null
          donor_address_zip?: string | null
          donor_contact_email?: string
          donor_contact_first_name?: string
          donor_contact_last_name?: string
          id_donation_id?: string
          id_donor_id?: string | null
          id_stripe_balance_transaction?: string | null
          id_stripe_charge?: string | null
          id_stripe_customer?: string | null
          id_stripe_payment_intent?: string | null
          id_stripe_payment_method?: string | null
          txn_amount_charged_cents?: number
          txn_amount_donated_cents?: number
          txn_currency?: DatabaseTypings["public"]["Enums"]["currencies"]
          txn_payment_method?: DatabaseTypings["public"]["Enums"]["method"]
          txn_processing_fee_cents?: number | null
          txn_status?: DatabaseTypings["public"]["Enums"]["transactionstatus"]
        }
        Relationships: [
          {
            foreignKeyName: "donations_id_donor_id_fkey"
            columns: ["id_donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          }
        ]
      }
      donors: {
        Row: {
          address_city: string | null
          address_country: DatabaseTypings["public"]["Enums"]["country"] | null
          address_line1: string | null
          address_state: string | null
          address_zip: string | null
          admin: boolean | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          set_up: boolean | null
          stripe_customer_ids: Json | null
        }
        Insert: {
          address_city?: string | null
          address_country?: DatabaseTypings["public"]["Enums"]["country"] | null
          address_line1?: string | null
          address_state?: string | null
          address_zip?: string | null
          admin?: boolean | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          set_up?: boolean | null
          stripe_customer_ids?: Json | null
        }
        Update: {
          address_city?: string | null
          address_country?: DatabaseTypings["public"]["Enums"]["country"] | null
          address_line1?: string | null
          address_state?: string | null
          address_zip?: string | null
          admin?: boolean | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          set_up?: boolean | null
          stripe_customer_ids?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "donors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      feedback: {
        Row: {
          created_at: string | null
          donor_id: string | null
          feedback: string | null
          id: number
        }
        Insert: {
          created_at?: string | null
          donor_id?: string | null
          feedback?: string | null
          id?: number
        }
        Update: {
          created_at?: string | null
          donor_id?: string | null
          feedback?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "feedback_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      proof: {
        Row: {
          amount_distributed_in_cents: number
          causes: Json | null
          id: string
          message_to_donor: string | null
          region_distributed: DatabaseTypings["public"]["Enums"]["country"] | null
          uploaded_at: string
        }
        Insert: {
          amount_distributed_in_cents: number
          causes?: Json | null
          id?: string
          message_to_donor?: string | null
          region_distributed?: DatabaseTypings["public"]["Enums"]["country"] | null
          uploaded_at?: string
        }
        Update: {
          amount_distributed_in_cents?: number
          causes?: Json | null
          id?: string
          message_to_donor?: string | null
          region_distributed?: DatabaseTypings["public"]["Enums"]["country"] | null
          uploaded_at?: string
        }
        Relationships: []
      }
      proof_donation_junction_2: {
        Row: {
          amount_distributed_in_cents: number
          donation_id: string | null
          proof_id: string | null
        }
        Insert: {
          amount_distributed_in_cents: number
          donation_id?: string | null
          proof_id?: string | null
        }
        Update: {
          amount_distributed_in_cents?: number
          donation_id?: string | null
          proof_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proof_donation_junction_2_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id_donation_id"]
          },
          {
            foreignKeyName: "proof_donation_junction_2_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "proof"
            referencedColumns: ["id"]
          }
        ]
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
      donationstatus:
        | "processing"
        | "delivered_to_partners"
        | "partially_distributed"
        | "fully_distributed"
      method: "cash" | "wire_transfer" | "card" | "acss_debit"
      transactionstatus: "processing" | "payment_failed" | "succeeded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
  