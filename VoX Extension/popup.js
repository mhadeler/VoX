var resourceList = {};
var nameInput = document.querySelector('input#resourceNameInput');
var keywordInput = document.querySelector('textarea#keywordListInput');
var urlInput = document.querySelector('input#resourceURLInput');
var idInput = document.querySelector('input#resourceIDInput');
var icon = document.querySelector("img.logo-icon");
document.querySelector('button#addResourceButton').onclick = toggleResourceAdd;
document.querySelector('button#resourceBackButton').onclick = resourceBack;
document.querySelector('button#saveResourceButton').onclick = saveResource;

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

if (params.popup_mode == 'true') {
  document.body.setAttribute('popup_mode', 'true');
  icon.classList.add('active');
  if (params.mode && params.mode == 'start_dictation') {
    icon.onclick = function() {
      recognition.start();
      icon.classList.add('active');
    }
  }
} else {
  icon.onclick = function() {
    recognition.start();
    icon.classList.add('active');
  }
}

document.querySelectorAll('div.navTab').forEach((tab) => {
  tab.addEventListener('click', changeTab.bind(tab));
});

chrome.storage.sync.get('resourceList', (result) => {
    if (result.resourceList) {
      resourceList = result.resourceList;
    }
    var keys = Object.keys(resourceList);
    for (var key of keys) {
      addResourceItem(resourceList[key]);
    }
})

function changeTab() {
  var activeTab = this;
  var divID = activeTab.getAttribute('divid');
  document.querySelectorAll('div.navTab').forEach((tab) => {
    tab.classList.remove('active');
  })
  document.querySelectorAll('section.mainContent').forEach((section) => {
    section.classList.remove('active');
  })
  activeTab.classList.add('active');
  document.querySelector(`section#${divID}.mainContent`).classList.add('active');
}

function addResourceItem(resourceInfo) {
  var div = document.createElement('div');
  div.setAttribute('resourceid', resourceInfo.id);
  div.className = 'resource';
  div.innerHTML = `
    <h2 class="resourceNameText">${resourceInfo.name}</h2>
    <div class="actionButtonDiv">
        <button class="resourceButton edit">Edit</button>
        <button class="resourceButton delete">Delete</button>
    </div>
  `;
  var newResource = document.querySelector('div#resourceItemContainer').appendChild(div);
  newResource.querySelector('button.resourceButton.edit').onclick = editResource.bind(newResource);
  newResource.querySelector('button.resourceButton.delete').onclick = deleteResource.bind(newResource);
}

function toggleResourceAdd() {
  document.querySelector('div#addResourcePage').classList.toggle('active');
  document.querySelector('div#resourceListPage').classList.toggle('active');
}

function resourceBack() {
  setInputs();
  toggleResourceAdd();
}

function editResource() {
  var resourceID = this.getAttribute('resourceid');
  setInputs(resourceID);
  toggleResourceAdd();
}

function deleteResource() {
  var conf = confirm('Arey ou sure you want to delete this resource?');
  if (!conf) return; 
  var resourceID = this.getAttribute('resourceid');
  delete resourceList[resourceID];
  saveResourceList();
  document.querySelector(`div.resource[resourceid="${resourceID}"]`).remove();
}

function setInputs(id) {
  nameInput.value = id ? resourceList[id].name:'';
  keywordInput.value = id ? resourceList[id].keywords.join(', '):'';
  urlInput.value = id ? resourceList[id].url:'';
  idInput.value = id ? resourceList[id].id:'';
}

function getInputs() {
  var resourceObj = {
    name: nameInput.value.trim(),
    url: urlInput.value.trim(),
    keywords: keywordInput.value.toLowerCase().split(',').map((r) => {return r.trim()}),
    id: idInput.value
  }
  return resourceObj    
}

function saveResource() {
  var resourceObj = getInputs();
  setInputs();
  if (!resourceObj.id) {
    resourceObj.id = generateRandomID();
    addResourceItem(resourceObj);
  }
  resourceList[resourceObj.id] = resourceObj;
  document.querySelector(`div.resource[resourceid="${resourceObj.id}"] h2.resourceNameText`).innerText = resourceObj.name;
  saveResourceList();
  toggleResourceAdd();
}

function saveResourceList() {
  chrome.storage.sync.set({'resourceList':resourceList});
}

function generateRandomID() { 
  var charString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var uniqueID = "";
  uniqueID += charString[Math.floor(Math.random()*52)];
  for (var i=0; i<10; i++) {
      uniqueID += charString[Math.floor(Math.random()*62)];
  }
  uniqueID += charString[Math.floor(Math.random()*52)];
  return uniqueID
}



