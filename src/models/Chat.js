
export class Chat {
	constructor(title, sub_title, info) {
		this.title = title;
		this.sub_title = sub_title;
		this.info = info;
	}

	getId() {
		return this._id;
	}

	getTitle() {
		return this.title;
	}

	getSubTitle() {
		return this.sub_title;
	}

	getInfo() {
		return this.info;
	}

	setId(_id) {
		this._id = _id;
	}

	setTitle(title) {
		this.title = title;
	}

	setSubTitle(sub_title) {
		this.sub_title = sub_title;
	}

	setInfo(info) {
		this.info = info;
	}
}


