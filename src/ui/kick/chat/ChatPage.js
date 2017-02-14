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

        const data = this.props.route.data;
        this.state = {
            doctype: data.chat.type == Type.BOT ? data.chat.title : null,
            chatId: data.chat.id,
            chatType: data.chat.type,
            userId: data.owner.userId,
            userName: data.owner.userName,
            domain: data.owner.domain,
            room: data.chat.room,

            isLoading: true,
            messages: [],

            isGroupChat: data.chat.type == Type.GROUP ? true : false,
            recentAction: {
                actionName: null,
                actionOnButtonClick: null,
                actionOnListItemClick: null
            },

        };

        this.addBackEvent = this.addBackEvent.bind(this);
        this.removeBackEvent = this.removeBackEvent.bind(this);
        this.onSend = this.onSend.bind(this);
        this.onMessageReceive = this.onMessageReceive.bind(this);
        this.storeChatItemInDatabase = this.storeChatItemInDatabase.bind(this);
        this.renderSend = this.renderSend.bind(this);
        this.setStateData = this.setStateData.bind(this);
        this.onBotMessageSend = this.onBotMessageSend.bind(this);

        this.onViewInfo = this.onViewInfo.bind(this);
        this.onViewMore = this.onViewMore.bind(this);
        this.onItemClicked = this.onItemClicked.bind(this);
        this.callback = this.callback.bind(this);
        


        this.socket = SocketHelper(this.onMessageReceive);
    }

    componentWillMount() {
        this.addBackEvent();
    }

    componentWillUnmount() {
        this.removeBackEvent();
    }

    componentDidMount() {
        DatabaseHelper.getAllChatItemForChatByChatId([this.state.chatId], (results) => {
            let messages = results.map((result) => {
                return CollectionUtils.convertToAirChatMessageObjectFromChatItem(result, this.state.isGroupChat)
            });
            this.setStateData(messages.reverse());
        })
    }

    addBackEvent() {
        BackAndroid.addEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    }

    removeBackEvent() {
        BackAndroid.removeEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
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
        this.setState({ isLoading: true, });

        let chatItem = null;
        if (this.state.chatType == Type.BOT) {
            this.setState({ recentAction: message.action });
            chatItem = CollectionUtils.convertToChatItemFromBotMessage(this.state.userName, this.state.userId,
                message, this.state.chatId, this.state.chatType)

        } else {
            chatItem = CollectionUtils.convertToChatItemFromSocketMessage(message, this.state.chatId, this.state.chatType);
        }

        let messages = CollectionUtils.convertToAirChatMessageObjectFromChatItem(chatItem, this.state.isGroupChat);

        this.setStateData(messages);
        this.storeChatItemInDatabase(null, chatItem);
    }

    storeChatItemInDatabase(airChatObject, chatItemObject) {
        if (airChatObject) {
            let chatItem = CollectionUtils.convertToChatItemFromAirChatMessageObject(airChatObject, this.state.chatId, this.state.chatType);
            DatabaseHelper.addNewChatItem([chatItem], (msg) => {
                console.log(msg)
            });

        } else if (chatItemObject) {
            DatabaseHelper.addNewChatItem([chatItemObject], (msg) => {
                console.log(msg)
            });
        }

    }

    onSend(messages = []) {
        this.setStateData(messages);
        this.storeChatItemInDatabase(messages[0], null);

        // if (this.state.chatType == Type.BOT) {
        //     this.onBotMessageSend(messages)
        // } else {
        //     let socketData = CollectionUtils.prepareQueryForSocketEmit(messages.text, this.state.userName, this.state.userId, this.state.room);
        //     this.socket.sendMessage(socketData);
        // }

    }

    //bot realted functions;
    onBotMessageSend(messages = [], doctypeItemId = null, actionName = null, childActionName = null, pageCount = null) {
        let postData = CollectionUtils.prepareQueryForPostDataBotType(this.state.doctype.toLowerCase()
            , messages.text, doctypeItemId, actionName, childActionName, pageCount, this.state.room);
        InternetHelper.sendData(this.state.domain, postData);
    }

    onViewInfo(message) {
        let page = Page.VIEW_INFO_PAGE;
        this.props.navigator.push({ id: page.id, name: page.name, data: message.info });
    }

    onViewMore(message) {
        let page = Page.VIEW_MORE_PAGE;
        this.props.navigator.push({ id: page.id, name: page.name, data: message.info });
    }

    onItemClicked(message, index) {
        let action = message.info.action;
        let page, item = null;
        switch (action.actionOnListItemClick) {
            case ActionName.UPDATE:
                page = Page.EDIT_INFO_PAGE;
                let data = { message: message, index: index, callback: callback };
                this.props.navigator.push({ id: page.id, name: page.name, data: data });
                break;

            case ActionName.DELETE:
                item = message.info.listItems[index]
                this.callback('Alright, delete item', item.name, ActionName.DELETE_ITEM);
                break;

            case ActionName.INFO:
                page = Page.VIEW_INFO_PAGE;
                this.props.navigator.push({ id: page.id, name: page.name, data: message });
                break;
        }
    }


    callback(text, name, childActionName) {

        let message = CollectionUtils.createChatItem(this.state.userName, this.state.userId,
            text, new Date(), null, null, null, null, null, null, null, null, null, this.state.chatId, Type.BOT);

        switch (childActionName) {
            case ActionName.DELETE_ITEM:
                this.onBotMessageSend([message], name, ActionName.DELETE, childActionName, 0);
                break;
            case ActionName.UPDATE_ITEM:
                this.onBotMessageSend([message], name, ActionName.UPDATE, childActionName, 0);
                break;
        }
    }

    //end of bot related functions.

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
                    onLeftElementPress={() => this.props.navigator.pop()}
                    centerElement={this.props.route.name}
                    rightElement={{
                        menu: { labels: menuItems },
                    }}

                    onRightElementPress={(action) => { }} />

                <AirChatUI
                    messages={this.state.messages}
                    onSend={this.onSend}

                    user={{
                        _id: this.state.userId,
                        name: this.state.userName,
                    }}

                    info={{
                        buttonText: null,
                        isInteractiveChat: null,
                        isInteractiveList: null,
                        fields: null,
                        listItems: null,
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

