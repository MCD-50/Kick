
export class Message {

    constructor(user_name, user_id, text, created_on, is_alert, info, action, list_items) {
        this.user_name = user_name;
        this.user_id = user_id;
        this.text = text;
        this.created_on = created_on;
        this.is_alert = is_alert;
        this.info = info;
        this.action = action;
        this.list_items = list_items
    }

    getUserName() {
        return this.user_name;
    }

    getUserId() {
        return this.user_id;
    }

    getText() {
        return this.text;
    }

    getCreatedOn() {
        return this.created_on;
    }

    getIsAlert() {
        return this.is_alert;
    }

    getInfo() {
        return this.info;
    }

    getAction(){
        return this.action;
    }

    getListItems(){
        return this.list_items;
    }

    setUserName(user_name) {
        this.user_name = user_name;
    }

    setUserId(user_id) {
        this.user_id = user_id;
    }

    setText(text) {
        this.text = text;
    }

    setCreatedOn(created_on) {
        this.created_on = created_on;
    }

    setIsAlert(is_alert) {
        this.is_alert = is_alert;
    }

    setInfo(info) {
        this.info = info;
    }

    setAction(action) {
        this.action = action;
    }

    setListItems(list_items){
        this.list_items = list_items;
    }
}

