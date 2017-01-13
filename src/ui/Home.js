
import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Button,
    ListView,
    WebView
} from 'react-native';

import { MessageStore } from '../store/MessageStore.js';
//import { Input } from './ui/Input.js';
//import { List } from './ui/List.js';

import { GiftedChat } from 'react-native-gifted-chat';
import { MessageAction } from '../action/MessageAction.js';
import { Message } from '../model/Message.js';
import { getMessageFromString, } from '../helper/MessageHelper.js';
import { BotMessageType } from '../enum/BotMessageType.js';
import { fetchData } from '../helper/InternetHelper.js';

import CookieManager from 'react-native-cookies';
import { getUrl } from '../helper/AppConstant.js';
//var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })
//dataSource: ds.cloneWithRows(MessageStore.getState() || [])
//MessageStore.getState().message || []

const _gThis = {};

export class Home extends Component {


    constructor(props) {
        super(props);

        this.state = {
            input: '',
            id: '9821029018',
            messages: [],
            loggedIn: false
        };

        MessageStore.on('change:message', function (newArray, previousArray) {
            this.state.setState({ message: newArray });
        });

        _gThis = this;
        this.onSend = this.onSend.bind(this);
        this.showReply = this.showReply.bind(this);
        this.logout = this.logout.bind(this);
        this.afterLogin = this.afterLogin.bind(this);
    }




    componentWillMount() {
        CookieManager.get(getUrl(), (err, cookie) => {
            console.log(cookie);
            let isAuthenticated;
            if (cookie && cookie.sid && cookie.sid !== 'Guest') {
                isAuthenticated = true;
            }
            else {
                isAuthenticated = false;
            }
            console.log(isAuthenticated);
            this.setState({
                loggedIn: isAuthenticated
            });
        });
    }


    onSend(messages = []) {
        this.setState((previousState) => {
            return {
                messages: GiftedChat.append(previousState.messages, messages),
            };
        });

        if (messages[0].text.toLocaleLowerCase().startsWith('logout')) {
            this.logout();
        } else {
            this.showReply(getMessageFromString(messages[0].text));
        }
    }

    logout() {
        let _this = this;
        CookieManager.clearAll((err, res) => {
            console.log('cookies cleared!');
            _this.setState({
                loggedIn: false,
            })
        });
        console.log(this.state.loggedIn);
    }


    afterLogin() {
        this.setState((previousState) => {
            return {
                messages: GiftedChat.append(previousState.messages, ['Welcome again']),
            }
        });
    }


    showReply(botMessage) {

        if (botMessage.getType() == BotMessageType.STRING) {
            this.setState((previousState) => {
                return {
                    messages: GiftedChat.append(previousState.messages, {
                        _id: Math.round(Math.random() * 1000000),
                        text: botMessage.getMessage(),
                        createdAt: new Date(),
                        user: {
                            _id: 6867696090,
                            name: 'Erpnext',
                            avatar: 'https://facebook.github.io/react/img/logo_og.png',
                        }
                    })
                };
            });
        } else if (botMessage.getType() == BotMessageType.ARRAY) {
            fetchData(botMessage.getMessage())
                .then((arr) => this.setState((previousState) => {
                    let msg = arr.map((message) => {
                        return {
                            _id: Math.round(Math.random() * 1000000),
                            text: message.getText(),
                            createdAt: new Date(),
                            user: {
                                _id: 6867696090,
                                name: message.getFromWhom(),
                                avatar: 'https://facebook.github.io/react/img/logo_og.png',
                            }
                        }
                    });

                    return {
                        messages: GiftedChat.append(previousState.messages, msg)
                    };
                }))
        }
    }

    onNavigationStateChange(navState) {
        //problem occurs when not using web view;
        console.log(navState);
        if (navState.url === 'http://192.168.0.106:3000/desk') {
            this.setState({
                loggedIn: true,
            });
            // _gThis.afterLogin();
        }
        console.log(this.state.loggedIn);
    }

    render() {
        if (this.state.loggedIn) {
            return (
                <GiftedChat
                    messages={this.state.messages}
                    onSend={this.onSend}
                    user={{
                        _id: this.state.id,
                        name: 'Ayush',
                        avatar: 'https://facebook.github.io/react/img/logo_og.png',
                    }} />
            );
        }

        else {
            return (
                <WebView
                    ref={'webview'}
                    automaticallyAdjustContentInsets={false}
                    source={{ uri: getUrl() + 'login/' }}
                    javaScriptEnabled={true}
                    onNavigationStateChange={this.onNavigationStateChange.bind(this)}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                    />
            );
        }
    }
}



 //  <Login navigator={this.props.navigator}/>
