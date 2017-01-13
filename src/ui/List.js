import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Button
} from 'react-native';


import { MessageStore } from '../store/MessageStore.js';

var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })

export class List extends Component {
    constructor(props) {
        super(props);

        this.state = { dataSource: ds.cloneWithRows(MessageStore.getState() || []) };
        MessageStore.on('change:message', function (newArray, previousArray) {
            this.state.setState({ dataSource: ds.cloneWithRows(newArray) });
        });
    }


    render() {
        return (
            <ListView
                dataSource={this.state.dataSource}
                renderRow={(rowData) => <Text>{rowData.text}</Text>}
                />
        )
    }

}

