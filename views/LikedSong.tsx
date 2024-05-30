import { SafeAreaView, StatusBar, Image, ScrollView, StyleSheet, Text, View, Pressable, Touchable, TouchableOpacity, Dimensions, TextInput } from "react-native";
import React, { useContext, useEffect, useState,useCallback  } from "react";
import LinearGradient from "react-native-linear-gradient";
import { getAPI } from "../UsingAPI/CallAPI.js";
import { DeleteSavedTrack } from "../UsingAPI/SavedTracksAPI.js"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation,useIsFocused, useFocusEffect } from "@react-navigation/native";
import { Player } from "./ContextTrack";
import { BottomModal, ModalContent } from 'react-native-modals';
import TrackPlayer, { Capability, State, usePlaybackState, useTrackPlayerEvents, Event } from 'react-native-track-player';

import SongPlayer from "./SongPlayer";
import Loading from "./Loading";
import CurrentTrackBottom from "./CurrentTrackBottom";
import AddTrackToPlaylist from "./AddTrackToPlaylist";

function isSameArray(array1: any, array2: any) {
    return array1.length === array2.length && array1.every((value: any, index: any) => value === array2[index])
}



function LikedSong(): React.JSX.Element {
    const playbackState: any = usePlaybackState();
    const navigation: any = useNavigation();
    const { currentTrack, setCurrentTrack, currentList, setCurrentList }: any = useContext(Player);
    const [input, setInput] = useState("");
    const [savedTracks, setSavedTracks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [modalTrackToPlaylist,setModalTrackToPlaylist] = useState(false);
    const [uriTrackToAdd,setUriTrackToAdd] = useState("");
    const [isRefresh,setIsRefresh] = useState(false);
    const [searchedTracks, setSearchedTracks] = useState([]);
    const SongItem = ({ item, setCurrentTrack, trackIndex, savedTracks,setSavedTracks, currentList, setCurrentList, setContentTracksPlayer }: any) => {
        return (
            <TouchableOpacity
                onPress={async () => {
                    if (!isSameArray(savedTracks, currentList)) {
                        await setContentTracksPlayer(savedTracks);
                        setCurrentList(savedTracks);
                    }
                    setCurrentTrack(item);
                    const state = await TrackPlayer.getState();
                    if (state === State.Playing || state === State.Paused) {
                        await TrackPlayer.stop();
                    }
                    await TrackPlayer.skip(trackIndex);
                    TrackPlayer.play();
    
                }}
                style={[style.songItem]}>
                <Image style={{ width: 50, height: 50, marginRight: 10, borderRadius: 6 }} source={{ uri: item.track.album.images[0].url }} />
                <View style={{ width: "65%" }}>
                    <Text numberOfLines={1} style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>{item.track.name}</Text>
                    <Text style={{ color: "#b8b8b8" }}>{item.track.artists[0].name}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-around" }}>
                    <TouchableOpacity
                        onPress={ async()=> {
                            const accessToken = await AsyncStorage.getItem("token");
                            const ids = [item.track.id].join(",");
                            
                            try {
                                const res = await DeleteSavedTrack(ids,accessToken);
                                if(res.ok) {
                                    try {
                                        const get_data = await getAPI("https://api.spotify.com/v1/me/tracks?offset=0&limit=50", {
                                            method: "GET",
                                            headers: {
                                                Authorization: `Bearer ${accessToken}`
                                            },
                                            params: {
                                                limit: 50
                                            }
                                        });
                                        setSavedTracks(get_data.items);
                                    } catch (err:any) {
                                        console.log(err.message);
                                    }
                                }
                                
                            } catch(err:any) {
                                console.log(err.message);
                            }
    
                        }} >
                        <Image style={{ tintColor: "#18b14c" }} source={require("../icons/heart-d-24.png")} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>{
                            setUriTrackToAdd(item.track.uri) ;
                            setModalTrackToPlaylist(true);
                        }}>
                        <Image style={{ tintColor: "#fff" }} source={require("../icons/dots.png")} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    }
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

    const getSavedTracks = async () => {
        const accessToken = await AsyncStorage.getItem("token");
        const url_saveTracks = "https://api.spotify.com/v1/me/tracks?offset=0&limit=50";
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
            const data_saveTracks = await getAPI(url_saveTracks, config_saveTracks);
            setSavedTracks(data_saveTracks.items);
            setIsLoading(false);

        } catch (err: any) {
            console.log("Liked-Song: ", err.message);
        }
    }
    const setContentTracksPlayer = async (data_saveTracks: any) => {
        const listTracks = data_saveTracks.map((item: any, index: any) => {
            return {
                id: item.track.id,
                url: item.track.preview_url,
                title: item.track.name,
                artist: item.track.artists[0].name
            }
        })

        await TrackPlayer.reset();
        await TrackPlayer.add(listTracks);
    }

    useEffect(() => {
        getSavedTracks();
    }, [isRefresh])
    console.log("saved-Tracks: ", savedTracks);
    const playTracks = async () => {
        if (savedTracks.length > 0) {
            setCurrentTrack(savedTracks[0]);
            if (!isSameArray(savedTracks, currentList)) {
                setCurrentList(savedTracks);
                await setContentTracksPlayer(savedTracks);
            }
        }
        const state = await TrackPlayer.getState();
        if (state === State.Playing || state === State.Paused) {
            await TrackPlayer.stop();
        }
        await TrackPlayer.skip(0);
        await TrackPlayer.play();
    }
    function handleSearch(text:any) {
        if(text===""){
            getSavedTracks();
        }else {
            const filteredTracks = savedTracks.filter((item) => item.track.name.toLowerCase().includes(text.toLowerCase())
            );
            setSavedTracks(filteredTracks);
        }
    }
    const handleInputChange = (text:any) => {
        setInput(text);
        handleSearch(text);
    };
    if (isLoading) {
        return (
            <Loading />
        )
    }
    return (
        <>
            <LinearGradient style={{ flex: 1, paddingHorizontal: 15, paddingVertical: 10 }} colors={["#F87275", "#c24f83"]}>
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    <View style={{ flexDirection: "row", height: 40 }}>
                        <TouchableOpacity
                            onPress={() => { navigation.goBack(); }}
                            style={{ alignItems: "center", justifyContent: "center" }}>
                            <Image style={{ tintColor: "#fff" }} source={require("../icons/back-arrow.png")} />
                        </TouchableOpacity>
                        <View style={{ backgroundColor: "#38224e", marginLeft: 10, flexDirection: "row", overflow: "hidden", paddingHorizontal: 15, flex: 1, borderWidth: 2, borderColor: "#fff", borderRadius: 20, alignItems: "center" }}>
                            <Image style={{ tintColor: "#fff" }} source={require("../icons/search.png")} />
                            <TextInput
                                onChangeText={(text) => handleInputChange(text)}
                                style={{ flex: 1, color: "#fff", fontSize: 15, fontWeight: "500" }} placeholder="Find your liked song" placeholderTextColor={"#fff"} />
                        </View>
                    </View>
                    <View style={{ marginTop: 20, alignItems: "center" }}>
                        <Text style={{ color: "#fff", fontSize: 30, fontWeight: "bold" }}>Liked Songs</Text>
                        <Text style={{ color: "#fff", fontSize: 15 }}>{savedTracks.length} songs: Saved to library</Text>
                    </View>
                    <View style={{ marginTop: 15, justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                        <TouchableOpacity
                            onPress={playTracks}
                            style={{ width: 60, height: 60, borderRadius: 80, backgroundColor: "#18b14c", justifyContent: "center", alignItems: "center" }}>
                            <Image style={{ tintColor: "#fff" }} source={require("../icons/play.png")} />
                        </TouchableOpacity>
                        <Text style={{ marginLeft: 10, fontSize: 20, color: "#fff", fontWeight: "bold" }}>Play songs</Text>
                    </View>
                    <View style={{ marginTop: 25 }}>
                        {
                            
                                savedTracks.map((item, index) => {
                                    return <SongItem item={item} key={index} setCurrentTrack={setCurrentTrack}
                                        trackIndex={index} savedTracks={savedTracks} setSavedTracks={setSavedTracks} currentList={currentList} setCurrentList={setCurrentList} setContentTracksPlayer={setContentTracksPlayer} />
                                })
                           
                            
                        }
                    </View>
                    <View style={{ height: 70 }}>

                    </View>
                </ScrollView>
            </LinearGradient>
            {
                currentTrack && (
                    <CurrentTrackBottom currentTrack={currentTrack} modalVisible={modalVisible}
                        setModalVisible={setModalVisible} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
                )
            }
            <BottomModal
                visible={modalVisible}
                onHardwareBackPress={() => setModalVisible(false)}
                swipeDirection={["up", "down"]}
                swipeThreshold={200}>
                <ModalContent style={{ height: "100%", width: "100%", backgroundColor: "#453249" }}>
                    <SongPlayer item={currentTrack} modalVisible={modalVisible} setModalVisible={setModalVisible} isRefresh={isRefresh} setIsRefresh={setIsRefresh}/>
                </ModalContent>

            </BottomModal>
            <BottomModal
                visible={modalTrackToPlaylist}
                onHardwareBackPress={() => setModalTrackToPlaylist(false)}
                swipeDirection={["up", "down"]}
                swipeThreshold={200}>
                <ModalContent style={{ height: "100%", width: "100%", backgroundColor: "#000" }}>
                    <AddTrackToPlaylist uriTrack={uriTrackToAdd} setModalTrackToPlaylist={setModalTrackToPlaylist} isRefresh={isRefresh} setIsRefresh={setIsRefresh}/>
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
    currentTrack: {
        backgroundColor: "#38224e",
        padding: 10,
        position: "absolute",
        borderRadius: 10,
        left: 10,
        right: 10,
        bottom: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    }
})
export default LikedSong;