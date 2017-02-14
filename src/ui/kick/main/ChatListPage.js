import React, { Component, PropTypes } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ListView,
} from 'react-native';


import { Chat } from '../../../models/ChatItem.js';
import Toolbar from '../../customUI/ToolbarUI.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import Container from '../../Container.js';
import { Page } from '../../../enums/Page.js';
import Avatar from '../../customUI/Avatar.js';
import Badge from '../../customUI/Badge.js';
import ListItem from '../../customUI/ListItem.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import { Type } from '../../../enums/Type.js';
import { EMAIL, FIRST_NAME, DOMAIN } from '../../../constants/AppConstant.js';
import { getStoredDataFromKey } from '../../../helpers/AppStore.js';
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
class ChatList extends Component {

    constructor(params) {
        super(params);

        this.state = {
            searchText: '',
            isLoading: true,
            dataSource: ds.cloneWithRows([]),
            userId: '',
            userName: '',
            domain: '',
        };

        this.setStateData = this.setStateData.bind(this);
        this.renderListItem = this.renderListItem.bind(this);
        this.renderBadge = this.renderBadge.bind(this);
        this.getColor = this.getColor.bind(this);
        this.getIcon = this.getIcon.bind(this);
        this.callback = this.callback.bind(this);
        this.rightElementPress = this.rightElementPress.bind(this);
        this.onNotification = this.onNotification.bind(this);
        this.socket = SocketHelper(this.onNotification);
        this.renderElement = this.renderElement.bind(this);
    }

    componentWillMount() {
        getStoredDataFromKey(EMAIL).then((mail) => this.setState({ userId: mail }));
        getStoredDataFromKey(FIRST_NAME).then((name) => this.setState({ userName: name }));
        getStoredDataFromKey(DOMAIN).then((dom) => this.setState({ domain: dom }));
    }


    componentDidMount() {
        this.setStateData();
    }


    setStateData() {
        DatabaseHelper.getAllChats((results) => {
            let chats = Object.keys(results.rows).map((key) => {
                return CollectionUtils.convertToChat(results.rows[key], true);
            })
            this.setState({
                dataSource: ds.cloneWithRows(chats),
                isLoading: false
            });

        })
    }

    onChangeText(value) {
        this.setState({ searchText: value });
    }

    getColor(name) {
        const length = name.length;
        return colors[length % colors.length];
    }

    renderBadge(count) {
        if (count > 0)
            return <Badge text={count} />
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

    onNotification(noti) {
        //some code here;
    }

    renderListItem(chat) {
        const searchText = this.state.searchText.toLowerCase();
        if (searchText.length > 0 && chat.title.toLowerCase().indexOf(searchText) < 0) {
            return null;
        }

        return (
            <ListItem
                divider

                leftElement={<Avatar bgcolor={this.getColor(chat.title)} text={chat.title[0] + chat.title[1].toUpperCase()} />}

                centerElement={{
                    primaryText: chat.title,
                    secondaryText: chat.subTitle,
                    tertiaryText: this.getIcon(chat.type)
                }}

                rightElement={{
                    upperElement: chat.lastMessageTime,
                    lowerElement: this.renderBadge(chat.badge),
                }}

                onPress={() => {
                    let page = Page.CHAT_PAGE;
                    let state = this.state;
                    let data = { chat: chat, callback: this.callback, owner: { userName: state.userName, userId: state.userId, domain: state.domain } }
                    this.props.navigator.push({ id: page.id, name: page.name, data: data })
                }} />
        );
    }




    callback(fromWhichPage) {
        switch (fromWhichPage) {
            case Page.BOT_LIST_PAGE.name:
                break;
            case Page.CHAT_PAGE.name:
                break;
            case Page.CONTACT_LIST_PAGE.name:
                break;
            case Page.NEW_GROUP_PAGE.name:
                break;
            default:
                break;
        }
        this.setStateData();
    }

    rightElementPress(action) {
        let page = null;
        let data = null;
        switch (action.index) {
            case 0:
                page = Page.BOT_LIST_PAGE;
                data = { callback: this.callback }
                break;
            case 1:
                page = Page.CONTACT_LIST_PAGE;
                data = { callback: this.callback }
                break;
            case 2:
                page = Page.NEW_GROUP_PAGE
                break;
            case 3: page = Page.NEW_CONTACT_PAGE
                break;
            case 4: page = Page.OWNER_INFO_PAGE
                break;
            case 5: page = Page.SETTINGS_PAGE
                break;

        }

        if (page)
            this.props.navigator.push({ id: page.id, name: page.name, data: data })
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
                    centerElement={this.props.route.name}
                    searchable={{
                        autoFocus: true,
                        placeholder: 'Search...',
                        onChangeText: value => this.onChangeText(value),
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

ChatList.propTypes = propTypes;

export default ChatList;