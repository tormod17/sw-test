const sw = self
if (!sw.indexedDB) {
  console.log("SW IndexedDB is not supported");
} else {
  console.log("SW IndexedDB is supported");
}

const request = sw.indexedDB.open("EXAMPLE_DB", 1);
request.onsuccess = function(event) {
  console.log("[onsuccess]", request.result);
};
request.onerror = function(event) {
  console.log("[onerror]", request.error);
};
request.onupgradeneeded = function(event) {
  const db = event.target.result;
  const store = db.createObjectStore('user_profile', { keyPath: 'id' });
  store.add({id: 1, userId: event.data}).onsuccess = function(event){
      console.log('success adding', event)
    };
};

sw.addEventListener('message', function(event) {
  const db = request.result;
  const transaction = db.transaction("user_profile", "readwrite");
  const userProfileStore = transaction.objectStore('user_profile');

  if (event.data === 'get') {
    userProfileStore.get(1).onsuccess = function(event) {
      console.log('Success getting', event.target.result)
    };
  } else {
    userProfileStore.put({id: 1, userId: event.data}).onsuccess = function(event){
      console.log('success updating', event)
    };
  }


  transaction.onsuccess = function(event) {
    console.log('[Transaction] All Done!!')
  }
  console.log('Handling message event:', event);
});
