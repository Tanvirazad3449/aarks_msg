import React, { Component } from 'react';
import {
    View, Alert, AsyncStorage, Text, Modal, TextInput, ImageBackground, Dimensions, Button, StatusBar, FlatList,
    SafeAreaView, NativeModules, PermissionsAndroid, ToastAndroid, StyleSheet, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Image, ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import data from './../mock_data/data.json'
import FeatherIcon from 'react-native-vector-icons/Feather';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
import F5Icon from 'react-native-vector-icons/FontAwesome5';
var DirectSms = NativeModules.DirectSms;
import { Slider } from '@miblanchard/react-native-slider';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Data_SMS: [],
            loading: true,
            changeNumberModalVisible: false,
            sendAllModalVisible: false,
            own_number: null,
            viewTextModalVisible: false,
            modalTextBody: "",
            modalTextTo: "",
            modalTextId:null,
            loading: false,
            time_interval: 1,
            sendAllIndex:null,
            sendAllComplete:false
        };
    }
    componentDidMount() {
        this.getOwnNumber()
    }
    async saveOwnNumber() {
        await AsyncStorage.setItem('own_number', this.state.own_number);
        this.fetchSMS(this.state.own_number)

        this.setState({ changeNumberModalVisible: false })
    }
    async getOwnNumber() {
        var own_number = await AsyncStorage.getItem('own_number');
        if (own_number === null) {
            //this.setState({own_number:"Enter Mobile Number"})
        } else {
            this.setState({ own_number: own_number })
            this.fetchSMS(own_number)
        }
    }
    async fetchSMS(own_number) {
        this.setState({ loading: true })
        const link = "http://139.99.239.233/api/message/" + own_number;
        const data = await fetch(link);
        const item = await data.json();

        this.setState({ loading: false, Data_SMS:item })
        console.log("fetching",link)
        console.log(item)

    }
    sendAll() {

        var t = this.state.Data_SMS.length;
        var i = 2;  
        this.selectMessage(0)
 
        this.setState({sendAllIndex:i})
     
        this._interval = setInterval(() => {
            if (i > t) {
                clearInterval(this._interval);
                this.setState({sendAllIndex:null})
                this.setState({sendAllComplete:true})

            }else{
                console.log("i: " +i);
                this.selectMessage(i-1)
                this.setState({sendAllIndex:i})
            }
            i++;
        }, this.state.time_interval*30000);
        

    }
    selectMessage(i){
        var obj = this.state.Data_SMS[i]
        this.sendMessage(obj.to_number, obj.message, obj.id)
    }
    async updateStatus(sent_id){
        const link = "http://139.99.239.233/api/update_status?sent_id=" + sent_id;
        const data = await fetch(link);
        const item = await data.json(); 
        console.log(link);
        console.log(item);
    }
    async sendMessage(to_number, sms_body, id) {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.SEND_SMS,
                {
                    title: 'Send SMS App Sms Permission',
                    message:
                        'Send SMS App needs access to your inbox ' +
                        'so you can send messages in background.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                DirectSms.sendDirectSms(to_number, sms_body);
                ToastAndroid.show("SMS Sent", ToastAndroid.SHORT)
                console.log("sent: " + sms_body);
                this.updateStatus(id)

            } else {
                alert('SMS permission denied');
            }
        } catch (error) {
            console.warn(error);
            alert(error);
        }

    }
    showTextModal(to, body, id) {
        this.setState({ modalTextTo: to, modalTextBody: body,modalTextId:id, viewTextModalVisible: true })
    }
    
    render() {
        return (
            <View style={{ flex: 1 }}>
                <LinearGradient
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.1, y: 1 }}
                    colors={['#dcf8ef', '#fee2f8']}
                    style={{ flex: 1 }}>

                    <View style={styles.container}>
                        <Image
                            source={require('./../asset/image/logo.png')}
                            style={{ height: 60, width: 60 }} />

                        <TouchableOpacity
                            onPress={() => this.setState({ changeNumberModalVisible: !this.state.changeNumberModalVisible })}
                            style={styles.editNumberButton}>
                            <Text style={styles.editNumber}>{this.state.own_number === null ? "Enter Mobile Number" : this.state.own_number}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => this.fetchSMS(this.state.own_number)}
                            style={styles.reload}>
                            <MIcon
                                name="reload"
                                color="#0F2F4D"
                                size={30}
                            />
                        </TouchableOpacity>
                    </View>
                    {this.state.loading &&
                        <View style={{ height: 20, width: screenWidth, backgroundColor: "orange" }}>
                            <Text style={styles.listItemTo}>Loading...</Text>
                        </View>
                    }
                    <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 15, marginVertical: 10 }}>
                        <Text style={{ fontSize: 18, color: "black", fontWeight: "bold" }}>Found {this.state.Data_SMS.length} SMS</Text>
                        <View style={styles.sendContainerAll}>
                            <TouchableOpacity onPress={() => this.setState({ sendAllModalVisible: true })} style={styles.sendButtonAll}>
                                <Text style={{ color: "white" }}>Send All</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                    <FlatList
                        data={this.state.Data_SMS}
                        horizontal={false}
                        style={{ paddingTop: 0 }}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => {
                            return item.id;
                        }}
                        renderItem={(post) => {
                            const item = post.item;
                            return (

                                <View style={styles.listItemContainer}>

                                    <TouchableOpacity onPress={() => this.showTextModal(item.to_number, item.message, item.id)} style={styles.listItemTextContainer}>
                                        <Text style={styles.listItemTo}>{item.to_number}</Text>
                                        <View style={styles.listItemMsgContainer}>
                                            <Text numberOfLines={2} style={styles.msg}>{item.message}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <View style={styles.sendContainer}>
                                        <TouchableOpacity onPress={() => this.sendMessage(item.to_number, item.message, item.id)} style={styles.sendButtonAll}>
                                            <Text style={{ color: "white" }}>Send</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                            )
                        }} />

                </LinearGradient>

                {/**---------------------------------------- CHANGE OWN NUMBER MODAL--------------------------------------------------------------------------- */}

                <Modal
                    animationType="none"
                    transparent={true}
                    visible={this.state.changeNumberModalVisible}
                    onRequestClose={() => {
                        this.setState({ changeNumberModalVisible: !this.state.changeNumberModalVisible });
                    }}>
                    <View style={styles.modalContainer}>

                        <View style={styles.modalInnerContainer}>
                            <Text style={styles.label}>
                                Please enter your mobile number
                            </Text>
                            <TextInput style={{ fontSize: 20 }}
                                underlineColorAndroid="transparent"
                                placeholder="Mobile"
                                placeholderTextColor="#0F2F4D"
                                autoCapitalize="none"
                                keyboardType="phone-pad"
                                autoFocus={true}
                                onChangeText={(own_number) => this.setState({ own_number })}
                                value={this.state.own_number}
                            />


                            <TouchableOpacity onPress={() => this.saveOwnNumber()}>
                                <View style={styles.saveButton}>
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>Save</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setState({ changeNumberModalVisible: false })}>
                                <View style={styles.modalSaveButton}>
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>

                {/**---------------------------------------- VIEW TEXT MODAL--------------------------------------------------------------------------- */}

                <Modal
                    animationType="none"
                    transparent={true}
                    visible={this.state.viewTextModalVisible}
                    onRequestClose={() => {
                        this.setState({ viewTextModalVisible: !this.state.viewTextModalVisible });
                    }}>
                    <View style={styles.modalContainer}>

                        <View style={styles.modalInnerContainer}>

                            <View style={styles.modalListItemTextContainer}>
                                <Text style={styles.modalListItemTo}>{this.state.modalTextTo}</Text>
                                <View style={styles.modalListItemMsgContainer}>
                                    <Text style={styles.msg}>{this.state.modalTextBody}</Text>
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => this.sendMessage(this.state.modalTextTo, this.state.modalTextBody, this.state.modalTextId)}>
                                <View style={styles.saveButton}>
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>Send SMS</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setState({ viewTextModalVisible: false })}>
                                <View style={styles.modalSaveButton}>
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>

                {/**---------------------------------------- SEND ALL MODAL--------------------------------------------------------------------------- */}

                <Modal
                    animationType="none"
                    transparent={true}
                    visible={this.state.sendAllModalVisible}
                    onRequestClose={() => {
                        this.setState({ sendAllModalVisible: !this.state.sendAllModalVisible });
                    }}>
                    <View style={styles.modalContainer}>
                        {!this.state.sendAllComplete ?
                        <View style={styles.modalInnerContainer}>
                            <View style={{
                                width: screenWidth - 80,
                            }}>
                                <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'space-between', marginTop: 15 }}>

                                    <Text style={{ fontSize: 20, color: 'black', fontWeight: 'bold' }}>Time Interval </Text>
                                    <View style={{ backgroundColor: "black", padding: 10, borderRadius: 8 }}><Text style={{ fontSize: 30, color: 'white', fontWeight: 'bold' }}>{this.state.time_interval * 30}s</Text></View>
                                </View>
                                <Slider
                                    minimumValue={1}
                                    maximumValue={5}
                                    step={1}
                                    trackMarks={[1, 2, 3, 4, 5]}
                                    trackClickable={true}
                                    value={this.state.time_interval}
                                    onValueChange={time_interval => this.setState({ time_interval })}
                                />
                            </View>
                            <TouchableOpacity onPress={() => this.sendAll()}>
                                <View style={styles.saveButton}>
                                    {this.state.sendAllIndex === null ? 
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>Send All</Text>
                                    :
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>Sent {this.state.sendAllIndex - 1} of {this.state.Data_SMS.length}</Text>
                                    }
                                    </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                this.setState({ sendAllModalVisible: false })
                                clearInterval(this._interval);
                                this.setState({sendAllIndex:null})
                                }}>
                                <View style={styles.modalSaveButton}>
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                        :
                        <View style={styles.modalInnerContainer}>
                            <Image
                            source={require('./../asset/image/check.png')}
                            style={{ height: 100, width: 100,resizeMode:"contain", margin:20 }} />
                            <Text style={{fontSize:26, fontWeight:"bold", color:"#62B01E", marginBottom:10}}>Complete!</Text>
                            <TouchableOpacity onPress={() => {
                                this.setState({ sendAllModalVisible: false, sendAllComplete:false, sendAllIndex:null })}

                                }>
                                <View style={styles.modalSaveButton}>
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>OK</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        }
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: { backgroundColor: "white", elevation: 5, height: 60, width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", },
    editNumberButton: { height: 60, width: screenWidth * 0.6, flexDirection: "row", alignItems: "center", justifyContent: 'center', },
    editNumber: { fontSize: 18, textDecorationLine: "underline", fontWeight: "bold", color: "#1d71f2" },
    reload: { height: 60, width: 60, alignItems: "center", justifyContent: 'center', },
    listItemContainer: { flexDirection: "row", justifyContent: "space-between", elevation: 2, alignItems: "flex-end", marginLeft: 0, backgroundColor: "white", width: screenWidth - 20, alignSelf: "center", borderRadius: 10, marginBottom: 15 },
    listItemTextContainer: { alignItems: "flex-start", paddingVertical: 10, width: (screenWidth - 30) * 0.7, paddingLeft: 15 },
    modalListItemTextContainer: { alignItems: "flex-start", paddingVertical: 10, width: (screenWidth - 30), },
    listItemTo: { color: "#003d42", fontSize: 13, textAlign: "center", fontWeight: "bold" },
    modalListItemTo: { color: "#003d42", fontSize: 13, textAlign: "center", fontWeight: "bold", marginLeft: 20 },
    listItemMsgContainer: { padding: 6, backgroundColor: "#D2E3EC80", borderRadius: 6, marginTop:5 },
    modalListItemMsgContainer: { padding: 6, backgroundColor: "#D2E3EC80", borderRadius: 6,marginTop:5, marginHorizontal: 20 },
    msg: { color: "#0F2F4D", fontSize: 14, textAlign: "left", },
    sendContainer: { alignItems: "flex-start", width: (screenWidth - 30) * 0.17, height: (screenWidth - 30) * 0.15, justifyContent: 'center', },
    sendContainerAll: { alignItems: "flex-start", justifyContent: 'center', },
    sendButtonAll: { backgroundColor: "#1d71f2", borderRadius: 3, elevation: 5, paddingHorizontal: 8, height: 30, alignItems: "center", justifyContent: 'center', },
    modalContainer: { backgroundColor: 'rgba(0, 0, 0, 0.6)', flex: 1, flexDirection: "row", justifyContent: 'center', },
    modalInnerContainer: { backgroundColor: 'white', width: screenWidth - 40, alignSelf: "center", borderRadius: 20, alignItems: 'center', justifyContent: 'flex-start', },
    label: { fontSize: 16, fontWeight: "bold", marginHorizontal: 20, textAlign: "center", color: "grey", marginTop: 20 },
    saveButton: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        width: screenWidth - 80,
        alignSelf: "center",
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#1d71f2",
    },
    modalSaveButton: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        width: screenWidth - 80,
        alignSelf: "center",
        borderRadius: 5,
        marginBottom: 20,
        backgroundColor: "grey",

    }



})
export default Home;
