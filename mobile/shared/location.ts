import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { LocationData } from 'expo-location';
import { getData } from './asyncStorage';

export async function getLocationAsync() {
  const { status } = await Permissions.askAsync(Permissions.LOCATION);

  if (status === 'granted') {
    return {
      errorMessage: '',
      location: await Location.getCurrentPositionAsync({})
    };
  }
  return { errorMessage: 'Need permission for localization', location: null };
}

export function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: string
) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;

    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;

    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

    if (dist > 1) {
      dist = 1;
    }

    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;

    if (unit == 'K') {
      dist *= 1.609344;
    } else if (unit == 'M') {
      dist *= 1609.344;
    } else if (unit == 'N') {
      dist *= 0.8684;
    }
    return dist;
  }
}

export async function getDistanceFromHome() {
  const { location } = await getLocationAsync();
  const homeLocation: LocationData = await getData('homeLocation');

  return getDistance(
    location.coords.latitude,
    location.coords.longitude,
    homeLocation.coords.latitude,
    homeLocation.coords.longitude,
    'M'
  );
}
