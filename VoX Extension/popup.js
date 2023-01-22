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
      toggleRecognitionStart();
    }
  }
} else {
  icon.onclick = function() {
    toggleRecognitionStart();
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
  missingResources(true);  
  toggleResourceAdd();
}

function editResource() {
  var resourceID = this.getAttribute('resourceid');
  setInputs(resourceID);
  toggleResourceAdd();
}

function deleteResource() {
  var conf = confirm('Are you sure you want to delete this resource?');
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
    keywords: keywordInput.value ? keywordInput.value.toLowerCase().split(',').map((r) => {return r.trim()}):undefined,
    id: idInput.value
  }
  return resourceObj    
}

function missingResources(clear) {
  var bdr = clear ? null:'2px solid red';
  nameInput.style.border = nameInput.value ? null:bdr;
  keywordInput.style.border = keywordInput.value ? null:bdr;
  urlInput.style.border = urlInput.value ? null:bdr;
}

function saveResource() {
  var resourceObj = getInputs();
  missingResources();
  console.log(resourceObj);
  if (!resourceObj.name || !resourceObj.url || !resourceObj.keywords) {
    return;
  }
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
    <div class="infoHeaderContainer">
      <button class="resourceButton infoBackButton">Back</button>
      <div class="infoHeader">${infoPages[key].page_name}</div>
    </div>
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
