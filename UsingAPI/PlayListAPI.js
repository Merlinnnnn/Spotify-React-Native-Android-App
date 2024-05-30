export const CreatePlaylist =async (user_id,name,accessToken) => {
    const url = `https://api.spotify.com/v1/users/${user_id}/playlists`;
    const config = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name }) 
    };
    const response = await fetch(url,config);
    return response;
}

export const DeletePlayList = async(playlist_id,accessToken) => {
    const url = `https://api.spotify.com/v1/playlists/${playlist_id}/followers`;
    const config = {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        
    };
    const response = await fetch(url,config);
    return response;
}

export const DeleteTrackOfPlaylist = async(playlist_id,accessToken,tracks)=> {
    const url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
    config = {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                tracks:tracks
            }
        )
    };
    const respone = await fetch(url,config);
    return respone;
}

export const AddTrackOfPlaylist = async(playlist_id,accessToken,uris)=> {
    const url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
    config = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                uris:uris
            }
        )
    };
    const respone = await fetch(url,config);
    return respone;
}