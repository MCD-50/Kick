import React from 'react';

class InternetHelper {


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



    sendData(uri, data) {
        let url = uri + '/api/method/frappe.utils.bot_reply.get_reply';
        const form = new FormData();
        form.append('doctype', data.doctype);
        form.append('query', data.query);
        form.append('action', data.action);
        form.append('id', data.id);

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
}


const internet = new InternetHelper();
export default internet;