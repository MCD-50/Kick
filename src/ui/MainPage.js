import { View, StyleSheet, ToastAndroid, ScrollView, Platform, Animated, Easing } from 'react-native';
import React, { Component, PropTypes, } from 'react';

import { Toolbar, Icon, BottomNavigation } from 'react-native-material-ui';
import Container from './Container.js';

//import pages
import ChatList from './ChatList.js';
import BotList from './BotList.js';

const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
    },
});


const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};


class MainPage extends Component {

    render() {
        return (
            <Container>
               <ChatList navigator={this.props.navigator} route={this.props.route} />
            </Container>
        );
    }
}


//   <View style={{ flex: 1 }}>
//                     {this.getViewOnSelected()}
//                 </View>

//                 <BottomNavigation active={this.state.active} >
//                     <BottomNavigation.Action
//                         key="chats"
//                         icon="chat"
//                         label="Chats"
//                         onPress={() => this.setState({ active: 'chats' })} />

//                     <BottomNavigation.Action
//                         key="channels"
//                         icon="group-work"
//                         label="Channels"
//                         onPress={() => this.setState({ active: 'channels' })} />
//                 </BottomNavigation>




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



MainPage.propTypes = propTypes;

export default MainPage;