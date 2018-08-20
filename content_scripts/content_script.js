var CURRENT_CHANNEL = "";

/**
 * Gets the Twitch channel name if available. Raises an Error if name not found.
 * @return {string} The channel name.
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
    throw new Error("Channel name not found.");
  }
}

/**
 * If it can find a channel name, it either:
 *  - calls a function to update the time spent watching
 *  - calls a function to set stuff up for a newly navigated-to channel
 * Otherwise, it resets the `current channel`.
 */
function main() {
  try {
    const channelName = getChannelName();
    if (channelName === CURRENT_CHANNEL) {
      return
    } else {
      return
    }
  } catch (e) {
    CURRENT_CHANNEL = "";
  }
}
