import { View, StyleSheet, ToastAndroid, ScrollView, Platform, Animated, Easing } from 'react-native';
import React, { Component, PropTypes, } from 'react';

import { Toolbar, Icon, BottomNavigation } from 'react-native-material-ui';
import Container from './Container.js';



//import pages
import ChatList from './MainPageComponents/ChatList.js';
import ContactList from './MainPageComponents/ContactList.js';
import BotList from './MainPageComponents/BotList.js';


const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
    },
});


const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};


class Main extends Component {

    constructor(params) {
        super(params);
        this.state = {
            active: 'chats',
        };
        this.getViewOnSelected = this.getViewOnSelected.bind(this);
    }



    getViewOnSelected() {
        if (this.state.active == 'chats') {
            return <ChatList navigator={this.props.navigator} route={this.props.route} />
        } else if (this.state.active == 'contacts') {
            return <ContactList navigator={this.props.navigator} route={this.props.route} />
        } else {
            return <BotList navigator={this.props.navigator} route={this.props.route} />
        }
    }



    render() {
        return (
            <Container>

                <View style={{ flex: 1 }}>
                    {this.getViewOnSelected()}
                </View>

                <BottomNavigation active={this.state.active} >
                    <BottomNavigation.Action
                        key="chats"
                        icon="chat"
                        label="Chats"
                        onPress={() => this.setState({ active: 'chats' })} />

                    <BottomNavigation.Action
                        key="bots"
                        icon="group-work"
                        label="Bots"
                        onPress={() => this.setState({ active: 'bots' })} />

                    <BottomNavigation.Action
                        key="contacts"
                        icon="contacts"
                        label="Contacts"
                        onPress={() => this.setState({ active: 'contacts' })} />

                </BottomNavigation>

            </Container>
        );
    }
}


// <ActionButton
//                     actions={[
//                         { icon: 'group', label: 'New Group' },
//                         { icon: 'chat', label: 'New Chat' },
//                         { icon: 'group-work', label: 'New Channel' },
//                         { icon: 'contacts', label: 'Contacts' },
//                         { icon: 'settings', label: 'Settings' }]
//                     }

//                     icon="edit"
//                     transition="speedDial"
//                     onPress={(action) => {
//                         if (Platform.OS === 'android') {
//                             ToastAndroid.show(action, ToastAndroid.SHORT);
//                         }
//                     } }
//                     style={{
//                         positionContainer: { bottom: 12, right:12 },
//                     }}
//                     />



Main.propTypes = propTypes;

export default Main;