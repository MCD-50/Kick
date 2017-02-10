import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';

import { FIRST_RUN, SERVER_URL } from '../constants/AppConstant.js';

export function isFirstRun(set) {
    if (set)
        setDataAsync(FIRST_RUN, 'false');
    else {
        return getStoredDataFromKeyAsync(FIRST_RUN)
            .then((value) => {
                if (value === null)
                    return true;
                return false;
            })
    }
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

export function getStoredDataFromKey(key) {
    return getStoredDataFromKeyAsync(key);
}


async function getStoredDataFromKeyAsync(key) {
    try {
        return await AsyncStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

export function setData(key, data) {
    setDataAsync(key, data);
}

async function setDataAsync(key, data) {
    try {
        await AsyncStorage.setItem(key, data);
    } catch (error) {
        console.log(error);
    }
}




