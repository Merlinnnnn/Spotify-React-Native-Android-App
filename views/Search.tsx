import { SafeAreaView, StatusBar, Image, ScrollView, StyleSheet, Text, View, Pressable, Touchable, TouchableOpacity, Dimensions, TextInput } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import LinearGradient from "react-native-linear-gradient";
import { getAPI } from "../UsingAPI/CallAPI.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation ,useIsFocused} from "@react-navigation/native";
import { Player } from "./ContextTrack";
import { BottomModal, ModalContent } from 'react-native-modals';
import TrackPlayer, { Capability, State, usePlaybackState, useTrackPlayerEvents, Event } from 'react-native-track-player';
import SongPlayer from "./SongPlayer";
function isSameArray(array1: any, array2: any) {
    return array1.length === array2.length && array1.every((value: any, index: any) => value === array2[index])
}



function Search(): React.JSX.Element {

    const [searchInput, setSearchInput] = useState("");
    const [searchData, setSearchData] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const { currentTrack, setCurrentTrack, currentList, setCurrentList }: any = useContext(Player);
    const [isRefresh,setIsRefresh] = useState(false);
    const handleInputChange = (text: any) => {
        setSearchInput(text);
        console.log("Search: ", searchInput);
        getSearchTract();
    };
    useTrackPlayerEvents([Event.PlaybackState], async (event) => {
        if (event.type === Event.PlaybackState) {
            const state = await TrackPlayer.getState();
            if (state === State.Playing) {
                setIsPlaying(true);
            } else if (state === State.Paused) {
                setIsPlaying(false);
            }

        }
    });
    useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
        if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== null) {
            const nextTrackId = event.nextTrack;
            setCurrentTrack(currentList[nextTrackId]);
        }
    });
    const SongItem = ({ item, setCurrentTrack, trackIndex, savedTracks, currentList, setCurrentList, setContentTracksPlayer }: any) => {
        return (
            <TouchableOpacity
                onPress={async () => {
                    if (!isSameArray(searchData, currentList)) {
                        await setContentTracksPlayer(searchData);
                        setCurrentList(searchData);
                    }
                    setCurrentTrack(item);
                    setModalVisible(!modalVisible);
                    const state = await TrackPlayer.getState();
                    if (state === State.Playing || state === State.Paused) {
                        await TrackPlayer.stop();
                    }
                    await TrackPlayer.skip(trackIndex);
                    TrackPlayer.play();
                }}
                style={[style.songItem]}>
                <Image style={{ width: 50, height: 50, marginRight: 10, borderRadius: 6 }} source={{ uri: item.album.images[0].url }} />
                <View style={{ width: "65%" }}>
                    <Text numberOfLines={1} style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>{item.name}</Text>
                    <Text style={{ color: "#b8b8b8" }}>{item.artists[0].name}</Text>
                </View>
            </TouchableOpacity>
        )
    }
    const getSearchTract = async () => {
        const accessToken = await AsyncStorage.getItem("token");
        //console.log("datasearch: ",searchInput);
        const url_saveTracks = "https://api.spotify.com/v1/search?q=" + searchInput + "&type=track&limit=10";
        const config_saveTracks = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                limit: 50
            }

        };
        try {
            const dataSearch = await getAPI(url_saveTracks, config_saveTracks);


            setSearchData(dataSearch.tracks.items);
            console.log("datasearch: ", searchData);
        }
        catch (err: any) {
            console.log("Liked-Song: ", err.message);
        }


    }
    const setContentTracksPlayer = async (data_saveTracks: any) => {
        const listTracks = data_saveTracks.map((item: any, index: any) => {
            return {
                id: item.id,
                url: item.preview_url,
                title: item.name,
                artist: item.artists[0].name
            }
        })

        await TrackPlayer.reset();
        await TrackPlayer.add(listTracks);
    }

    return (
        <>
            <LinearGradient style={{ flex: 1, paddingHorizontal: 15, paddingVertical: 10 }} colors={["#F87275", "#c24f83"]}>
                <View style={{ backgroundColor: "#38224e", marginLeft: 10, flexDirection: "row", overflow: "hidden", paddingHorizontal: 15, borderWidth: 2, borderColor: "#fff", borderRadius: 20, alignItems: "center" }}>
                    <Image style={{ tintColor: "#fff" }} source={require("../icons/search.png")} />
                    <TextInput
                        onChangeText={(text) => handleInputChange(text)}
                        style={{ fontWeight: "500", color: "white",width:"100%" }}
                    />
                </View>
                <ScrollView>
                    <View style={{ marginTop: 25 }}>
                        {
                            searchData && searchData.length > 0 ? (
                                searchData.map((item, index) => {
                                    return <SongItem item={item} key={index} setCurrentTrack={setCurrentTrack}
                                        trackIndex={index} savedTracks={searchData} currentList={currentList} setCurrentList={setCurrentList} setContentTracksPlayer={setContentTracksPlayer} />
                                })
                            ) : null
                        }
                    </View>
                </ScrollView>
            </LinearGradient>
            <BottomModal
                visible={modalVisible}
                onHardwareBackPress={() => setModalVisible(false)}
                swipeDirection={["up", "down"]}
                swipeThreshold={200}>
                <ModalContent style={{ height: "100%", width: "100%", backgroundColor: "#453249" }}>
                    <SongPlayer item={currentTrack} modalVisible={modalVisible} setModalVisible={setModalVisible} isRefresh={isRefresh} setIsRefresh={setIsRefresh}/>
                </ModalContent>
            </BottomModal>
        </>

    )
}

const style = StyleSheet.create({
    songItem: {
        marginTop: 3,
        backgroundColor: "#636363",
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center"
    },

})
export default Search;