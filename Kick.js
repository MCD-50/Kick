//import from system.
import React, { Component } from 'react';
import { Navigator } from 'react-native';
import Fluxify from 'fluxify';
const UIManager = require('UIManager');

//import from app
import { ThemeProvider } from 'react-native-material-component';
import { Page } from './src/enums/Page.js';
import { uiTheme } from './src/constants/AppStyle.js';
import StateHelper from './src/helpers/StateHelper.js';


//pages 
import SplashPage from './src/ui/kick/others/SplashPage.js';
import LoginPage from './src/ui/kick/main/LoginPage.js';
import ChatListPage from './src/ui/kick/main/ChatListPage.js';
import ContactListPage from './src/ui/kick/main/ContactListPage.js';
import ChatPage from './src/ui/kick/chat/ChatPage.js';
import SettingsPage from './src/ui/kick/main/SettingsPage.js';
import ContactInfoPage from './src/ui/kick/others/ContactInfoPage.js';
import GroupInfoPage from './src/ui/kick/others/GroupInfoPage.js';
import NewGroupPage from './src/ui/kick/others/NewGroupPage.js';
import ProfilePage from './src/ui/kick/others/OwnerInfoPage.js';


class Kick extends Component {
	constructor(params) {
		super(params);
		this.state = {
			chatList: [],
			chatItemList: [],
			currentChat: null
		}

		this.onChatListChanged = this.onChatListChanged.bind(this);
		this.onChatItemListChanged = this.onChatItemListChanged.bind(this);
		this.onCurrentChatChanged = this.onCurrentChatChanged.bind(this);
	}

	componentDidMount() {
		if (UIManager.setLayoutAnimationEnabledExperimental) {
			UIManager.setLayoutAnimationEnabledExperimental(true);
		}

		StateHelper.setOnChatListChanged(this.onChatListChanged)
		StateHelper.setOnChatItemListChanged(this.onChatItemListChanged);
		StateHelper.setOnCurrentChatChanged(this.onCurrentChatChanged);
	}

	onChatListChanged(list) {
		this.setState({ chatList: list });
	}

	onChatItemListChanged(list) {
		this.setState({ chatItemList: list });
	}

	onCurrentChatChanged(chat) {
		this.setState({ currentChat: chat });
	}

	renderNavigation(route, navigator) {
		const id = route.id;
		Fluxify.doAction('updateCurrentPageId', id);
		if (id == 1)
			return <SplashPage navigator={navigator} route={route} chats={this.state.chatList} messages={this.state.chatItemList} chat={this.state.currentChat} />
		else if (id == 2)
			return <LoginPage navigator={navigator} route={route} chats={this.state.chatList} messages={this.state.chatItemList} chat={this.state.currentChat} />
		else if (id == 3)
			return <ChatListPage navigator={navigator} route={route} chats={this.state.chatList} messages={this.state.chatItemList} chat={this.state.currentChat} />
		else if (id == 4)
			return <ContactListPage navigator={navigator} route={route} chats={this.state.chatList} messages={this.state.chatItemList} chat={this.state.currentChat} />
		else if (id == 5)
			return <ChatPage navigator={navigator} route={route} chats={this.state.chatList} messages={this.state.chatItemList} chat={this.state.currentChat} />
		else if (id == 6)
			return <SettingsPage navigator={navigator} route={route} chats={this.state.chatList} messages={this.state.chatItemList} chat={this.state.currentChat} />
		else if (id == 7)
			return <ContactInfoPage navigator={navigator} route={route} chats={this.state.chatList} messages={this.state.chatItemList} chat={this.state.currentChat} />
		else if (id == 8)
			return <GroupInfoPage navigator={navigator} route={route} chats={this.state.chatList} messages={this.state.chatItemList} chat={this.state.currentChat} />
		else if (id == 9)
			return <NewGroupPage navigator={navigator} route={route} chats={this.state.chatList} messages={this.state.chatItemList} chat={this.state.currentChat} />
		else if (id == 10)
			return <ProfilePage navigator={navigator} route={route} chats={this.state.chatList} messages={this.state.chatItemList} chat={this.state.currentChat} />
	}

	render() {
		return (
			<ThemeProvider uiTheme={uiTheme}>
				<Navigator initialRoute={{ id: 1, name: 'Splash' }}
					renderScene={this.renderNavigation.bind(this)}
					configureScene={(route, routeStack) => Navigator.SceneConfigs.FloatFromBottomAndroid} />
			</ThemeProvider>
		);
	}
}

export default Kick;