let CURRENT_CHANNEL = "";
let CHANNEL_TIME = 0;
let INTERVAL_SECONDS = 2;
let DISPLAY_FORMAT = "";

/**
 * Generic error handler.
 */
function onError(error) {
  console.log(error);
}

/**
 * For initially setting-up a format for the display widget.
 */
function assignDisplayFormat() {
  const gettingDisplayFormat = browser.storage.sync.get({ displayFormat: "watched-dh" });
  gettingDisplayFormat.then((result) => {
    DISPLAY_FORMAT = result.displayFormat;
  }, onError);
}

/**
 * For Preferences changes.
 */
function updateDisplayFormat(changes, area) {
  if (changes.hasOwnProperty("displayFormat")) {
    DISPLAY_FORMAT = changes.displayFormat.newValue;
  }
}

/**
 * Converts time in seconds to one of the following forms:
 *   "blank"       = *no display*
 *   "watched-dh"  = `Watched: [${d} d] ${h} h`
 *   "watched-dhm" = `Watched: [${d} d] [${h} h] ${m} m`
 *   "dh"          = `[${d} d] ${h} h`
 *   "dhm"         = `[${d} d] [${h} h] ${m} m`
 * @param {number} time - Time, in seconds.
 * @return {string} A formatted time string.
 */
function formatTime(time) {
  let formattedTime = ""

  if (DISPLAY_FORMAT === "blank") {
    return formattedTime;
  }

  if (["watched-dh", "watched-dhm"].includes(DISPLAY_FORMAT)) {
    formattedTime = "Watched: ";
  }

  const timeInHours = Math.floor(time / 3600);
  const days = Math.floor(timeInHours / 24);
  const hours = timeInHours % 24;

  if (["dh", "watched-dh"].includes(DISPLAY_FORMAT)) {
    const formattedDays = `${days}:`;
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;

    formattedTime += formattedDays + formattedHours;
  } else if (["dhm", "watched-dhm"].includes(DISPLAY_FORMAT)) {
    const timeInMinutes = Math.floor(time / 60);
    const minutes = timeInMinutes % 60;

    const formattedDays = days === 0 ? "" : `${days}:`;
    const formattedHours = hours < 10 ? `0${hours}:` : `${hours}:`;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

    formattedTime += formattedDays + formattedHours + formattedMinutes;
  } else {
    formattedTime += `${days}d`;  // Just in case.
  }

  return formattedTime;
}

/**
 * Removes the time indicator element from the Twitch page.
 */
function removeTimeIndicator() {
  let timeIndicator = document.querySelector(".twitch-time-display");
  if (timeIndicator !== null) {
    timeIndicator.remove();
  }
}

/**
 * Inserts a text element next to the Follow and Subscribe buttons on a
 * Twitch channel.
 * @param {Object.<string, number>} storedTime - The channel name and time, in seconds.
 */
function injectTimeIndicator(storedTime) {
  removeTimeIndicator();

  CHANNEL_TIME = Object.values(storedTime)[0];  // Should have one k:v pair.
  const formattedTime = formatTime(CHANNEL_TIME);

  let div = document.createElement("div");
  const text = document.createTextNode(formattedTime);

  div.className = "twitch-time-display"
  div.appendChild(text);

  let parent = document.querySelector("main div.channel-header__right")  // Brittle.
  parent.appendChild(div);
}

/**
 * Injects an Element onto the Twitch page indicating the time spent watching
 * the channel.
 * @param {string} channelName - The channel name.
 */
function setupForChannel(channelName) {
  CURRENT_CHANNEL = channelName;
  const gettingChannelTime = browser.storage.sync.get({ [CURRENT_CHANNEL]: 0 });
  gettingChannelTime.then(injectTimeIndicator, onError);
}

/**
 * Updates the text content of the time indicator element on the Twitch channel,
 * IF there is a difference in the new text (i.e. on an hour / day rollover).
 */
function lazyUpdateTimeIndicator() {
  let timeIndicator = document.querySelector(".twitch-time-display");

  if (timeIndicator === null) {  // Happens if you go from VODs to livestream.
    setupForChannel(CURRENT_CHANNEL);

  } else {
    const oldFormattedTime = timeIndicator.textContent;
    const newFormattedTime = formatTime(CHANNEL_TIME);

    if (newFormattedTime !== oldFormattedTime) {
      timeIndicator.textContent = newFormattedTime;
    }
  }
}

/**
 * Saves the new time spent watching to sync storage, and calls a UI updater.
 */
function addWatchTime() {
  CHANNEL_TIME += INTERVAL_SECONDS;
  const storingChannelTime = browser.storage.sync.set({ [CURRENT_CHANNEL]: CHANNEL_TIME});
  storingChannelTime.then(lazyUpdateTimeIndicator, onError);
}

/**
 * Checks if there is a video playing.
 * @return {boolean}
 */
function isPlaying() {
  // Not sure if there are ever multiple `video` elements on screen at once,
  // so I just check if there is any playing video.
  let vids = document.querySelectorAll('video');
  for (const vid of vids) {
    if (!vid.paused) {
      return true;
    }
  }
  return false;
}

/**
 * Gets the Twitch channel name if available. Raises an Error if name not found.
 * @return {string} The channel name.
 */
function getChannelName() {
  const channelNameElement = document.querySelector("main .channel-header p");  // Brittle.

  if (channelNameElement) {
    return channelNameElement.textContent.toLowerCase();  // *display* names have capitals, not account names.
  } else {
    throw new Error("Channel name not found.");
  }
}

/**
 * If it can find a channel name, it either:
 * 1. updates the time spent watching
 * 2. sets stuff up for a newly navigated-to channel
 * Otherwise, it resets the `current channel`.
 */
function main() {
  try {
    const channelName = getChannelName();
    if (channelName === CURRENT_CHANNEL) {
      if (isPlaying()) {
        addWatchTime();
      }
    } else {
      setupForChannel(channelName)
    }
  } catch (e) {
    removeTimeIndicator();  // Not sure if needed.
    CURRENT_CHANNEL = "";
  }
}

browser.storage.onChanged.addListener(updateDisplayFormat);
assignDisplayFormat();
window.setInterval(main, 1000 * INTERVAL_SECONDS);
