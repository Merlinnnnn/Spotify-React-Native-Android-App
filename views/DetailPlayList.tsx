import { SafeAreaView, StatusBar, Image, ScrollView, StyleSheet, Text, View, Pressable, Touchable, TouchableOpacity, Dimensions, TextInput } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import LinearGradient from "react-native-linear-gradient";
import { getAPI } from "../UsingAPI/CallAPI.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation,useIsFocused } from "@react-navigation/native";
import { Player } from "./ContextTrack";
import { BottomModal, ModalContent } from 'react-native-modals';
import TrackPlayer, { Capability, State, usePlaybackState, useTrackPlayerEvents, Event } from 'react-native-track-player';
import { CreatePlaylist, DeletePlayList, DeleteTrackOfPlaylist } from "../UsingAPI/PlayListAPI.js";
import { DeleteSavedTrack, AddSaveTrack } from "../UsingAPI/SavedTracksAPI.js";
import FindTrackToAdd from "./FindTrackToAdd";
import Loading from "./Loading";
import SongPlayer from "./SongPlayer";
import CurrentTrackBottom from "./CurrentTrackBottom";
import AddTrackToPlaylist from "./AddTrackToPlaylist";
function isSameArray(array1: any, array2: any) {
    return array1.length === array2.length && array1.every((value: any, index: any) => value === array2[index])
}

