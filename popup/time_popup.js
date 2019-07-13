function sortHostsByTime(channels) {
    var n = channels.length;
    for(i = 0; i < n - 1; i++) {
        for(k = 0; k < n - i - 1; k++) {
            if(channels[k].time < channels[k+1].time) {
                var tmp = channels[k];
                channels[k] = channels[k+1];
                channels[k+1] = tmp;
            }
        }
    }
    return channels;
}

function calcTime(time) {
  const timeInMinutes = Math.floor(time/60);
  const timeInHours = Math.floor(time / 3600);

  const days = Math.floor(timeInHours / 24);
  const hours = timeInHours % 24;
  const minutes = timeInMinutes % 60;

  var time = {
      days : days,
      hours : hours,
      minutes : minutes
  };

  return time;
}

function updateTimeTable(items) {
    var channelList = [];
    var timeTable = document.getElementById("timeTable");
    Object.keys(items).forEach(function(key, index, keys) {
        let time = items[keys[index]];
        var channel = {name: key, time: time};
        channelList.push(channel);
    });

    channelList = sortHostsByTime(channelList);
    channelList.forEach(function(channel) {
        var row = timeTable.insertRow(-1);
        var channelCell = row.insertCell(0);
        var timeCell = row.insertCell(1);

        let link = document.createElement("a");
        link.href = "https://twitch.tv/" + channel.name;
        link.innerHTML = channel.name;

        channelCell.appendChild(link);
        var time = calcTime(channel.time);
        timeCell.innerHTML = time.days + "d " + time.hours + "h " + time.minutes + "m";
    });
}

function onError(error) {
    console.log(error);
}

browser.storage.sync.get(null).then(updateTimeTable, onError);
