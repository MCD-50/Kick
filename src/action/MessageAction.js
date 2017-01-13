
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native';

var fluxify = require('fluxify');

export class MessageAction extends Component{
    sendMessage(message){
        fluxify.doAction('sendMessage', {payload:{message:message}});
    }
}


