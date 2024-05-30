import { SafeAreaView, StatusBar, Image, ScrollView, StyleSheet, Text, View, Pressable, Touchable, TouchableOpacity, Dimensions, TextInput } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { getAPI } from "../UsingAPI/CallAPI.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AddTrackOfPlaylist} from "../UsingAPI/PlayListAPI.js";
import Loading from "./Loading";
function AddTrackToPlaylist({uriTrack,setModalTrackToPlaylist, isRefresh, setIsRefresh}:any): React.JSX.Element {
    const [playList,setPlayList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const getPlayList = async()=> {
        const accessToken = await AsyncStorage.getItem("token");
        const url_playlist = "https://api.spotify.com/v1/me/playlists?offset=0&limit=20";
        const url_user = "https://api.spotify.com/v1/me";
        const config_user = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        };
        try {
            const data_playList = await getAPI(url_playlist, config_user);
            const data_user = await getAPI(url_user,config_user);
            const valid_playlist = data_playList.items.filter((item:any,index:any)=>{
                return item.owner.id === data_user.id;
            })
            setPlayList(valid_playlist);
            setIsLoading(false);
        }catch(err:any) {
            console.log(err.message);
        }
    }
    useEffect(()=>{
        getPlayList();
    },[])
    const ItemPlaylist = ({item}:any)=> {
        return (
            <View style={{alignItems:"center",flexDirection:"row",width:"100%",backgroundColor:"#474747",marginTop:10,padding:10,borderRadius:10}}>
                {
                    item.images?(<Image style={[style.image]} source={{uri: item.images[0].url}}/>)  
                        :(<Image  style={[style.image]} source={{uri:"https://t3.ftcdn.net/jpg/01/95/82/02/360_F_195820215_3qBs8o8cUenR6H9ZWIjnKe60IXSb1xjv.jpg"}}/>)
                }
                <View style={{flex:1,marginLeft:10}}>
                    <Text numberOfLines={1} style={{color:"#fff",fontSize:17,fontWeight:"bold"}}>{item.name}</Text>
                </View>
                <TouchableOpacity
                    onPress={async()=> {
                        const accessToken = await AsyncStorage.getItem("token");
                        const pll_id = item.id;
                        const uris=[uriTrack];
                        // console.log("uri_track: ",uris);
                        const response = await AddTrackOfPlaylist(pll_id,accessToken,uris);
                        if(response.ok) {
                            setIsRefresh(!isRefresh);
                            setModalTrackToPlaylist(false);
                        }else {
                            console.log("status Add track to playlist: ",response.status);
                        }
                    }}>
                    <Image style={{tintColor:"#fff"}} source={require("../icons/add-circle.png")}/>
                </TouchableOpacity>
            </View>

        )
    }
    if(isLoading){
        return (
            <Loading />
        )
    }
    return(
        <View style={{width:"100%",height:"100%"}}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                    onPress={()=>{
                        setModalTrackToPlaylist(false);
                    }}
                    style={{justifyContent:"center",alignItems:"center",width:100,height:50,borderWidth:2,borderColor:"#fff",borderRadius:6}}>
                    <Text style={{color:"#fff",fontSize:20, fontWeight:"bold"}}>Cancel</Text>
                </TouchableOpacity>
                {
                    playList.map((item:any,index:any)=> {
                        return (
                            <ItemPlaylist item={item} key={index}/>
                        )
                    })
                }
            </ScrollView>
        </View>
    )
}
const style = StyleSheet.create({
    image: {
        width:60,
        height:60,
        borderRadius:5
    }
})
export default AddTrackToPlaylist;