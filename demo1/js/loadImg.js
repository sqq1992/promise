
define([],function () {


    function loadImgList(arry,cb,timeOut) {

        if(!(arry instanceof Array)) return;
        if(!arry.length)return;


        var len = arry.length;
        var isTimeOut = false;
        var loadSuccess = true,
            timeOut = timeOut || 10000,
            timer = null;



        for(var i=0,j=len;i<j;i++){
            
            loadImg(i);
            
        }
        
        function loadImg(index) {
            
            console.log(index)
            var imgSrc = arry[index]

            var newImgObj = new Image();

            newImgObj.onload = function () {

                doLoaded(this);

            };

            newImgObj.onerror = function () {
                loadSuccess = false
                doLoaded(this);
            };

            newImgObj.src = imgSrc;

        }

        function doLoaded(imgObj) {
            len--;

            imgObj.onload = null;
            imgObj.onerror = null;


            if(len===0 && !isTimeOut){
                cb(loadSuccess);
                clearTimeout(timer);
            }

        }

        timer = setTimeout(function () {
            loadSuccess = false;
            isTimeOut = true;
            cb(loadSuccess)


        },timeOut);
        
        
    }
    
    
    return loadImgList
})