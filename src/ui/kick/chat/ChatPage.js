import React, { Component, PropTypes } from 'react';
import {
    View,
    StyleSheet,
    BackAndroid,
} from 'react-native';

import { AirChatUI } from '../../customUI/airchat/AirChatUI.js';
import { Message } from '../../../models/Message.js';
import SendUI from '../../customUI/SendUI.js';
import Toolbar from '../../customUI/ToolbarUI.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import Container from '../../Container.js';
import { Page } from '../../../enums/Page.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import { Type } from '../../../enums/Type.js';
import { EMAIL, FIRST_NAME } from '../../../constants/AppConstant.js';
import { getStoredDataFromKey } from '../../../helpers/AppStore.js';
import { ActionName } from '../../../enums/ActionName.js';
import Progress from '../../customUI/Progress.js';


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
};


const menuItems = [
    'View info', 'Clear chat', 'Mail chat'
]

let count = 0;
class ChatPage extends Component {
    constructor(params) {
        super(params);
        const chat = this.props.route.chat;
        this.socket = {};
        this.state = {
            chat: chat,
            isLoading: true,
            messages: [],
            owner: this.props.route.owner,
            isGroupChat: chat.info.chat_type == Type.GROUP ? true : false,
            recentAction: {
                action_on_button_click: null,
                action_on_list_item_click: null
            },
        };

        this.onMessageReceive = this.onMessageReceive.bind(this);
        this.onSocketConnectCallback = this.onSocketConnectCallback.bind(this);
        //this.socket = SocketHelper(this.onMessageReceive, onSocketConnectCallback);


        this.addBackEvent = this.addBackEvent.bind(this);
        this.removeBackEvent = this.removeBackEvent.bind(this);
        this.onSend = this.onSend.bind(this);

        this.storeChatItemInDatabase = this.storeChatItemInDatabase.bind(this);
        this.renderSend = this.renderSend.bind(this);
        this.setStateData = this.setStateData.bind(this);
        this.setUsers = this.setUsers.bind(this);
        // this.onViewInfo = this.onViewInfo.bind(this);
        // this.onViewMore = this.onViewMore.bind(this);
        // this.onItemClicked = this.onItemClicked.bind(this);
        // this.callback = this.callback.bind(this);


    }

    componentWillMount() {
        this.addBackEvent();
    }

    componentWillUnmount() {
        this.socket.leaveRoom(this.state.chat.info.room);
        DatabaseHelper.updateChat([this.state.chat._id], [this.state.chat], (msg) => {
            console.log(msg);
        });
        this.removeBackEvent();
    }

    setUsers() {
        let users = [];
        if (this.state.chat.info.chat_type == Type.GROUP) {
            users = this.state.chat.group.people;
        } else if (this.state.chat.info.chat_type == Type.PERSONAL) {
            let owner = this.state.owner;
            let currentUser = {
                title: owner.userName,
                email: owner.userId,
                number: owner.number
            };
            users = [currentUser, this.state.chat.person];
        }

        if (users.length > 0)
            InternetHelper.setUsersInARoom(this.state.owner.domain, users, this.state.chat.info.room);
    }

    componentDidMount() {
        this.socket = SocketHelper(this.onMessageReceive, this.onSocketConnectCallback);
    }

    onSocketConnectCallback() {
        this.socket.joinRoom(this.state.chat.info.room);
        this.setState({
            chat: Object.assign({}, this.state.chat, {
                info: {
                    ...this.state.chat.info,
                    new_message_count: null
                }
            })
        });
        this.setUsers();
        DatabaseHelper.getAllChatItemForChatByChatId([this.state.chat._id], (results) => {
            let messages = results.map((result) => {
                return CollectionUtils.convertToAirChatMessageObjectFromChatItem(result, this.state.isGroupChat)
            });
            this.setStateData(messages.reverse());
        })

    }

    addBackEvent() {
        BackAndroid.addEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                this.props.route.callback(Page.CHAT_PAGE, this.state.chat);
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    }

    removeBackEvent() {
        BackAndroid.removeEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                this.props.route.callback(Page.CHAT_PAGE, this.state.chat);
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    }

    setStateData(messages) {
        this.setState((previousState) => {
            return {
                isLoading: false,
                messages: AirChatUI.append(previousState.messages, messages),
                recentAction: this.state.recentAction,
            }
        })
    }

    onMessageReceive(message) {
        let botChatItems = [];
        let otherChatItems = [];
        let chat = this.state.chat;
        for (x of message) {
            if (x.is_bot == 'true' && x.bot_name != this.state.owner.userName) {
                botChatItems.push(CollectionUtils.createChatItemFromResponse(x, chat._id, chat.title))
            } else if (x.is_bot == 'false' && x.user_id != this.state.owner.userId) {
                otherChatItems.push(CollectionUtils.createChatItemFromResponse(x, chat._id, null))
            }
        }

        if (botChatItems.length > 0) {
            const lastChatItem = botChatItems[(botChatItems.length - 1)];

            chat = Object.assign({}, chat, {
                sub_title: lastChatItem.message.text,
                info: {
                    ...chat.info,
                    last_message_time: lastChatItem.message.created_on,
                }
            });

            let botAirchatObject = botChatItems.map((item) => {
                return CollectionUtils.convertToAirChatMessageObjectFromChatItem(item, false)
            });
            this.setState({ recentAction: lastChatItem.action });
            this.setStateData(botAirchatObject);
            DatabaseHelper.addNewChatItem(botChatItems, (msg) => {
                //console.log(msg);
            });
        }

        if (otherChatItems.length > 0) {
            const lastChatItem = otherChatItems[(otherChatItems.length - 1)];
            chat = Object.assign({}, chat, {
                sub_title: lastChatItem.message.text,
                info: {
                    ...chat.info,
                    last_message_time: lastChatItem.message.created_on,
                }
            });
            let otherAirchatObject = otherChatItems.map((item) => {
                return CollectionUtils.convertToAirChatMessageObjectFromChatItem(item, this.state.isGroupChat)
            });
            this.setStateData(otherAirchatObject);
            DatabaseHelper.addNewChatItem(otherChatItems, (msg) => {
                //console.log(msg);
            })
        }
        this.setState({ chat: chat });
    }




