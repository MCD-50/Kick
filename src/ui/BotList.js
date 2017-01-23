import { View, StyleSheet, Image, BackAndroid, StatusBar, ToastAndroid, ListView, ScrollView, Platform, Animated, Easing } from 'react-native';
import React, { Component, PropTypes } from 'react';

import { Icon, Avatar, ListItem } from 'react-native-material-ui';

import Toolbar from './customUI/ToolbarUI.js';

import {Chat} from '../model/Chat.js';
import DatabaseHelper from '../helper/DatabaseHelper.js';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 40
    }
});

const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};

const menuItems = [
    'Profile', 'Settings'
]

const bots = [
    new Chat('Todo', 'Creates new todo', 'man_avatar', 0, 'hcvjdbvbdshvjbdvdvbjkvbvkdbvdvjvbvbdkvjdvbvkdsvbskvdvlbkjdvsjbkvds', 'BOT'),
    new Chat('Customer', 'Creates new customer', 'man_avatar', 0, 'hcvjdbvbdshvjbdvdvbjkvbvkdbvdvjvbvbdkvjdvbvkdsvbskvdvlbkjdvsjbkvds', 'BOT'),
    new Chat('Help', 'Helps user', 'man_avatar', 0,'hcvjdbvbdshvjbdvdvbjkvbvkdbvdvjvbvbdkvjdvbvkdsvbskvdvlbkjdvsjbkvds', 'BOT'),
    new Chat('Assign', 'Assign task vjbfljv dkjjvbvbskfv dkjjvbfsjkvbfsv djvbjvbvsv kjvnkfvnfv', 'man_avatar', 0, 'hcvjdbvbdshvjbdvdvbjkvbvkdbvdvjvbvbdkvjdvbvkdsvbskvdvlbkjdvsjbkvds', 'BOT')
 ]


const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });

class BotList extends Component {

    constructor(params) {
        super(params);

        this.state = {
            searchText: '',
            bottomHidden: false,
            dataSource: ds.cloneWithRows(bots),
        };

        this.renderListItem = this.renderListItem.bind(this);
        this.onChangeText = this.onChangeText.bind(this);
        this.addBackEvent();
    }

    addBackEvent() {
        BackAndroid.addEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                this.props.route.callback();
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    }


    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                console.log(this.props.route);
                this.props.route.callback();
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    }


    onChangeText(value) {
        console.log(this.state.searchText);
        this.setState({ searchText: value });

    }

    renderListItem(chat) {
        const searchText = this.state.searchText.toLowerCase();

        if (searchText.length > 0 && chat.getName().toLowerCase().indexOf(searchText) < 0) {
            return null;
        }

        //onPress={() => this.props.navigator.push(route)}
        ///onLeftElementPress={() => this.onAvatarPressed(title)}
        //<Image style={styles.avatarImage} source={{uri: src}} />
        //const src =  chat.getImage();
        

        return (
            <ListItem
                divider
                leftElement={<Avatar icon='person'/>}
                centerElement={{
                    primaryText: chat.getName(),
                    secondaryText: chat.getLatestMsg()
                }}

                onPress={() => DatabaseHelper.addNewChat(
                    chat, function (results) {
                    console.log(results);
                })}
                />
        );
    }

    render() {
        return (
            <View style={styles.container}>
                <Toolbar
                    leftElement="arrow-back"
                    onLeftElementPress={() => {
                        this.props.route.callback();
                        this.props.navigator.pop();
                    } }

                    centerElement='Bots'
                    searchable={{
                        autoFocus: true,
                        placeholder: 'Search',
                        onChangeText: value => this.onChangeText(value),
                        onSearchClosed: () => this.setState({ searchText: '' }),
                    }}
                    rightElement={{
                        menu: { labels: menuItems },
                    }}
                    onRightElementPress={(action) => {
                        if (Platform.OS === 'android') {

                            //ToastAndroid.show(menuItems[action.index], ToastAndroid.SHORT);
                        }
                    } } />


                <ListView
                    dataSource={this.state.dataSource} //data source
                    keyboardShouldPersistTaps='always'
                    keyboardDismissMode='interactive'
                    enableEmptySections={true}
                    ref={'LISTVIEW'}
                    renderRow={(item) => this.renderListItem(item)}
                    />
            </View>
        )
    }
}

BotList.propTypes = propTypes;

export default BotList;