import {JSX} from "react";

export default function Loader(): JSX.Element {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs bg-black/80 transition-all duration-300">
            <div className="flex flex-col space-y-3 justify-center items-center border-2 rounded-xl w-[300px] h-[200px] bg-gray-100 border-primary relative transition-all duration-300">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-solid border-opacity-70 mb-8"></div>
                <p className="text-primary text-md font-bold">Please wait a moment ...</p>
            </div>
        </div>
    );
}
