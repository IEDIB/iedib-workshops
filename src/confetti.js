(function () {
    
        var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                 window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    
        window.requestAnimationFrame = requestAnimationFrame;
       
        var randomRange = function (min, max) {
           return Math.random() * (max - min) + min;
        };
   
       window.Confetti = function (container) {
           this.container = container;
           this.container.style.position = "relative";
           this.canvas = document.createElement("canvas");
           this.canvas.classList.add("confetti-canvas");
           this.container.appendChild(this.canvas);
           this.ctx = this.canvas.getContext("2d");
           var bb = this.container.getBoundingClientRect();
           this.canvas.width = bb.width;
           this.canvas.height = bb.height;
           this.cx = this.ctx.canvas.width / 2;
           this.cy = this.ctx.canvas.height / 2;
   
           this.confetti = [];
           this.confettiCount = 200;
           this.gravity = 0.9;
           this.terminalVelocity = 8;
           this.drag = 0.075;
           this.colors = [
               { front: 'red', back: 'darkred' },
               { front: 'green', back: 'darkgreen' },
               { front: 'blue', back: 'darkblue' },
               { front: 'yellow', back: 'darkyellow' },
               { front: 'orange', back: 'darkorange' },
               { front: 'pink', back: 'darkpink' },
               { front: 'purple', back: 'darkpurple' },
               { front: 'turquoise', back: 'darkturquoise' }];
         
           this.initialized = false;
         
           //----------Resize----------
           var self = this;
           window.addEventListener('resize', function () {
             self.resizeCanvas();
           });
       };
         
     
     
       Confetti.prototype = {
           resizeCanvas: function () {
               var bb = this.container.getBoundingClientRect();
               this.canvas.width = bb.width;
               this.canvas.height = bb.height;
               this.cx = this.ctx.canvas.width / 2;
               this.cy = this.ctx.canvas.height / 2;
           },
           initConfetti: function () {
               if(this.initialized) {
                  return;
               }
               this.initialized = true;
             
               this.confetti = [];
               for (var i = 0; i < this.confettiCount; i++) {
                   this.confetti.push({
                       color: this.colors[Math.floor(randomRange(0, this.colors.length))],
                       dimensions: {
                           x: randomRange(10, 20),
                           y: randomRange(10, 30)
                       },
   
                       position: {
                           x: randomRange(0, this.canvas.width),
                           y: this.canvas.height - 1
                       },
   
                       rotation: randomRange(0, 2 * Math.PI),
                       scale: {
                           x: 1,
                           y: 1
                       },
   
                       velocity: {
                           x: randomRange(-25, 25),
                           y: randomRange(0, -50)
                       }
                   });
               }
           },
           render: function() { 
               this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
             
               for(var index=0, len=this.confetti.length; index<len; index++) {
                   var confetto = this.confetti[index];
                   if(confetto == null) { 
                       continue;
                   }
                   var width = confetto.dimensions.x * confetto.scale.x;
                   var height = confetto.dimensions.y * confetto.scale.y;
   
                   // Move this.canvas to position and rotate
                   this.ctx.translate(confetto.position.x, confetto.position.y);
                   this.ctx.rotate(confetto.rotation);
   
                   // Apply forces to velocity
                   confetto.velocity.x -= confetto.velocity.x * this.drag;
                   confetto.velocity.y = Math.min(confetto.velocity.y + this.gravity, this.terminalVelocity);
                   confetto.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();
   
                   // Set position
                   confetto.position.x += confetto.velocity.x;
                   confetto.position.y += confetto.velocity.y;
   
                   // Devare confetti when out of frame
                   if (confetto.position.y >= this.canvas.height) {
                     this.confetti.splice(index, 1);
                   }
   
                   // Loop confetto x position
                   if (confetto.position.x > this.canvas.width) {
                     confetto.position.x = 0;
                   }
                   if (confetto.position.x < 0) {
                     confetto.position.x = this.canvas.width;
                   }
   
                   // Spin confetto by scaling y
                   confetto.scale.y = Math.cos(confetto.position.y * 0.1);
                   this.ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;
   
                   // Draw confetti
                   this.ctx.fillRect(-width / 2, -height / 2, width, height);
   
                   // Reset transform matrix
                   this.ctx.setTransform(1, 0, 0, 1, 0, 0);
               }
   
               // Fire off another round of confetti
               //if (confetti.length <= 10) initConfetti(); 
               
           },
           play: function() {
               this.initConfetti();
               var self = this;
               var loop = function() {
                   self.render();
                   if(self.confetti.length) {
                       window.requestAnimationFrame(loop); 
                   } 
               }; 
               window.requestAnimationFrame(loop);
           },
           dispose: function() {
               this.initialized = false;
           }
       };
   
   })();
   
   var instance = new window.Confetti(document.getElementById('container'));
   
   document.getElementById("play").addEventListener("click", function(evt){
       instance.play();
   });