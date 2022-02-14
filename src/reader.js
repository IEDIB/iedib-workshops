(function(modul){
    // Check of voice support in current browser
    var synth = window.speechSynthesis;
    var supported = synth != null && window.SpeechSynthesisUtterance != null;


    var findVoice = function (lang, voices) {
        lang = (lang || "").toLowerCase();
        var k = 0;
        var voice = null;
        var len = (voices || []).length;
        while (k < len && voice == null) {
            console.error("Compare", voices[k], lang);
            if (voices[k].lang.toLowerCase() == lang) {
                voice = voices[k];
            }
            k++;
        }
        return voice;
    };

    var voices_avail = [];
    var onVoicesLoaded = function() {
        //Stop voices on page change
        window.addEventListener('unload', function(evt) {
            window.speechSynthesis.cancel();
        });
        voices_avail = window.speechSynthesis.getVoices();
        //Trigger queue
    };

    var langs = ['ca-ES', 'es-ES'];
    modul.reader = function(textMap, attempt){
        attempt = attempt || 0;
        if(!supported) {
            return;
        }
        if(!voices_avail.length) {
            if(attempt < 3) {
                //try latter
                setTimeout(function(){
                    console.log(voices_avail, "trying latter...", attempt);
                    modul.reader(textMap, attempt+1);
                }, 800);
            }
            return;
        }  

        var voice = null;
        var lang = null; 
        console.error(voices_avail);
        for(var i=0, len=langs.length; i<len; i++) {
            lang = langs[i];
            console.error(lang);
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