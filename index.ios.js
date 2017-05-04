//import from system
import React, { Component } from 'react';
import { AppRegistry } from 'react-native';


//import from app
import Kick from './Kick.js';
import Container from './Container.js';

class ChatApp extends Component {
	render() {
		return (<Container><Kick /></Container>);
	}
}

AppRegistry.registerComponent('chatApp', () => ChatApp);