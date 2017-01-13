import React, { Component } from 'react';

const login = 'usr=Administrator&pwd=qwe';
const loginUrl = 'http://192.168.0.106:3000/api/method/login?' + login;

import { Message } from '../model/Message.js';

export function fetchData(url) {

    return getBaseDataAsync(url);
}

async function getBaseDataAsync(url) {
    try {
        let split = true;

        let response = await fetch(url);
        //console.log(response);
        
        let responseJson = await response.json();

        console.log(responseJson.message);
        let messageArray = [];

        if (!responseJson.message.includes('have fun!')) {
            console.log('inside');
            let arrayOfMessage = responseJson.message.split(':');
            messageArray.push(new Message('Erpnext', 'Ayush', arrayOfMessage[0]));
            if (arrayOfMessage[1] && arrayOfMessage[1] !== ' ') {
                arrayOfMessage = arrayOfMessage[1].trim().split(',');
                let entireMsg = '';
                arrayOfMessage.forEach((xm) => {
                    let newArrayOfMessages = xm.split('[');
                    newArrayOfMessages = newArrayOfMessages[1].split(']');
                    entireMsg = entireMsg + newArrayOfMessages[0] + '\n';
                    ///console.log(newArrayOfMessages);   
                });
                messageArray.push(new Message('Erpnext', 'Ayush', entireMsg));
                if (messageArray.length < 1) {
                    return [new Message('Erpnext', 'Ayush', 'Its empty in here')];
                } else {
                    return messageArray.reverse();
                }
            }else {
                if (messageArray[0].getText().startsWith('I found')) {
                    return [new Message('Erpnext', 'Ayush', 'Its empty in here')];
                }
                return messageArray; //[new Message('Erpnext', 'Ayush', 'Its empty in here')];
            }
        }else{
            messageArray.push(new Message('Erpnext', 'Ayush', responseJson.message));
            return messageArray;
        }
        //console.log(arrayOfMessage);
        //return responseJson.data;
    } catch (error) {
        console.error(error);
        return [new Message('Erpnext', 'Ayush', 'Something went wrong')];
    }
}

