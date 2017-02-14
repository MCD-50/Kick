
import { Chat } from '../models/Chat.js';
import { ChatItem } from '../models/ChatItem.js';
import { Message } from '../models/Message.js';
import { Action } from '../models/Action.js';
import { Info } from '../models/Info.js';

import { ActionName } from '../enums/ActionName.js';
import { Type } from '../enums/Type.js';

import { EMAIL, FIRST_NAME, DOMAIN } from '../constants/AppConstant.js';
import { getStoredDataFromKey } from './AppStore.js';
import DatabaseHelper from './DatabaseHelper.js';




class CollectionUtils {

    getDefaultDoctypes = () => {
        return [
            { title: 'Todo', subTitle: 'Make a todo', image: '', badge: '', type: Type.BOT, isMute: false, email: '' },
            { title: 'Note', subTitle: 'Make a note', image: '', badge: '', type: Type.BOT, isMute: false, email: '' },
            { title: 'Issue', subTitle: 'Reply an issue', image: '', badge: '', type: Type.BOT, isMute: false, email: '' },
        ];
    }


    addDefaultBots = (callback) => {
        let array = this.getDefaultDoctypes();
        console.log(array);
        getStoredDataFromKey(EMAIL)
            .then((mail) => {
                let _array = array.map((bot) => {
                    return Object.assign({}, bot, {
                        room: 'BOT' + bot.title + mail,
                        lastActive: '0',
                        lastMessageTime: '0',
                    })
                })

                let items = _array.map((item) => {
                    return this.convertToChat(item, false);
                })

                DatabaseHelper.addNewChat(items, (msg) => callback());
            })
    }

    convertToChat = (item, hasId) => {
        let title = item.title;
        let subTitle = item.subTitle;
        let image = (item.image.trim().length > 0) ? item.image : ' ';
        let badge = (item.badge.trim().length > 0) ? item.badge : '0';
        let type = item.type;
        let room = item.room;
        let isMute = item.isMute;
        let email = (item.email.trim().length > 0) ? item.email : ' ';
        let chat = new Chat(title, subTitle, image, badge, type, room, isMute, email);

        chat.setLastActive(item.lastActive);
        chat.setLastMessageTime(item.lastMessageTime);

        if (hasId)
            chat.setId(item._id);

        return chat;
    }


    /*
    send:::: structure: bot::::
        {
            doctype: string,
            text: string,
            doctypeItemId: string,
            action: {
                actionName: string,
                childActionName: string,
            },
            pageCount: int,
            room: string
        }
    receive:::: structure: bot::::
        {
           text:text,
           createdOn : text,
           isAlert : bool,
           room : string,
           info : {
                buttonText : string,
                isInteractiveChat : bool,
                isInteractiveList : bool,
                fields : array,
                listItems : array,
           }
           action:{
               actionName : string,
               actionOnButtonClick : string,
               actionOnListItemClick : string,
           }
        }

     send::: personal + group
     {
        text: string,
        userName: string,
        userId: string,
        room: string,
        createdOn : string,
     }

     receive::: personal + group
     {
        text: text,
        userName: userName,
        userId: userId,
        room: room,            
        createdOn: createdOn,
        isAlert: isAlert
     }
     
    */

    sortMessageByCreatedOn(messages){
        
    }

    convertToChatItemFromSocketMessage = (message, chatId, type) => {
        return this.createChatItem(message.userName, message.userId, message.text,
            message.createdOn, message.isAlert, chatId, type);
    }

    convertToChatItemFromAirChatMessageObject = (airChatObject, chatId, type) => {
        return this.createChatItem(airChatObject.user.name, airChatObject.user._id, airChatObject.text,
            new Date(), airChatObject.isAlert, chatId, type, airChatObject.info, airChatObject.action);
    }

    convertToAirChatMessageObjectFromChatItem = (chatItem, isGroupChat) => {
        let message = {
            _id: Math.round(Math.random() * 1000000),
            text: chatItem.message.text,
            createdAt: chatItem.message.createdOn,
            user: {
                _id: chatItem.message.userId,
                name: chatItem.message.userName,
            },
            isAlert: chatItem.message.isAlert,
            isGroupChat: isGroupChat,
            info: this.createInfo(chatItem.message.info),
            action: this.createAction(chatItem.message.action),
        }

        return message;
    }


    convertToChatItemFromBotMessage = (userName, userId, item, chatId, type) => {
        let text = item.text;
        let createdOn = item.createdOn;
        let isAlert = item.isAlert;
        let info = item.info;
        let action = item.action;
        let message = new Message(userName, userId, text, createdOn, isAlert, this.createInfo(info), this.createAction(action));
        let chatItem = new chatItem(message, chatId, type);
        return chatItem;
    }

    createChatItem = (userName, userId, text, createdOn, isAlert, chatId, type, info = null, action = null) => {
        let message = new Message(userName, userId, text, createdOn, isAlert, this.createInfo(info), this.createAction(action));
        let chatItem = new ChatItem(message, chatId, type);
        return chatItem;
    }

    createInfo = (info) => {
        if (info) {
            return {
                buttonText: info.buttonText,
                isInteractiveChat: info.isInteractiveChat,
                isInteractiveList: info.isInteractiveList,
                listItems: info.listItems,
                fields: info.fields
            }
        }
        return {
            buttonText: null,
            isInteractiveChat: null,
            isInteractiveList: null,
            listItems: null,
            fields: null
        }
    }

    createAction = (action) => {
        if (action) {
            return {
                actionName: action.actionName,
                actionOnButtonClick: action.actionOnButtonClick,
                actionOnListItemClick: action.actionOnListItemClick
            }
        }
        return {
            actionName: null,
            actionOnButtonClick: null,
            actionOnListItemClick: null
        }
    }


    prepareQueryForSocketEmit = (text, userName, userId, room, callback) => {
        let query = {
            text: text,
            userName: userName,
            userId: userId,
            room: room
        }

        return query;
    }

    prepareQueryForPostDataBotType = (doctype, text, doctypeItemId, actionName, childActionName, pageCount, room) => {
        let query = {
            doctype: doctype,
            text: text,
            doctypeItemId: doctypeItemId,
            action: {
                actionName: actionName,
                childActionName: childActionName,
            },
            pageCount: pageCount,
            room: room
        }
        
        return query;
    }


    prepareCallbackData = (text, id, action) => {
        let item = {
            text: text,
            id: id,
            action: action
        };

        return item;
    }
}

const collection = new CollectionUtils();
export default collection;

