function onError(error) {
    console.log(error);
}

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

  const reservedWords = ["displayFormat"];
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

function onOpened() {
  console.log(`Options page opened`);
}

function openOptions(event) {
  var opening = browser.runtime.openOptionsPage();
  opening.then(onOpened, onError);
}

document.querySelector("button").addEventListener("click", openOptions);
browser.storage.sync.get().then(populateTable, onError);
