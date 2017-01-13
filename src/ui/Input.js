
import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Button
} from 'react-native';

import MaterialsIcon from 'react-native-vector-icons/MaterialIcons';
import { Kohana } from 'react-native-textinput-effects';
import {MessageAction} from '../action/MessageAction.js';
import {Message} from '../model/Message.js';

export class Input extends Component {

    contructor() {
        this.state = { input: '' };
    }

    render() {
        <Kohana
            style={{ backgroundColor: '#f9f5ed' }}
            label={'Message'}
            iconClass={MaterialsIcon}
            iconName={'directions-send'}
            iconColor={'#f4d29a'}
            labelStyle={{ color: '#91627b' }}
            inputStyle={{ color: '#91627b' }}
            value={this.state.input}
            onSubmitEditing={submitData}/>
    }
}

function submitData(){
    let text = this.state.input;
    MessageAction.sendMessage(new Message('Me', 'You', text, 'Today'));
    this.state.input = '';
}
