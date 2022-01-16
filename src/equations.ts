 
(function() {

    var Rational = function(a, b) {
        if(b==null) {
            b = 1;
        }
        this.a = a;
        this.b = b;
    };
    Rational.render = function(container) {
        if(this.b == 1) {
            var span = document.createElement("span");
            span.innerHTML = "" + this.a;
            container.appendChild(span);
        } else {
            var spanNum = document.createElement("span");
            spanNum.innerHTML = "" + this.a;
            var spanDen = document.createElement("span");
            spanDen.innerHTML = "/" + this.b;
            container.appendChild(spanNum);
            container.appendChild(spanDen);
        }
    };

    // TODO LTerm with rational*([List of PTerm])

    // rational*(power)
    // poly is a list of Term
    var PTerm = function(num, literal, degree) {
        this.sign = (num+"").indexOf("-") >= 0?-1:1;
        if(typeof(num)==="string") {
            num = num.replace("-","");
            if(num.indexOf("/")>0) {

            }
        }
        this.coef = new Rational(a, b);
        this.literal = literal;
        this.degree = degree || 0;
        if(!this.literal) {
            this.degree = 0;
        }
    };
    PTerm.x = function() {
        return new PTerm(1, "x", 1);
    };
    PTerm.prototype.render = function(container) {
 
    };

    var EquationMember = function() {
        this.den = 1;    //Future compatibilty (unused)
        this.terms = []; //List of terms
    };

    var Equation = function() {
        this.ans = Rational(0);
        this.lhs = new EquationMember();
        this.rhs = new EquationMember();
    };
    Equation.prototype.generate = function(level) {
        if(!level) {
            level = 1;
        }
        if(level == 1) {
            // x + a = b
            var a = randint();
            var b = randint();
            this.ans = b - a;
            this.lhs.terms.push(PTerm.x());
            this.lhs.terms.push(new PTerm(a));
            this.rhs.terms.push(new PTerm(b));
        } else if(level == 2) {

        } else if(level == 3) {
            
        }
    };
    Equation.prototype.render = function(container) {
        container.innerHTML = "";
        for(var i=0; i < this.lhs.terms.length; i++) {
            var term = this.lhs.terms[i];
            container.appendChild(term.render());
        }
        var eqSymb = document.createElement("span");
        eqSymb.innerHTML = " = ";
        container.appendChild(eqSymb);
        for(var i=0; i < this.rhs.terms.length; i++) {
            var term = this.rhs.terms[i];
            container.appendChild(term.render());
        }
    };

})();