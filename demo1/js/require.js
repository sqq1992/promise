

;(function () {
    
    var moduleCache = {};


    var require = function (arry,callBack) {

        if(!(arry instanceof Array)) return;

        var modalName = document.currentScript && document.currentScript.id || "noName";

        if(arry.length){
            var dependence = 0,
                cacheParams = [];


            for(var i=0,j=arry.length;i<j;i++){

                dependence++;

                ;(function (index) {

                    var tempModuleName = arry[index]

                    loadModule(tempModuleName, function (params) {

                        dependence--;
                        cacheParams[index] = params

                        if(dependence===0){
                            saveModule(modalName,cacheParams,callBack)
                        }


                    });

                })(i)

            }


        }else {

            saveModule(modalName,null,callBack)

        }



    }


    require.config = {};


    var saveModule = function (moduleName,params,callBack) {


        if(moduleCache[moduleName]){
            var fn
            var mod = moduleCache[moduleName];
            mod.status = "loaded";

            var exportParams = (callBack && callBack.apply(null,params)) || null;
            mod.export = exportParams;

            while (fn = mod.onload.shift()){
                fn(exportParams)
            }


        }else {
            callBack && callBack.apply(null,params)
        }



    };

    var loadModule = function (moduleName, callBack) {


        if(moduleCache[moduleName]){
            var mod = moduleCache[moduleName];

            if(mod.status==="loaded"){
                callBack && callBack.call(null,mod.export)
            }else {
                mod.onload.push(callBack)
            }


        }else {

            moduleCache[moduleName] = {
                onload:[callBack],
                export:null,
                status:'loading'
            }

            var _script = document.createElement('script');

            _script.id = moduleName
            _script.type = 'text/javascript'
            _script.async = true
            _script.src = _getUrl(moduleName);


            var head = document.getElementsByTagName("head")[0]
            head.appendChild(_script);

        }
    }


    var _getUrl = function (moduleName) {

        var baseUrl = require.config.baseUrl,
            specialUrl = require.config.moudles[moduleName]

        var targetUrl = baseUrl+specialUrl

        if(targetUrl.indexOf('.js')==-1)targetUrl += ".js";

        return targetUrl
    }



    window.require = require;
    window.define = require;


})()