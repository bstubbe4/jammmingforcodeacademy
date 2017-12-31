const clientId = 'd80719d256554ab1b92f6d8a4ebece39';
const redirectUri = 'http://jammming_spotify_brad_stubbe.surge.sh';
let userAccessToken;

export const Spotify = {

  getAccessToken() {
    if (userAccessToken) {
      return userAccessToken;
    }

    const tokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expireMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (tokenMatch && expireMatch) {
      this.tokenMatch = userAccessToken[1];
      const expiresIn = expireMatch[1];
      window.setTimeout(() => userAccessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return userAccessToken;
    } else {
      const accessUrl = 'https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}';
      window.location = accessUrl;
    }
  },

  search(term) {
      const userAccessToken = this.getAccessToken();
      return fetch('https://api.spotify.com/v1/search?type=track&q=${term}',
      {headers: {
        Authorization: `Bearer ${this.accessToken}`}
      }).then(response => {
        return response.json();
      }).then(jsonResponse => {
        if (!jsonResponse.tracks) {
          return [];
        }
        return jsonResponse.tracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
        }));
      });
    },

    savePlaylist(name, trackURIs) {
      if (!name || !trackURIs) {
        return;
      }

      const accessToken = Spotify.getAccessToken();
      const headers = { Authorization: `Bearer ${this.accessToken}` };
      let userId;

      return fetch('https://api.spotify.com/v1/me',
        {headers:
          headers}).then(response =>
            response.json()).then(jsonResponse =>
              { userId = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${this.userId}/playlists`, {
                  headers: headers,
                  method: 'POST',
                  body: JSON.stringify({name: name})
                }).then(response => response.json()).then(jsonResponse => {
                  const playlistId = jsonResponse.id;
                  return fetch(`https://api.spotify.com/v1/users/${this.userId}/playlists/${this.playlistId}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris: trackURIs})
                  });
                });

              });
            }
};

//export default Spotify;
