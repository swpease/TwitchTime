/**
 * Gets the Twitch channel name if available. Works if you are able to watch
 * a video from the current url.
 * @return {(string|null)} The channel name or null.
 */
function getChannelName() {
  const pathname = window.location.pathname;
  const splitPath = pathname.split("/");
  /*
   * To my knowledge, the only paths you can start to watch videos from are:
   *   1. twitch.tv/[channel]
   *   2. twitch.tv/videos/*
   * As such, these are the only paths I'll try to find the channel name from.
   */
  if (splitPath[1] === "videos" || splitPath.length === 2) {
    const channelNameElement = document.querySelector("main h5");  // Brittle.
    const channelName = channelNameElement.textContent.toLowerCase();  // Protect from display name changes.
    return channelName;
  } else {
    return null;
  }
}
