const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const recognition = new SpeechRecognition();


var closeAfter = false;
var dictationTextArea = document.querySelector('textarea#dictationTextArea');

recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 2;
recognition.started = false;

if (params.mode) {
  if (params.mode == 'search_open') {
      closeAfter = true;
  } else if (params.mode == 'start_dictation') {
      dictationTextArea.style.display = null;
      recognition.continuous = true;
  }
  toggleRecognitionStart(true);
}

function toggleRecognitionStart(turnon) {
  var start = turnon === undefined ? !recognition.started:turnon;
  if (!start) {
    recognition.stop();
    icon.classList.remove('active');
    recognition.started = false;
  } else {
    recognition.start();
    icon.classList.add('active');
    recognition.started = true;
  }
}

window.onblur = function() {
  toggleRecognitionStart(false);
}

recognition.onresult = function(event) {
  var results = event.results;
  if (params.mode && params.mode == 'start_dictation') {
    handleDictation(results);
  } else {
    handleNavigation(results);
  }
}  

function handleDictation(results) {
  var resultString = results[results.length-1][0].transcript.trim();
  var str = dictationTextArea.value;
  if (str[str.length-2] != ',') {
    resultString = resultString.charAt(0).toUpperCase() + resultString.slice(1);
  }
  var lastChar = resultString[resultString.length-1];
  var endPunc = '.,?'.includes(lastChar) ? ' ':'. ';
  dictationTextArea.value += resultString + endPunc;
  return;
}

function handleNavigation(results) {
  let speechResult = results[0][0].transcript;
  console.log('Confidence: ' + results[0][0].confidence);
  var text = speechResult.toLowerCase();
  var matches;

  function performMatch(textInput, regex) {
    matches = textInput.match(regex);
    return matches
  }

  if (performMatch(text, /.*(go to|open|get).*?/)) {
    var wordList = text.split(matches[0])[1].split(" ");
    console.log(wordList);
    var matchArray = [];
    var resources = Object.values(resourceList);
    for (var item of resources) {
      var matchAmt = 0;
      for (var keyword of item.keywords) {
        if (wordList.includes(keyword)) {
          matchAmt += (item.keywords.indexOf(keyword)+1)/item.keywords.length;
        }
      }
      matchArray.push(matchAmt);
    }
    var matchIndex = matchArray.indexOf(Math.max(...matchArray));
    console.log(matchArray);
    if (matchArray[matchIndex]>0) {
      window.open(resources[matchIndex].url, "_blank");
      if (closeAfter) window.close();
    }
  } else if (performMatch(text, /.*search.*google( for| of| with| 4)?/)) {
    var query = text.split(matches[0])[1];
    window.open("https://www.google.com/search?q="+query.replaceAll(" ", "+"), "_blank");
    if (closeAfter) window.close();
  } else if (performMatch(text, /.*search.*(youtube|you tube|u tube)( for| of| with| 4)?/)) {
    var query = text.split(matches[0])[1];
    console.log(query);
    window.open("https://www.youtube.com/" + ((query) ? "results?search_query="+encodeURIComponent(query):""), "_blank");
    if (closeAfter) window.close();
  }
}

recognition.onspeechend = function() {
    if (params.mode != 'start_dictation') {
      toggleRecognitionStart(false);
    }
}


