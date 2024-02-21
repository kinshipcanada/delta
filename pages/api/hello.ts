import { NextApiRequest, NextApiResponse } from "next";
import * as Sentry from "@sentry/nextjs";
import { DonorEngine, FetchDonorProfileProps } from "@lib/methods/donors";

/**
 * @description Fetch a donors profile
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    return res.status(200).send({ "hi": "hey" })
}