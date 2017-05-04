//import fromm system
import { Alert } from 'react-native'
import React, { Component } from 'react'

const AlertHelper = {
	showAlert(title, body, callback = null) {
		Alert.alert(
			title, body,
			[{
				text: 'OK',
				onPress: () => {
					if (callback)
						callback({ Ok: true, Cancel: false })
				}
			},
			{
				text: 'CANCEL',
				onPress: () => {
					if (callback)
						callback({ Ok: false, Cancel: true })
				}
			}]
		);
	}
}

export default AlertHelper;