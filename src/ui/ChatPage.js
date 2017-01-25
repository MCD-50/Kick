import { View, StyleSheet, StatusBar, ToastAndroid, ScrollView, Platform, Animated, Easing } from 'react-native';
import React, { Component, PropTypes } from 'react';


import { AirChatUI } from 'react-native-air-chat';
import { Message } from '../model/Message.js';

import Toolbar from './customUI/ToolbarUI.js';

import SendUI from './customUI/SendUI.js';

import RequestHelper from '../helper/RequestHelper.js';
import TodoParser from '../parser/TodoParser.js';

window.navigator.userAgent = "react-native"

var io = require("socket.io-client");


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
        console.log(data);

        // this.socket = io('http://192.168.3.104:9000', { jsonp: false });
        this.socket = io('http://192.168.0.114:9000', {
           transports: ['websocket'],
           extraHeaders: { 'origin' : 'http://192.168.0.114:8000'}
               // you need to explicitly tell it to use websockets
        });

        

        this.socket.on('connect', () => {
            console.log('connected!');
        });




        this.state = {
            input: '',
            id: data.getId(),
            messages: [],
            userName: data.getUserName(),
            avatar: data.getAvatar(),
            isPrivate: true,
            type: data.getType(),
        };

        //this.renderListItem = this.renderListItem.bind(this);

        this.onSend = this.onSend.bind(this);

        //this.onChangeText = this.onChangeText.bind(this);
        this.showReply = this.showReply.bind(this);
        this.renderSend = this.renderSend.bind(this);



        // ws.onopen = () => {
        //     // connection opened

        //    console.log('opened'); // send a message
        // };

        // ws.onmessage = (e) => {
        //     // a message was received
        //     console.log(e.data);
        //     // e.data.room_name
        // };

        // ws.onerror = (e) => {
        //     // an error occurred
        //     console.log(e.message);
        // };

        // ws.onclose = (e) => {
        //     // connection closed
        //     console.log(e.code, e.reason);
        // };

    }

    onSend(messages = []) {

        let _messages = messages.map((message) => {
            return Object.assign({}, message, {
                isNotification: false,
            });
        })

        this.setState((previousState) => {
            return {
                messages: AirChatUI.append(previousState.messages, _messages),
            };
        });


        console.log(this.state.type);
        if (this.state.type === 'BOT') {
            //ws.send(messages[0].text);
            //fetch('http://192.168.0.106:8000/api/method/frappe.utils.parser.bot_request?doctype=ToDo&message=ping');
            //this.showReply(messages[0].text.toLowerCase());
        }

    }



    onChangeText(value) {
        console.log(value);
    }


    showReply(stringData) {
        if (stringData.includes('create')) {
            prevMsg = stringData;
            this.setState((previousState) => {
                return {
                    messages: AirChatUI.append(previousState.messages, {
                        _id: Math.round(Math.random() * 1000000),
                        text: 'Enter Description',
                        createdAt: new Date(),
                        user: {
                            _id: 6867696090,
                            name: 'Erpnext',
                            isPrivate: this.state.isPrivate,
                        },
                        isNotification: false,
                    }),
                };
            });
        }

        else if (stringData.includes('delete')) {

            this.setState((previousState) => {
                return {
                    messages: AirChatUI.append(previousState.messages, {
                        _id: Math.round(Math.random() * 1000000),
                        text: 'Enter id of Todo',
                        createdAt: new Date(),
                        user: {
                            _id: 6867696090,
                            name: 'Erpnext',
                            isPrivate: this.state.isPrivate,
                        },
                        isNotification: false,
                    }),
                };
            });
        }
        else if (stringData.includes('update')) {
            this.setState((previousState) => {
                return {
                    messages: AirChatUI.append(previousState.messages, {
                        _id: Math.round(Math.random() * 1000000),
                        text: 'Enter id of todo',
                        createdAt: new Date(),
                        user: {
                            _id: 6867696090,
                            name: 'Erpnext',
                            isPrivate: this.state.isPrivate,
                        },
                        isNotification: false,
                    }),
                };
            });
        }
        else if (prevMsg.includes('create')) {
            RequestHelper.setData('http://192.168.0.106:3000', 'ToDo', { 'description': stringData }).then((data) => {
                this.setState((previousState) => {
                    return {
                        messages: AirChatUI.append(previousState.messages, {
                            _id: Math.round(Math.random() * 1000000),
                            text: TodoParser.getName(data),
                            createdAt: new Date(),
                            user: {
                                _id: 6867696090,
                                name: 'Erpnext',
                                isPrivate: this.state.isPrivate,
                            },
                            isNotification: false,
                        }),
                    };
                });
            })
        } else if (prevMsg.includes('delete')) {
            RequestHelper.removeData('http://192.168.0.106:3000', 'ToDo', stringData).then((data) => {
                this.setState((previousState) => {
                    return {
                        messages: AirChatUI.append(previousState.messages, {
                            _id: Math.round(Math.random() * 1000000),
                            text: data,
                            createdAt: new Date(),
                            user: {
                                _id: 6867696090,
                                name: 'Erpnext',
                                isPrivate: this.state.isPrivate,
                            },
                            isNotification: false,
                        }),
                    };
                });
            })
        }
        else {
            this.setState((previousState) => {
                return {
                    messages: AirChatUI.append(previousState.messages, {
                        _id: Math.round(Math.random() * 1000000),
                        text: 'Sorry try create or delete',
                        createdAt: new Date(),
                        user: {
                            _id: 6867696090,
                            name: 'Erpnext',
                            isPrivate: this.state.isPrivate,
                        },
                        isNotification: true,
                    }),
                };
            });
        }
        prevMsg = stringData;
        console.log(prevMsg);
    }


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
                    } } />

                <AirChatUI
                    messages={this.state.messages}
                    onSend={this.onSend}
                    user={{
                        _id: this.state.id,
                        name: this.state.userName,
                        isPrivate: this.state.isPrivate,
                    }}

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

