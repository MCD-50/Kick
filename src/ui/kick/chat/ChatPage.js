import { View, StyleSheet, StatusBar, ToastAndroid, ScrollView, Platform, Animated, Easing } from 'react-native';
import React, { Component, PropTypes } from 'react';
import { AirChatUI } from '../../customUI/airchat/AirChatUI.js';
import { Message } from '../../../models/Message.js';
import Toolbar from '../../customUI/ToolbarUI.js';
import Conatainer from '../../Container.js';
import SendUI from '../../customUI/SendUI.js';

window.navigator.userAgent = "react-native"
import InternetHelper from '../../../helpers/InternetHelper.js';
import SocketHelper from '../../../helpers/SocketHelper.js';


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
    'Add to contacts', 'View contact', 'Clear chat', 'Mail chat'
]


let count = 1;
let prevMsg = " ";
let ws;

class ChatPage extends Component {

    constructor(params) {
        super(params);
        const data = this.props.route.data;
        this.state = {
            input: '',
            id: data.getId(),
            messages: [],
            userName: data.getUserName(),
            isGroupChat: false,
            isAlert: false,
            action: 'nothing',
            type: data.getType(),
        };

        //this.renderListItem = this.renderListItem.bind(this);
        this.onSend = this.onSend.bind(this);
        this.onViewInfo = this.onViewInfo.bind(this);
        this.onViewMore = this.onViewMore.bind(this);
        this.onItemClicked = this.onItemClicked.bind(this);
        this.onItemClickedExecute = this.onItemClickedExecute.bind(this),
        this.getQueryFromAction = this.getQueryFromAction.bind(this);
        this.renderSend = this.renderSend.bind(this);
        this.onReceive = this.onReceive.bind(this);
        this.socket = SocketHelper({}, ()=>console.log());
    }

    onReceive(data) {
        let info = data.info;
        let message = data.message;
        let doctype = data.doctype;

        this.setState((previousState) => {
            return {
                messages: AirChatUI.append(previousState.messages, {
                    _id: Math.round(Math.random() * 1000000),
                    text: message.message,
                    createdAt: new Date(),
                    user: {
                        _id: 6867696090,
                        name: 'Erpnext',
                    },
                    isAlert: false,
                    isGroupChat: false,
                    info: {
                        buttonText: info.button_text,
                        isInteractive: info.is_interactive,
                        isInteractiveChat: info.is_interactive_chat,
                        isInteractiveList: info.is_interactive_list,
                        fields: info.fields,
                        listItems: message.list,
                        action: message.action,
                    }
                }),
                action: message.action
            };
        });
    }

    onSend(messages = []) {

        // let _messages = messages.map((message) => {
        //     return Object.assign({}, message, {

        //     });
        // })

        this.setState((previousState) => {
            return {
                messages: AirChatUI.append(previousState.messages, messages),
            };
        });


        if (this.state.type === 'BOT') {
            //this.socket.emit('bot_message_from_client', {'doctype': this.state.userName, 'query': messages[0].text});
            //this.socket.emit('message', messages[0].text);
            //ws.send(messages[0].text);
            //fetch('http://192.168.0.106:8000/api/method/frappe.utils.bot_reply.get_reply?doctype=todo&query=' + messages[0].text + '&action=' + this.state.action + '&id=' + '-1');
            //this.showReply(messages[0].text.toLowerCase());
            RequestHelper.postData('http://192.168.0.106:8000', { 'doctype': this.state.userName.toLowerCase(), 'query': messages[0].text, 'action': this.state.action, 'id': '-1' })
        }
    }

    onViewInfo(message) {
        this.props.navigator.push({ id: 'ViewInfo', name: 'View Info', 'item': message.info.listItems[0], 'fields': message.info.fields });
    }

    onViewMore(message) {
        this.props.navigator.push({ id: 'ViewMore', name: 'View More', 'message': message });
    }

    onItemClicked(message, index) {
        if (this.state.action.includes('nothing')) {
            this.props.navigator.push({ id: 'ViewInfo', name: 'View Info', 'item': message.info.listItems[0], 'fields': message.info.fields });
        } else if(this.state.action.includes('update')){
            this.props.navigator.push({ id: 'UpdateInfo', name: 'Update Info', 'item': message.info.listItems[0], 'fields': message.info.fields });
        } else {
            const item = message.info.listItems[index];
            let id = item['name'];
            this.onItemClickedExecute(id);
        }

    }

    onItemClickedExecute(id) {

        let query = this.getQueryFromAction(this.state.action, id);
        let _msg = {
            'doctype': this.state.userName.toLowerCase(),
            'query': query,
            'action': this.state.action,
            'id': id,
        };

        message = {
            _id: Math.round(Math.random() * 1000000),
            text: query,
            createdAt: new Date(),
            user: {
                _id: this.state.id,
                name: this.state.userName,
            },
            isAlert: false,
            isGroupChat: false,
            info: {
                buttonText: '',
                isInteractive: false,
                isInteractiveChat: false,
                isInteractiveList: false,
                fields: [],
                listItems: [],
                action: 'nothing',
            }
        }

        if (this.state.type === 'BOT') {
            this.setState((previousState) => {
                return {
                    messages: AirChatUI.append(previousState.messages, [message]),
                };
            });

            RequestHelper.postData('http://192.168.0.106:8000', _msg);
        }

    }

