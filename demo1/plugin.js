
;(function(){
    'use strict';

    /**
     * 异步加载图片的函数
     * @param images	传入的图片数组
     * @param callback	回调函数
     * @param timeout	超时时间
     */
    var loadingImage = function(images,callback,timeout){

        var conut = 0,
            item = {},
            isTimeout = false,  //是否超时
            timeoutId = null,   //异步超时函数的定时器id
            success = true;    //是否成功加载图片的标志

        for(var i in images){

            //过滤原型上的属性
            if(!images.hasOwnProperty(i)) continue;

            //存储图片对象
            item = {
                src:images[i]
            };

            //如果图片的路径地址不存在的话，直接过滤
            if(!item || !item.src) continue;

            conut++;

            item.img = new Image();

            //加载图片对象
            load(item);
        }

        if(!conut){         //如果没有可加载的图片
            callback(success);
        }else{              //设置超时的定时器
            timeoutId = setTimeout(function () {
                isTimeout = true;
                callback(false);
            }, timeout);
        }

        /**
         * 存储完整的图片对象
         * @param item  传入的完整图片对象
         */
        function load(item){

            var img = item.img;

            img.onload = function () {
                success = success && true;

                doLoaded();
            };
            img.src = item.src;         //加载图片

            img.onerror = function () {
                success = false;

                doLoaded();
            };

            /**
             * 图片加载成功或者加载失败的回调函数
             */
            function doLoaded(){
                //清楚图片对象
                img.onload = img.onerror = null;
                try{
                    img = null;
                }catch(e){

                }

                if(!--conut && !isTimeout){ //加载全部的图片，并且没有超时
                    clearTimeout(timeoutId);
                    callback(success);
                }

            }

        }

    }

    /**
     * 设置时间轴，拿来做帧动画的应用
     */
    var Timeline = (function(){
        'use strict';

        var DEFAULT_INTERVAL = 1000 / 60;   //默认跳一帧所需的时间

        var START_INITAL = 0,   //初始值
            START_START = 1,    //开始
            START_STOP =2;      //结束

        //帧动画的定时器
        var requestAnimationFrame = (function(){
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

        function TimeLine(){

            this.state = START_INITAL; //初始化状态
            this.animationId = null;        //动画的定时器
            this.startTime = 0;         //动画开始的时间
        }

        /**
         * 动画的开始函数
         * @param interval  传入自定义的1帧所需的时间
         * @returns {Timeline}
         */
        TimeLine.prototype.start = function (interval) {

            if(this.state===START_START) return this;

            this.state = START_START;

            this.interval = interval || DEFAULT_INTERVAL;

            this.startTimeline(+new Date());
        };

        /**
         * 动画帧的结束
         */
        TimeLine.prototype.stop = function () {

            if(this.state!==START_START) return this;

            this.state = START_STOP;

            if(this.startTime){
                this.dur = +new Date() - this.startTime;    //动画结束的时间到动画开始的时间差值
            }

            cancelAnimationFrame(this.animationId);
        };

        /**
         * 重新启动动画帧的效果
         */
        TimeLine.prototype.restart = function () {

            if(this.state!==START_STOP) return this;

            if(!this.dur || !this.interval){
                return;
            }
            this.state = START_START;

            //保持中断动画后，动画执行倒动画开始的时间差的保持定值
            this.startTimeline(+new Date() - this.dur);
        };

        /**
         * 执行所需的帧动画
         * @param time  从动画开始到执行动画的时间差
         */
        TimeLine.prototype.onenterframe = function (time) {
        };

        /**
         * 开始进行动画帧
         */
        TimeLine.prototype.startTimeline = function (nowTime) {
            var _this = this;

            this.startTime = nowTime;

            var lastTickTime = nowTime;     //上一个动画的执行的时间值

            nextTick();

            function nextTick(){

                var now = +new Date();

                _this.animationId = requestAnimationFrame(nextTick);

                //当前后时间差大于自定义的帧值时，执行动画
                if(now-lastTickTime>=_this.interval){
                    _this.onenterframe(now - nowTime);
                    lastTickTime = now;
                }

            }

        };

        return TimeLine;
    })();


    /**
     * 帧动画的类库,传入加载图片的库和时间轴的库
     */
    var Aniamtion = (function () {
        'use strict';

        var DEFAULT_INTERVAL = 1000 / 60;   //默认跳一帧所需的时间

        var START_INITAL = 0,   //初始值
            START_START = 1,    //开始
            START_STOP =2;      //结束

        var TASK_SYNC = 0,  //同步任务
            TASK_ASYNC = 1; //异步任务

        var Animation = function () {

            this.queue = [];    //存储任务的队列
            this.state = START_INITAL;  //初始化状态
            this.index = 0;     //当前任务的索引
            this.timeline = new Timeline(); //创建时间轴

        };

        /**
         * 同步加载图片列表
         * @param imgaesArry    传入的图片列表数组
         */
        Animation.prototype.loadImages = function (imgaesArry) {

            /**
             * 增加加载图片的任务队列
             * @param next  图片加载完毕后的回调函数
             */
            var next = function (next) {
                loadingImage(imgaesArry, next);
            };

            var type = TASK_SYNC;

            return this._add(next, type);
        };

        /**
         * 改变图片的背景位置来实现帧动画
         * @param ele   当前的节点
         * @param positions 当前背景数据的数组
         * @param img   图片
         */
        Animation.prototype.changePosition = function (ele,positions,imgUrl) {
            var len = positions.length,
                taskFn,
                type;

            if(len){
                var _this = this;
                /**
                 * 执行异步的帧动画
                 * @param next  传入的帧动画结束后的回调函数
                 * @param time  动画开始到现在执行的时间差值
                 */
                 taskFn = function (next,time) {

                    if(imgUrl){
                        ele.style.backgroundImage = 'url(' + imgUrl+')';
                    }

                    var index = Math.min(time / _this.interval | 0, len - 1);
                    var positionArry = positions[index].split(' ');

                    ele.style.backgroundPosition = positionArry[0] + 'px ' + positionArry[1] + 'px';

                    //动画执行完毕，执行回调
                    if(index===len-1){
                        next();
                    }

                };
                type = TASK_ASYNC;
            }

            return this._add(taskFn, type);

        };

        /**
         * 跳一帧所花费的时间
         * @param interval
         * @returns {Aniamtion}
         */
        Animation.prototype.start = function (interval) {

            if(this.state===START_START) return;

            this.state = START_START;

            this.interval = interval || DEFAULT_INTERVAL;

            this._runTask();

            return this;
        };

        /**
         * 无限重复这个动画任务
         */
        Animation.prototype.repeatForever = function () {
            this.repeat();
        };

        /**
         * 重复动画的这个任务
         * @param times 重复的次数
         */
        Animation.prototype.repeat = function (times) {
            var _this = this;
            var taskFn = function () {
                if(typeof times==="undefined"){        //无限重复这个动画
                    _this.index--;
                    _this._runTask();
                    return;
                }

                if(times){      //重复的有限次数
                    times--;
                    _this.index--;
                    _this._runTask();
                }else{          //执行下一个队列的任务
                    var task = _this.queue[_this.index];
                    _this._next(task);
                }

            };

            var type = TASK_SYNC;

            return this._add(taskFn, type);
        };

        /**
         * 当前任务执行完毕之后的等待时间
         */
        Animation.prototype.wait = function (time) {
            this.queue[this.queue.length-1].wait = time || 0;
            return this;
        };

        /**
         * 中断帧动画
         */
        Animation.prototype.pause = function () {
            if(this.state===START_START){
                this.state = START_STOP;
                this.timeline.stop();
                return this;
            }
        };

        /**
         * 重启帧动画
         */
        Animation.prototype.restart = function () {
            if(this.state===START_STOP){
                this.state = START_START;
                this.timeline.restart();
                return this;
            }
        };

        /**
         * 创建异步的帧动画
         */
        Animation.prototype.enterFrame = function (taskFn) {
            return this._add(taskFn, TASK_ASYNC);
        };

        /**
         * 动画完毕后的回调事件
         * @param fn
         */
        Animation.prototype.then = function (fn) {
            return this._add(fn, TASK_SYNC);
        };

        /**
         * 清除动画资源
         * @returns {Aniamtion}
         */
        Animation.prototype.dispose = function () {
            if(this.state!==START_INITAL){
                this.state === START_INITAL;
                this.queue = null;
                this.timeline.stop();
                this.timeline = null;
            }
            return this;
        };

        /**
         * 执行动画的任务
         * @private
         */
        Animation.prototype._runTask = function () {

            if(!this.queue[this.index] || !this.queue.length) return;

            var task = this.queue[this.index];

            if(task.type===TASK_SYNC){  //同步
                this._syncTask(task);
            }else if(task.type===TASK_ASYNC){   //异步
                this._asyncTask(task);
            }

        };

        /**
         * 执行同步任务
         * @param task  传入的任务
         * @private
         */
        Animation.prototype._syncTask = function(task){
            var _this = this;
            //todo 关于task参数的访问问题
            var next = function () {
                _this._next(task);
            };
            var taskFn = task.taskFn;
            taskFn(next);
        };

        /**
         * 执行异步的任务
         * @param task  传入的任务
         * @private
         */
        Animation.prototype._asyncTask = function (task) {

            var _this = this,
                taskFn = task.taskFn;

            /**
             * 传入的时间差值，在timeline里执行
             * @param time
             */
            var onenterFrame = function (time) {
                var next = function () {
                    _this.timeline.stop();
                    _this._next(task);
                };
                taskFn(next, time);
            };

            this.timeline.onenterframe = onenterFrame;
            this.timeline.start();

        };

        /**
         * 往任务队列中添加任务
         * @param task  任务
         * @param type  任务类型，同步还是异步
         * @private
         */
        Animation.prototype._add = function (task, type) {
            this.queue.push({
                taskFn: task,
                type: type
            });
            return this;
        };

        /**
         * 执行下一个队列的任务
         * @param task
         * @private
         */
        Animation.prototype._next = function (task) {
            var _this = this;
            this.index++;
            task.wait?setTimeout(function(){
                _this._runTask();
            },task.wait):this._runTask();
        };


        return Animation;

    })();

    window['Aniamtion'] = Aniamtion;
})();

