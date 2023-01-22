

chrome.commands.onCommand.addListener((command) => {
    switch(command) {
        case 'start_dictation':
            startDictation();
            break;
        case 'search_open':
            searchOpen()
            break;
        default:
            break;
    }
})

function startDictation() {
    chrome.windows.create({
        focused: true,
        width: 400,
        height: 500,
        type: 'popup',
        url: 'popup.html?popup_mode=true&mode=start_dictation', 
        top: 0,
        left: 0
    },
    () => {});
}

function searchOpen() {
    chrome.windows.create({
        focused: true,
        width: 125,
        height: 150,
        type: 'popup',
        url: 'popup.html?popup_mode=true&mode=search_open', 
        top: 0,
        left: 0
    },
    () => {});
}

