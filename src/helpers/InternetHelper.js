import { NetInfo } from 'react-native';
import { getStoredDataFromKey } from './AppStore.js';
import { DOMAIN } from '../constants/AppConstant.js';
class InternetHelper {

	checkIfNetworkAvailable(networkStatusCallback) {
		NetInfo.isConnected.fetch().then(isConnected => {
			networkStatusCallback(isConnected)
		});
	}

	login(full_url, alertCallback, successCallback) {
		let index = full_url.lastIndexOf('api');
		let ping_url = full_url.substring(0, index);

		fetch(ping_url + 'api/method/ping', {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		}).then((succ) => {
			fetch(full_url, {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
			}).then((response) => response.json(), (reject) => alertCallback('Network request failed.', 'Something went wrong. Please try in a little bit.'))
				.then((responseData) => {
					if (responseData.message.includes('Incorrect password')) {
						alertCallback('Network request failed.',
							'Incorrect Password, make sure the entered password is correct and try again in a little bit.');
					} else if (responseData.message.includes('User disabled or missing')) {
						alertCallback('Network request failed.',
							'Incorrect Username / Email, make sure the entered email is correct and try again in a little bit.');
					} else {
						successCallback(responseData);
					}
				}, (reject) => alertCallback('Network request failed.', 'Something went wrong. Please try in a little bit.'))
		}, (reject) => {
			alertCallback('Network request failed.',
				'Failed to connect to given domain, make sure the entered domain is correct and try in a little bit.');
		});
	}

	getAllUsersInRoom(domain, room, callback) {
		let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.bridge.get_users_in_room';
		let data = {
			room: room,
		}

		const form = new FormData();
		form.append('obj', JSON.stringify(data));

		let method = {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'multipart/form-data',
			},
			body: form
		};
		this.fetch(url, method, callback);
	}

	setAllUsersInRoom(domain, users, room, chat_type, callback = null) {
		let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.bridge.set_users_in_room';
		let data = {
			room: room,
			users: users,
			chat_type: chat_type
		}
		const form = new FormData();
		form.append('obj', JSON.stringify(data));

		let method = {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'multipart/form-data',
			},
			body: form
		};
		this.fetch(url, method, callback);
	}

	removeFromGroup(domain, room, email, callback = null) {
		let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.bridge.remove_user_from_group';
		let data = {
			room: room,
			email: email
		}
		const form = new FormData();
		form.append('obj', JSON.stringify(data));
		let method = {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'multipart/form-data',
			},
			body: form
		};
		this.fetch(url, method, callback);
	}

	getUsers(domain, user_id, page_count, callback) {
		let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.bridge.get_users';

		let data = {
			email: user_id,
			page_count: page_count
		}

		const form = new FormData();
		form.append('obj', JSON.stringify(data));

		let method = {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'multipart/form-data',
			},
			body: form
		};

		this.fetch(url, method, callback)
	}

	get_user(domain, user_id, callback) {
		let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.bridge.get_user_by_email';
		let data = {
			email: user_id,
		}
		const form = new FormData();
		form.append('obj', JSON.stringify(data));
		
		let method = {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'multipart/form-data',
			},
			body: form
		};
		this.fetch(url, method, callback)
	}

	getAllMessages(domain, obj) {
		let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.bridge.get_message';
		const form = new FormData();
		form.append('obj', JSON.stringify(obj));

		let method = {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'multipart/form-data',
			},
			body: form
		};
		this.fetch(url, method)
	}


	getAllIssues(domain, obj, callback) {
		let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.bridge.get_issues';
		const form = new FormData();
		form.append('obj', JSON.stringify(obj));

		let method = {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'multipart/form-data',
			},
			body: form
		};
		this.fetch(url, method, callback)
	}

	getIssueForUser(domain, obj, callback) {
		let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.bridge.get_issue_for_user';
		const form = new FormData();
		form.append('obj', JSON.stringify(obj));

		let method = {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'multipart/form-data',
			},
			body: form
		};
		this.fetch(url, method, callback)
	}

	sendData(domain, data, userId) {
		let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.bridge.send_message_and_get_reply';
		let query = {
			"user_id": userId,
			"data": data
		};
		const form = new FormData();
		form.append('obj', JSON.stringify(query));

		let method = {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'multipart/form-data',
			},
			body: form
		};

		this.fetch(url, method);
	}

	loadMore(domain, bot_name, page_count, email, callback, is_load_items = false) {
		let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.bridge.load_more';
		if (is_load_items)
			url = 'http://' + domain + '/api/method/frappe.utils.kickapp.bridge.load_items';
		let query = {
			"bot_name": bot_name,
			"page_count": page_count,
			"email": email
		};

		const form = new FormData();
		form.append('query', JSON.stringify(query));
		let method = {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'multipart/form-data',
			},
			body: form
		};
		this.fetch(url, method, callback);
	}

	getMeta(domain, bot_name, callback) {
		let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.bridge.get_meta?bot_name=' + bot_name;
		fetch(url)
			.then((response) => response.json(),
			(reject) => callback({ is_error: true, data: null }))
			.then((responseData) => callback({ is_error: false, data: responseData.message }),
			(reject) => callback({ is_error: true, data: null }));
	}

	fetch(url, method, callback = null) {
		fetch(url, method)
			.then((response) => response.json(), (reject) => {
				if (callback)
					callback('Something went wrong.')
			})
			.then((responseData) => {
				if (callback)
					callback(responseData);
			}, (reject) => {
				console.log(reject);
			})
	}
}

const internet = new InternetHelper();
export default internet;