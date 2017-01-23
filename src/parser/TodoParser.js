import React from 'react';


class TodoParser extends React.Component {

    parse(data) {
       console.log(data.data);
       console.log(data);
       return data.data;
    }

    getName(data){
       return data.name;
    }

    getDescription(data){
       return data.description;
    }

    getStatus(data){
        return data.status;
    }

    getOwner(data){
        return data.owner;
    }

    getPriority(){
        return data.priority;
    }

}

const todoFunc = new TodoParser();
export default todoFunc;