import { SafeAreaView, StatusBar, Image, ScrollView, StyleSheet, Text, View, Pressable, Touchable, TouchableOpacity, Dimensions, TextInput } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import LinearGradient from "react-native-linear-gradient";
import { getAPI } from "../UsingAPI/CallAPI.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation,useIsFocused } from "@react-navigation/native";
import { SearchTrack } from "../UsingAPI/SearchAPI.js";
import { AddTrackOfPlaylist } from "../UsingAPI/PlayListAPI.js";
function FindTrackToAdd({ playlistId, setModalPlaylistAddTrack ,isRefresh, setIsRefresh}: any): React.JSX.Element {

    const [inputText, setInputText] = useState("");
    const [searchedTracks, setSearchedTracks] = useState([]);
    async function handleTextChange(text: any) {
        setInputText(text);
        const accessToken = await AsyncStorage.getItem("token");
        const resp_se = await SearchTrack(inputText, accessToken);
        if (resp_se.ok) {
            const resp_data = await resp_se.json();
            setSearchedTracks(resp_data.tracks.items);
        }
    }
    const SongItem = ({ item }: any) => {
        return (
            <View style={{flexDirection:"row",alignItems:"center",marginTop:10,backgroundColor:"#2D2D2D",padding:5,borderRadius:5}}>
                <Image style={{width:40,height:40}} source={{uri:item.album.images[0].url}} />
                <View style={{flex:1,marginLeft:8}}>
                    <Text style={{ color: "#fff" }}>{item.name}</Text>
                    <Text style={{ color: "#fff" }}>Artist: {item.artists[0].name}</Text>
                </View>
                <TouchableOpacity
                    onPress={async()=> {
                        const accessToken = await AsyncStorage.getItem("token");
                        const pll_id = playlistId;
                        const uris=[item.uri];
                        const response = await AddTrackOfPlaylist(pll_id,accessToken,uris);
                        console.log("addtopll: ",response.status)
                    }}>
                    <Image style={{tintColor:"#fff"}} source={require("../icons/add-circle.png")}/>
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <View style={{ width: "100%", height: "100%" }}>
            <TouchableOpacity
                onPress={() => { 
                    setIsRefresh(!isRefresh);
                    setModalPlaylistAddTrack(false);
                   
                 }}
                style={{ justifyContent: "center", alignSelf: "flex-end", alignItems: "center", padding: 10, borderWidth: 2, borderColor: "#fff", borderRadius: 30, width: 100 }}>
                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>Cancel</Text>
            </TouchableOpacity>
            <View style={{ marginTop: 20, width: "100%", height: 50, flexDirection: "row", borderWidth: 2, borderColor: "#fff", paddingHorizontal: 10, alignItems: "center", borderRadius: 30 }}>
                <Image style={{ tintColor: "#fff" }} source={require("../icons/search.png")} />
                <TextInput
                    onChangeText={(text) => {
                        handleTextChange(text);
                    }}
                    style={{ flex: 1, color: "#fff", fontSize: 15, fontWeight: "500", marginLeft: 5 }} placeholder="Find your liked song" placeholderTextColor={"#fff"} />
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}>
                {
                    searchedTracks.length != 0 ? (
                        searchedTracks.map((item: any, index: any) => {
                            return <SongItem item={item} key={index}/>
                        })
                    ) : null
                }
            </ScrollView>
        </View>
    )
}

export default FindTrackToAdd