
import React, {
	Component,
	PropTypes,
} from 'react';
import {
	AppRegistry,
	View,
	Text
} from 'react-native';

import Kick from './Kick.js';
// import { NotificationsAndroid } from 'react-native-notifications';
import Container from './Container.js';

//user this for automatic linking 
//react-native link package_name && rnpm link package_name
class chatApp extends Component {
	// constructor(params) {
	// 	super(params)
	// 	NotificationsAndroid.setRegistrationTokenUpdateListener((deviceToken) => {
	// 		console.log('Push-notifications registered!', deviceToken)
	// 	});
	// 	NotificationsAndroid.setNotificationReceivedListener((notification) => {
	// 		console.log("Notification received on device", notification.getData());
	// 	});
	// 	NotificationsAndroid.setNotificationOpenedListener((notification) => {
	// 		console.log("Notification opened by device user", notification.getData());
	// 	});
	// }

	render() {
		return (
			<Container>
				<Kick />
			</Container>);
	}
}

AppRegistry.registerComponent('chatApp', () => chatApp);
