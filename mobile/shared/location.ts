import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

export const getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      return {error: "Need location premissions."}
    }
    let currentLocation = await Location.getCurrentPositionAsync({});
    return currentLocation;
  };