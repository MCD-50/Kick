import React, { Component, PropTypes } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ListView,
    TouchableOpacity
} from 'react-native';


import Toolbar from '../../customUI/ToolbarUI.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import Container from '../../Container.js';
import { Page } from '../../../enums/Page.js';
import Avatar from '../../customUI/Avatar.js';
import Badge from '../../customUI/Badge.js';
import ListItem from '../../customUI/ListItem.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import { Type } from '../../../enums/Type.js';
import { EMAIL, FULL_NAME, DOMAIN, MOBILE_NUMBER, LAST_ACTIVE } from '../../../constants/AppConstant.js';
import { getStoredDataFromKey, setData } from '../../../helpers/AppStore.js';
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
    hasDefaultBots: PropTypes.bool,
    botList: PropTypes.array,
};

const menuItems = [
    'Bots', 'Contacts', 'New group', 'New contact', 'Profile', 'Settings'
]

const defaultProps = {
    hasDefaultBots: false,
    botList: [],
}

const colors = [
    '#e67e22', // carrot
    '#3498db', // peter river
    '#8e44ad', // wisteria
    '#e74c3c', // alizarin
    '#1abc9c', // turquoise
    '#2c3e50', // midnight blue
];

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });
class ChatListPage extends Component {

    constructor(params) {
        super(params);

        this.state = {
            searchText: '',
            isLoading: true,
            listOfChats: [],
            dataSource: ds.cloneWithRows([]),
            isOnChatListPage: true,
            title: 'Updating...',
            userId: '',
            userName: '',
            domain: '',
            number: '',
        };


        this.renderListItem = this.renderListItem.bind(this);
        this.renderBadge = this.renderBadge.bind(this);
        this.onChangeText = this.onChangeText.bind(this);

        this.getColor = this.getColor.bind(this);
        this.getIcon = this.getIcon.bind(this);
        this.callback = this.callback.bind(this);
        this.rightElementPress = this.rightElementPress.bind(this);
        this.onMessageReceive = this.onMessageReceive.bind(this);
        this.socket = SocketHelper(this.onMessageReceive);
        this.renderElement = this.renderElement.bind(this);
        this.getAllMessages = this.getAllMessages.bind(this);
        this.setStateData = this.setStateData.bind(this);
        this.renderLastMessageTime = this.renderLastMessageTime.bind(this);
        this.getIndex = this.getIndex.bind(this);
        this.updateChatAndChatItem = this.updateChatAndChatItem.bind(this);
        this.createChatAndChatItem = this.createChatAndChatItem.bind(this);
        this.updateData = this.updateData.bind(this);
    }

    componentWillMount() {
        getStoredDataFromKey(EMAIL).then((mail) => this.setState({ userId: mail }));
        getStoredDataFromKey(MOBILE_NUMBER).then((number) => this.setState({ number: number }));
        getStoredDataFromKey(FULL_NAME).then((name) => this.setState({ userName: name }));
        getStoredDataFromKey(DOMAIN).then((dom) => this.setState({ domain: dom }));
    }


    componentDidMount() {
        getStoredDataFromKey(EMAIL).then((mail) => {
            this.socket.joinRoom(mail);
            DatabaseHelper.getAllChatsByQuery({ is_added_to_chat_list: true }, (results) => {
                results = CollectionUtils.getSortedArrayByDate(results);
                this.setStateData(results);
                this.getAllMessages(this.state.userId);
            })
        });
    }


    setStateData(chats) {
        this.setState({
            listOfChats: chats,
            dataSource: ds.cloneWithRows(chats),
            isLoading: false
        });
    }


    onChangeText(e) {
        this.setState({ searchText: e });
    }

    getColor(name) {
        const length = name.length;
        return colors[length % colors.length];
    }

    renderBadge(count) {
        if (count && count > 0)
            return <Badge text={count.toString()} />
        return null
    }


