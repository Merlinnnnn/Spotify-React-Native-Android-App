import { getAPI } from "./CallAPI.js";
export const DeleteSavedTrack = async (ids, accessToken) => {
    console.log(ids.split(","))
    const url = `https://api.spotify.com/v1/me/tracks`;
    const config = {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: ids.split(",") }) 
    };
    const res = await fetch(url, config);
    return res;
   
}

export const AddSaveTrack = async(ids, accessToken)=> {
    const url = `https://api.spotify.com/v1/me/tracks`;
    const config = {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: ids.split(",") }) 
    };
    const res = await fetch(url, config);
    console.log("Put status: ",res.status);
    return res;
}
   