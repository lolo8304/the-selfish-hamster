import { Client } from '@googlemaps/google-maps-services-js';
import { HamsterPlace } from '../entity/HamsterPlace';

export class GooglePlaces {
  async FindByNameAndLocation(name, zip) {
    const client = new Client({});
    return client
      .textSearch({
        params: {
          // eslint-disable-next-line radix
          query: `${name} near ${Math.floor(Number.parseInt(zip) / 10) * 10}`,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
        timeout: 1000, // milliseconds
      })
      .then(r => r.data.results.map((p) => {
        const place = new HamsterPlace();
        place.name = p.name;
        place.formattedAddress = p.formatted_address;
        return place;
      }))
      .catch(e => []);
  }
}