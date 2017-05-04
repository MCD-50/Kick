export class Message {
	constructor(user_name, user_id, text, created_on, is_alert, communication) {
		this.user_name = user_name;
		this.user_id = user_id;
		this.text = text;
		this.created_on = created_on;
		this.is_alert = is_alert;
		this.communication = communication;
	}
}