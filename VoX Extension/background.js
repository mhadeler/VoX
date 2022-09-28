

chrome.commands.onCommand.addListener((command) => {
    switch(command) {
        case 'start_dictation':
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
              break;
        case 'search_open':
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
              break;
        default:
            break;
    }
})

