
define(['loadImg','timeLine'],function (loadImgFunc,TimeLine) {

    
    var Animation_Init = "Animation_Init";
    var Animation_Start = "Animation_Start";
    var Animation_Stop = "Animation_Stop";

    var ASYNC_TASK = "ASYNC_TASK";
    var SYNC_TASK = "SYNC_TASK";

    var DEFAULT_INTERVAL = 1000 / 60;

    var Animation = function (options) {

        this.state = Animation_Init
        this.queue = [];
        this.index = 0;
        this.interVal = DEFAULT_INTERVAL;
        this.timeLine = new TimeLine();

    };

    Animation.prototype = {
        
        loadImgList:function (list) {

            var taskFn = function (next) {
                loadImgFunc(list, next);
            };
            var taskType = SYNC_TASK;
            
            return this._add(taskFn,taskType)
            
        },

        changePostition:function (elem,position,imgUrl) {
            var _this = this;
            var len = position.length,
                taksFn;


            if(len){
                taksFn = function (next,time) {
                    var index = Math.min(Math.floor(time / _this.interVal),len-1);
                    var positionArray = position[index].split(' ');

                    elem.style.backgroundImage = "url(" + imgUrl + ")";
                    elem.style.backgroundPosition = positionArray[0] + "px " + positionArray[1] + "px";


                    if(index===len-1){
                        next();
                    }

                }
            }

            var taskType = ASYNC_TASK;

            return this._add(taksFn,taskType)
        },
        
        
        start:function (interval) {

            if(this.state===Animation_Start) return;
            this.state = Animation_Start;

            this.interVal = interval || DEFAULT_INTERVAL;

            this._runTask();

        },

        _runTask:function () {
            
            if(!this.queue.length || !this.queue[this.index]) return;

            var taskObj = this.queue[this.index],
                taskType = taskObj.taskType,
                taskFn = taskObj.taskFn;
            
            if(taskType===ASYNC_TASK){
                this._runAsyncTask(taskFn);
            }else if(taskType===SYNC_TASK){
                this._runSyncTask(taskFn);
            }
            
        },
        
        _runAsyncTask:function (task) {
            var _this = this;
            
            var onterFrame = function (time) {
                var next = function () {
                    _this.timeLine.stop();
                    _this._next();

                };
                task(next, time);
            };
            this.timeLine.onEnterFrame = onterFrame;
            _this.timeLine.start();
            
        },
        
        _runSyncTask:function (task) {
            var _this = this;
            var next = function () {
                _this._next();
            };
            task(next);
        },

        _next:function () {
            var _this = this;
            if(this.index>=this.queue.length-1) return;

            var taskObj = this.queue[this.index];
            this.index++;
            
            taskObj.waitTime?setTimeout(function () {
                _this._runTask();
            },taskObj.waitTime):_this._runTask();
            
        },

        restart:function () {
            
            if(this.state===Animation_Stop){
                this.state = Animation_Start;
                this.timeLine.restart();
                return this;
            }
            
        },
        
        then:function (cb) {

            var taskFn = function (next) {
                cb && cb();
                next();
            };
            var taskType = SYNC_TASK;
            return this._add(taskFn,taskType)
        },

        pause:function () {
            
            if(this.state===Animation_Start){
                this.state = Animation_Stop;
                this.timeLine.stop();
                return this;
            }
            
        },
        repeat:function (times) {
            var _this = this;
            var taskFn = function () {

                if(typeof times==="undefined"){
                    _this.index--;
                    _this._runTask();
                    return;
                }

                if(times){
                    times--;
                    _this.index--;
                    _this._runTask();
                }else {
                    _this._next();
                }


            };

            var taskType = SYNC_TASK;

            return this._add(taskFn, taskType);
        },
        
        repeatForver:function () {
            return this.repeat();
        },

        wait:function (time) {

            this.queue[this.queue.length - 1].waitTime = time || 0;
            return this;
            
        },
        
        dispose:function () {
            
            this.timeLine.dispose();
            this.queue = [];
            
        },

        _add:function (taskFn,taskType) {

            this.queue.push({
                taskFn:taskFn,
                taskType:taskType
            })

            return this;

        }
        
    }
    
    return Animation

})