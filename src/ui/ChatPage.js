import { View, StyleSheet, StatusBar, ToastAndroid, ScrollView, Platform, Animated, Easing } from 'react-native';
import React, { Component, PropTypes } from 'react';

import { Toolbar, Icon, Avatar, ListItem, ActionButton } from 'react-native-material-ui';

import { GiftedChat } from 'react-native-gifted-chat';
import { Message } from '../model/Message.js';

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

class ChatPage extends Component {

    constructor(params) {
        super(params);
        const data = this.props.route.data;

        this.state = {
            input: '',
            id: data.getId(),
            messages: [],
            userName: data.getUserName(),
            avatar: data.getAvatar()
        };

        //this.renderListItem = this.renderListItem.bind(this);

        this.onSend = this.onSend.bind(this);

        //this.onChangeText = this.onChangeText.bind(this);
        this.showReply = this.showReply.bind(this);


        this.renderComposer = this.renderComposer.bind(this);
        this.renderSend = this.renderSend.bind(this);
        this.renderCustomActions = this.renderCustomActions.bind(this);
        this.renderCustomViews = this.renderCustomViews.bind(this);
        this.renderBubble = this.renderBubble.bind(this);
        this.renderFooter = this.renderFooter.bind(this);
    }

    onSend(messages = []) {
        this.setState((previousState) => {
            return {
                messages: GiftedChat.append(previousState.messages, messages),
            };
        });
        //getMessageFromString(messages[0].text)
        this.showReply(messages[0].text);
    }

    onChangeText(value) {
        console.log(value);
    }

    showReply(stringData) {
        console.log(stringData);
        this.setState((previousState) => {
            return {
                messages: GiftedChat.append(previousState.messages, {
                    _id: Math.round(Math.random() * 1000000),
                    text: stringData,
                    createdAt: new Date(),
                    user: {
                        _id: 6867696090,
                        name: 'Erpnext',
                        avatar: 'https://facebook.github.io/react/img/logo_og.png',
                    }
                }),
            };
        });
    }

    renderComposer(props) {
        console.log(props);
    }

    renderSend(props) {
        console.log(props);
    }

    renderCustomViews(props) {
        console.log(props);
    }

    renderCustomActions(props) {
        console.log(props);
    }

    renderBubble(props) {
        console.log(props);
    }

    renderFooter(props) {
        console.log(props);
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

                <GiftedChat
                    messages={this.state.messages}
                    onSend={this.onSend}

                    user={{
                        _id: this.state.id,
                        name: this.state.userName,
                        avatar: this.state.avatar,
                    }}

                    renderComposer={this.renderComposer}
                    renderSend={this.renderSend}
                    renderCustomViews={this.renderCustomViews}
                    renderCustomActions={this.renderCustomActions}
                    renderBubble={this.renderBubble}
                    renderFooter={this.renderFooter} />

            </View>
        )
    }
}

ChatPage.propTypes = propTypes;

export default ChatPage;

