const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const recognition = new SpeechRecognition();


var closeAfter = false;
var dictationTextArea = document.querySelector('textarea#dictationTextArea');

if (params.mode) {
    recognition.start();
    if (params.mode == 'search_open') {
        closeAfter = true;
    } else if (params.mode == 'start_dictation') {
        dictationTextArea.style.display = null;
    }
}

recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 2;



recognition.onresult = function(event) {
  let speechResult = event.results[0][0].transcript;

  console.log(event.results);
  console.log('Confidence: ' + event.results[0][0].confidence);
  
  var text = speechResult.toLowerCase();
  var matches;

  function performMatch(textInput, regex) {
    matches = textInput.match(regex);
    return matches
  }

  if (params.mode && params.mode == 'start_dictation') {
    dictationTextArea.value = speechResult;
    return;
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
    icon.classList.remove('active');
    recognition.stop();
}    

