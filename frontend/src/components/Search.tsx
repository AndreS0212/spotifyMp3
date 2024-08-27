import type { ChangeEvent, KeyboardEvent } from "react";

interface Props {
    searchValue: string;
    handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleOnKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    handleSearch: () => void;
}

const Search = ({ searchValue, handleSearchChange, handleOnKeyDown, handleSearch }: Props) => {
    return (
        <div className="w-[80%] md:w-[50%] mx-auto justify-center flex flex-col" >
            <div className="flex flex-row">
                <input
                    className="w-full bg-gray-200 rounded-md p-2"
                    type="text"
                    placeholder={"https://open.spotify.com/playlist/@playlist_id"}
                    onKeyDown={handleOnKeyDown}
                    onChange={handleSearchChange}
                    value={searchValue}
                />

            </div>
            <button onClick={handleSearch} className="bg-green-500 hover:bg-green-700 text-xl text-white font-bold py-2 px-4 rounded">
                Search
            </button>
        </div>
    );
};

export default Search;