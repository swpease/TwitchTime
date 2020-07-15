/**
 * Saves the preferred format for what is displayed on the Twitch webpage.
 */
function saveDisplayFormat(e) {
  browser.storage.local.set({
    displayFormat: document.querySelector("#tt-display").value
  });

  e.preventDefault();
}

/**
 * Sets the <select> to the current saved format.
 */
function restoreDisplayFormat() {
  let gettingFormat = browser.storage.local.get({ displayFormat: "watched-dh" });

  gettingFormat.then((res) => {
    document.querySelector("#tt-display").value = res.displayFormat;
  }, (error) => {
    console.log(`Error: ${error}`);
  });
}

document.addEventListener('DOMContentLoaded', restoreDisplayFormat);
document.querySelector("form").addEventListener("submit", saveDisplayFormat);
