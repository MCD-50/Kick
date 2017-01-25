import React, { Component } from 'react';

const header = 'http://';
const localHost = '192.168.0.106:3000/';
const afterHostResources = 'api/resource/';
const afterHostMethod = 'api/method/';
const afterMethod = 'frappe.utils.bot.get_bot_reply?question=';
const login = 'usr=Administrator&pwd=qwe';
const loginUrl = 'http://192.168.0.106:3000/api/method/login?' + login;

export const DOMAIN = 'DOMAIN';
export const EMAIL = 'EMAIL';
export const SID = 'SID';
export const FIRST_RUN = 'FIRST_RUN';
export const FULL_URL ='FULL_URL';
export const SERVER_URL = 'SERVER_URL';

function getCommon() {
    return header + localHost;
}

export function getUrl(){
    return 'http://192.168.0.106:3000/';
}

export function getResourcesString(data) {
    return getCommon() + afterHostResources + data;
}

export function getMethodString(data) {
    return getCommon() + afterHostMethod + afterMethod + data;
}


