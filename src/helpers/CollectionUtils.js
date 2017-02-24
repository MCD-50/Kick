
import { Chat } from '../models/Chat.js';
import { ChatItem } from '../models/ChatItem.js';
import { Message } from '../models/Message.js';


import { ActionName } from '../enums/ActionName.js';
import { Type } from '../enums/Type.js';

import { EMAIL, FULL_NAME, DOMAIN } from '../constants/AppConstant.js';
import { getStoredDataFromKey } from './AppStore.js';
import DatabaseHelper from './DatabaseHelper.js';
import InternetHelper from './InternetHelper.js';


class CollectionUtils {

    getAllBots = () => {
        return [
            {
                title: 'Todo',
                sub_title: 'Make a todo',
                info: {
                    is_added_to_chat_list: true,
                    chat_type: Type.BOT,
                    room: null,
                    new_message_count: null,
                    last_message_time: null,
                    last_active: null,
                },
                person: null,
                group: null,
                bot: {
                    description: 'Some random bot with some random description',
                    commands: [
                        {
                            syntax: '/bot add todo',
                            command_description: 'Some random command with some random description'
                        }, {
                            syntax: '/bot get todo',
                            command_description: 'Some random command with some random description'
                        }, {
                            syntax: '/bot update todo',
                            command_description: 'Some random command with some random description'
                        }, {
                            syntax: '/bot delete todo',
                            command_description: 'Some random command with some random description'
                        }]
                }
            },
            {
                title: 'Note',
                sub_title: 'Make a note',
                info: {
                    is_added_to_chat_list: true,
                    chat_type: Type.BOT,
                    room: null,
                    new_message_count: null,
                    last_message_time: null,
                    last_active: null,
                },
                person: null,
                group: null,
                bot: {
                    description: 'Some random bot with some random description',
                    commands: [
                        {
                            syntax: '/bot add todo',
                            command_description: 'Some random command with some random description'
                        }, {
                            syntax: '/bot get todo',
                            command_description: 'Some random command with some random description'
                        }, {
                            syntax: '/bot update todo',
                            command_description: 'Some random command with some random description'
                        }, {
                            syntax: '/bot delete todo',
                            command_description: 'Some random command with some random description'
                        }]
                }
            },
            {
                title: 'Event',
                sub_title: 'Make a event',
                info: {
                    is_added_to_chat_list: true,
                    chat_type: Type.BOT,
                    room: null,
                    new_message_count: null,
                    last_message_time: null,
                    last_active: null,
                },
                person: null,
                group: null,
                bot: {
                    description: 'Some random bot with some random description',
                    commands: [
                        {
                            syntax: '/bot add todo',
                            command_description: 'Some random command with some random description'
                        }, {
                            syntax: '/bot get todo',
                            command_description: 'Some random command with some random description'
                        }, {
                            syntax: '/bot update todo',
                            command_description: 'Some random command with some random description'
                        }, {
                            syntax: '/bot delete todo',
                            command_description: 'Some random command with some random description'
                        }]
                }
            }];
    }

    addDefaultBots = (callback) => {
        let array = this.getAllBots();

        getStoredDataFromKey(EMAIL)
            .then((mail) => {
                let _array = array.map((bot) => {
                    return Object.assign({}, bot, {
                        info: {
                            ...bot.info,
                            room: mail + bot.title,
                        }
                    })
                })

                let items = _array.map((item) => {
                    return this.convertToChat(item, false);
                })

                DatabaseHelper.addNewChat(items, (msg) => callback());
            })
    }


    createChat = (title, sub_title, is_added_to_chat_list, chat_type, room, new_message_count, last_message_time, last_active, person = null, group = null, bot = null) => {
        let info = {
            is_added_to_chat_list: is_added_to_chat_list,
            chat_type: chat_type,
            room: room,
            new_message_count: new_message_count,
            last_message_time: last_message_time,
            last_active: last_active
        }
        return new Chat(title, sub_title,
            this.createChatInfoObject(info),
            this.createChatPersonObject(person),
            this.createChatGroupObject(group),
            this.createChatBotObject(bot));
    }


    convertToChat = (item, has_id) => {
        let chat = new Chat(item.title, item.sub_title,
            this.createChatInfoObject(item.info),
            this.createChatPersonObject(item.person),
            this.createChatGroupObject(item.group),
            this.createChatBotObject(item.bot));
        if (has_id)
            chat.setId(item._id);

        return chat;
    }

