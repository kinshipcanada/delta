// todo

import { NoDataApiResponse } from "@lib/classes/api";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @description Creates a PDF of a donation receipt, and returns it to the frontend
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const response: NoDataApiResponse = { error: "Method has not been implemented" }
  return res.status(500).send(response);
}