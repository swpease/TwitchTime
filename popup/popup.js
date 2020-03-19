function onError(error) {
  console.log(error);
}


// Setting up the table of channels and times watched

/**
 * Converts time in seconds to the following form:
 * [d*]d:hh:mm
 * @param {number} time - Time, in seconds.
 * @return {string} A formatted time string.
 */
function formatTime(time) {
  let formattedTime = "";

  const timeInHours = Math.floor(time / 3600);
  const days = Math.floor(timeInHours / 24);
  const hours = timeInHours % 24;
  const timeInMinutes = Math.floor(time / 60);
  const minutes = timeInMinutes % 60;

  const formattedDays = days === 0 ? "" : `${days}:`;
  const formattedHours = hours < 10 ? `0${hours}:` : `${hours}:`;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  formattedTime += formattedDays + formattedHours + formattedMinutes;

  return formattedTime;
}

/**
 * For calling by storage get.
 * Currently establishes a cut-off of 30 minutes minimum to display the channel.
 */
function populateTable(data) {
  let dataList = [];
  for (let [k, v] of Object.entries(data)) {
    dataList.push({ name: k, time: v });
  }

  const reservedWords = ["friends", "subscriptions", "inventory",
                         "payments", "settings", "displayFormat",
                         "videos", "p", "random facts",
                         "directory", "downloads", "jobs",
                         "turbo", "darkThemeMode"];
  let channels = dataList.filter(datum => !reservedWords.includes(datum.name));
  let topChannels = channels.filter(datum => datum.time > 1800);  // TODO: options besides 30 mins?
  topChannels.sort((a, b) => b.time - a.time);

  let timeTable = document.getElementById("time-table");
  for (const channel of topChannels) {
      let row = timeTable.insertRow(-1);
      let channelCell = row.insertCell(0);
      let timeCell = row.insertCell(1);

      let link = document.createElement("a");
      link.href = "https://twitch.tv/" + channel.name;
      link.innerText = channel.name;

      channelCell.appendChild(link);
      timeCell.innerText = formatTime(channel.time);
  }
}


/* Deleting a channel
  User types in a channel. If it exists, it is deleted from storage and the
  displayed table. The text input is cleared regardless.
*/

function onRemoveError(error) {
  e.preventDefault();
  document.querySelector("#chan-to-delete").value = "";
}

function onRemoved() {
  let textInput = document.querySelector("#chan-to-delete");
  const channel = textInput.value.toLowerCase();

  let rows = document.querySelectorAll("tr");
  for (let row of rows) {
    if (row.children[0].textContent == channel) {
      row.remove();
    }
  }

  document.querySelector("#chan-to-delete").value = "";
}

function deleteChannel(e) {
  e.preventDefault();

  const channel = document.querySelector("#chan-to-delete").value.toLowerCase();
  let removeChannel = browser.storage.sync.remove(channel);
  removeChannel.then(onRemoved, onRemoveError);
}


// Opening options

function onOpened() {
  console.log(`Options page opened`);
}

function openOptions(event) {
  var opening = browser.runtime.openOptionsPage();
  opening.then(onOpened, onError);
}

function toggleTheme() {
  console.log("Switching themes");
  if (document.documentElement.hasAttribute('theme')) {
      document.documentElement.removeAttribute('theme');
      browser.storage.sync.set({darkThemeMode: false});
  } else {
      document.documentElement.setAttribute('theme', 'dark');
      browser.storage.sync.set({darkThemeMode: true});
  }

}

function setTheme(theme) {
    if (theme.darkThemeMode)
      document.documentElement.setAttribute('theme', 'dark');
    else
      document.documentElement.removeAttribute('theme');

}


// "main"

document.querySelector("#options").addEventListener("click", openOptions);
document.querySelector("form").addEventListener("submit", deleteChannel);
document.querySelector("#theme_toggle").addEventListener("click", toggleTheme);
browser.storage.sync.get({darkThemeMode: false}).then(setTheme, onError);
browser.storage.sync.get().then(populateTable, onError);
