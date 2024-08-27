import requests
import json
from bs4 import BeautifulSoup


class YoutubeScraper:
    def __init__(self, query, duration):
        self.session = requests.session()
        self.query = query
        self.duration = duration

    def compareDuration(self, videoDuration):
        return self.duration == videoDuration  # You can improve this logic if needed

    def searchQuery(self):
        url = f"https://www.youtube.com/results?search_query={self.query}"
        response = self.session.get(url)
        soup = BeautifulSoup(response.text, "html.parser")

        scriptElements = soup.find_all("script")
        for scriptElement in scriptElements:
            if "ytInitialData" in scriptElement.text:
                jsonData = json.loads(scriptElement.string[19:-1])
                break

        videos = jsonData["contents"]["twoColumnSearchResultsRenderer"][
            "primaryContents"
        ]["sectionListRenderer"]["contents"][0]["itemSectionRenderer"]["contents"]
        videoData = {}

        for video in videos:
            if "videoRenderer" not in video:
                continue
            url = (
                "https://youtube.com/"
                + video["videoRenderer"]["navigationEndpoint"]["commandMetadata"][
                    "webCommandMetadata"
                ]["url"]
            )
            try:
                if self.compareDuration(
                    video["videoRenderer"]["lengthText"]["simpleText"]
                ):
                    videoData = {
                        "title": self.query,
                        "duration": video["videoRenderer"]["lengthText"]["simpleText"],
                        "channel": video["videoRenderer"]["ownerText"]["runs"][0][
                            "text"
                        ],
                        "thumbnail": video["videoRenderer"]["thumbnail"]["thumbnails"][
                            0
                        ]["url"],
                        "url": url,
                    }
                    break
            except KeyError:
                continue

        if not videoData:
            url = (
                "https://youtube.com/"
                + jsonData["contents"]["twoColumnSearchResultsRenderer"][
                    "primaryContents"
                ]["sectionListRenderer"]["contents"][0]["itemSectionRenderer"][
                    "contents"
                ][
                    0
                ][
                    "videoRenderer"
                ][
                    "navigationEndpoint"
                ][
                    "commandMetadata"
                ][
                    "webCommandMetadata"
                ][
                    "url"
                ]
            )
            videoData = {
                "title": self.query,
                "duration": jsonData["contents"]["twoColumnSearchResultsRenderer"][
                    "primaryContents"
                ]["sectionListRenderer"]["contents"][0]["itemSectionRenderer"][
                    "contents"
                ][
                    0
                ][
                    "videoRenderer"
                ][
                    "lengthText"
                ][
                    "simpleText"
                ],
                "channel": jsonData["contents"]["twoColumnSearchResultsRenderer"][
                    "primaryContents"
                ]["sectionListRenderer"]["contents"][0]["itemSectionRenderer"][
                    "contents"
                ][
                    0
                ][
                    "videoRenderer"
                ][
                    "ownerText"
                ][
                    "runs"
                ][
                    0
                ][
                    "text"
                ],
                "thumbnail": jsonData["contents"]["twoColumnSearchResultsRenderer"][
                    "primaryContents"
                ]["sectionListRenderer"]["contents"][0]["itemSectionRenderer"][
                    "contents"
                ][
                    0
                ][
                    "videoRenderer"
                ][
                    "thumbnail"
                ][
                    "thumbnails"
                ][
                    0
                ][
                    "url"
                ],
                "url": url,
            }
        return videoData
