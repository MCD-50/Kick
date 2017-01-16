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

import Main from './src/ui/Main.js';
import { COLOR, ThemeProvider } from 'react-native-material-ui';
var UIManager = require('UIManager');

const uiTheme = {
  palette: {
    primaryColor: '#333333',
    accentColor: '#ff4500',
  },
  toolbar: {
    container: {
      height: 55,
    },
  },
};

export default class chatApp extends Component {

  constructor(params) {
    super(params);
  }

  componentWillMount() {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  renderScene(route, navigator) {
    let routeId = route.id;
    if (routeId === 'HomePage') {
      return (
        <Main navigator={navigator} route={route} />
      );
    }
  }

  render() {
    return (
      <ThemeProvider uiTheme={uiTheme}>
        <Navigator
          initialRoute={{ id: 'HomePage', name: 'Home' }}
          renderScene={this.renderScene.bind(this)} />
      </ThemeProvider>

    );
  }
}


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
