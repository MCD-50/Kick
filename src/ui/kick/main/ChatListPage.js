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
import { EMAIL, FULL_NAME, DOMAIN } from '../../../constants/AppConstant.js';
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
class ChatListPage extends Component {

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
        this.onChangeText = this.onChangeText.bind(this);

        this.getColor = this.getColor.bind(this);
        this.getIcon = this.getIcon.bind(this);
        this.callback = this.callback.bind(this);
        this.rightElementPress = this.rightElementPress.bind(this);
        this.onMessageReceive = this.onMessageReceive.bind(this);
        this.socket = SocketHelper(this.onMessageReceive);
        this.renderElement = this.renderElement.bind(this);
    }

    componentWillMount() {
        getStoredDataFromKey(EMAIL).then((mail) => this.setState({ userId: mail }));
        getStoredDataFromKey(FULL_NAME).then((name) => this.setState({ userName: name }));
        getStoredDataFromKey(DOMAIN).then((dom) => this.setState({ domain: dom }));
    }


    componentDidMount() {
        this.setStateData();
    }


    setStateData() {
        DatabaseHelper.getAllChatsByQuery({ is_added_to_chat_list: true }, (results) => {
            let chats = results.map((result) => {
                return CollectionUtils.convertToChat(result, true);
            })
            this.setState({
                dataSource: ds.cloneWithRows(chats.reverse()),
                isLoading: false
            });
        })
    }

    onChangeText(e) {
        this.setState({ searchText: e });
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

    onMessageReceive(message) {
        console.log(message);
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
                    upperElement: chat.info.last_message_time,
                    lowerElement: this.renderBadge(chat.info.new_message_count),
                }}

                onPress={() => {
                    let page = Page.CHAT_PAGE;
                    let state = this.state;
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


    callback(fromWhichPage) {
        switch (fromWhichPage) {
            case Page.BOT_LIST_PAGE.name:
                break;
            case Page.CHAT_PAGE.name:
                break;
            case Page.CONTACT_LIST_PAGE.name:
                break;
            case Page.NEW_CONTACT_PAGE.name:
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
                    centerElement={this.props.route.name}
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