// Saves options to chrome.storage
function save_options() {
    var address = document.getElementById('address').value;

    chrome.storage.sync.set({
        address: address

    }, function () {
        // Update status to let user know options were saved.
        console.log('Options saved.');
    });
}
// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        address: 'http://localhost:6600/',

    }, function (items) {
        document.getElementById('address').value = items.address;

    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);