function DetailPlayList({ route }: any): React.JSX.Element {
    const { data, user_id,isRefreshHome,setIsRefreshHome } = route.params;
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [tracks, setTracks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentTrack, setCurrentTrack, currentList, setCurrentList }: any = useContext(Player);
    const [listSaved, setListSaved] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalPlaylistAddTrack, setModalPlaylistAddTrack] = useState(false)
    const [modalTrackToPlaylist, setModalTrackToPlaylist] = useState(false);
    const [uriTrackToAdd, setUriTrackToAdd] = useState("");
    const [isRefresh,setIsRefresh] = useState(false);
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

    const getTracks = async () => {
        const accessToken = await AsyncStorage.getItem("token");
        const playlist_id = data.id;
        const url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?offset=0&limit=25`;
        const config = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
        };
        try {
            const data_s = await getAPI(url, config);
            console.log("Trackplltdata: ", data_s);
            const ids = data_s.items.map((item: any, index: any) => {
                return item.track.id;
            }).join(",");
            console.log("ids: ", ids)
            const url_checkSaved = `https://api.spotify.com/v1/me/tracks/contains?ids=${ids}`;
            const data_check = await getAPI(url_checkSaved, config);
            console.log("datacheck-pll: ", data_check);
            setTracks(data_s.items);
            setListSaved(data_check);
            setIsAdding(user_id == data.owner.id);
            setIsDeleting(user_id == data.owner.id);
            setIsLoading(false);
        } catch (err: any) {
            console.log(err.message);
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
    const RenderTrack = ({ item, trackIndex, islike }: any) => {
        const [isLikeItem, setIsLikeItem] = useState(islike);
        return (
            <TouchableOpacity
                onPress={async () => {
                    setIsRefresh(!isRefresh);
                    if (!isSameArray(tracks, currentList)) {
                        await setContentTracksPlayer(tracks);
                        setCurrentList(tracks);
                    }
                    setCurrentTrack(item);
                    const state = await TrackPlayer.getState();
                    if (state === State.Playing || state === State.Paused) {
                        await TrackPlayer.stop();
                    }
                    await TrackPlayer.skip(trackIndex);
                    TrackPlayer.play();
                }}
                style={{ marginTop: 10, borderRadius: 15, overflow: "hidden" }}>
                <LinearGradient
                    style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20 }}
                    colors={["#232323", "#282828"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Image style={{ width: 60, height: 60 }} source={{ uri: item.track.album.images[0].url }} />
                    <View style={{ flex: 1, justifyContent: "center", marginLeft: 20 }}>
                        <Text style={{ color: "#fff", fontSize: 15 }} numberOfLines={1}>{item.track.name}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={async () => {
                            const accessToken = await AsyncStorage.getItem("token");
                            const ids = [item.track.id].join(",");
                            if (isLikeItem == false) {
                                setIsLikeItem(true);
                                await AddSaveTrack(ids, accessToken);

                            } else {
                                setIsLikeItem(false);
                                await DeleteSavedTrack(ids, accessToken);
                            }

                        }}
                        style={{ justifyContent: "center", alignItems: "center" }}>
                        {
                            isLikeItem ? <Image style={{ tintColor: "#31a24c" }} source={require("../icons/heart-d-24.png")} />
                                : <Image style={{ tintColor: "#fff" }} source={require("../icons/heart-d-24.png")} />
                        }

                    </TouchableOpacity>
                    {
                        isDeleting ? (
                            <TouchableOpacity
                                onPress={async () => {
                                    const accessToken = await AsyncStorage.getItem("token");
                                    const playlist_id = data.id;

                                    const tracks = [{
                                        uri: item.track.uri
                                    }]
                                    console.log(playlist_id)
                                    console.log(tracks);
                                    const res_dlit = await DeleteTrackOfPlaylist(playlist_id, accessToken, tracks);
                                    getTracks();
                                }}
                                style={{ justifyContent: "center", alignItems: "center", marginLeft: 10 }}>
                                <Image source={require("../icons/close.png")} />
                            </TouchableOpacity>
                        ) : (
                            null
                        )
                    }
                    <TouchableOpacity
                        onPress={() => {
                            setUriTrackToAdd(item.track.uri);
                            setModalTrackToPlaylist(true);
                        }}
                        style={{ justifyContent: "center", alignItems: "center", marginLeft: 10 }}>
                        <Image style={{ tintColor: "#fff" }} source={require("../icons/dots.png")} />
                    </TouchableOpacity>
                </LinearGradient>
            </TouchableOpacity>
        )
    }
    useEffect(() => {
        getTracks();
    }, [isRefresh])
    const playTrack = async () => {
        setIsRefresh(!isRefresh);
        if (tracks.length > 0) {
            setCurrentTrack(tracks[0]);
            if (!isSameArray(tracks, currentList)) {
                setCurrentList(tracks);
                await setContentTracksPlayer(tracks);
            }
        }
        const state = await TrackPlayer.getState();
        if (state === State.Playing || state === State.Paused) {
            await TrackPlayer.stop();
        }
        await TrackPlayer.skip(0);
        await TrackPlayer.play();
    }
    // useEffect(() => {
    //     getTracks();
    // }, [])
    if (isLoading) {
        return (
            <Loading />
        )
    }
    return (
        <>
            <View style={{ flex: 1, backgroundColor: "#000" }}>
                <LinearGradient style={{ paddingTop: 20, paddingBottom: 0, alignItems: "center" }} colors={["#9ec2d0", "#000"]}>

                    {
                        data.images ? (<Image style={{ width: 200, height: 200 }} source={{ uri: data.images[0].url }} />)
                            : (<Image style={{ width: 200, height: 200 }} source={{ uri: "https://t3.ftcdn.net/jpg/01/95/82/02/360_F_195820215_3qBs8o8cUenR6H9ZWIjnKe60IXSb1xjv.jpg" }} />)
                    }
                    <TouchableOpacity
                        onPress={() => { navigation.goBack(); }}
                        style={{ justifyContent: "center", alignItems: "center", position: "absolute", left: 10, top: 10, backgroundColor: 'rgba(0, 0, 0, 0.6)', width: 50, height: 50, borderRadius: 50 }}>
                        <Image style={{ tintColor: "#fff" }} source={require("../icons/back-arrow.png")} />
                    </TouchableOpacity>
                    <View style={{ marginTop: 10, padding: 10, width: "100%" }}>
                        <Text numberOfLines={2} style={{ color: "#fff", fontSize: 25, fontWeight: "bold" }}>{data.name}</Text>
                    </View>
                </LinearGradient>
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: "#000", paddingHorizontal: 20 }}>
                    <View>
                        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "500" }}>Owner: {data.owner.display_name}</Text>

                    </View>
                    <View style={{ marginTop: 20 }}>
                        {
                            isAdding ? (<TouchableOpacity 
                                    onPress={()=>setModalPlaylistAddTrack(true)}
                                    style={{ flexDirection: "row", alignItems: "center" }}>
                                <View style={{ borderRadius: 50, width: 50, height: 50, justifyContent: "center", alignItems: "center", backgroundColor: "#ababab" }}>
                                    <Image style={{ tintColor: "#fff" }} source={require("../icons/add.png")} />
                                </View>
                                <Text style={{ marginLeft: 10, color: "#fff", fontSize: 17, fontWeight: "bold" }}>Add song to this playlist</Text>
                            </TouchableOpacity>) : (<View></View>)
                        }
                    </View>
                    <View style={{ flexDirection: "row", marginTop: 20, justifyContent: "space-between" }}>
                        <TouchableOpacity
                            onPress={async () => {
                                const accessToken = await AsyncStorage.getItem("token");
                                console.log(data.id)
                                const res_dl_pll = await DeletePlayList(data.id, accessToken);
                                if (res_dl_pll.ok) {
                                    setIsRefreshHome(!isRefreshHome);
                                    navigation.goBack();
                                } else {
                                    console.log("res_dl_pll: ", res_dl_pll.status);
                                }
                            }}
                            style={{ justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#fff", borderRadius: 5, width: 100, height: 50 }}>
                            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "bold" }}>Delete playlist</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={playTrack}
                            style={{ backgroundColor: "#31a24c", width: 60, height: 60, borderRadius: 60, justifyContent: "center", alignItems: "center" }}>
                            <Image style={{ tintColor: "#000" }} source={require("../icons/play.png")} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>List songs</Text>
                        <View>
                            {
                                tracks.map((item, index) => {
                                    return <RenderTrack item={item} key={index} islike={listSaved[index]} trackIndex={index} />
                                })
                            }
                        </View>
                    </View>
                </ScrollView>
                {
                    currentTrack && (<View style={{ height: 100 }}>
                        <CurrentTrackBottom currentTrack={currentTrack} modalVisible={modalVisible}
                            setModalVisible={setModalVisible} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
                    </View>
                    )
                }
            </View>
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
            <BottomModal
                visible={modalPlaylistAddTrack}
                onHardwareBackPress={() => setModalPlaylistAddTrack(false)}
                swipeDirection={["up", "down"]}
                swipeThreshold={200}>
                <ModalContent style={{ height: "100%", width: "100%", backgroundColor: "#000" }}>
                    <FindTrackToAdd playlistId={data.id} setModalPlaylistAddTrack={setModalPlaylistAddTrack} setModalVisible={setModalVisible} isRefresh={isRefresh} setIsRefresh={setIsRefresh}/>
                </ModalContent>
            </BottomModal>
        </>
    )
}

export default DetailPlayList;