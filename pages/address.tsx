import Address, { GoogleFormattedAddress } from "@components/Address";
import { useState } from "react";

export default function X() {
  const [address, setAddress] = useState<string>("")
  const [formattedAddress, setFormattedAddress] = useState<GoogleFormattedAddress>()
  return <Address address={address} setAddress={setAddress} />
}