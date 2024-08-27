import Image from "next/image";
import { useState } from "react";
import type { SpotifyInfo, Video, urls } from "../utils/interfaces";

interface Props {
    data: SpotifyInfo | undefined;
    getDownloadUrls: (url: string) => void;
    downloadVideo: (url: string) => void;
    isLoading: boolean;
    urls: urls[];
}
const Gallery = ({ data, getDownloadUrls, downloadVideo, isLoading, urls }: Props) => {
    const [downloadUrls, setDownloadUrls] = useState<string>();

    const checkStatus = (url: string) => {
        return urls.find((item) => item.youtubeUrl === url)
    }
    const handleGetDownloadUrl = (url: string) => {
        setDownloadUrls(url)
        getDownloadUrls(url)
    }
    const isItemLoading = (url: string) => {
        return isLoading && downloadUrls === url
    }

    return (

        <div className="overflow-x-auto mt-3 text-white">
            <table className="table ">
                {data && (
                    <thead className="text-white text-lg">
                        <tr>
                            <th>Preview</th>
                            <th>Name</th>
                            <th>Duration</th>
                            <th>Download</th>
                        </tr>
                    </thead>)
                }

                <tbody>
                    {
                        data?.videos?.map((item: Video) => {
                            return (
                                <tr key={item.url}>
                                    <td>
                                        <a href={item.url} target="_blank"
                                            rel="noopener noreferrer">
                                            <Image src={item.thumbnail} alt="Spotify Icon" height={50} width={100} style={{ width: "auto", height: "auto" }} />
                                        </a>
                                    </td>
                                    <td>{item.title}</td>
                                    <td>{item.duration}</td>
                                    <td className="h-[64px] w-[107px]">{isItemLoading(item.url) ? <span className="loading loading-spinner loading-md ms-7"></span> : <button className="bg-green-400 p-2 w-[85px]" onClick={checkStatus(item.url) ? () => downloadVideo(item.url) : () => handleGetDownloadUrl(item.url)}>{checkStatus(item.url) ? 'Download' : 'Get URL'}</button>}</td>
                                </tr>
                            );
                        }
                        )
                    }

                </tbody>
            </table>
        </div>
    )
}

export default Gallery