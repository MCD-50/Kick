import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import { FIRST_RUN, EMAIL, DOMAIN, FULL_URL, SERVER_URL } from './AppConstant.js';


export function getStoredDataFromKey(key) {
    return getStoredDataFromKeyAsync(key);
}

export function isFirstRun() {
    return getStoredDataFromKeyAsync(FIRST_RUN)
        .then((value) => {
            if (value === 'Guest')
                return true;
            return false;
        })
}

export function hasServerUrl() {
    return getStoredDataFromKeyAsync(SERVER_URL)
        .then((value) => {
            if (value === null) {
                return false;
            }
            return true;
        })
}

export function setData(key, data) {
    setDataAsync(key, data);
}

async function getStoredDataFromKeyAsync(key) {
    try {
        return await AsyncStorage.getItem(key);
    } catch (error) {
        if (key === FIRST_RUN)
            setDataAsync(FIRST_RUN, 'False');
        else if (key === SERVER_URL)
            return null;
        else
            return 'Guest';
    }
}

async function setDataAsync(key, data) {
    try {
        console.log(data);
        console.log(key);
        await AsyncStorage.setItem(key, data);
        
        // getStoredDataFromKeyAsync(key)
        //     .then(console);

    } catch (error) {
        console.log(error);
    }
}




