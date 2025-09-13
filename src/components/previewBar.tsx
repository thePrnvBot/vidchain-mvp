import { type VidchainObject } from "../types";

type PreviewBarProps = {
    vidchainData: VidchainObject | null;
    player: YT.Player | null;
    currentClipIndex: React.MutableRefObject<number>;
    confirmPreview: () => void;
}

const PreviewBar: React.FC<PreviewBarProps> = ({ vidchainData, player, currentClipIndex, confirmPreview }) => {
    return (
        <div className="flex flex-col gap-2 border items-center border-gray-300 p-4 rounded-lg">
            <h2 className="text-xl font-semibold">Preview</h2>
            {vidchainData?.clips.map((clip, index) => (

                <div key={index} className="flex flex-row items-center gap-2 border border-gray-300 p-4 rounded-lg">
                    <p>Clip {index + 1}</p>
                    <img src={clip.thumbnail} alt={`Thumbnail for clip ${index + 1}`} className="w-32 h-18 object-cover rounded" />
                    <p>Duration: {clip.end - clip.start}s</p>
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
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Load
                    </button>
                </div>
            ))}
            <a onClick={confirmPreview} className="hover:underline cursor-pointer">Confirm!</a>
        </div>
    );
}

export default PreviewBar;