    createChatFromResponse = (response) => {
        if (response.is_bot == 'false') {
            let info = {
                is_added_to_chat_list: true,
                chat_type: response.chat_type,
                room: response.room,
                new_message_count: 1,
                last_message_time: null,
                last_active: null,
            }

            if (response.chat_type == Type.GROUP) {
                InternetHelper.getAllUsersInARoom(response.room, (users, msg) => {
                    if (users && users.length > 0) {
                        let _users = users.map((user) => {
                            return this.createChatPersonObject(user);
                        })
                        let group = {
                            people: _users,
                            peopleCount: (_users != null) ? _users.length : null,
                        }
                        return new Chat(response.chat_title, text.substring(0, 20) + " ...", )
                    }
                })
            } else {
                let person = {
                    title: response.user_name,
                    email: response.user_id,
                    number: null
                }

                return new Chat(response.chat_title, text.substring(0, 20) + " ...", info,
                    person, this.createChatGroupObject(null), this.createChatBotObject(null))
            }


        }
    }


    createChatItem = (user_name, user_id, text, created_on, is_alert, chat_id, chat_type, info = null, action = null, list_items = null) => {
        let message = new Message(user_name, user_id, text, created_on, is_alert,
            this.createChatItemInfo(info),
            this.createChatItemAction(action),
            this.createChatItemListItems(list_items));
        return new ChatItem(message, chat_id, chat_type);
    }

    convertToChatItem = (item, has_id) => {
        let message = new Message(item.message.user_name, item.message.user_id, item.message.text, item.message.created_on,
            item.message.is_alert, item.message.info, item.message.action, item.message.list_items);
        return new ChatItem(message, item.chat_id, item.chat_type);
    }

    convertToChatItemFromResponse = (response, chat_id, chat_type) => {
        if (response.is_bot == 'true') {
            return new ChatItem(new Message(response.bot_name, response.bot_name,
                response.text, response.created_on, false, response.info, response.action,
                response.list_items), chat_id, chat_type)
        } else {
            return new ChatItem(new Message(response.user_name, response.user_id,
                response.text, response.created_on, response.is_alert, null, null, null),
                chat_id, chat_type);
        }
    }


    convertToChatItemFromAirChatMessageObject = (airChatObject, chat_id, chat_type) => {
        return this.createChatItem(airChatObject.user.name, airChatObject.user._id, airChatObject.text,
            new Date(), airChatObject.isAlert, chat_id, chat_type, airChatObject.info, airChatObject.action, airChatObject.listItems);
    }

    convertToAirChatMessageObjectFromChatItem = (chat_item, is_group_chat) => {
        let message = {
            _id: Math.round(Math.random() * 1000000),

            text: chat_item.message.text,
            createdAt: chat_item.message.created_on,

            user: {
                _id: chat_item.message.user_id,
                name: chat_item.message.user_name,
            },

            isAlert: chat_item.message.is_alert,
            isGroupChat: is_group_chat,
            info: this.createChatItemInfo(chat_item.message.info),
            action: this.createChatItemAction(chat_item.message.action),
            listItems: this.createChatItemListItems(chat_item.message.list_items)
        }

        return message;
    }



    createChatItemInfo = (info) => {
        if (info) {
            return {
                button_text: info.button_text,
                is_interactive_chat: info.is_interactive_chat,
                is_interactive_list: info.is_interactive_list
            }
        }

        return {
            button_text: null,
            is_interactive_chat: null,
            is_interactive_list: null
        }
    }

    createChatItemListItems = (list_items) => {
        if (list_items) {
            return {
                action_on_internal_item_click: list_items.action_on_internal_item_click,
                items: list_items.items
            }
        }

        return {
            action_on_internal_item_click: null,
            items: null
        }
    }

    createChatItemAction = (action) => {
        if (action) {
            return {
                action_on_button_click: action.action_on_button_click,
                action_on_list_item_click: action.action_on_list_item_click
            }
        }
        return {
            action_on_button_click: null,
            action_on_list_item_click: null
        }
    }

    createChatInfoObject = (info) => {
        return {
            is_added_to_chat_list: info.is_added_to_chat_list,
            chat_type: info.chat_type,
            room: info.room,
            new_message_count: info.new_message_count,
            last_message_time: info.last_message_time,
            last_active: info.last_active,
        }
    }

