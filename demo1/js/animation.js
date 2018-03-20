
define(['loadImg','timeLine'],function (loadImgFunc,timeLine) {

    
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
                    var index = Math.floor(time / _this.interVal) - 1;
                    index = index < 0 ? 0 : index;
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



        },
        pause:function () {
            
        },
        repeat:function () {
            
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