export const SearchTrack = async(trackName,accessToken)=> {
    console.log(trackName)
    const url = `https://api.spotify.com/v1/search?q=${trackName}&type=track`;
    config = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            
        }
    };
    const response = await fetch(url,config);
    return response;
}