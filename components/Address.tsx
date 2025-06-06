import PlacesAutocomplete, { geocodeByAddress } from "react-places-autocomplete";
import React, { useEffect, useState } from "react";
import Script from "next/script";
import { CursorArrowIcon } from "@radix-ui/react-icons";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

const source = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

export type GoogleFormattedAddress = {
  streetNumber?: string;
  route?: string;
  locality?: string;
  administrativeAreaLevel3?: string;
  administrativeAreaLevel2?: string;
  administrativeAreaLevel1?: string;
  country?: string;
  postalCode?: string;
};

export default function Address({ addressString, setAddressString, formattedAddress, setFormattedAddress }: { addressString: string, setAddressString: (value: string) => void, formattedAddress: GoogleFormattedAddress | undefined, setFormattedAddress: (value: GoogleFormattedAddress) => void }) {
    const [error, setError] = useState<string>()

    function formatAddress(addressComponents: AddressComponent[]): GoogleFormattedAddress {
        const formattedAddress: GoogleFormattedAddress = {};
      
        addressComponents.forEach(component => {
          if (component.types.includes("street_number")) {
            formattedAddress.streetNumber = component.long_name;
          } else if (component.types.includes("route")) {
            formattedAddress.route = component.long_name;
          } else if (component.types.includes("locality")) {
            formattedAddress.locality = component.long_name;
          } else if (component.types.includes("administrative_area_level_3")) {
            formattedAddress.administrativeAreaLevel3 = component.long_name;
          } else if (component.types.includes("administrative_area_level_2")) {
            formattedAddress.administrativeAreaLevel2 = component.long_name;
          } else if (component.types.includes("administrative_area_level_1")) {
            formattedAddress.administrativeAreaLevel1 = component.long_name;
          } else if (component.types.includes("country")) {
            formattedAddress.country = component.long_name;
          } else if (component.types.includes("postal_code")) {
            formattedAddress.postalCode = component.long_name;
          }
        });
      
        return formattedAddress;
    }
    const [scriptLoaded, setScriptLoaded] = useState(false)

    useEffect(() => {
        if (window.google && window.google.maps) {
            setScriptLoaded(true)
        }
    }, [])

    const handleSelect = async (address: any) => {
      console.log('selecting')
      console.log(address)
      const results = await geocodeByAddress(address);
      console.log("found results")
      console.log(results[0])
      if (results.length === 0) {
          setError("No results found for this address")
          return;
      }
      setAddressString(results[0].formatted_address)
      setFormattedAddress(formatAddress(results[0].address_components))
    };

    if (!scriptLoaded) {
      return (
          <div>
              <Script 
                  type="text/javascript" 
                  src={source} 
                  strategy="beforeInteractive" 
                  onLoad={() => setScriptLoaded(true)}
              />
              <p>Loading address search...</p>
          </div>
      )
  }

    return (
        <div>
          {error && `Error: ${error}`}
          <Script type="text/javascript" src={source} strategy="beforeInteractive" />
          <PlacesAutocomplete
              value={addressString}
              onChange={setAddressString}
              onSelect={handleSelect}
              searchOptions={{
              types: [],
              // componentRestrictions: { country: "ca" },
              }}
          >
              {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
              <div>
                  <input
                  {...getInputProps({
                    placeholder: "Start typing to search addresses...",
                    className: "location-search-input focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md w-full",
                  })}
                  />
                  {(loading || suggestions.length > 0) && (
                    <div className="autocomplete-dropdown-container border rounded-lg p-2 space-y-1">
                      {loading && <div>Loading...</div>}
                      {suggestions.map((suggestion) => {
                          const style = suggestion.active
                          ? { backgroundColor: "#fafafa", cursor: "pointer" }
                          : { backgroundColor: "#ffffff", cursor: "pointer" };
                          return (
                          <div {...getSuggestionItemProps(suggestion, { style })} className="py-2">
                              <span className="flex space-x-4 cursor-select">
                              {suggestion.description} 
                              <CursorArrowIcon className="w-4 h-4" />
                              </span>
                          </div>
                          );
                      })}
                    </div>
                  )}
                  {(formattedAddress && formattedAddress.streetNumber) && <p>Selected Address: {formattedAddress.streetNumber} {formattedAddress.route} {formattedAddress.locality} {formattedAddress.administrativeAreaLevel1} {formattedAddress.country} ({formattedAddress.postalCode})</p>}
              </div>
              )}
          </PlacesAutocomplete>
        </div>
    )
};