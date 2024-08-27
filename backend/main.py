import json
import os
from fastapi import FastAPI, HTTPException
from spotify import SpotifyScraper
from youtube import YoutubeScraper
from pytube import YouTube
import b2sdk.v2 as b2
import shutil
import yt_dlp
from dotenv import load_dotenv

load_dotenv()
# FastAPI instance
app = FastAPI()

# Setting up Backblaze B2 Cloud Storage
info = b2.InMemoryAccountInfo()
b2_api = b2.B2Api(info)
application_key_id = os.getenv("application_key_id")
application_key = os.getenv("application_key")
b2_api.authorize_account("production", application_key_id, application_key)

# Get the bucket with the name
mediaBucket = b2_api.get_bucket_by_name(os.getenv("bucket_name"))


# Function to get playlist data from Spotify and perform YouTube search
def get_playlist_data(url):
    playlist = SpotifyScraper(url).getPlaylist()
    queries = [
        {
            "playlistName": f"{playlist['name']}",
            "text": f"{track['name']} - {track['artist']}",
            "duration": f"{track['trackDuration']}",
        }
        for track in playlist["tracks"]
    ]
    videos = [
        YoutubeScraper(query=query["text"], duration=query["duration"]).searchQuery()
        for query in queries
    ]
    return {
        "playlistId": playlist["id"],
        "playlistName": playlist["name"],
        "videos": videos,
    }


def download_audio(url, name, playlistName):
    temp_dir = "./tmp/audio"
    os.makedirs(temp_dir, exist_ok=True)
    # Setup yt-dlp options
    ydl_opts = {
        "format": "bestaudio/best",  # Download the best available audio format
        "outtmpl": os.path.join(
            temp_dir, f"{name}.%(ext)s"
        ),  # Save with the specified name and extension
        "quiet": True,  # Suppress output
        "no_warnings": True,  # Suppress warnings
        "postprocessors": [],  # No conversion needed, just download the audio
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    # List files in temp_dir after download
    files_after_download = os.listdir(temp_dir)

    # Find the downloaded file with the correct name
    downloaded_file = None
    for file in files_after_download:
        if file.startswith(name):
            downloaded_file = file
            break

    if downloaded_file is None:
        raise FileNotFoundError("The audio file could not be found after download.")

    final_output_dir = os.path.join(temp_dir, playlistName)
    os.makedirs(final_output_dir, exist_ok=True)

    # Move the downloaded file to the final output directory
    shutil.move(
        os.path.join(temp_dir, downloaded_file),
        os.path.join(final_output_dir, downloaded_file),
    )

    return os.path.join(final_output_dir, downloaded_file)


# Function to download all videos in a playlist
def download_playlist_video(video, playlistName):
    path_file = download_audio(video["url"], video["title"], playlistName)
    file_name = video["title"] + ".mp3"
    try:
        mediaBucket.upload_local_file(
            local_file=path_file,
            file_name=file_name,
            content_type="application/octet-stream",
        )
        videoUrl = mediaBucket.get_download_url(file_name)
        temp_dir = os.path.dirname(path_file)
        shutil.rmtree(temp_dir, ignore_errors=True)
        return videoUrl
    except TimeoutError:
        print("TimeoutError")
        return videoUrl


@app.post("/spotify")
async def playlist_handler(request: dict):
    url = request.get("url")

    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    result = get_playlist_data(url)
    return result


@app.post("/download")
async def download_handler(request: dict):
    video = request.get("video")
    playlistId = request.get("playlistId")
    playlistName = request.get("playlistName")

    if not video:
        raise HTTPException(status_code=400, detail="Video is required")

    try:
        url = download_playlist_video(video, playlistName)
    except TimeoutError:
        return {"playlistId": playlistId, "url": url, "youtubeUrl": video["url"]}

    return {"playlistId": playlistId, "url": url, "youtubeUrl": video["url"]}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000)
