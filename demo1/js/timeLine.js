
define([],function () {

    var DEFAULT_INTERVAL = 1000 / 60;


    var START_INIT = "START_INIT";
    var START_START = "START_START";
    var START_STOP = "START_STOP";

    var requestiomation = (function () {

        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            function(callBack){
                window.setTimeout(callBack, callBack.interval || DEFAULT_INTERVAL);
            }

    })();


    //取消帧动画的定时器
    var cancelAnimationFrame = (function(){
        return window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            window.oCancelAnimationFrame ||
            function (id) {
                window.clearTimeout(id);
            };
    })();


    var TimeLine = function (options) {

        this.state = START_INIT;
        this.timer = null;
        this.nowTime = '';
        this.durTime = ''
        this.interVal = DEFAULT_INTERVAL;
        
        
    };

    TimeLine.prototype = {

        dispose:function () {

            cancelAnimationFrame(this.timer);
        },
        
        start:function (interVal) {
            
            if(this.state===START_START) return;
            this.state = START_START;
            this.interVal = interVal || DEFAULT_INTERVAL;
            
            
            this.startTime(+new Date());
            
        },

        restart:function () {
            
            if(this.state!==START_STOP) return;
            
            if(!this.durTime || !this.interVal) return;
            
            this.state = START_START;

            this.startTime(+new Date() - this.durTime);
        },
        
        stop:function () {
            if(this.state===START_STOP) return;
            
            this.state = START_STOP;

            if(this.nowTime){
                this.durTime = +new Date() - this.nowTime;
            }
            
            cancelAnimationFrame(this.timer);
        },
        
        startTime:function (time) {
            var _this = this;
            
            this.nowTime = time;
            var lastTime = time;
            
            nextTick();
            function nextTick() {

                var now = +new Date();
                _this.timer = requestiomation(nextTick);
                
                if(now-lastTime>=_this.interVal){
                    _this.onEnterFrame(now - _this.nowTime);
                    lastTime = now;
                }
                
            }
            
            
        },
        
        onEnterFrame:function (diffTime) {
            
        }

    }


    return TimeLine;
    
   
})