    getIcon(type) {
        if (type == Type.BOT) {
            return 'toys';
        } else if (type == Type.GROUP) {
            return 'people';
        } else {
            return 'person';
        }
    }


    getAllMessages(chats) {
        InternetHelper.checkIfNetworkAvailable((isConnected) => {
            if (isConnected) {
                getStoredDataFromKey(LAST_ACTIVE)
                    .then((last_active) => {
                        console.log(last_active);
                        if (last_active) {
                            InternetHelper.getAllMessages(this.state.domain, this.state.userId, last_active);
                        } else {
                            InternetHelper.getLastActive(this.state.domain, this.state.userId, (last_time, msg) => {
                                if (last_time && last_time.length > 0) {
                                    let last_active = last_time[0].last_active.toString();
                                    setData(LAST_ACTIVE, last_active);
                                    InternetHelper.getAllMessages(this.state.domain, this.state.userId, last_active);
                                } else {
                                    this.setState({ title: 'Kick' });
                                }
                            })
                        }
                    })

            } else {
                this.setState({ title: 'Kick' });
            }
        })
    }

    onMessageReceive(message) {
        if (this.state.title == 'Updating...') {
            this.setState({ title: 'Kick' });
        }
        if (this.state.isOnChatListPage) {
            let newChats = [];
            for (chat of this.state.listOfChats) {
                if (message.length > 0) {
                    newChats = message.filter((n) => n.room != chat.info.room)
                    let x = message.filter((n) => n.room == chat.info.room);
                    message = newChats;
                    this.updateChatAndChatItem(x, chat);
                } else {
                    break;
                }
            }

            if (newChats && newChats.length > 0) {
                console.log(newChats);
            }
        }
    }

    createChatAndChatItem(newChats) {

    }

    updateChatAndChatItem(elements, chat) {
        let botChatItems = [];
        let otherChatItems = [];
        for (let x of elements) {
            if (x.is_bot == 'true' && x.bot_name != this.state.userName) {
                botChatItems.push(CollectionUtils.createChatItemFromResponse(x, chat._id, chat.title))
            } else if (x.is_bot == 'false' && x.user_id != this.state.userId) {
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
                    new_message_count: botChatItems.length
                }
            });

            DatabaseHelper.updateChat([chat._id], [chat], (msg) => {
                //console.log(msg);
                DatabaseHelper.addNewChatItem(botChatItems, (msg) => {
                    //console.log(msg);
                })
            });

