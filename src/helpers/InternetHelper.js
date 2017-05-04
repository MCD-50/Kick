//import from system
import { NetInfo } from 'react-native';

//import from app
import { getData } from './AsyncStore';
import { DOMAIN } from '../constants/AppConstant.js';
import AlertHelper from '../helpers/AlertHelper.js';

export const checkIfNetworkAvailable = () => {
	return new Promise((resolve, reject) => {
		NetInfo.isConnected.fetch()
			.then((res) => resolve(res), (rej) => reject(rej));
	});
}

export const login = (full_url) => {
	const index = full_url.lastIndexOf('api');
	const ping_url = full_url.substring(0, index);
	const method = getMethod()
	fetchUrl(ping_url + 'api/method/ping', method)
	.then((json) => {
		fetchUrl(full_url, method)
		.then((res) => {
			if (res.message.includes('Incorrect password')) {
				AlertHelper.showAlert('Network request failed.', 
					'Incorrect Password, make sure the entered password is correct and try again in a little bit.');
				return Promise.reject();
			} else if (res.message.includes('User disabled or missing')) {
				AlertHelper.showAlert('Network request failed.', 
					'Incorrect Username / Email, make sure the entered email is correct and try again in a little bit.');
				return Promise.reject();
			} else {
				return Promise.resolve(res)
			}
		})
		.catch((rej) => {
			showRejectMessage(rej, 'Something went wrong. Please try in a little bit.');
			return Promise.reject();
		});
	})
	.catch((rej) => {
		showRejectMessage(rej, 'Failed to connect to given domain, make sure the entered domain is correct and try in a little bit.')
		return Promise.reject();
	});
}

export const resolveRequest = (url, data = null) => {
	return new Promise((resolve, reject)=>{
		let form = null
		if(data){
			data = JSON.stringify(data);
			form = new FormData();
			form.append('obj', data);
		}
		const method = getMethod(form);
		fetchUrl(url, method)
		.then((json) => resolve(json))
		.catch((rej)=>{
			showRejectMessage(rej, 'Something went wrong. Please try in a little bit.');
			reject(rej);
		});
	})
}

const getMethod = (body = null) => {
	if (body) {
		return {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: body
		}
	} else {
		return {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		}
	}
}

const fetchUrl = (url, method) => {
	return new Promise((resolve, reject) => {
		checkIfNetworkAvailable()
		.then((r)=>{
			fetch(url, method)
			.then((res) => res.json(), (rej) => reject(rej))
			.then((json) => resolve(json), (rej) => reject(rej));
		})
		.catch((rej)=> reject({ is_connected:false }));
	})
}


const showRejectMessage = (rej, message)=>{
	if (rej) {
		AlertHelper.showAlert("Network request failed.",
			"Please check your internet connection and try again.")
	}else{
		AlertHelper.showAlert('Network request failed.', message)
	}
}
