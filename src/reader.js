(function(modul){
    var NUMBERS_MAP = {
        "u": 1,
        "un": 1,
        "uno": 1,
        "dos": 2,
        "tres": 3,
        "quatre": 4,
        "cuatro": 4,
        "cinc": 5,
        "cinco": 5,
        "sis": 6,
        "seis": 6,
        "siete": 7,
        "set": 7,
        "vuit": 8,
        "ocho": 8,
        "nou": 9,
        "nueve": 9,
        "diez": 10,
        "deu": 10
    };
    // Check of voice speak support in current browser
    var synth = window.speechSynthesis;
    var supported = synth != null && window.SpeechSynthesisUtterance != null;
    // Check if voice recognition is supported
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    //var SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    var SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
    var supported2 = SpeechRecognition!=null  && SpeechRecognitionEvent!=null;
    IB.supported2 = supported2; 
    var findVoice = function (lang, voices) {
        lang = (lang || "").toLowerCase();
        var k = 0;
        var voice = null;
        var len = (voices || []).length;
        while (k < len && voice == null) { 
            if (voices[k].lang.toLowerCase() == lang) {
                voice = voices[k];
            }
            k++;
        }
        return voice;
    };

    var voices_avail = [];
    var volume_on = true;
    var onVoicesLoaded = function() {
        //Stop voices on page change
        window.addEventListener('unload', function(evt) {
            window.speechSynthesis.cancel();
        });
        voices_avail = window.speechSynthesis.getVoices();
        
        if(IB.SHOW_MUTE_BTN) {
            //Add a mute/play button to stop sounds
            var mainEl = document.querySelector('.no-overflow');
            mainEl.style.position = 'relative';
            if(mainEl) {
                var spanEl = document.createElement("span");
                spanEl.style.position='absolute';
                spanEl.style.right='10px';
                spanEl.style.fontSize='125%';
                spanEl.style.color='lightgray';
                spanEl.style.top='0';
                spanEl.style.cursor='pointer';
                spanEl.title = "Desconnecta la veu";
                var iconEl = document.createElement("i");
                iconEl.classList.add('fas', 'fa-volume');
                spanEl.append(iconEl);
                mainEl.append(spanEl);
                spanEl.addEventListener("click", function(evt){
                    evt.preventDefault();
                    if(volume_on) {
                        window.speechSynthesis.cancel();
                        iconEl.classList.remove('fa-volume');
                        iconEl.classList.add('fa-volume-mute');
                        spanEl.title = "Desconnecta la veu";
                    } else {
                        iconEl.classList.add('fa-volume');
                        iconEl.classList.remove('fa-volume-mute');
                        spanEl.title = "Activa la veu";
                    }
                    volume_on = !volume_on;
                });
            }  
        }
    };

    var langs = ['ca-ES', 'es-ES'];
    modul.reader = function(textMap, attempt){
        attempt = attempt || 0;
        if(!supported || !volume_on) {
            return;
        }
        if(!voices_avail.length) {
            if(attempt < 3) {
                //try latter
                setTimeout(function(){ 
                    modul.reader(textMap, attempt+1);
                }, 800);
            }
            return;
        }  

        var voice = null;
        var lang = null;  
        for(var i=0, len=langs.length; i<len; i++) {
            lang = langs[i];
            voice = findVoice(langs[i], voices_avail);
            if(voice != null) {
                break;
            }
        }
        
        if(!voice || !textMap[lang]) {
            console.error("No voice/text found");
        }

        // stop speak now
        window.speechSynthesis.cancel();
        // create voice player
        var text = textMap[lang];
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        window.speechSynthesis.speak(utterance); 
    };

    modul.speechRecognition = function(cb, lang, continuous) {
        continuous = continuous || false;
        if(!supported2) {
            console.error("Speech recognition not supported");
            cb && cb(null, 0);
            return;
        }
        var recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.start();
        recognition.onresult = function(event) {
            var res = event.results[0][0].transcript; 
            if(res && NUMBERS_MAP[res]) {
                res = ""+ NUMBERS_MAP[res.toLowerCase().trim()];
            }
            var confidence = event.results[0][0].confidence;
            cb && cb(res, confidence);
        };
    };

    if(supported) {
        if ((synth.getVoices() || []).length) {
            onVoicesLoaded();
        } else {
            // wait until the voices have been loaded asyncronously
            synth.addEventListener("voiceschanged", function () {
                onVoicesLoaded();
            });
        }
    } else {
        console.error("Sorry: SpeechSynthesis not supported in browser.");
    } 

})(window.IB);