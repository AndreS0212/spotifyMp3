import Image from "next/image"
import AuthButtons from "./AuthButtons"

const Header = () => {
    return (
        <header className="flex flex-row justify-between bg-black text-white px-16 p-4">
            <div className="flex flex-row items-center gap-2">
                <Image src="/spotify-logo.png" width={35} height={35} alt="spotify icon" />
                <h1 className="text-xl font-bold">Spotify to Mp3</h1>
            </div>
            <AuthButtons />


        </header>
    )
}

export default Header