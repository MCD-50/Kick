import { View, StyleSheet, StatusBar, ToastAndroid, ScrollView, Platform, Animated, Easing } from 'react-native';
import React, { Component, PropTypes } from 'react';

import { Toolbar, Icon, Avatar, ListItem, ActionButton } from 'react-native-material-ui';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};

const menuItems = [
    'New group', 'New chat', 'Profile', 'Settings'
]

class ContactList extends Component {

    constructor(params) {
        super(params);

        this.state = {
            searchText: '',
            bottomHidden: false,
            moveAnimated: new Animated.Value(0),
        };

        this.renderListItem = this.renderListItem.bind(this);
        this.onChangeText = this.onChangeText.bind(this);
    }

    onChangeText(value) {
        this.setState({ searchText: value });
        //search related tasks;
        
    }

    renderListItem(chatlistItem) {
        const searchText = this.state.searchText.toLowerCase();

        if (searchText.length > 0 && chatlistItem.toLowerCase().indexOf(searchText) < 0) {
            return null;
        }

        //onPress={() => this.props.navigator.push(route)}
        ///onLeftElementPress={() => this.onAvatarPressed(title)}
        return (
            <ListItem
                divider
                leftElement={<Avatar text={chatlistItem[0]} />}
                centerElement={chatlistItem}
                />
        );
    }

    render() {
        return (
            <View style={styles.container}>

                <Toolbar
                    centerElement='Contacts'
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
                            ToastAndroid.show(menuItems[action.index], ToastAndroid.SHORT);
                        }
                    } } />

                <ScrollView keyboardShouldPersistTaps='always'
                    keyboardDismissMode='interactive'>
                    {this.renderListItem('Ayush')}
                    {this.renderListItem('Manas')}
                    {this.renderListItem('Faris')}
                    {this.renderListItem('Rushabh')}
                    {this.renderListItem('Viraat')}
                    {this.renderListItem('Faris')}
                    {this.renderListItem('Rushabh')}
                    {this.renderListItem('Viraat')}
                    {this.renderListItem('Manas')}
                    {this.renderListItem('Faris')}
                    {this.renderListItem('Rushabh')}
                    {this.renderListItem('Viraat')}
                    {this.renderListItem('Faris')}
                    {this.renderListItem('Rushabh')}
                    {this.renderListItem('Viraat')}
                    {this.renderListItem('Manas')}
                    {this.renderListItem('Faris')}
                    {this.renderListItem('Rushabh')}
                    {this.renderListItem('Viraat')}
                    {this.renderListItem('Faris')}
                    {this.renderListItem('Rushabh')}
                    {this.renderListItem('Viraat')}
                </ScrollView>

            </View>
        )
    }
}

ContactList.propTypes = propTypes;

export default ContactList;