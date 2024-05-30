export const FollowUser = async(ids,accessToken,type)=> {
    const url = `https://api.spotify.com/v1/me/following?type=${type}&ids=${ids}`;;
    const config = {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: ids.split(",") }) 
    };
    const response = await fetch(url,config);
    console.log("res-follow-stt: ",response.status);
}

export const CheckIsFollowing = async(ids,accessToken,type) => {
    const url = `https://api.spotify.com/v1/me/following/contains?type=${type}&ids=${ids}`;
    const config = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            
        }
    };
    const response = await fetch(url,config);
    const data = await response.json();
    return data;
}

export const UnfollowUser = async (ids,accessToken,type)=> {
    const url = `https://api.spotify.com/v1/me/following?type=${type}&ids=${ids}`;;
    const config = {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: ids.split(",") }) 
    };
    const response = await fetch(url,config);
    console.log("res-unfollow-stt: ",response.status);
}