import React, { Component } from 'react';

import { Type } from '../model/Type.js';
import { BotMessageType } from '../enum/BotMessageType.js';
import { getFullUrl } from './UrlHelper.js';

export function getMessageFromString(message) {
    let msg = message.toLocaleLowerCase();
    if (msg.startsWith('kaisa hai') || msg.startsWith('how are') || msg.startsWith('whats up')) {
        return new Type(BotMessageType.STRING, 'good');
    }

    else if (msg.startsWith('who are you') || msg.startsWith('who made you')) {
        return new Type(BotMessageType.STRING, 'my name is iyer, venugopal iyer, krishnamurti venugopal iyer, trichipalli krishnamurti venugopal iyer')
    }

    // else if (msg.startsWith('bot')) {
    //     msg =  msg.replace('bot', ' ').trim();
    //     return showMeString(msg);
    // }
    else {
        //return new Type(BotMessageType.STRING, 'I dont have answer, sorry');
        return showMeString(msg);
    }
}

function showMeString(msg) {
    return new Type(BotMessageType.ARRAY, getFullUrl(msg, false));
}



