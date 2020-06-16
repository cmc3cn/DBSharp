; (function() {
    function createPromiseCallback() {
        var resolve, reject;
        var promise = new Promise(function(_resolve, _reject) {
            resolve = _resolve;
            reject = _reject;
        });
        var cb = function(err, res) {
            if (err) {
                return reject(err)
            }
            resolve(res || '');
        };
        return {
            promise: promise,
            cb: cb
        }
    };

    var DBSharp = {

        DB: null,

        query: function(queryParams) {

            let assign = createPromiseCallback();
            let promise = assign.promise;
            let cb = assign.cb;

            let successFn = function(event) {
                let db;
                if (DBSharp.DDB) {
                    db = DBSharp.DDB
                } else if (event) {
                    db = DBSharp.DDB = event.target.result;
                }
                let store = queryParams.store;
                //创建事务
                let transaction = db.transaction([store], 'readwrite');
                //获取对象仓库
                let objStore = transaction.objectStore(store);

                objStore.get(queryParams.key).onsuccess = function(e) { //异步的
                    cb(null, e.target.result)
                };
            };

            if (DBSharp.DDB) {
                //db已经打开
                console.log('DBSharp.DDB exists');
                successFn();
            } else {
                let openRequest = indexedDB.open(queryParams.db, queryParams.ver);
                openRequest.onerror = function() {
                    cb('error in open indexedDB');
                };
                openRequest.onsuccess = successFn;
            }

            return promise;
        },

        set: function(setParams) {

            let assign = createPromiseCallback();
            let promise = assign.promise;
            let cb = assign.cb;

            let store = setParams.store;

            let successFn = function(event) {

                let db;
                if (DBSharp.DDB) {
                    db = DBSharp.DDB
                } else if (event) {
                    db = DBSharp.DDB = event.target.result;
                }

                //创建事务
                let transaction = db.transaction(store, 'readwrite');

                //获取对象仓库
                let objStore = transaction.objectStore(store);

                //添加数据
                let res = objStore.add(setParams.val);

                res.onsuccess = function() {
                    cb(res.error, true);
                };

                res.onerror = function() {
                    cb(res.error);
                };

            };

            if (DBSharp.DDB) {
                //db已经打开
                successFn();
            } else {
                let openRequest = indexedDB.open(setParams.db, setParams.ver);
                openRequest.onerror = function() {
                    cb('error in open indexedDB');
                }
                openRequest.onsuccess = successFn;
            }

            return promise;
        },

        del: function(delParams) {

            let assign = createPromiseCallback();
            let promise = assign.promise;
            let cb = assign.cb;

            let store = delParams.store;

            let successFn = function(event) {

                let db;
                if (DBSharp.DDB) {
                    db = DBSharp.DDB
                } else if (event) {
                    db = DBSharp.DDB = event.target.result;
                }

                let request = db.transaction(store, 'readwrite').objectStore(store);

                let del = request.delete(delParams.key);
                del.onsuccess = function() {
                    cb(null, true)
                }
                del.onerror = function() {
                    cb(del.error)
                }
            };

            if (DBSharp.DDB) {
                //db已经打开
                successFn();
            } else {
                let openRequest = indexedDB.open(delParams.db, delParams.ver);
                openRequest.onerror = function() {
                    cb('error in open indexedDB');
                }
                openRequest.onsuccess = successFn;
            }

            return promise;
        }

    };

    if(typeof exports==="object" && typeof module!=="undefined"){
        module.exports=DBSharp
    }else{
        window.DBSharp = DBSharp;    
    }
    
})();