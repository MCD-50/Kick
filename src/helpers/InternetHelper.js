import { NetInfo } from 'react-native';
import { getStoredDataFromKey } from './AppStore.js';
import { DOMAIN } from '../constants/AppConstant.js';
class InternetHelper {

    //     NetInfo.isConnected.fetch().then(isConnected => {
    //         console.log('First, is ' + (isConnected ? 'online' : 'offline'));
    //     });
    // function handleFirstConnectivityChange(isConnected) {
    //     console.log('Then, is ' + (isConnected ? 'online' : 'offline'));
    //     NetInfo.isConnected.removeEventListener(
    //         'change',
    //         handleFirstConnectivityChange
    //     );
    // }
    // NetInfo.isConnected.addEventListener(
    //     'change',
    //     handleFirstConnectivityChange
    // );


    checkIfNetworkAvailable(networkStatusCallback) {
        NetInfo.isConnected.fetch().then(isConnected => {
            networkStatusCallback(isConnected)
        });
    }


    getAllUsersInARoom(room, callback) {
        getStoredDataFromKey(DOMAIN).then((domain) => {
            let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.reply.send_message_and_get_reply?room=' + room;
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
        })
    }

    getAllUsers(full_url, callback) {
        let index = full_url.lastIndexOf('api');
        let ping_url = full_url.substring(0, index);

        fetch(ping_url + 'api/method/frappe.utils.kickapp.reply.get_all_users', {
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



    sendData(domain, data) {
        let url = 'http://' + domain + '/api/method/frappe.utils.kickapp.reply.send_message_and_get_reply';

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


        fetch(url, method).then((succ) => {
            console.log(succ);
        }, (error) => {
            console.log(error);
        });
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

        fetch(url, method).then((succ) => {
            console.log(succ);
        }, (error) => {
            console.log(error);
        })
    }
}



const internet = new InternetHelper();
export default internet;