    storeChatItemInDatabase(airChatObject, chatItemObject) {
        if (airChatObject) {
            let chatItem = CollectionUtils.convertToChatItemFromAirChatMessageObject(airChatObject,
                this.state.chat._id, this.state.chat.info.chat_type);

            this.setState({
                chat: Object.assign({}, this.state.chat, {
                    sub_title: airChatObject.text,
                    info: {
                        ...this.state.chat.info,
                        is_added_to_chat_list: true,
                        last_message_time: chatItem.message.created_on,
                        last_active: CollectionUtils.getLastActive(chatItem.message.created_on)
                    }
                })
            });


            DatabaseHelper.addNewChatItem([chatItem], (msg) => {
                //console.log(msg)
            });
        } else if (chatItemObject) {
            this.setState({
                chat: Object.assign({}, this.state.chat, {
                    sub_title: chatItemObject.message.text,
                    info: {
                        ...this.state.chat.info,
                        is_added_to_chat_list: true,
                        last_message_time: chatItemObject.message.created_on,
                        last_active: CollectionUtils.getLastActive(chatItemObject.message.created_on)
                    }
                })
            });

            DatabaseHelper.addNewChatItem([chatItemObject], (msg) => {
                //console.log(msg)
            });
        }
    }



    onSend(messages = [], page_count = 0) {
        InternetHelper.checkIfNetworkAvailable((isConnected) => {
            if (isConnected) {
                this.setStateData(messages);
                this.storeChatItemInDatabase(messages[0], null);
                let chat_title = this.state.isGroupChat ? this.state.chat.title : this.state.owner.userName
                let obj = CollectionUtils.prepareBeforeSending(this.state.chat.info.chat_type,
                    chat_title, this.state.chat.info.room, page_count, messages[0], null);
                InternetHelper.sendData(this.state.owner.domain, obj);
            }
        })
    }

    // onViewInfo(message) {
    //     let page = Page.VIEW_INFO_PAGE;
    //     this.props.navigator.push({ id: page.id, name: page.name, data: message.info });
    // }

    // onViewMore(message) {
    //     let page = Page.VIEW_MORE_PAGE;
    //     this.props.navigator.push({ id: page.id, name: page.name, data: message.info });
    // }

    // onItemClicked(message, index) {
    //     let action = message.info.action;
    //     let page, item = null;
    //     switch (action.actionOnListItemClick) {
    //         case ActionName.UPDATE:
    //             page = Page.EDIT_INFO_PAGE;
    //             let data = { message: message, index: index, callback: callback };
    //             this.props.navigator.push({ id: page.id, name: page.name, data: data });
    //             break;

    //         case ActionName.DELETE:
    //             item = message.info.listItems[index]
    //             this.callback('Alright, delete item', item.name, ActionName.DELETE_ITEM);
    //             break;

    //         case ActionName.INFO:
    //             page = Page.VIEW_INFO_PAGE;
    //             this.props.navigator.push({ id: page.id, name: page.name, data: message });
    //             break;
    //     }
    // }


    // callback(text, name, childActionName) {
    //     let message = CollectionUtils.createChatItem(this.state.owner.userName, this.state.owner.userId,
    //         text, new Date(), null, null, null, null, null, null, null, null, null, this.state.chatId, Type.BOT);

    //     switch (childActionName) {
    //         case ActionName.DELETE_ITEM:
    //             this.onBotMessageSend([message], name, ActionName.DELETE, childActionName, 0);
    //             break;
    //         case ActionName.UPDATE_ITEM:
    //             this.onBotMessageSend([message], name, ActionName.UPDATE, childActionName, 0);
    //             break;
    //     }
    // }

    renderSend(props) {
        return (
            <SendUI {...props } />
        )
    }

    render() {
        return (
            <View style={styles.container}>

                <Toolbar
                    leftElement="arrow-back"
                    onLeftElementPress={() => {
                        this.props.route.callback(Page.CHAT_PAGE, this.state.chat);
                        this.props.navigator.pop();
                    }}
                    centerElement={this.state.chat.title}
                    rightElement={{
                        menu: { labels: menuItems },
                    }}

                    onRightElementPress={(action) => { }} />

                <AirChatUI
                    messages={this.state.messages}
                    onSend={this.onSend}

                    user={{
                        _id: this.state.owner.userId,
                        name: this.state.owner.userName,
                    }}

                    info={{
                        button_text: null,
                        is_interactive_chat: null,
                        is_interactive_list: null
                    }}

                    action={{
                        action_on_button_click: null,
                        action_on_list_item_click: null
                    }}

                    listItems={{
                        action_on_internal_item_click: null,
                        items: null
                    }}

                    action={this.state.recentAction}

                    onViewInfo={this.onViewInfo}
                    onViewMore={this.onViewMore}
                    onItemClicked={this.onItemClicked}

                    isAlert={false}
                    isGroupChat={this.state.isGroupChat}

                    keyboardDismissMode='interactive'
                    enableEmptySections={true}
                    renderSend={this.renderSend}
                />
            </View>
        )
    }
}

ChatPage.propTypes = propTypes;

export default ChatPage;

