import { CountryList } from "../classes/utils";

export function isValidCountryCode(countryCode: string): boolean {
    return (Object.values(CountryList) as string[]).includes(countryCode);
}