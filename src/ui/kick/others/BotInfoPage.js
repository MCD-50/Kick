import React, { Component, PropTypes } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    TouchableOpacity,
    BackAndroid,
} from 'react-native';



import Toolbar from '../../customUI/ToolbarUI.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import Container from '../../Container.js';
import { Page } from '../../../enums/Page.js';
import { Type } from '../../../enums/Type.js';
import Avatar from '../../customUI/Avatar.js';
import {
    UPMARGIN,
    DOWNMARGIN,
    LEFTMARGIN,
    RIGHTMARGIN
} from '../../../constants/AppConstant.js';
import Icon from '../../customUI/Icon.js';
import ListItem from '../../customUI/ListItem.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import Progress from '../../customUI/Progress.js';


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    view: {
        flex: 1,
        marginLeft: LEFTMARGIN,
        marginRight: RIGHTMARGIN,
        marginTop: UPMARGIN,
        marginBottom: DOWNMARGIN,
    },

    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    text: {
        color: 'white',
        fontSize: 17,
    },
    avatar: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: UPMARGIN,
        marginBottom: DOWNMARGIN
    }

});

const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,

};


const colors = [
    '#e67e22', // carrot
    '#3498db', // peter river
    '#8e44ad', // wisteria
    '#e74c3c', // alizarin
    '#1abc9c', // turquoise
    '#2c3e50', // midnight blue
];



class BotInfoPage extends Component {

    constructor(params) {
        super(params);

        this.state = {
            bot: this.props.route.data,
        };


        this.addBackEvent = this.addBackEvent.bind(this);
        this.removeBackEvent = this.removeBackEvent.bind(this);
        this.renderElement = this.renderElement.bind(this);
        this.renderAddElement = this.renderAddElement.bind(this);
        this.addRemoveBotToChat = this.addRemoveBotToChat.bind(this);
    }

    addBackEvent() {
        BackAndroid.addEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    }

    removeBackEvent() {
        BackAndroid.removeEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    }

    componentWillMount() {
        this.addBackEvent();
    }

    componentWillUnmount() {
        this.removeBackEvent();
    }

    getColor(name) {
        const length = name.length;
        return colors[length % colors.length];
    }


    renderElement() {
        let bot = this.state.bot;
        return (
            <ScrollView style={styles.container} keyboardDismissMode='interactive'>
                <View >
                    <View style={[styles.view, { marginTop: LEFTMARGIN, flexDirection: 'row', flex: 1, }]}>
                        <View style={{ marginRight: 20 }}>
                            <Icon name='label' size={30} />
                        </View>
                        <Text style={[styles.text, { marginTop: 3, color: '#8f8f8f' }]}> {'jbjjdvkfv,jdfvbkvvljskvbsljdvvkljdsvblv jfj kvfvjvns,m  vbvfn f fkjv fb n jf b knf kfnf ng  flk ngfn'.trim()} </Text>
                    </View>

                    <View style={{ marginTop: UPMARGIN, marginBottom: DOWNMARGIN, height: StyleSheet.hairlineWidth, backgroundColor: '#8f8f8f' }} />

                </View>
            </ScrollView >
        )
    }

    // renderElement() {
    //     let bot = this.state.bot;
    //     return (
    //         <ScrollView style={styles.container} keyboardDismissMode='interactive'>

    //             <View style={[styles.noMarginView, { height: 130, backgroundColor: '#3f51b5' }]}>
    //                 <View style={{ flex: 1, marginLeft: LEFTMARGIN, marginTop: 60 }}>
    //                     <View style={{
    //                         alignItems: 'flex-start',
    //                         justifyContent: 'flex-start',
    //                         flexDirection: 'row'
    //                     }}>

    //                         <View>
    //                             <Avatar textSize={20} size={50}
    //                                 bgcolor={this.getColor(bot.title)}
    //                                 text={bot.title[0] + bot.title[1].toUpperCase()} />
    //                         </View>

    //                         <View style={{
    //                             flex: 1,
    //                             height: 50,
    //                             flexDirection: 'row',
    //                             marginLeft: LEFTMARGIN,
    //                             justifyContent: 'center'
    //                         }}>

    //                             <View style={{
    //                                 flex: 1, justifyContent: 'center',
    //                                 alignItems: 'flex-start'
    //                             }}>
    //                                 <Text style={[styles.text, { fontSize: 15 }]}> {bot.title} </Text>
    //                                 <Text style={[styles.text, { fontSize: 13 }]}> {bot.subTitle} </Text>
    //                             </View>

    //                             <TouchableOpacity style={{
    //                                 alignItems: 'flex-end',
    //                                 justifyContent: 'center',
    //                                 marginRight: RIGHTMARGIN,
    //                             }} onPress={() => { }}
    //                                 accessibilityTraits="button">
    //                                 <View style={[styles.centerContainer, {}]}>
    //                                     <Icon name='add' size={24} color='white' />
    //                                 </View>
    //                             </TouchableOpacity>
    //                         </View>
    //                     </View>
    //                 </View>
    //             </View>




    //         </ScrollView>
    //     )
    // }


    // renderListItem(bot) {
    //     const searchText = this.state.searchText.toLowerCase();
    //     if (searchText.length > 0 && bot.title.toLowerCase().indexOf(searchText) < 0) {
    //         return null;
    //     }

    //     return (
    //         <ListItem
    //             divider

    //             leftElement={<Avatar bgcolor={this.getColor(bot.title)} text={bot.title[0] + bot.title[1].toUpperCase()} />}

    //             centerElement={{
    //                 primaryText: bot.title,
    //                 secondaryText: bot.subTitle,
    //                 tertiaryText: this.getIcon(bot.type)
    //             }}

    //             rightElement={{
    //                 upperElement: this.getString(bot.added),
    //                 lowerElement: this.getIcon(bot.added),
    //             }}

    //             onPress={() => {
    //                 let page = Page.BOT_INFO_PAGE;
    //                 this.props.navigator.push({ id: page.id, name: page.name, data: bot })
    //             }} />
    //     );
    // }

    addRemoveBotToChat() {
        let bot = this.state.bot;
        let newBot = Object.assign({}, bot, {
            added: !bot.added
        });

        DatabaseHelper.updateChatByQuery({ title: bot.title }, newBot, (results) => {
            this.props.route.callback();
            this.props.navigator.pop();
        })
    }

    renderAddElement() {
        if (!this.state.bot.added) {
            return 'add';
        }
        return 'remove';
    }


    render() {
        return (
            <Container>
                <Toolbar
                    leftElement="arrow-back"
                    onLeftElementPress={() => {
                        this.props.navigator.pop();
                    }}
                    centerElement={{
                        upperText: this.state.bot.title,
                        lowerText: this.state.bot.subTitle
                    }}
                    rightElement={this.renderAddElement()}
                    onRightElementPress={() => this.addRemoveBotToChat()} />

                {this.renderElement()}

            </Container>
        )
    }
}

BotInfoPage.propTypes = propTypes;

export default BotInfoPage;