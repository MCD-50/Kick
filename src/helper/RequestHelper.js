import React from 'react';

import TodoParser from '../parser/TodoParser.js';
import HelpParser from '../parser/HelpParser.js';
import IssueParser from '../parser/IssueParser.js';
import StudentParser from '../parser/StudentParser.js';
import ChatParser from '../parser/ChatParser.js';


class RequestHelper extends React.Component {

    constructor(params) {
        super(params);

        this.getParserFromDoctype = this.getParserFromDoctype.bind(this);
        this.serializeJSON = this.serializeJSON.bind(this);
    }

    getData(uri, doctype, id) {
        return fetch(uri + '/api/resource/' + doctype + '/' + id, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((res) => res.json())
            .then((data) => {
                let _data = this.getParserFromDoctype(doctype, data.json());
                if (_data != null) {
                    return _data;
                }
                return 'Something went wrong.'
            }, (reject) => {
                return reject.toString();
            });
    }

    removeData(uri, doctype, id) {
        return fetch(uri + '/api/resource/' + doctype + '/' + id, {
            method: "DELETE",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((res) => res.json())
            .then((data) => {
                return data.message;
            }, (reject) => {
                return reject.toString();
            });
    }


    serializeJSON(data) {
        return Object.keys(data).map(function (keyName) {
            return encodeURIComponent(keyName) + '=' + encodeURIComponent(data[keyName])
        }).join('&');
    }



    setData(uri, doctype, data) {

        let url = uri + '/api/resource/' + doctype;
        const form = new FormData();
        form.append('data', JSON.stringify(data));

        let method = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: form
        };

        return fetch(url, method)
            .then(res => res.json())
            .then((data) => {
                console.log(data);
                let _data = this.getParserFromDoctype(doctype, data);
                if (_data != null) {
                    return _data;
                }
                return 'Something went wrong.'
            }, (reject) => {
                console.log(reject);
                return reject.toString();
            });
    }


    updateData(uri, doctype, data) {
        let url = uri + '/api/resource/' + doctype;
        const form = new FormData();
        form.append('data', JSON.stringify(data));

        let method = {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: form
        };

        return fetch(url, method)
            .then(res => res.json())
            .then((data) => {
                let _data = this.getParserFromDoctype(doctype, data);
                if (_data != null) {
                    return _data;
                }
                return 'Something went wrong.'
            }, (reject) => {
                console.log(reject);
                return reject.toString();
            });
    }


    getParserFromDoctype(doctype, data) {
        switch (doctype.toLowerCase()) {
            case 'todo': return TodoParser.parse(data);
            case 'help': return HelpParser.parse(data);
            case 'issue': return IssueHelper.parse(data);
            case 'student': return StudentHelper.parse(data);

            default: return null;
        }
    }

}


const reqFunc = new RequestHelper();
export default reqFunc;