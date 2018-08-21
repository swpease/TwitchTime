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
 * Inserts a text element next to the Follow and Subscribe buttons on a
 * Twitch channel.
 * @param {Object.<string, string>} channelTime - The channel name and time, in seconds.
 */
function injectTimeIndicator(channelTime) {
  const time = Object.values(channelTime)[0];  // Should have one k:v pair.

  let div = document.createElement("div");
  let text = document.createTextNode(`Watch Time: ${time}`);

  div.className = "twitch-time-display"
  div.appendChild(text);

  let parent = document.querySelector("main div.channel-header__right")  // Brittle.
  parent.appendChild(div);
}

/**
 * Generic error handler.
 */
function onError(error) {
  console.log(error);
}

/**
 * Injects an Element onto the Twitch page indicating the time spent watching
 * the channel.
 * @param {string} channelName - The channel name.
 */
function setupForChannel(channelName) {
  let gettingChannelTime = browser.storage.sync.get({ [channelName]: "0" });
  gettingChannelTime.then(injectTimeIndicator, onError);
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
      setupForChannel(channelName)
    }
  } catch (e) {
    CURRENT_CHANNEL = "";
  }
}
