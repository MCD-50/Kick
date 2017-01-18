import { View, StyleSheet, Image, StatusBar, ToastAndroid, ListView, ScrollView, Platform, Animated, Easing } from 'react-native';
import React, { Component, PropTypes } from 'react';

import { Toolbar, Icon, Avatar, ListItem } from 'react-native-material-ui';

import { Bot } from '../model/Bot.js';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    avatarImage:{
        width:40,
        height:40,
        borderRadius:40,
        elevation:2,
        alignItems:'center',
        justifyContent:'center'
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
    new Bot('Todo', 'Creates new todo', 'hgvbf vjhvbvhvdkffv jvbfvfbvkfj', 'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png'),
    new Bot('Customer', 'Creates new customer', 'hgvbf vjhvbvhvdkffv jvbfvfbvkfj', 'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png'),
    new Bot('Help', 'Helps user', 'hgvbf vjhvbvhvdkffv jvbfvfbvkfj', 'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png'),
    new Bot('Assign', 'Assign task', 'hgvbf vjhvbvhvdkffv jvbfvfbvkfj', 'https://cdn3.iconfinder.com/data/icons/rcons-user-action/32/boy-512.png'),
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
    }


    onChangeText(value) {
        this.setState({ searchText: value });

    }

    renderListItem(chatlistItem) {
        const searchText = this.state.searchText.toLowerCase();

        if (searchText.length > 0 && chatlistItem.getName().toLowerCase().indexOf(searchText) < 0) {
            return null;
        }



        //onPress={() => this.props.navigator.push(route)}
        ///onLeftElementPress={() => this.onAvatarPressed(title)}
        

        return (
            <ListItem
                divider
                leftElement={<Image style={styles.avatarImage} source={{uri:chatlistItem.getAvatar()}} />}
                centerElement={{
                    primaryText: chatlistItem.getName(),
                    secondaryText: chatlistItem.getSDescription()
                }}
                onPress={() => console.log('pressed key')}
                />
        );
    }


    render() {
        return (
            <View style={styles.container}>
                <Toolbar
                    leftElement="arrow-back"
                    onLeftElementPress={() => this.props.navigator.pop()}
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
                    keyboardShouldPersistTaps = 'always'
                    keyboardDismissMode='interactive'
                    ref={'LISTVIEW'}
                    renderRow={(item) => this.renderListItem(item)}
                    />
            </View>
        )
    }
}

BotList.propTypes = propTypes;

export default BotList;