import { NetInfo } from 'react-native';
import { getStoredDataFromKey } from './AppStore.js';
import { DOMAIN } from '../constants/AppConstant.js';
class InternetHelper {
    checkIfNetworkAvailable(networkStatusCallback) {
        NetInfo.isConnected.fetch().then(isConnected => {
            networkStatusCallback(isConnected)
        });
    }

    // getAllUsersInARoom(room, callback) {
    //     getStoredDataFromKey(DOMAIN).then((domain) => {
    //         let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.reply.get_users_in_group?room=' + room;
    //         fetch(url, {
    //             method: "POST",
    //             headers: {
    //                 'Accept': 'application/json',
    //                 'Content-Type': 'application/json',
    //             },
    //         }).then((response) => response.json(), (reject) => callback(null, 'Something went wrong.'))
    //             .then((responseData) => {
    //                 callback(responseData.message, null)
    //             }, (reject) => callback(null, 'Something went wrong.'));
    //     })
    // }

    getAllUsers(domain, user_id, callback) {
        fetch('http://' + domain + '/api/method/frappe.utils.kickapp.reply.get_all_users?email=' + user_id, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json(), (reject) => callback(null, 'Something went wrong.'))
            .then((responseData) => {
                callback(responseData.message, null)
            }, (reject) => callback(null, 'Something went wrong.'));
    }

    getAllUsersByRoom(domain, room, callback) {
        fetch('http://' + domain + '/api/method/frappe.utils.kickapp.reply.get_users_in_group?room=' + room, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json(), (reject) => callback(null, 'Something went wrong.'))
            .then((responseData) => {
                callback(responseData.message, null)
            }, (reject) => callback(null, 'Something went wrong.'));
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
                        successCallback();
                    }
                }, (reject) => alertCallback('Network request failed.', 'Something went wrong. Please try in a little bit.'))
        }, (reject) => {

            alertCallback('Network request failed.',
                'Failed to connect to given domain, make sure the entered domain is correct and try in a little bit.');
        });
    }


    sendData(domain, data, userId) {
        let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.reply.send_message_and_get_reply';
        let query = {
            "user_id": userId,
            "obj": data
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

        this.fetch(url, method);
    }

    getLastActive(domain, email, callback) {
        let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.reply.get_last_active_by_email?email=' + email;
        fetch(url, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json(), (reject) => callback(null, 'Something went wrong.'))
            .then((responseData) => {
                callback(responseData.message, null)
            }, (reject) => callback(null, 'Something went wrong.'));
    }

    getAllMessages(domain, obj) {
        let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.reply.get_message_for_first_time';
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

    setGlobalRoom(domain, email, number, title) {
        let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.reply.set_user_in_global_chat_room';
        let data = {
            room: email,
            user: {
                title: title,
                number: number,
                email: email
            }
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

        this.fetch(url, method);
    }


    setUsersInARoom(domain, users, room, callback = null) {
        let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.reply.set_users_in_room';
        let data = {
            room: room,
            users: users
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

    fetch(url, method, callback = null) {
        fetch(url, method)
            .then((response) => response.json(), (reject) => {
                if (callback)
                    callback('Something went wrong.')
            })
            .then((responseData) => {
                //console.log(succ);
                if (callback)
                    callback(responseData);
            }, (error) => {
                console.log(error);
            })
    }
}

const internet = new InternetHelper();
export default internet;