    createChatPersonObject = (personal) => {
        if (personal) {
            return {
                title: personal.title,
                email: personal.email,
                number: personal.number,
            }
        }
        return {
            title: null,
            email: null,
            number: null,
        }
    }

    createChatBotObject = (bot) => {
        if (bot) {
            return {
                description: bot.description,
                commands: bot.commands,
            }
        }
        return {
            description: null,
            commands: null,
        }
    }

    createChatGroupObject = (group) => {
        if (group) {
            return {
                people: group.people,
                peopleCount: (group.people != null) ? group.people.length : null,
            }
        }
        return {
            people: null,
            peopleCount: null,
        }
    }

    createChatBotCommandObject = (command) => {
        if (command) {
            return {
                syntax: command.syntax,
                command_description: command.command_description,
            }
        }
        return {
            syntax: null,
            command_description: null,
        }
    }


    prepareBeforeSending(chat_type, chat_title, room, page_count, airChatMessageObject, message) {
        if (airChatMessageObject) {
            if (chat_type == Type.BOT) {
                return {
                    "room": room,
                    "is_bot": 'true',
                    "bot_name": chat_title,
                    "created_on": this.parseCreatedAt(airChatMessageObject.createdAt),
                    "text": airChatMessageObject.text,
                    "page_count": page_count,
                    "action": this.createChatItemAction(airChatMessageObject.action),
                    "info": this.createChatItemInfo(airChatMessageObject.info),
                    "list_items": this.createChatItemListItems(airChatMessageObject.listItems)
                }
            } else {
                return {
                    "room": room,
                    "is_bot": 'false',
                    "created_on": this.parseCreatedAt(airChatMessageObject.createdAt),
                    "user_name": airChatMessageObject.user.name,
                    "user_id": airChatMessageObject.user._id,
                    "text": airChatMessageObject.text,
                    "is_alert": airChatMessageObject.isAlert,
                    "chat_title": chat_title,
                    "chat_type": chat_type
                }
            }
        } else {
            return null;
        }
    }

    getCreatedOn() {
        let today = new Date();
        var dd = today.getDate();
        if (dd.toString().length < 2)
            dd = '0' + dd.toString()
        var mm = parseInt(today.getMonth()) + 1;
        if (mm.toString().length < 2)
            mm = '0' + mm.toString();
        var yyyy = today.getFullYear();
        return yyyy + '-' + mm + '-' + dd + ' ' +
            today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()
    }

    parseCreatedAt = (createdAt) => {
        let date = createdAt.split(' ');
        let mm = this.getMonth(null, date[1]);
        if (mm.toString().length < 2)
            mm = '0' + mm.toString();
        let dd = date[2];
        if (dd.toString().length < 2)
            dd = '0' + dd.toString();
        let yyyy = date[3];
        let time = date[4];

        return yyyy + '-' + mm + '-' + dd + ' ' + time;
    }

    prepareCallbackData = (text, id, action) => {
        let item = {
            text: text,
            id: id,
            action: action
        };

        return item;
    }




    getMonth = (index, month = null) => {
        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ];
        if (index) {
            return months[index];
        } else {
            for (i = 0; i < months.length; i++) {
                if (months[i] == month)
                    return i + 1;
            }
        }
    }

    getLastActive = (createdOn, getDateOnly = false) => {
        if (createdOn) {
            let dateArray = createdOn.split(' ');
            if (getDateOnly) {
                let array = dateArray[0].split('-');
                let month = months[parseInt(array[1]) - 1];
                return array[2] + ' ' + month + ', ' + array[0];
            }

            let today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth(); //January is 0!
            var yyyy = today.getFullYear();

            let day = parseInt(dateArray[0].split('-')[2]);
            if (dd == day) {
                return 'Last seen at ' + dateArray[1].split(':')[0] + ':' + dateArray[1].split(':')[1];
            } else if (dd == day - 1) {
                return 'Last seen yesterday at ' + dateArray[1].split(':')[0] + ':' + dateArray[1].split(':')[1];
            } else {
                let array = dateArray[0].split('-');
                let month = this.getMonth(parseInt(array[1]) - 1);
                return 'Last seen ' + array[2] + ' ' + month + ', ' + array[0];
            }
        } else {
            return 'Last seen recently';
        }

    }

}

const collection = new CollectionUtils();
export default collection;

