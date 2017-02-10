
import { Chat } from '../models/Chat.js';
import { ChatItem } from '../models/ChatItem.js';
import { Message } from '../models/Message.js';
import { Type } from '../enums/Type.js';
import { EMAIL } from '../constants/AppConstant.js';
import { getStoredDataFromKey } from './AppStore.js';
import DatabaseHelper from './DatabaseHelper.js';


function getDefaultDoctypes() {
    return [
        { title: 'Todo', subTitle: 'Make a todo', image: '', badge: '', type: Type.BOT, isMute: false, email:'' },
        { title: 'Note', subTitle: 'Make a note', image: '', badge: '', type: Type.BOT, isMute: false, email:'' },
        { title: 'Issue', subTitle: 'Reply an issue', image: '', badge: '', type: Type.BOT, isMute: false, email:'' },
    ];
}

export function addDefaultBots(callback) {
    let array = getDefaultDoctypes();
    getStoredDataFromKey(EMAIL)
        .then((mail) => {
            let _array = array.map((bot) => {
                return Object.assign({}, bot, {
                    room: 'BOT' + bot.title + mail
                })
            })
            let item = _array.map((item) => {
                return convertToChat(item, false);
            })
            
            DatabaseHelper.addNewChat(item, (msg) => callback());
        })
}

export function convertToChat(item, hasId) {
   
    let title = item.title;
    let subTitle = item.subTitle;
    let image = (item.image.trim().length > 0) ? item.image : ' ';
    let badge = (item.badge.trim().length > 0) ? item.badge : '0';
    let type = item.type;
    let room = item.room;
    let isMute = item.isMute;
    let email = (item.email.trim().length > 0) ? item.email : ' ';
    let chat = new Chat(title, subTitle, image, badge, type, room, isMute, email);

    if (hasId)
        chat.setId(item._id);
    
    return chat;
}

export function convertToChatItem(item, hasId) {
    let fromWhom = item.fromWhom;
    let text = item.text;
    let createdOn = item.createdOn;
    let message = new Message(fromWhom, text, createdOn);
    message.setAction(item.setAction)
    message.setIsBot(item.isBot);

    if (item.list.length > 0)
        message.setList(item.list);

    if (item.buttonText.trim().length > 0)
        message.setButtonText(item.buttonText);

    let chatItem = new chatItem(message, item.chatId);
    if (hasId)
        chatItem.setId(item._id);

    return chatItem;
}