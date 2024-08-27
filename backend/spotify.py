import requests
import json
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import os

load_dotenv()


class SpotifyScraper:
    def __init__(self, url):
        self.session = requests.session()
        self.url = url

    def milliToMinutes(self, millis):
        seconds = (millis / 1000) % 60
        seconds = int(seconds)
        minutes = (millis / (1000 * 60)) % 60
        minutes = int(minutes)
        return f"{minutes}:{seconds:02d}"

    def getPlaylist(self):
        accessToken = self.getAccessToken()
        headers = {
            "User-Agent": "Mozilla/5.0",
            "client-token": os.getenv("spotify_client_id"),
            "Authorization": f"Bearer {accessToken}",
        }
        playlistId = self.getPlaylistId()
        url = f'https://api-partner.spotify.com/pathfinder/v1/query?operationName=fetchPlaylist&variables={{"uri":"spotify:playlist:{playlistId}","offset":0,"limit":8}}&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%2276849d094f1ac9870ac9dbd5731bde5dc228264574b5f5d8cbc8f5a8f2f26116%22%7D%7D'
        response = self.session.get(url, headers=headers)
        playlistRequest = response.json()["data"]["playlistV2"]

        playlist = {
            "id": playlistId,
            "name": self.clean_filename(playlistRequest["name"]),
            "description": playlistRequest["description"],
            "followers": playlistRequest["followers"],
            "tracks": [],
        }

        for track in playlistRequest["content"]["items"]:
            playlist["tracks"].append(
                {
                    "name": track["itemV2"]["data"]["name"],
                    "artist": track["itemV2"]["data"]["artists"]["items"][0]["profile"][
                        "name"
                    ],
                    "trackDuration": self.milliToMinutes(
                        track["itemV2"]["data"]["trackDuration"]["totalMilliseconds"]
                    ),
                }
            )

        return playlist

    def getPlaylistId(self):
        return self.url.split("/")[-1]

    def getAccessToken(self):
        response = self.session.get(self.url)
        soup = BeautifulSoup(response.text, "html.parser")
        sessionElement = soup.find("script", id="session")
        accessTokenJson = json.loads(sessionElement.string)
        accessToken = accessTokenJson["accessToken"]
        return accessToken

    def clean_filename(self, filename):
        return "".join(c for c in filename if c.isalnum() or c in (" ", "_")).rstrip()
