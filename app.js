if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    // Wait until the service worker is active.
    .then(function() {
      console.log("browser supports service worker");
      return navigator.serviceWorker.ready;
    })
    // ...and then show the interface for the commands once it's ready.
    .then()
    .catch(function(error) {
      // Something went wrong during registration. The service-worker.js file
      // might be unavailable or contain a syntax error.
      console.error(error);
    });
} else {
  console.log("browser does not support service worker");
}
function sendMessage() {
  const message = window.prompt();
  console.log("send message", message);
  // This wraps the message posting/response in a promise, which will resolve if the response doesn't
  // contain an error, and reject with the error if it does. If you'd prefer, it's possible to call
  // controller.postMessage() and set up the onmessage handler independently of a promise, but this is
  // a convenient wrapper.
  return new Promise(function(resolve, reject) {
    var messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function(event) {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    // This sends the message data as well as transferring messageChannel.port2 to the service worker.
    // The service worker can then use the transferred port to reply via postMessage(), which
    // will in turn trigger the onmessage handler on messageChannel.port1.
    // See https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
    navigator.serviceWorker.controller.postMessage(message, [
      messageChannel.port2
    ]);
  });
}

if (!window.indexedDB) {
  console.log("Window IndexedDB is not supported");
} else {
  console.log("Window IndexedDB is supported");
}

function updateIndexDb() {
  const request = window.indexedDB.open("EXAMPLE_DB", 1);
  request.onsuccess = function(event) {
      const db = request.result;
      const transaction = db.transaction("user_profile", "readwrite");
      const userProfileStore = transaction.objectStore("user_profile");
      const message = window.prompt();
      if (message === "get") {
        userProfileStore.get(1).onsuccess = function(event) {
          console.log("Success getting", event.target.result);
        };
      } else {
        userProfileStore.put({id: 1, userId: message}).onsuccess = function(
          event
        ) {
          console.log("success adding", event);
        };
      }
  };
  request.onerror = function(event) {
    console.log("[onerror]", request.error);
  };
  request.onupgradeneeded = function(event) {
    const db = event.target.result;
    const store = db.createObjectStore("user_profile", {keyPath: "id"});
  };

}
