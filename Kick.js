import React, { Component } from 'react';
import {
    Navigator,
} from 'react-native';


var UIManager = require('UIManager');
import ThemeProvider from './src/ui/customUI/utils/themeprovider.js';
import { Page } from './src/enums/Page.js';


import ChatPage from './src/ui/kick/chat/ChatPage.js';
import EditInfoPage from './src/ui/kick/chat/EditInfoPage.js';
import ViewInfoPage from './src/ui/kick/chat/ViewInfoPage.js';
import ViewMorePage from './src/ui/kick/chat/ViewMorePage.js';

import BotListPage from './src/ui/kick/main/BotListPage.js';
import ChatListPage from './src/ui/kick/main/ChatListPage.js';
import ContactListPage from './src/ui/kick/main/ContactListPage.js';
import LoginPage from './src/ui/kick/main/LoginPage.js';
import SettingsPage from './src/ui/kick/main/SettingsPage.js';

import BotInfoPage from './src/ui/kick/others/BotInfoPage.js';
import ChatInfoPage from './src/ui/kick/others/ChatInfoPage.js';
import ContactInfoPage from './src/ui/kick/others/ContactInfoPage.js';
import FirstRunPage from './src/ui/kick/others/FirstRunPage.js';
import GroupInfoPage from './src/ui/kick/others/GroupInfoPage.js';
import OwnerInfoPage from './src/ui/kick/others/OwnerInfoPage.js';
import SplashPage from './src/ui/kick/others/SplashPage.js';
import NewGroupPage from './src/ui/kick/others/NewGroupPage.js';
import NewContactPage from './src/ui/kick/others/NewContactPage.js';

const uiTheme = {
    toolbar: {
        container: {
            height: 55,
        },
    },
};



class Kick extends Component {
    constructor(params) {
        super(params)
    }

    componentDidMount() {
        if (UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }

    renderNavigation(route, navigator) {
        let id = route.id;
        if (id == 1)
            return <SplashPage navigator={navigator} route={route} />
        else if (id == 2)
            return <LoginPage navigator={navigator} route={route} />
        else if (id == 3)
            return <FirstRunPage navigator={navigator} route={route} />
        else if (id == 4)
            return <ChatListPage navigator={navigator} route={route} />
        else if (id == 5)
            return <BotListPage navigator={navigator} route={route} />
        else if (id == 6)
            return <ContactListPage navigator={navigator} route={route} />
        else if (id == 7)
            return <ChatPage navigator={navigator} route={route} />
        else if (id == 8)
            return <SettingsPage navigator={navigator} route={route} />
        else if (id == 9)
            return <EditInfoPage navigator={navigator} route={route} />
        else if (id == 10)
            return <ViewInfoPage navigator={navigator} route={route} />
        else if (id == 11)
            return <ViewMorePage navigator={navigator} route={route} />
        else if (id == 12)
            return <OwnerInfoPage navigator={navigator} route={route} />
        else if (id == 13)
            return <BotInfoPage navigator={navigator} route={route} />
        else if (id == 14)
            return <GroupInfoPage navigator={navigator} route={route} />
        else if (id == 15)
            return <ContactInfoPage navigator={navigator} route={route} />
        else if (id == 16)
            return <ChatInfoPage navigator={navigator} route={route} />
        else if (id == 17)
            return <NewContactPage navigator={navigator} route={route} />
        else if (id == 18)
            return <NewGroupPage navigator={navigator} route={route} />
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


// <Navigator
//   renderScene={(route, navigator) =>
//     // ...
//   }
//   configureScene={(route, routeStack) =>
//     Navigator.SceneConfigs.FloatFromBottom}
// />
// Navigator.SceneConfigs.PushFromRight (default)
// Navigator.SceneConfigs.FloatFromRight
// Navigator.SceneConfigs.FloatFromLeft
// Navigator.SceneConfigs.FloatFromBottom
// Navigator.SceneConfigs.FloatFromBottomAndroid
// Navigator.SceneConfigs.FadeAndroid
// Navigator.SceneConfigs.SwipeFromLeft
// Navigator.SceneConfigs.HorizontalSwipeJump
// Navigator.SceneConfigs.HorizontalSwipeJumpFromRight
// Navigator.SceneConfigs.HorizontalSwipeJumpFromLeft
// Navigator.SceneConfigs.VerticalUpSwipeJump
// Navigator.SceneConfigs.VerticalDownSwipeJump
