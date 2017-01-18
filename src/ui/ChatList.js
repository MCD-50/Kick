import { View, StyleSheet, StatusBar, ListView, ToastAndroid, ScrollView, Platform, Animated, Easing } from 'react-native';
import React, { Component, PropTypes } from 'react';

import { Toolbar, Icon, Avatar, ListItem, ActionButton } from 'react-native-material-ui';

import { Params } from '../model/Params.js';

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
    }

    onChangeText(value) {
        this.setState({ searchText: value });
        //search related tasks;
    }

    renderListItem(chatlistItem) {
        const searchText = this.state.searchText.toLowerCase();

        if (searchText.length > 0 && chatlistItem.toLowerCase().indexOf(searchText) < 0) {
            return null;
        }

        return (
            <ListItem
                divider
                leftElement={<Avatar text={chatlistItem[0]} />}
                centerElement={chatlistItem}
                onPress={() => this.props.navigator.push({
                    id: 'ChatPage', name: chatlistItem, data: new Params(chatlistItem + '987', 'ChatList', 'https://facebook.github.io/react/img/logo_og.png')
                })} />
        );
    }

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
                            id: 'BotPage', name: 'Bots', data: {}
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