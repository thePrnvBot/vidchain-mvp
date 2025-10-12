import { type VidchainObject } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area"

type PreviewBarProps = {
    vidchainData: VidchainObject | null;
    player: YT.Player | null;
    currentClipIndex: React.MutableRefObject<number>;
    confirmPreview: () => void;
}

const PreviewBar: React.FC<PreviewBarProps> = ({ vidchainData, player, currentClipIndex, confirmPreview }) => {
    return (
        <ScrollArea className="h-96 w-full p-4 border border-gray-300 rounded-lg">
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Preview</h2>
            {vidchainData?.clips.map((clip, index) => (

                <div key={index} className="flex flex-row items-center gap-2 border border-gray-300 p-4 rounded-lg mt-2">
                    <p className="leading-7">Clip {index + 1}</p>
                    <img src={clip.thumbnail} alt={`Thumbnail for clip ${index + 1}`} className="w-32 h-18 object-cover rounded" />
                    <p className="leading-7">Duration: {clip.end - clip.start}s</p>
                    <button
                        onClick={() => {
                            if (!player) return;
                            const videoId = clip.videoId;
                            if (videoId) {
                                currentClipIndex.current = index;
                                player.loadVideoById({
                                    videoId,
                                    startSeconds: clip.start,
                                    endSeconds: clip.end,
                                });
                            }
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer scroll-m-20 text-md font-semibold tracking-tight"
                    >
                        Load
                    </button>
                </div>
            ))}
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-[#242424]/70 backdrop-blur-sm">
                <a
                    onClick={confirmPreview}
                    className="block w-full p-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 active:bg-blue-800 rounded-lg cursor-pointer text-center text-md tracking-tight transition-colors duration-200"
                >
                    Scroll & Confirm!
                </a>
            </div>
        </ScrollArea>
    );
}

export default PreviewBar;