            this.setStateData(this.updateData(this.state.listOfChats, chat));
        }

        if (otherChatItems.length > 0) {
            const lastChatItem = otherChatItems[(otherChatItems.length - 1)];
            chat = Object.assign({}, chat, {
                sub_title: lastChatItem.message.text,
                info: {
                    ...chat.info,
                    last_message_time: lastChatItem.message.created_on,
                    new_message_count: otherChatItems.length
                }
            });

            DatabaseHelper.updateChat([chat._id], [chat], (msg) => {
                //console.log(msg);
                DatabaseHelper.addNewChatItem(otherChatItems, (msg) => {
                    //console.log(msg);
                })
            });

            this.setStateData(this.updateData(this.state.listOfChats, chat));
        }
    }

    renderLastMessageTime(last_message_time) {
        if (last_message_time) {
            last_message_time = last_message_time.split(' ');
            if (last_message_time.length > 1) {
                let today = CollectionUtils.getTodayDate();
                if (today == last_message_time[0]) {
                    last_message_time = last_message_time[1].split(':');
                    return last_message_time[0] + ':' + last_message_time[1];
                } else {
                    return last_message_time[0];
                }
            }
        }
        return null;
    }

    renderListItem(chat) {
        const searchText = this.state.searchText.toLowerCase();
        if (searchText.length > 0 && chat.title.toLowerCase().indexOf(searchText) < 0) {
            return null;
        }

        let title = (chat.title.length > 1) ? chat.title[0] + chat.title[1].toUpperCase() : ((chat.title.length > 0) ? chat.title[0] : 'UN');
        return (
            <ListItem
                divider

                leftElement={<Avatar bgcolor={this.getColor(chat.title)} text={title} />}

                centerElement={{
                    primaryText: chat.title,
                    secondaryText: chat.sub_title,
                    tertiaryText: this.getIcon(chat.info.chat_type)
                }}

                rightElement={{
                    upperElement: this.renderLastMessageTime(chat.info.last_message_time),
                    lowerElement: this.renderBadge(chat.info.new_message_count),
                }}

                onPress={() => {
                    let page = Page.CHAT_PAGE;
                    let state = this.state;
                    this.setState({ isOnChatListPage: false })
                    this.props.navigator.push({
                        id: page.id,
                        name: page.name,
                        chat: chat,
                        callback: this.callback,
                        owner: {
                            userName: state.userName,
                            userId: state.userId,
                            domain: state.domain
                        }
                    })
                }} />
        );
    }

    getIndex(chatList, room) {
        for (let i = 0; i < chatList.length; i++) {
            if (chatList[i].info.room == room)
                return i;
        }
        return -1;
    }

    callback(fromWhichPage, chat) {
        switch (fromWhichPage.id) {
            case Page.BOT_LIST_PAGE.id:
                break;
            case Page.CHAT_PAGE.id:
                break;
            case Page.CONTACT_LIST_PAGE.id:
                break;
            case Page.NEW_GROUP_PAGE.id:
                break;
            default:
                break;
        }
        if (chat)
            this.setStateData(this.updateData(this.state.listOfChats, chat));
    }


    updateData(listOfChats, chat) {
        index = this.getIndex(listOfChats, chat.info.room);
        if (index > -1) {
            listOfChats[index] = chat;
        } else {
            listOfChats.push(chat);
        }
        return CollectionUtils.getSortedArrayByDate(listOfChats);
    }

    rightElementPress(action) {
        let page = null;
        let isForGroupChat = false;
        switch (action.index) {
            case 0:
                page = Page.BOT_LIST_PAGE;
                break;
            case 1:
                page = Page.CONTACT_LIST_PAGE;
                break;
            case 2:
                //creating new group page
                isForGroupChat = true;
                page = Page.CONTACT_LIST_PAGE
                break;
            case 3: page = Page.NEW_CONTACT_PAGE
                break;
            case 4: page = Page.OWNER_INFO_PAGE
                break;
            case 5: page = Page.SETTINGS_PAGE
                break;
        }

        if (page) {
            this.setState({ isOnChatListPage: false })
            this.props.navigator.push({
                id: page.id,
                name: page.name,
                callback: this.callback,
                owner: {
                    userName: this.state.userName,
                    userId: this.state.userId,
                    domain: this.state.domain
                },
                isForGroupChat: isForGroupChat
            });
        }

    }

    renderElement() {
        if (this.state.isLoading) {
            return (
                <View style={styles.progress}>
                    <Progress color={['#3f51b5']} size={50} duration={300} />
                </View>)
        }

        return (
            <ListView
                dataSource={this.state.dataSource}
                keyboardShouldPersistTaps='always'
                keyboardDismissMode='interactive'
                enableEmptySections={true}
                ref={'LISTVIEW'}
                renderRow={(item) => this.renderListItem(item)}
            />
        );
    }


    render() {
        return (
            <Container>
                <Toolbar
                    centerElement={this.state.title}
                    searchable={{
                        autoFocus: true,
                        placeholder: 'Search chat...',
                        onChangeText: e => this.onChangeText(e),
                        onSearchClosed: () => this.setState({ searchText: '' }),
                    }}

                    rightElement={{
                        menu: { labels: menuItems },
                    }}
                    onRightElementPress={(action) => this.rightElementPress(action)}

                />
                {this.renderElement()}

            </Container>
        )
    }
}

ChatListPage.propTypes = propTypes;

export default ChatListPage;