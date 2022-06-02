(function () {

    var reflowLatex = function () {
        if (window.MathJax) {
            window.MathJax.typesetPromise && window.MathJax.typesetPromise();
            window.MathJax.Hub && window.MathJax.Hub.Queue &&
                window.MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        }
    };

    var pad2 = function(e) {
        if(e<10) {
            return "0"+e;
        }
        return e;
    };

    var bl = "\\" + "(";
    var el = "\\" + ")";

    var turns = 0;
    var $girs = $("#voltes");
    var $crono = $("#comptador");
    $girs.html("&nbsp;" + turns + "&nbsp;");
    var confetti = null;
    var cronoInterval = null;

    var Memory = {

        init: function (cards) {
            this.$game = $(".fc_game");
            this.$modal = $(".modal");
            this.$overlay = $(".modal-overlay");
            this.$restartButton = $("button.restart");
            this.$restartButton.hide();
            this.$startButton = $("button.start");
            this.$startButton.on("click", this.onGameStart);
            this.allCards = cards;
            this.cardsArray = cards;
            this.playing = false;
            this.seconds = 0;
            this.shuffleCards();
            this.setup();
        },

        shuffleCards: function () {
            // Limit to 8 pairs
            var pairs = this.allCards.length / 2;
            var ids = [];
            for (var i = 1; i <= pairs; i++) {
                ids.push(i);
            }
            // Shuffle the id's that we are considering
            ids = this.shuffle(ids);
            // take up to 8 pairs

            this.cardsArray = [];
            for (var i = 0; i < 6; i++) {
                var id = ids[i];
                for (var j = 0; j < 2 * pairs; j++) {
                    var ca = cards[j];
                    if (ca.id == id) {
                        this.cardsArray.push(ca);
                    }
                }
            }
            this.cardsArray = this.shuffle(this.cardsArray);
            this.$cards = $(this.cardsArray);
        },

        setup: function () {
            this.html = this.buildHTML();
            this.$game.html(this.html);
            reflowLatex();
            this.$memoryCards = $(".carta");
            this.paused = false;
            this.guess = null;
            this.binding();
        },

        binding: function () {
            this.$memoryCards.on("click", this.cardClicked);
            this.$restartButton.on("click", $.proxy(this.reset, this));
        },
        showModal: function (id) {
            var _ = Memory;
            var feedback = "";
            var enunciat = "";
            var solucio = "";
            for (var i = 0, len = _.cardsArray.length; i < len; i++) {
                var ca = _.cardsArray[i];
                if (ca.id == id && ca.feed) {
                    feedback = ca.feed || "";
                    enunciat = ca.desc || "";
                }
                if (ca.id == id && !ca.feed) {
                    solucio = ca.desc || "";
                }
            }
            if (feedback) {
                $('#enunciat_modal').html(enunciat);
                $('#retroaccio_modal').html(feedback);
                $('#solucio_modal').html(solucio);
                reflowLatex();
                $('#exampleModal').modal('show');
            }
        },
        // kinda messy but hey
        cardClicked: function () {
            var _ = Memory;
            if (!_.playing) {
                return;
            }
            var $card = $(this);
            if (!_.paused && !$card.find(".inside").hasClass("matched") && !$card.find(".inside").hasClass("picked")) {
                $card.find(".inside").addClass("picked");
                if (!_.guess) {
                    // Selecció de la primera carta
                    _.guess = $(this);
                    turns += 1;
                    $girs.html("" + turns + "&nbsp;");

                } else if (_.guess.attr("data-id") == $(this).attr("data-id") && !$(this).hasClass("picked")) {
                    $(".picked").addClass("matched");
                    var id = _.guess.attr("data-id");
                    _.showModal(id);
                    _.guess = null;
                } else {
                    _.guess = null;
                    _.paused = true;
                    setTimeout(function () {
                        $(".picked").removeClass("picked");
                        Memory.paused = false;
                    }, 600);
                }
                if ($(".matched").length == $(".carta").length) {
                    _.win();
                }
            }
        },

        win: function () {
            var _ = Memory;
            this.paused = true;
            if (!confetti && window.Confetti) {
                var container = document.querySelector(".fc_wrap");
                confetti = new Confetti(container);
            }
            if (confetti) {
                confetti.play();
            }
            setTimeout(function () {
                _.$restartButton.hide();
                _.$startButton.show();
                if (cronoInterval) {
                    clearInterval(cronoInterval);
                    cronoInterval = null;
                }
                $crono.html("");
                _.reset();
            }, 1000);
        },

        onGameStart: function (ev) {
            var _ = Memory;
            // start crono
            if (cronoInterval != null) {
                clearInterval(cronoInterval);
            }
            _.seconds = 0;
            cronoInterval = window.setInterval(function () {
                _.seconds += 1;
                var totalSeconds = _.seconds;
                var hours = Math.floor(totalSeconds / 3600);
                totalSeconds %= 3600;
                var minutes = Math.floor(totalSeconds / 60);
                var seconds = totalSeconds % 60;
                $crono.html(pad2(hours) + ":" + pad2(minutes) + ":" + pad2(seconds));
            }, 1000);
            //uncover all cards
            _.$startButton.hide();
            $(".carta > .inside.picked").removeClass('picked');
            _.playing = true;
            _.$restartButton.show();
        },
        reset: function (ev) {
            var _ = Memory;
            _.$restartButton.show();
            _.$startButton.show();
            turns = 0;
            $girs.html("&nbsp;" + turns + "&nbsp;");
            if (ev && ev.preventDefault) {
                ev.preventDefault();
            }
            //$('#exampleModal').modal('hide');
            this.shuffleCards(this.cardsArray);
            this.setup();
            this.$game.show("slow");
        },

        // Fisher--Yates Algorithm -- https://bost.ocks.org/mike/shuffle/
        shuffle: function (array) {
            var counter = array.length, temp, index;
            // While there are elements in the array
            while (counter > 0) {
                // Pick a random index
                index = Math.floor(Math.random() * counter);
                // Decrease counter by 1
                counter--;
                // And swap the last element with it
                temp = array[counter];
                array[counter] = array[index];
                array[index] = temp;
            }
            return array;
        },

        buildHTML: function () {
            turns = 0;
            $girs.html("&nbsp;" + turns + "&nbsp;");
            var frag = '';
            this.$cards.each(function (k, v) {
                frag += '<div class="carta" data-id="' + v.id + '"><div class="inside picked">\
               <div class="back">'+ v.desc + '</div>\
               <div class="front"><img src="https://piworld.es/iedib/img/IEDIB.png"\
               alt="IEDIB" /></div></div>\
               </div>';
            });
            return frag;
        }
    };

    var cards = [
        {
            id: 1,
            desc: "Una recta que té pendent " + bl + "2" + el + " i que passa pel punt " + bl + "(-1, -1)" + el,
            feed: "Si sabem un punt i el pendent, podem escriure l'equació punt-pendent " + bl + "y+1=2(x+1)" + el + " i operant arribam a l'explícita " + bl + "y=2x+1" + el + "."
        },
        {
            id: 1,
            desc: "" + bl + "y=2x+1" + el
        },
        {
            id: 2,
            desc: "Un vector normal a la recta " + bl + "-x+2y+1=0" + el,
            feed: "El vector normal d'una recta expressada en forma general són directament els coeficients que acompanyen a la x i la y."
        },
        {
            id: 2,
            desc: "" + bl + "\\vec v(-1,2)" + el
        },
        {
            id: 3,
            desc: "Un vector director de la recta " + bl + "y=\\dfrac{1}{2}x-1" + el,
            feed: "De l'equació explícita sabem que el pendent és " + bl + "m=\\dfrac{1}{2}" + el + ", aleshores per cada 2 unitats que avançam en x, en pujam 1. Expressat com un vector és " + bl + "(2,1)" + el + "."
        },
        {
            id: 3,
            desc: "" + bl + "\\vec v(2,1)" + el
        },
        {
            id: 4,
            desc: "Un vector director de la recta " + bl + "(x,y)=(-1,0)+t(1,2)" + el,
            feed: "El vector director en una recta en forma vectorial apareix multiplicant al paràmetre. En aquest cas " + bl + "(1,2)" + el
        },
        {
            id: 4,
            desc: "" + bl + "\\vec v(1,2)" + el
        },
        {
            id: 5,
            desc: "Una recta paral·lela a " + bl + "\\dfrac{x+2}{1}=\\dfrac{y}{-1}" + el,
            feed: "D'aquesta recta en forma contínua, obtenim el vector director dels denominadors " + bl + "\\vec d (1,-1)" + el + ". D'aquest vector director calculam el pendent " + bl + "m=-1" + el + ". Llavors, ha d'ésser una recta que en forma explícita comenci per " + bl + "y=-x+\\cdots" + el + "."
        },
        {
            id: 5,
            desc: "" + bl + "y=-x+2" + el
        },
        {
            id: 6,
            desc: "El resultat de l'operació " + bl + "2\\vec{u}-3\\vec{v}" + el + " essent " + bl + "\\vec{u}(-1,3)" + el + " i " + bl + "\\vec{v}(-1,2)" + el,
            feed: "En primer lloc multiplicam els escalars pels vectors " + bl + "2(-1,3)-3(-1,2)=(-2,6)-(-3,6)" + el + ". Finalment, efectuam la resta de vectors i trobam " + bl + "\\vec v(1,0)" + el + ". El resultat és un vector."
        },
        {
            id: 6,
            desc: "" + bl + "\\vec v(1,0)" + el
        },
        {
            id: 7,
            desc: "Un vector perpendicular al segment d'extrems " + bl + "A=(3,-2)" + el + " i " + bl + "B=(2,-1)" + el,
            feed: "En primer lloc determinam el vector fix " + bl + "\\vec{AB}=(-1,1)" + el + " que serà el vector director del segment. Per trobar un vector perpendicular a aquest, giram l'ordre de les components i canviam un únic signe."
        },
        {
            id: 7,
            desc: "" + bl + "\\vec v(1,1)" + el
        },
        {
            id: 8,
            desc: "Un vector que tengui igual direcció a " + bl + "(12,-8)" + el + " però sentit oposat",
            feed: "Si dividim el vector entre l'escalar " + bl + "-4" + el + " trobam el vector " + bl + "\\vec v(-2,3)" + el + ". Atès que el factor és negatiu, assegura que tenen igual direcció i sentit contraris."
        },
        {
            id: 8,
            desc: "" + bl + "\\vec v(-2,3)" + el
        },
        {
            id: 9,
            desc: "L'equació de la recta que passa pels punts " + bl + "A=(0,0)" + el + " i " + bl + "B=(2,3)" + el,
            feed: "En primer lloc determinam el vector fix " + bl + "\\vec{AB}=(2,3)" + el + " que serà el vector director de la recta. En forma contínua aquest vector apareix en els denominadors de l'equació."
        },
        {
            id: 9,
            desc: "" + bl + "\\dfrac{x}{2}=\\dfrac{y}{3}" + el
        },
        {
            id: 10,
            desc: "Un vector de mòdul 5",
            feed: "El mòdul d'un vector és l'arrel quadrada de la suma de les seves components al quadrat. " + bl + "\\vec v|=\\sqrt{3^2+(-4^2)}=\\sqrt{25}=5" + el + "."
        },
        {
            id: 10,
            desc: "" + bl + "\\vec v(3,-4)" + el
        },
        {
            id: 11,
            desc: "Una recta perpendicular a " + bl + "x+y+2=0" + el,
            feed: "De l'equació general de la recta és fàcil obtenir el seu vector normal " + bl + "\\vec n(1,1)" + el + " (coeficients de x i y). La recta que es perpendicular a la donada tindrà com a vector director el mateix vector normal o qualsevol proporcional a ell. Fixem-nos que el vector " + bl + "(2,2)" + el + " és proporcional a " + bl + "(1,1)" + el + " per un factor 2."
        },
        {
            id: 11,
            desc: "" + bl + "(x,y)=(-1,0)+t(2,2)" + el
        },
        {
            id: 12,
            desc: "El resultat de l'operació " + bl + "\\vec{a}\\cdot \\left( \\vec{b} + \\vec{c}\\right)" + el + " essent " + bl + "\\vec{a}(2,-1)" + el + ", " + bl + "\\vec{b}(2,1)" + el + ", " + bl + " \\vec{c}(-3,-2)" + el,
            feed: "En primer lloc efectuam la suma de vectors " + bl + "(2,-1)\\cdot (-1,-1)" + el + ". A continuació feim el producte escalar " + bl + "(2,-1)\\cdot (-1,-1)=-2+(-1)\\cdot(-1)=-2+1=-1" + el + ". El resultat és un escalar."
        },
        {
            id: 12,
            desc: "L'escalar " + bl + "-1" + el
        }
    ];


    Memory.init(cards);


})();