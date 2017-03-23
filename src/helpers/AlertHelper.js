import {
	Alert
} from 'react-native'

import React, {
	Component
} from 'react'


class AlertHelper extends Component {
	showAlert(title, body, callback = null) {
		Alert.alert(
			title,
			body,
			[{
				text: 'OK', onPress: () => {
					if (callback)
						callback()
				}
			},
			{
				text: 'CANCEL', onPress: () => {
					if (callback)
						callback()
				}
			}]
		);
	}
}

export default AlertHelper;