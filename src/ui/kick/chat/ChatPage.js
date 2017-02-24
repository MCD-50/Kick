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


class ChatPage extends Component {
    constructor(params) {
        super(params);
        const chat = this.props.route.chat;
        const owner = this.props.route.owner
        this.state = {
            chat: chat,
            isLoading: true,
            messages: [],
            owner: owner,
            isGroupChat: chat.info.chat_type == Type.GROUP ? true : false,
            recentAction: {
                action_on_button_click: null,
                action_on_list_item_click: null
            },
        };

        this.addBackEvent = this.addBackEvent.bind(this);
        this.removeBackEvent = this.removeBackEvent.bind(this);
        this.onSend = this.onSend.bind(this);
        this.onMessageReceive = this.onMessageReceive.bind(this);
        this.storeChatItemInDatabase = this.storeChatItemInDatabase.bind(this);
        this.renderSend = this.renderSend.bind(this);
        this.setStateData = this.setStateData.bind(this);

        // this.onViewInfo = this.onViewInfo.bind(this);
        // this.onViewMore = this.onViewMore.bind(this);
        // this.onItemClicked = this.onItemClicked.bind(this);
        // this.callback = this.callback.bind(this);

        this.socket = SocketHelper(this.onMessageReceive);
    }

    componentWillMount() {
        this.addBackEvent();
    }

    componentWillUnmount() {
        this.removeBackEvent();
    }

    componentDidMount() {
        DatabaseHelper.updateChat([this.state.chat.id], [{ is_added_to_chat_list: true }], (results) => {
            DatabaseHelper.getAllChatItemForChatByChatId([this.state.chat.id], (results) => {
                let messages = results.map((result) => {
                    return CollectionUtils.convertToAirChatMessageObjectFromChatItem(result, this.state.isGroupChat)
                });

                this.setStateData(messages.reverse());
            })
        });

    }

    addBackEvent() {
        BackAndroid.addEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                this.props.route.callback(Page.CHAT_PAGE);
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    }

    removeBackEvent() {
        BackAndroid.removeEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                this.props.route.callback(Page.CHAT_PAGE);
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
        console.log(message);
        // this.setState({ isLoading: true, });
        // if (this.state.chat.info.chat_type == Type.BOT)
        //     this.setState({ recentAction: message.action });
        // let chatItem = CollectionUtils.convertToChatItemFromResponse(message,
        //     this.state.chat.id, this.state.chat.info.chat_type)
        // this.setStateData([message]);
        // this.storeChatItemInDatabase(null, chatItem);
    }

    storeChatItemInDatabase(airChatObject, chatItemObject) {
        if (airChatObject) {
            let chatItem = CollectionUtils.convertToChatItemFromAirChatMessageObject(airChatObject,
                this.state.chat.id, this.state.chat.info.chat_type);
            // DatabaseHelper.addNewChatItem([chatItem], (msg) => {
            //     console.log(msg)
            // });
        } else if (chatItemObject) {
            DatabaseHelper.addNewChatItem([chatItemObject], (msg) => {
                console.log(msg)
            });
        }
    }


    onSend(messages = [], page_count = 0) {
        this.setStateData(messages);
        this.storeChatItemInDatabase(messages[0], null);
        let obj = CollectionUtils.prepareBeforeSending(this.state.chat.info.chat_type,
            this.state.chat.title, this.state.chat.info.room, page_count, messages[0], null);
        console.log(obj);
        //InternetHelper.sendData(this.state.owner.domain, obj)
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
    //     let message = CollectionUtils.createChatItem(this.state.userName, this.state.userId,
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
                        this.props.route.callback(Page.CHAT_PAGE);
                        this.props.navigator.pop();
                    }}
                    centerElement={this.props.route.name}
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

