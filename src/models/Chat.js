
export class Chat {
    constructor(title, sub_title, info, person, group, bot) {
        this.title = title;
        this.sub_title = sub_title;
        this.info = info;
        this.person = person;
        this.group = group;
        this.bot = bot;
    }

    getId() {
        return this.id;
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

    getPerson() {
        return this.person;
    }

    getGroup() {
        return this.group;
    }

    getBot() {
        return this.bot;
    }

    setId(id) {
        this.id = id;
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

    setPerson(person) {
        this.person = person;
    }

    setBot(bot) {
        this.bot = bot;
    }

    setGroup(group) {
        this.group = group;
    }

}