const infoPages = {
  about: {
    page_name: 'About VoX',
    page_text: `
    VoX is an extension to help you quickly open resources or search Google and YouTube by utilizing voice recognition. 
    It can also convert long messages into text for easy copying and pasting in to other places. 
    Make sure you have a microphone and the volume is turned up!
    `
  },
  shortcut_keys: {
    page_name: 'Shortcut Keys',
    page_text: `
    The default keys are as follows:<br>
    <br>
    To search YouTube/Google or open a custom resource:<br>
    <b>Crtl + Shift + Space</b><br>
    <br>
    To begin open the dictation window and begin recording:<br>
    <b>Ctrl + Shift + Period</b><br>
    <br>
    You can reassign the default keys by going to chrome://extensions/shortcuts<br>
    `
  },
  searching_google: {
    page_name: 'Searching Google',
    page_text: `
    To perform a Google search with your voice, simply press the search shortcut key pattern and say "Search Google for...."
    You can also press the microphone icon on the top left.<br>
    <br>
    Examples:<br>
    "Search Google for ice cream shops near me"<br>
    "Search Google for the time in India"<br>
    `
  },
  searching_youtube: {
    page_name: 'Searching YouTube',
    page_text: `
    To perform a YouTube search with your voice, simply press the search shortcut key pattern and say "Search YouTube for...."
    You can also press the microphone icon on the top left.<br>
    <br>
    Examples:<br>
    "Search YouTube for funny cat videos"<br>
    "Search YouTube DIY projects"<br>
    `
  },
  opening_custom_resources: {
    page_name: 'Opening Custom Resources',
    page_text: `
    To open custom resources, you must first add some on the Resources tab up top. 
    Then, simply press the shortcut key pattern and say "go to", "open", or "get", followed by some of the main keywords you added for the resource.
    You can also press the microphone icon on the top left.<br>
    <br>
    Examples:<br>
    "Go to my Google email"<br>
    "Open the chores spreadsheet"<br>
    "Get my calendar"<br>    
    `
  },
  adding_resources: {
    page_name: 'Adding Custom Resources',
    page_text: `
    To add a custom resource, go to the Resources tab up top, and click on "Add New Resource". 
    You will need to fill out the following inputs:<br>
    <br>
    <b>Resource Name:</b><br>
    This is the name of the resource that is shown in the interface. 
    It is NOT used for voice recognition, so feel free to name it whatever you like, as long as you know what it is.<br>
    <br>
    <b>Resource URL:</b><br>
    This is the URL (website link) of the resource that you would like to open.<br>
    <br>
    <b>Keywords:</b><br>
    This is the most important section, and some though needs to be put into the list. 
    See the section on adding keywords for more info.<br>  
    `
  },
  adding_keywords: {
    page_name: 'Adding Keywords',
    page_text: `
    Keywords are the words that the voice recognition will use to identify which resource you wish to open.
    They are <b style="color: lightcoral">comma-separated</b> and <b style="color: lightcoral">weighted by importance</b> from <b style="color: lightcoral">least to most</b> important. 
    This is done so that multiple resources can share some of the same keywords.<br>
    <br> 
    For instance, you might want to add a calendar app, and also a calendar spreadsheet.
    Both would have "Calendar" as a keyword, but the word "Spreadsheet" would push the voice recognition algorithm towards that resource.
    You may even decide to have multiple spreadsheets as resources, in which case you would want to weigh the more descriptive words more heavily.<br>
    <br>
    You may want to try adding variations of the same word to your keyword list, for instance, you might add "sheet", "sheets", "spreadsheet", and "spreadsheets".
    You might even occasionally need to incorporate other interpretations and pronunciations of the word you are trying to match, for instance "4", "for", and "four", "fer". 
    This can depend heavily on your accent and how fast you speak.<br>      
    `
  },
  dictation_mode: {
    page_name: 'Dictation Mode',
    page_text: `
    Dictation mode provides a pop-up window where you can simply speak and all of your words will get copied to a text area within the popup window.
    This is useful if you have a lot of things to write and you feel that it would be faster to simply speak it. 
    You can click the microphone icon to append more text into the text box.
    When you are through, you can simply copy and paste the text anywhere you like.<br> 
    `
  }
}

addInfoPages();
function addInfoPages() {
  for (var key of Object.keys(infoPages)) {
    createInfoPageButton(key);
    createInfoPage(key);
  }
}

function createInfoPageButton(key) {
  var div = document.createElement('div');
  div.className = 'infoPageButton';
  div.setAttribute('divid', key);
  div.innerText = infoPages[key].page_name;
  var newButton = document.querySelector('div.infoMainContainer.home').appendChild(div);
  newButton.addEventListener('click', openInfoPage.bind(key));
}

function createInfoPage(key) {
  var div = document.createElement('div');
  div.className = 'infoMainContainer';
  div.id = key;
  div.innerHTML = `
    <button class="resourceButton infoBackButton">Back</button>
    <div class="infoHeader">${infoPages[key].page_name}</div>
    <div class="infoText">${infoPages[key].page_text}</div>
  `;
  div.querySelector('button.infoBackButton').addEventListener('click', backToMainInfo.bind(key));
  document.querySelector('section#extensionInfo.mainContent').appendChild(div);

}

function openInfoPage() {
  var key = this;
  document.querySelector('div.infoMainContainer.home').classList.remove('active');
  document.querySelector(`div#${key}.infoMainContainer`).classList.add('active');
}

function backToMainInfo() {
  var key = this;
  document.querySelector('div.infoMainContainer.home').classList.add('active');
  document.querySelector(`div#${key}.infoMainContainer`).classList.remove('active');  
}
