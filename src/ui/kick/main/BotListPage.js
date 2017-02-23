import React, { Component, PropTypes } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ListView,
    BackAndroid,
} from 'react-native';



import Toolbar from '../../customUI/ToolbarUI.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import Container from '../../Container.js';
import { Page } from '../../../enums/Page.js';
import { Type } from '../../../enums/Type.js';
import Avatar from '../../customUI/Avatar.js';
import Icon from '../../customUI/Icon.js';

import ListItem from '../../customUI/ListItem.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import Progress from '../../customUI/Progress.js';


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    progress: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    botList: PropTypes.array,
};


const defaultProps = {
    botList: [],
}

const colors = [
    '#e67e22', // carrot
    '#3498db', // peter river
    '#8e44ad', // wisteria
    '#e74c3c', // alizarin
    '#1abc9c', // turquoise
    '#2c3e50', // midnight blue
];


const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });
class BotListPage extends Component {

    constructor(params) {
        super(params);
        let owner = this.props.route.owner;
        this.state = {
            searchText: '',
            isLoading: true,
            dataSource: ds.cloneWithRows([]),
            isChanged: false,
            userId: owner.userId,
            userName: owner.userName,
            domain: owner.domain,
        };


        this.addBackEvent = this.addBackEvent.bind(this);
        this.removeBackEvent = this.removeBackEvent.bind(this);
        this.setStateData = this.setStateData.bind(this);
        this.renderListItem = this.renderListItem.bind(this);


        this.onChangeText = this.onChangeText.bind(this);
        this.getColor = this.getColor.bind(this);
        this.getIcon = this.getIcon.bind(this);
        this.getString = this.getString.bind(this);

        this.renderElement = this.renderElement.bind(this);
        this.callback = this.callback.bind(this);
    }

    addBackEvent() {
        BackAndroid.addEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                if (this.state.isChanged)
                    this.props.route.callback(Page.BOT_LIST_PAGE);
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    }

    removeBackEvent() {
        BackAndroid.removeEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                if (this.state.isChanged)
                    this.props.route.callback(Page.BOT_LIST_PAGE);
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

    componentDidMount() {
        this.setStateData();
    }

    setStateData() {
        DatabaseHelper.getAllChatsByQuery({ chatType: Type.BOT }, (results) => {
            console.log(results);
            let bots = results.map((result) => {
                return CollectionUtils.convertToChat(result, true);
            })
            this.setState({
                dataSource: ds.cloneWithRows(bots),
                isLoading: false
            });
        })
    }

    onChangeText(e) {
        this.setState({ searchText: e });
    }

    callback() {
        this.setState({ isChanged: true });
        this.setStateData();
    }

    getColor(name) {
        const length = name.length;
        return colors[length % colors.length];
    }


    getIcon(added) {
        if (added)
            return <Icon name='done' />;
        null;
    }

    getString(added) {
        if (added)
            return 'Added';
        return 'Not Added';
    }


    renderListItem(bot) {
        const searchText = this.state.searchText.toLowerCase();
        if (searchText.length > 0 && bot.title.toLowerCase().indexOf(searchText) < 0) {
            return null;
        }

        return (
            <ListItem
                divider

                leftElement={<Avatar bgcolor={this.getColor(bot.title)} text={bot.title[0] + bot.title[1].toUpperCase()} />}

                centerElement={{
                    primaryText: bot.title,
                    secondaryText: bot.subTitle,
                    tertiaryText: 'toys'
                }}

                onPress={() => {
                    let state = this.state;
                    this.props.navigator.push({
                        id: page.id,
                        name: page.name,
                        chat: bot,
                        callback: this.callback,
                        owner: {
                            userName: state.userName,
                            userId: state.userId,
                            domain: state.domain
                        }
                    })
                }} />
        );
    }


    renderElement() {
        if (this.state.isLoading) {
            return (
                <View style={styles.progress}>
                    <Progress color={['#3f51b5']} size={50} duration={300} />
                </View>)
        }

        return (
            <ListView
                dataSource={this.state.dataSource}
                keyboardShouldPersistTaps='always'
                keyboardDismissMode='interactive'
                enableEmptySections={true}
                ref={'LISTVIEW'}
                renderRow={(item) => this.renderListItem(item)}
            />
        );
    }


    render() {
        return (
            <Container>
                <Toolbar
                    leftElement="arrow-back"
                    onLeftElementPress={() => {
                        if (this.state.isChanged) {
                            this.props.route.callback(Page.BOT_LIST_PAGE);
                        }
                        this.props.navigator.pop();
                    }}
                    centerElement={this.props.route.name}
                    searchable={{
                        autoFocus: true,
                        placeholder: 'Search bot...',
                        onChangeText: e => this.onChangeText(e),
                        onSearchClosed: () => this.setState({ searchText: '' }),
                    }}
                />
                {this.renderElement()}

            </Container>
        )
    }
}

BotListPage.propTypes = propTypes;

export default BotListPage;