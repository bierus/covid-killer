import AsyncStorage from '@react-native-community/async-storage';

export const storeData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value)
    } catch (e) {
        // saving error
    }
}

export const getData = async (key) => {
    try {
        console.log("CALLED")
        const value = await AsyncStorage.getItem(key)
        console.log(value);
        if (value !== null) {
            return value;
        }
    } catch (e) {
        // error reading value
    }
}