import AsyncStorage from '@react-native-community/async-storage';

export const storeData = async (key, value) => {
    try {
        console.log("save",key,value)
        await AsyncStorage.setItem(key, value)
    } catch (e) {
        // saving error
    }
}

export const getData = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key)
        if (value !== null) {
            console.log("got", value)
            return value;
        }
    } catch (e) {
        // error reading value
    }
}