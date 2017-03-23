
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
import { NotificationsAndroid } from 'react-native-notifications';
import Container from './Container.js';

class chatApp extends Component {

	constructor(params) {
		super(params)
		NotificationsIOS.addEventListener('remoteNotificationsRegistered', this.onPushRegistered.bind(this));
		NotificationsIOS.addEventListener('remoteNotificationsRegistrationFailed', this.onPushRegistrationFaled.bind(this));
		NotificationsIOS.requestPermissions();
	}

	componentWillUnmount() {
		NotificationsIOS.removeEventListener('remoteNotificationsRegistered', this.onPushRegistered.bind(this));
		NotificationsIOS.removeEventListener('remoteNotificationsRegistrationFailed', this.onPushRegistrationFailed.bind(this));
	}

	onPushRegistered(deviceToken) {
		console.log("Device Token Received", deviceToken);
	}

	onPushRegistrationFailed(error) {
		// error={
		//   domain: 'NSCocoaErroDomain',
		//   code: 3010,
		//   localizedDescription: 'remote notifications are not supported in the simulator'
		// }
		console.error(error);
	}

	render() {
		return (
			<Container>
				<Kick />
			</Container>);
	}
}

AppRegistry.registerComponent('chatApp', () => chatApp);
