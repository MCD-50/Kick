import { View, StyleSheet, StatusBar, ListView, ToastAndroid, ScrollView, Platform, Animated, Easing } from 'react-native';
import React, { Component, PropTypes } from 'react';

import { Toolbar, Icon, Avatar, ListItem, ActionButton } from 'react-native-material-ui';
import { Params } from '../model/Params.js';
import { Chat } from '../model/Chat.js';
var DBEvents = require('react-native-db-models').DBEvents;

import DatabaseHelper from '../helper/DatabaseHelper.js';
import DatabaseWrapper from '../utils/DatabaseWrapper.js';


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};

const menuItems = [
    'Add bot', 'New group', 'New chat', 'Profile', 'Settings'
]


const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });

class ChatList extends Component {

    constructor(params) {
        super(params);

        this.state = {
            searchText: '',
            dataSource: ds.cloneWithRows([]),
        };

        this.renderListItem = this.renderListItem.bind(this);
        this.onChangeText = this.onChangeText.bind(this);
        this.callback = this.callback.bind(this);
        this.setAllChats = this.setAllChats.bind(this);
    }


    componentWillMount() {
        this.setAllChats()
    }

    setAllChats() {
        DatabaseWrapper.getAllChats((results) => {
            console.log(results)
            
            let chats = Object.keys(results.rows).map((key) => {
                const item = results.rows[key];
                const chat = new Chat(item.name, item.latestMsg, item.image, item.newMsgCount);
                chat.setId(item._id);
                return chat;
            })

            this.setState({ dataSource: ds.cloneWithRows(chats) });
        })
    }

    onChangeText(value) {
        this.setState({ searchText: value });
        //search related tasks;
    }

    renderListItem(chat) {
        const searchText = this.state.searchText.toLowerCase();

        if (searchText.length > 0 && chat.getName().toLowerCase().indexOf(searchText) < 0) {
            return null;
        }

        return (
            <ListItem
                divider
                leftElement={<Avatar text={chat.getName()[0]} />}
                centerElement={{
                    primaryText: chat.getName(),
                    secondaryText: chat.getLatestMsg(),
                }}

                onPress={() => this.props.navigator.push({
                    id: 'ChatPage', name: chat.getName(),
                    data: new Params(chat.getName() + '987', 'ChatList', 'https://facebook.github.io/react/img/logo_og.png')
                })} />
        );
    }

    callback() {
        this.setAllChats();
    }

    // recursiveDelete(ids) {
    //     let length = ids.length;
    //     if (length == 0) {
    //         DatabaseHelper.getAllChats(function (results) {
    //             console.log(results);
    //             //this.setState({dataSource : results});
    //         })
    //         return;
    //     }
    //     DatabaseHelper.removeChatById(ids[length - 1], (results) => {
    //         ids.pop();
    //         this.recursiveDelete(ids);
    //     })
    // }

    render() {
        return (
            <View style={styles.container}>
                <Toolbar
                    centerElement='Chats'
                    searchable={{
                        autoFocus: true,
                        placeholder: 'Search chat',
                        onChangeText: value => this.onChangeText(value),
                        onSearchClosed: () => this.setState({ searchText: '' }),
                    }}
                    rightElement={{
                        menu: { labels: menuItems },
                    }}

                    onRightElementPress={(action) => {
                        // if (Platform.OS === 'android') {
                        //     //ToastAndroid.show(menuItems[action.index], ToastAndroid.SHORT);
                        // }

                        this.props.navigator.push({
                            id: 'BotPage', name: 'Bots', data: {},
                            callback: this.callback
                        })

                    } } />


                <ListView
                    dataSource={this.state.dataSource} //data source
                    keyboardShouldPersistTaps='always'
                    keyboardDismissMode='interactive'
                    ref={'LISTVIEW'}
                    renderRow={(item) => this.renderListItem(item)}
                    />

            </View>
        )
    }
}

ChatList.propTypes = propTypes;

export default ChatList;