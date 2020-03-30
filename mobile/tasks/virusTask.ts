import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { getData, storeData } from '../shared/asyncStorage';
import { getDistanceFromHome } from '../shared/location';
import { Virus } from '../models/Virus';

export const VIRUS_TASK = 'VIRUS_TASK';
export const MINUTE_INTERVAL = 1;

TaskManager.defineTask(VIRUS_TASK, updateVirusWithLocation);

async function updateVirusWithLocation() {
  try {
    const homeDistance = await getDistanceFromHome();

    const { initialHealth, health } = await getData('Virus');
    const virus = new Virus(initialHealth, health);

    if (homeDistance < 50) {
      virus.reduceHealth(MINUTE_INTERVAL * 60);
    }
    else{
      virus.regenerateHealth(MINUTE_INTERVAL * 60);
    }

    storeData('Virus', virus);

    return BackgroundFetch.Result.NewData;
  } catch (error) {
    return BackgroundFetch.Result.Failed;
  }
}
