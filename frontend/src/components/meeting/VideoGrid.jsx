import VideoTile from "./VideoTile";

const VideoGrid = ({
  localStream,
  localUser,
  remoteUsers = [],
  audioEnabled,
  videoEnabled,
  localSpeaking = false,
}) => {
  const total = 1 + remoteUsers.length;

  // Predictable layout: fixed columns, capped tile width.
  let columns = 4;
  let tileMax = "300px";
  let container = "max-w-7xl";

  if (total === 1) {
    columns = 1;
    tileMax = "680px";
    container = "max-w-2xl";
  } else if (total <= 2) {
    columns = 2;
    tileMax = "500px";
    container = "max-w-[900px]";
  } else if (total <= 4) {
    columns = 2;
    tileMax = "460px";
    container = "max-w-4xl";
  } else if (total <= 6) {
    columns = 3;
    tileMax = "380px";
    container = "max-w-5xl";
  } else if (total <= 8) {
    columns = 4;
    tileMax = "340px";
    container = "max-w-6xl";
  }

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        className={`w-full grid gap-3 md:gap-4 items-center content-center ${container}`}
      >
        {/* Local User */}
        <div key="local" className="flex justify-center">
          <div style={{ maxWidth: tileMax }} className="w-full">
            <VideoTile
              stream={localStream}
              name={localUser?.name || localUser?.fullName || "You"}
              isLocal={true}
              audioEnabled={audioEnabled}
              videoEnabled={videoEnabled}
              speaking={localSpeaking}
            />
          </div>
        </div>

        {/* Remote Users */}
        {remoteUsers.map((user) => (
          <div
            key={user.socketId || user.userId}
            className="flex justify-center"
          >
            <div style={{ maxWidth: tileMax }} className="w-full">
              <VideoTile
                stream={user.stream}
                name={user.userName || user.name || "Participant"}
                audioEnabled={user.audioEnabled}
                videoEnabled={user.videoEnabled}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;