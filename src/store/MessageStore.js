
import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Button
} from 'react-native';

var fluxify = require('fluxify');

export var MessageStore = fluxify.createStore({
    id: 'MessageStore',
    initialState: {
        message: [],
        error: ''
    },
    
    actionCallbacks: {
        sendMessage(state, action) {
            var arrayvar = state.message.slice()
            arrayvar.push(action.payload.message);
            state.set(arrayvar);
        },
        errorOnMessage(state, error) {
            state.set({ message: error });
        },
    }
});
