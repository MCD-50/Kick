/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
  Navigator,
} from 'react-native';

var fluxify = require('fluxify');

import CookieManager from 'react-native-cookies';
import { isFirstRun, getStoredDataFromKey } from './src/helper/SharedReferencesHelper.js';

import { COLOR, ThemeProvider } from 'react-native-material-ui';
var UIManager = require('UIManager');

const login = 'usr=Administrator&pwd=qwe';
const loginUrl = 'http://192.168.0.106:3000/api/method/login?' + login;

import MainPage from './src/ui/MainPage.js';
import ChatPage from './src/ui/ChatPage.js';
import LoginPage from './src/ui/LoginPage.js';
import SplashPage from './src/ui/SplashPage.js';
import BotList from './src/ui/BotList.js';

import { FULL_URL, SID } from './src/helper/AppConstant.js';

const TEXTBOLDPRICOLOR = '#212121';
const TEXTGRAYSECCOLOR = '#8F8F8F'
const PRICOLOR = '#527DA3'
const ACCENTCOLOR = '#6AA1CE'

const uiTheme = {
  palette: {
    primaryColor: PRICOLOR,
    accentColor: ACCENTCOLOR,
    primaryTextColor: TEXTBOLDPRICOLOR,
    secondaryTextColor: TEXTGRAYSECCOLOR,
    alternateTextColor: 'white'
  },

  toolbar: {
    container: {
      height: 55,
    },
  },
};

const _this = {};

export default class chatApp extends Component {
  constructor(params) {
    super(params);
    this.state = {
      isLogged: false,
      isFirstRun: false
    }
    _this = this;
  }



  componentDidMount() {

    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    isFirstRun().then((value) => {
      this.setState({ isFirstRun: value })
    });

    if (this.state.isFirstRun) {
      this.setState({
        isLogged: false
      });
    } else {
      getStoredDataFromKey(FULL_URL)
        .then((full) => {
          if (full) {
            CookieManager.get(full, (err, cookie) => {
              let isAuthenticated;
              if (cookie && cookie.sid && cookie.sid !== 'Guest') {
                isAuthenticated = true;
              }
              else {
                isAuthenticated = false;
              }
              this.setState({
                isLogged: isAuthenticated
              });
            });
          } else {
            this.setState({
              isLogged: false
            });
          }
        })
    }
  }


  renderScene(route, navigator) {
    let routeId = route.id;
    if (routeId === 'SplashPage') {
      return (
        <SplashPage navigator={navigator} route={route} />
      );
    }
    else if (routeId === 'Base') {
      if (_this.state.isLogged) {
        return (<MainPage navigator={navigator} route={route} />);
      } else {
        return (<LoginPage navigator={navigator} route={route} />);
      }
    }
    else if (routeId === 'ChatPage') {
      return (
        <ChatPage navigator={navigator} route={route} />
      );
    } else if (routeId === 'HomePage') {
      return (
        <MainPage navigator={navigator} route={route} />
      );
    } else if (routeId === 'BotPage') {
      return (
        <BotList navigator={navigator} route={route} />
      );
    }
  }



  render() {
    return (
      <ThemeProvider uiTheme={uiTheme}>
        <Navigator initialRoute={{ id: 'SplashPage', name: 'Splash', data: {} }}
          renderScene={this.renderScene.bind(this)} />
      </ThemeProvider>

    );
  }
}

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



// <View style={styles.container}>
//         <Text style={styles.welcome}>
//           Welcome to React Native!
//         </Text>
//         <Text style={styles.instructions}>
//           To get started, edit index.android.js
//         </Text>
//         <Text style={styles.instructions}>
//           Double tap R on your keyboard to reload,{'\n'}
//           Shake or press menu button for dev menu
//         </Text>

//         <Button title='click to change name'
//                 onPress={changeName}/>
//       </View>



var helloStore = fluxify.createStore({
  id: 'helloStore',
  initialState: {
    name: 'Alice'
  },
  actionCallbacks: {
    changeName: function (state, action) {
      // Stores updates are only made inside store's action callbacks
      state.set({ name: action.payload.name });
    }
  }
});


helloStore.on('change:name', function (name, previousName) {
  console.log('Bye ' + previousName + ', hello ' + helloStore.name);
});

// Dispatch actions
// logs "Bye Alice, hello Bob";

function changeName() {
  fluxify.doAction('changeName', { payload: { name: 'ayush' } });
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('chatApp', () => chatApp);
