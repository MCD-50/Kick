import { View, StyleSheet, StatusBar, ListView, ToastAndroid, ScrollView, Platform, Animated, Easing } from 'react-native';
import React, { Component, PropTypes } from 'react';

import { Chat } from '../../../models/Chat.js';
import Toolbar from '../../customUI/ToolbarUI.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import Container from '../../Container.js';
import { Page } from '../../../enums/Page.js';
import Avatar from '../../customUI/Avatar.js';
import Badge from '../../customUI/Badge.js';
import ListItem from '../../customUI/ListItem.js';
import { convertToChat } from '../../../helpers/CollectionUtils.js';


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    hasDefaultBots: PropTypes.bool,
    botList: PropTypes.array,
};

const menuItems = [
    'Add bot', 'New group', 'New chat', 'Profile', 'Settings'
]

const defaultProps = {
    hasDefaultBots: false,
    botList: [],
}

const colors = [
    '#e67e22', // carrot
    '#3498db', // peter river
    '#8e44ad', // wisteria
    '#e74c3c', // alizarin
    '#1abc9c', // turquoise
    '#2c3e50', // midnight blue
];

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });
class ChatList extends Component {

    constructor(params) {
        super(params);
        this.state = {
            searchText: '',
            isLoading: true,
            chats: [],
            dataSource: ds.cloneWithRows([]),
        };

        this.renderListItem = this.renderListItem.bind(this);
        this.renderBadge = this.renderBadge.bind(this);
        this.getColor = this.getColor.bind(this);
        this.callbackFromChatPage = this.callbackFromChatPage.bind(this);
        this.callbackFromBotPage = this.callbackFromBotPage.bind(this);
        this.callbackFromContactPage = this.callbackFromContactPage.bind(this);
    }

    componentDidMount() {
        DatabaseHelper.getAllChats((results) => {
            let chats = Object.keys(results.rows).map((key) => {
                return convertToChat(results.rows[key], true);
            })
            this.setState({
                chats: chats,
                dataSource: ds.cloneWithRows(chats),
                isLoading: false
            });

        })
    }


    
    onChangeText(value) {
        this.setState({ searchText: value });
    }

    getColor(name) {
        const length = name.length;
        return colors[length % colors.length];
    }

    renderBadge(count) {
        if (count > 0)
            return <Badge text={count} />
        return null
    }

    renderListItem(chat) {
        const searchText = this.state.searchText.toLowerCase();

        if (searchText.length > 0 && searchText.indexOf(chat.title.toLowerCase()) < 0) {
            return null;
        }

        return (
            <ListItem
                divider
                leftElement={<Avatar bgcolor={this.getColor(chat.title)} text={chat.title[0] + chat.title[1].toUpperCase()} />}
                centerElement={{
                    primaryText: chat.title,
                    secondaryText: chat.subTitle,
                }}

                rightElement={this.renderBadge(chat.badge)}

                onPress={() => {
                    let page = Page.CHAT_PAGE;
                    this.props.navigator.push({ id: page.id, name: page.name, data: chat })
                }} />
        );
    }

    // callback() {
    //     this.setAllChats();
    // }
    // searchable={{
    //                     autoFocus: true,
    //                     placeholder: 'Search chat',
    //                     onChangeText: value => this.onChangeText(value),
    //                     onSearchClosed: () => this.setState({ searchText: '' }),
    //                 }}
    //                 rightElement={{
    //                     menu: { labels: menuItems },
    //                 }}

    //                 onRightElementPress={(action) => {
    //                     // if (Platform.OS === 'android') {
    //                     //     //ToastAndroid.show(menuItems[action.index], ToastAndroid.SHORT);
    //                     // }

    //                     this.props.navigator.push({
    //                         id: 'BotPage', name: 'Bots', data: {},
    //                         callback: this.callback
    //                     })
    //                 }}

    render() {
        return (
            <Container>

                <Toolbar centerElement='Chats' />

                <ListView
                    dataSource={this.state.dataSource} //data source
                    keyboardShouldPersistTaps='always'
                    keyboardDismissMode='interactive'
                    enableEmptySections={true}
                    ref={'LISTVIEW'}
                    renderRow={(item) => this.renderListItem(item)}
                />

            </Container>
        )
    }
}

ChatList.propTypes = propTypes;

export default ChatList;