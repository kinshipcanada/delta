import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useState } from "react";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";

export default function Home() {
 const { isLoaded } = useJsApiLoader({
   googleMapsApiKey: "AIzaSyBimjBAxzzGXeDQfEyD4iH4U-67P5gh3KU",
 });

 if (!isLoaded) return <div>Loading...</div>;
 return <Address />;
}

function Address() {
  // Your existing state variables and functions here
  const [address, setAddress] = useState("");

  // Handle place selection
  const handleSelect = async (address: any) => {
    setAddress(address);
    const results = await geocodeByAddress(address);
    console.log(results)
  };

  return (
    <div>
      <PlacesAutocomplete
        value={address}
        onChange={setAddress}
        onSelect={handleSelect}
        searchOptions={{
          types: [],
          componentRestrictions: { country: "ca" },
        }}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <input
              {...getInputProps({
                placeholder: "Search Places ...",
                className: "location-search-input",
                style: {
                  width: "50%",
                  marginBottom: 8,
                  paddingInline: 8,
                  paddingBlock: 4,
                  borderRadius: 8,
                  zIndex: 100,
                },
              })}
            />
            <div className="autocomplete-dropdown-container">
              {loading && <div>Loading...</div>}
              {suggestions.map((suggestion) => {
                const style = suggestion.active
                  ? { backgroundColor: "#fafafa", cursor: "pointer" }
                  : { backgroundColor: "#ffffff", cursor: "pointer" };
                return (
                  <div {...getSuggestionItemProps(suggestion, { style })}>
                    {suggestion.description}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
    </div>
  )
};