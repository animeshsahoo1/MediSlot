export const getCoordinatesFromAddress = async (address) => {
  try {
    const { name, street, city, state, country, postcode } = address;
    //uricomponent converts a string to a uri component i.e abc hospital into abc%20hospital like this
    const url = `https://api.geoapify.com/v1/geocode/search?name=${encodeURIComponent(name)}&street=${encodeURIComponent(
      street
    )}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(
      state
    )}&country=${encodeURIComponent(
      country
    )}&postcode=${encodeURIComponent(
      postcode
    )}&limit=1&format=json&apiKey=${process.env.GEOAPIFY_API_KEY}`;

    var requestOptions = {
        method: 'GET',
    };
    const response = await fetch(url, requestOptions);
    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error("No coordinates found for the given address");
    }
    //check the retun json of the api to see the structure of the returned json format
    const [lon, lat] = data.features[0].geometry.coordinates;
    return { lon, lat };
  } catch (error) {
    return { error: error.message || "Error fetching coordinates" };
  }
};
