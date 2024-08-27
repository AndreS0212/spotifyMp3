import { SignInButton, SignOutButton, SignUpButton, useUser, UserButton } from "@clerk/nextjs";

const AuthButtons = () => {
    const { user } = useUser();
    const redirectToSignIn = () => {
        window.location.reload()
    };
    if (user) {
        return (
            <div className="flex flex-row items-center gap-5">
                <UserButton />
                <div className="border-[1px] border-x-zinc-400 rounded-lg font-medium  px-3 p-2  items-center hover:bg-white hover:text-black">
                    <SignOutButton />
                </div>
            </div>
        );
    } else {
        return (
            <div className="flex flex-row items-center gap-4">
                <div className="border-[1px] border-x-zinc-400 rounded-lg font-medium  px-3 p-2  items-center hover:bg-white hover:text-black">
                    <SignInButton />
                </div>
            </div>
        );
    }
}
export default AuthButtons;