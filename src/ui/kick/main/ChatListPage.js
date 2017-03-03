import React, { Component, PropTypes } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ListView,
    TouchableOpacity
} from 'react-native';

import _ from 'lodash.groupby';
import Fluxify from 'fluxify';
import Toolbar from '../../customUI/ToolbarUI.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import Container from '../../Container.js';
import { Page } from '../../../enums/Page.js';
import Avatar from '../../customUI/Avatar.js';
import Badge from '../../customUI/Badge.js';
import ListItem from '../../customUI/ListItem.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import { Type } from '../../../enums/Type.js';
import { EMAIL, FULL_NAME, DOMAIN, MOBILE_NUMBER, LAST_ACTIVE } from '../../../constants/AppConstant.js';
import { getStoredDataFromKey, setData } from '../../../helpers/AppStore.js';
import Progress from '../../customUI/Progress.js';
import StateHelper from '../../../helpers/StateHelper.js';
import StateClient from '../../../helpers/StateClient.js';


window.navigator.userAgent = "react-native"
import InternetHelper from '../../../helpers/InternetHelper.js';
import SocketHelper from '../../../helpers/SocketHelper.js';


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    progress: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    hasDefaultBots: PropTypes.bool,
    botList: PropTypes.array,
};

const menuItems = [
    'Bots', 'Contacts', 'New group', 'New contact', 'Profile', 'Settings'
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
class ChatListPage extends Component {

    constructor(params) {
        super(params);
        this.socket = {};
        this.state = {
            searchText: '',
            isLoading: true,
            listOfChats: [],
            dataSource: ds.cloneWithRows([]),
            title: 'Updating...',
            userId: '',
            userName: '',
            domain: '',
            number: '',
        };


        this.onSocketConnectCallback = this.onSocketConnectCallback.bind(this);
        this.onRoomJoinedCallback = this.onRoomJoinedCallback.bind(this);
        this.getMessageOnStart = this.getMessageOnStart.bind(this);
        this.updateFluxState = this.updateFluxState.bind(this);
        this.setStateData = this.setStateData.bind(this);
        this.onChatListChanged = this.onChatListChanged.bind(this);
        this.onMessageReceive = this.onMessageReceive.bind(this);
        this.hasChatInChatList = this.hasChatInChatList.bind(this);
        this.updateChat = this.updateChat.bind(this);

        this.onChangeText = this.onChangeText.bind(this);
        this.getColor = this.getColor.bind(this);
        this.getIcon = this.getIcon.bind(this);
        this.renderListItem = this.renderListItem.bind(this);
        this.renderBadge = this.renderBadge.bind(this);
        this.rightElementPress = this.rightElementPress.bind(this);
        this.renderElement = this.renderElement.bind(this);
        this.renderLastMessageTime = this.renderLastMessageTime.bind(this);

        this.callback = this.callback.bind(this);
    }

    componentWillMount() {
        getStoredDataFromKey(EMAIL).then((mail) => {
            getStoredDataFromKey(MOBILE_NUMBER).then((number) => {
                getStoredDataFromKey(FULL_NAME).then((name) => {
                    getStoredDataFromKey(DOMAIN).then((dom) => {
                        this.setState({ domain: dom });
                        this.setState({ userName: name });
                        this.setState({ userId: mail });
                        this.setState({ number: number });
                        Fluxify.doAction('setAppData', {
                            user_id: mail,
                            user_name: name,
                            number: number,
                            domain: dom
                        });
                    });
                });
            });
        });
    }

    componentDidMount() {
        StateHelper.setOnChatListChanged(this.onChatListChanged);
        this.socket = SocketHelper(this.onMessageReceive, this.onSocketConnectCallback, this.onRoomJoinedCallback);
    }

    onSocketConnectCallback() {
        getStoredDataFromKey(EMAIL).then((mail) => {
            this.socket.joinRoom(mail.toLowerCase().trim());
        });
    }

    onRoomJoinedCallback() {
        DatabaseHelper.getAllChats((results) => {
            let chats = Object.keys(results.rows).map((key) => results.rows[key]);
            chats = CollectionUtils.getSortedArrayByDate(chats);
            console.log(chats);
            this.updateFluxState(chats);
            this.getMessageOnStart(chats);
        });
    }

    updateFluxState(chats) {
        Fluxify.doAction('updateChatList', chats);
    }

    onChatListChanged(chatList) {
        console.log(chatList);
        if (Page.CHAT_LIST_PAGE.id == StateClient.currentPageId)
            this.setStateData(chatList);
    }

    setStateData(chats) {
        chats = chats.filter((n) => n.info.is_added_to_chat_list == true);
        this.setState({
            listOfChats: chats,
            dataSource: ds.cloneWithRows(chats),
            isLoading: false,
        });
    }


    getMessageOnStart(x) {
        let chats = x.filter((m) => m.info.chat_type != Type.BOT);
        chats = CollectionUtils.getUniqueItemsByChatRoom(chats);

        const rooms = chats.map((n) => n.info.room);
        const last_message_times = chats.map((n) => n.info.last_message_time);

        console.log(rooms);
        console.log(last_message_times);

        InternetHelper.checkIfNetworkAvailable((isConnected) => {
            if (isConnected) {
                InternetHelper.getAllMessages(this.state.domain, {
                    mail_id: this.state.userId,
                    rooms: rooms,
                    last_message_times: last_message_times
                });
            } else {
                this.setState({title: 'Kick'});
            }
        });
    }

    onMessageReceive(messages) {
        if (this.state.title == 'Updating...') {
            this.setState({ title: 'Kick' });
        }
        console.log(messages);
        if (messages.length < 1)
            return;
        let finalChatList = [];
        let finalChatItemsList = [];

        let chatList = StateClient.chatList;
        console.log(chatList);
        console.log(StateClient.currentChat);
        messages = CollectionUtils.getSortedArrayByRoom(messages);
        const chats = CollectionUtils.getUniqueItems(messages);

        for (const chat of chats) {
            if (messages.length > 0) {
                let ignoreOwner = false;
                let chatToBeUpdated = this.hasChatInChatList(chatList, chat);
                if (chatToBeUpdated == null) {
                    ignoreOwner = true;
                    chatToBeUpdated = CollectionUtils.createChatFromResponse(chat);
                }
                const newChatItemsToBeAdded = messages.filter((m) => m.room == chatToBeUpdated.info.room);
                messages = messages.filter((m) => m.room != chatToBeUpdated.info.room);
                console.log(newChatItemsToBeAdded);
                if (newChatItemsToBeAdded && newChatItemsToBeAdded.length > 0) {
                    const res = this.updateChat(newChatItemsToBeAdded,
                        chatToBeUpdated, StateClient.appData, chatList,
                        StateClient.currentChat, StateClient.currentChatMessages, ignoreOwner);
                    console.log(res);
                    finalChatList.push(res.chat);
                    finalChatItemsList = finalChatItemsList.concat(res.chatItems);
                }
            } else {
                break;
            }
        }

        if (finalChatList && finalChatList.length > 0) {
            const sortedChatList = CollectionUtils.pushNewDataAndSortArray(chatList, finalChatList);
            const sortedChatItems = CollectionUtils.getSortedChatItems(finalChatItemsList);
            console.log(sortedChatList);
            console.log(sortedChatItems);
            this.updateFluxState(sortedChatList);
            DatabaseHelper.addNewChat(sortedChatList, (msg) => {
                console.log(msg);
                DatabaseHelper.addNewChatItem(finalChatItemsList, (msg) => {
                    console.log(msg);
                })
            }, true);
        }
    }

    hasChatInChatList(chatList, chat) {
        const x = chatList.filter((n) => n.info.room == chat.room);
        return x.length > 0 ? x[0] : null;
    }

    updateChat(newChatItemsToBeAdded, chatToBeUpdated, ownerInfo, chatList,
        currentChat, currentMessages, ignoreOwner = false) {

        console.log(chatToBeUpdated);

        let chatItems = [];
        if (chatToBeUpdated.info.chat_type == Type.BOT) {
            if (ignoreOwner || newChatItemsToBeAdded[0].bot_name != ownerInfo.user_name) {
                chatItems = newChatItemsToBeAdded.map((x) => {
                    return CollectionUtils.createChatItemFromResponse(x, chatToBeUpdated.info.room, chatToBeUpdated.title)
                });
            }
        } else {
            if (ignoreOwner || newChatItemsToBeAdded[0].user_id != ownerInfo.user_id) {
                chatItems = newChatItemsToBeAdded.map((x) => {
                    return CollectionUtils.createChatItemFromResponse(x, chatToBeUpdated.info.room, null)
                });
            }
        }

        if (chatItems.length > 0) {
            const lastChatItem = chatItems[(chatItems.length - 1)];
            const new_message_count = chatToBeUpdated.info.new_message_count == null
                ? chatItems.length : chatToBeUpdated.info.new_message_count + chatItems.length;
            chatToBeUpdated = Object.assign({}, chatToBeUpdated, {
                sub_title: lastChatItem.message.text,
                info: {
                    ...chatToBeUpdated.info,
                    is_added_to_chat_list: true,
                    last_message_time: lastChatItem.message.created_on,
                    new_message_count: new_message_count,
                    last_active: CollectionUtils.getLastActive(lastChatItem.message.created_on)

                }
            });
            console.log(currentChat)
            if (currentChat && currentChat.info && currentChat.info.room == chatToBeUpdated.info.room) {
                let isGroupChat = chatToBeUpdated.info.chat_type == Type.GROUP ? true : false;

                let botAirchatObject = chatItems.map((item) => {
                    return CollectionUtils.convertToAirChatMessageObjectFromChatItem(item, isGroupChat)
                });

                currentMessages = botAirchatObject.concat(currentMessages);
                chatToBeUpdated = Object.assign({}, chatToBeUpdated, {
                    info: {
                        ...chatToBeUpdated.info,
                        is_added_to_chat_list: true,
                        last_message_time: lastChatItem.message.created_on,
                        new_message_count: null,
                        last_active: CollectionUtils.getLastActive(lastChatItem.message.created_on)

                    }
                });

                Fluxify.doAction('updateCurrentChat', chatToBeUpdated);
                Fluxify.doAction('updateCurrentChatMessages', currentMessages);
            }
            
        }
        return {
            chat: chatToBeUpdated,
            chatItems: chatItems
        };
    }

    callback(fromWhichPage, chat) {
        switch (fromWhichPage.id) {
            case Page.BOT_LIST_PAGE.id:
                break;
            case Page.CHAT_PAGE.id:
                break;
            case Page.CONTACT_LIST_PAGE.id:
                break;
            case Page.NEW_GROUP_PAGE.id:
                break;
            default:
                break;
        }

        Fluxify.doAction('updateCurrentPageId', Page.CHAT_LIST_PAGE.id);
        Fluxify.doAction('updateCurrentChatMessages', []);
        Fluxify.doAction('updateCurrentChat', null);
        if (chat) {
            console.log(StateClient.chatList);
            const sortedChatList = CollectionUtils.pushNewDataAndSortArray(StateClient.chatList, [chat])
            console.log(sortedChatList);
            Fluxify.doAction('updateChatList', sortedChatList);
        } else {
            Fluxify.doAction('updateChatList', StateClient.chatList);
        }
    }

    onChangeText(e) {
        this.setState({ searchText: e });
    }

    getColor(name) {
        const length = name.length;
        return colors[length % colors.length];
    }

    renderBadge(count) {
        if (count && count > 0)
            return <Badge text={count.toString()} />
        return null
    }


    getIcon(type) {
        if (type == Type.BOT) {
            return 'toys';
        } else if (type == Type.GROUP) {
            return 'people';
        } else {
            return 'person';
        }
    }

    renderLastMessageTime(last_message_time) {
        if (last_message_time) {
            last_message_time = last_message_time.split(' ');
            if (last_message_time.length > 1) {
                let today = CollectionUtils.getTodayDate();
                if (today == last_message_time[0]) {
                    last_message_time = last_message_time[1].split(':');
                    return last_message_time[0] + ':' + last_message_time[1];
                } else {
                    return last_message_time[0];
                }
            }
        }
        return null;
    }

    renderListItem(chat) {
        const searchText = this.state.searchText.toLowerCase();
        if (searchText.length > 0 && chat.title.toLowerCase().indexOf(searchText) < 0) {
            return null;
        }

        let title = (chat.title.length > 1) ? chat.title[0] + chat.title[1].toUpperCase() : ((chat.title.length > 0) ? chat.title[0] : 'UN');
        return (
            <ListItem
                divider

                leftElement={<Avatar bgcolor={this.getColor(chat.title)} text={title} />}

                centerElement={{
                    primaryText: chat.title,
                    secondaryText: chat.sub_title,
                    tertiaryText: this.getIcon(chat.info.chat_type)
                }}

                rightElement={{
                    upperElement: this.renderLastMessageTime(chat.info.last_message_time),
                    lowerElement: this.renderBadge(chat.info.new_message_count),
                }}

                onPress={() => {
                    let page = Page.CHAT_PAGE;
                    let state = this.state;
                    this.props.navigator.push({
                        id: page.id,
                        name: page.name,
                        chat: chat,
                        callback: this.callback,
                        owner: {
                            userName: state.userName,
                            userId: state.userId,
                            domain: state.domain
                        }
                    })
                }} />
        );
    }

    rightElementPress(action) {
        let page = null;
        let isForGroupChat = false;
        switch (action.index) {
            case 0:
                page = Page.BOT_LIST_PAGE;
                break;
            case 1:
                page = Page.CONTACT_LIST_PAGE;
                break;
            case 2:
                //creating new group page
                isForGroupChat = true;
                page = Page.CONTACT_LIST_PAGE
                break;
            case 3: page = Page.NEW_CONTACT_PAGE
                break;
            case 4: page = Page.OWNER_INFO_PAGE
                break;
            case 5: page = Page.SETTINGS_PAGE
                break;
        }

        if (page) {
            let state = this.state;
            this.props.navigator.push({
                id: page.id,
                name: page.name,
                callback: this.callback,
                owner: {
                    userName: state.userName,
                    userId: state.userId,
                    domain: state.domain
                },
                isForGroupChat: isForGroupChat
            });
        }

    }

    renderElement() {
        if (this.state.isLoading) {
            return (
                <View style={styles.progress}>
                    <Progress color={['#3f51b5']} size={50} duration={300} />
                </View>)
        }

        return (
            <ListView
                dataSource={this.state.dataSource}
                keyboardShouldPersistTaps='always'
                keyboardDismissMode='interactive'
                enableEmptySections={true}
                ref={'LISTVIEW'}
                renderRow={(item) => this.renderListItem(item)}
            />
        );
    }


    render() {
        return (
            <Container>
                <Toolbar
                    centerElement={this.state.title}
                    searchable={{
                        autoFocus: true,
                        placeholder: 'Search chat...',
                        onChangeText: e => this.onChangeText(e),
                        onSearchClosed: () => this.setState({ searchText: '' }),
                    }}

                    rightElement={{
                        menu: { labels: menuItems },
                    }}
                    onRightElementPress={(action) => this.rightElementPress(action)}

                />
                {this.renderElement()}

            </Container>
        )
    }
}

ChatListPage.propTypes = propTypes;

export default ChatListPage;