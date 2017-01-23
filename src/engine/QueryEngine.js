import React from 'react';


import BotEngine from './BotEngine.js';
import ChatEngine from './ChatEngine.js'; 

let _type;

class QueryEngine extends React.Component{

    setEngineType(type){
       _type = type;
    }
   
//    //ToDo
//     getData(){
//         if(_type === 'BOT'){
           
//         }else{
//             return null;
//         }
//     }

}

const botFunc = new BotEngine();
export default botFunc;