    getQueryFromAction(action, id) {
        if (action.includes('delete')) {
            return 'Delete ' + id + 'from ' + this.state.userName;
        } else if (action.includes('update')) {
            return 'Update ' + id;
        }
    }

    onChangeText(value) {
        console.log(value);
    }


    // showReply(stringData) {
    //     if (stringData.includes('create')) {
    //         prevMsg = stringData;
    //         this.setState((previousState) => {
    //             return {
    //                 messages: AirChatUI.append(previousState.messages, {
    //                     _id: Math.round(Math.random() * 1000000),
    //                     text: 'Enter Description',
    //                     createdAt: new Date(),
    //                     user: {
    //                         _id: 6867696090,
    //                         name: 'Erpnext',
    //                     },
    //                 }),
    //             };
    //         });
    //     }

    //     else if (stringData.includes('delete')) {

    //         this.setState((previousState) => {
    //             return {
    //                 messages: AirChatUI.append(previousState.messages, {
    //                     _id: Math.round(Math.random() * 1000000),
    //                     text: 'Enter id of Todo',
    //                     createdAt: new Date(),
    //                     user: {
    //                         _id: 6867696090,
    //                         name: 'Erpnext',
    //                     },
    //                 }),
    //             };
    //         });
    //     }
    //     else if (stringData.includes('update')) {
    //         this.setState((previousState) => {
    //             return {
    //                 messages: AirChatUI.append(previousState.messages, {
    //                     _id: Math.round(Math.random() * 1000000),
    //                     text: 'Enter id of todo',
    //                     createdAt: new Date(),
    //                     user: {
    //                         _id: 6867696090,
    //                         name: 'Erpnext',
    //                         isPrivate: this.state.isPrivate,
    //                     },
    //                     isNotification: false,
    //                 }),
    //             };
    //         });
    //     }
    //     else if (prevMsg.includes('create')) {
    //         RequestHelper.setData('http://192.168.0.106:3000', 'ToDo', { 'description': stringData }).then((data) => {
    //             this.setState((previousState) => {
    //                 return {
    //                     messages: AirChatUI.append(previousState.messages, {
    //                         _id: Math.round(Math.random() * 1000000),
    //                         text: TodoParser.getName(data),
    //                         createdAt: new Date(),
    //                         user: {
    //                             _id: 6867696090,
    //                             name: 'Erpnext',
    //                             isPrivate: this.state.isPrivate,
    //                         },
    //                         isNotification: false,
    //                     }),
    //                 };
    //             });
    //         })
    //     } else if (prevMsg.includes('delete')) {
    //         RequestHelper.removeData('http://192.168.0.106:3000', 'ToDo', stringData).then((data) => {
    //             this.setState((previousState) => {
    //                 return {
    //                     messages: AirChatUI.append(previousState.messages, {
    //                         _id: Math.round(Math.random() * 1000000),
    //                         text: data,
    //                         createdAt: new Date(),
    //                         user: {
    //                             _id: 6867696090,
    //                             name: 'Erpnext',
    //                             isPrivate: this.state.isPrivate,
    //                         },
    //                         isNotification: false,
    //                     }),
    //                 };
    //             });
    //         })
    //     }
    //     else {
    //         this.setState((previousState) => {
    //             return {
    //                 messages: AirChatUI.append(previousState.messages, {
    //                     _id: Math.round(Math.random() * 1000000),
    //                     text: 'Sorry try create or delete',
    //                     createdAt: new Date(),
    //                     user: {
    //                         _id: 6867696090,
    //                         name: 'Erpnext',
    //                         isPrivate: this.state.isPrivate,
    //                     },
    //                     isNotification: true,
    //                 }),
    //             };
    //         });
    //     }
    //     prevMsg = stringData;
    //     console.log(prevMsg);
    // }


    renderSend(props) {
        return (
            <SendUI {...props} />
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

                    onRightElementPress={(action) => {
                        if (Platform.OS === 'android') {
                            //ToastAndroid.show(menuItems[action.index], ToastAndroid.SHORT);
                        }
                    }} />

                <AirChatUI
                    messages={this.state.messages}
                    onSend={this.onSend}


                    user={{
                        _id: this.state.id,
                        name: this.state.userName,
                    }}
                    info={{
                        buttonText: '',
                        isInteractive: false,
                        isInteractiveChat: false,
                        isInteractiveList: false,
                        fields: [],
                        listItems: [],
                        action: 'nothing',
                    }}


                    onViewInfo={this.onViewInfo}
                    onViewMore={this.onViewMore}
                    onItemClicked={this.onItemClicked}

                    isAlert={this.state.isAlert}
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

