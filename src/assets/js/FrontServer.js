/**
 *
 */
var dal = dal || {};

/**
 *
 * @class
 * @name dal.frontServer
 */
dal.frontServer = {
    proto : {
        TEST : 0,
        SERVER_CONFIRM : 1,
        PING : 2,
        PING_REPLY : 3,
        PING_RESULT : 4,
        NOTIFY : 5,
        LOGIN : 6
    },
    _client: undefined,
    _wsUrl: null,
    _connected: false,

    _components: [

    ],
    _serverCodes : {},
    _pktHandlers: {},
    _notifyHandlers : {},

    _sessionId: 1,
    _sessionHandlers: {},
    _generateSession: function () {
        var s = this._sessionId;
        this._sessionId++;
        if (s > 65535) {
            this._sessionId = 1;
        }
        return s;
    },

    identity : '',
    token : '',
    user : null,
    asset: null,
    uid :  0,
    user_token : '',

    _onConnect: function () {
        for (var i = 0; i < this._components.length; ++i) {
            var c = this._components[i];
            if (c.onConnect != undefined) {
                c.onConnect();
            }
        }
        this._connected = true;
        console.log("====onConnect====");

        //this.evtConnect.trigger();
    },
    _onClose: function () {
        console.log("====onClose====");
        this._connected = false;
        for (var i = this._components.length - 1; i >= 0; --i) {
            var c = this._components[i];
            if (c.onClose != undefined) {
                c.onClose();
            }
        }
        this._client&&this._client.setEvtHandler({
            obj: null,
            onReceive: null,
            onClose: null,
            onConnect: null,
            onError: null
        });
        this._client = null;

        this.evtClose.trigger();
    },
    _onReceive: function (pktin) {
        var session = pktin.session;
        if (pktin.code < 10 && session==0) {
            switch(pktin.code) {
                case this.proto.SERVER_CONFIRM:
                    this._onServerConfirm(pktin);
                    break;
                case this.proto.PING:
                    this._onPing(pktin);
                    break;
                case this.proto.PING_RESULT:
                    this._onPingResult(pktin);
                    break;
                case this.proto.NOTIFY:
                    this._onNotify(pktin);
                    break;
                default:
                    console.log('onReceive: default code(%i) not exists',pktin.code);
                    break;
            }
        }
        else {
            var hd = null;
            if (session > 0) {
                hd = this._sessionHandlers[session];
                this._sessionHandlers[session] = null;
            }
            else {
                hd = this._pktHandlers[pktin.code];
            }
            if (hd != null) {
                //console.log(hd.obj);
                //console.log(pktin);
                hd.fun.call(hd.obj, pktin);
            }
            else{
                console.log('onReceive: code(%i) session(%i) not exists',pktin.code,pktin.session);
            }
        }
    },
    _onError: function (reason) {
        this._connected = false;
        this.evtError.trigger(reason);
    },

    isConnected: function () {
        return this._connected;
    },

    /**
     * @type shared.Event
     */
    evtConnect: new shared.Event(),

    evtLogin: new shared.Event(),
    /**
     * @type shared.Event
     */
    evtClose: new shared.Event(),

    /**
     * @type shared.Event
     */
    evtError: new shared.Event(),

    setup: function () {
        var i = 0;
        this._components.forEach(function (c) {
            ++i;
            if (c.hasOwnProperty('onInit')) {
                c.onInit();
            }
        });
    },

    /**
     *
     * @param code {Number}
     * @param fun {Function}
     * @param obj {Object}
     */
    registerHandler: function (code, fun, obj) {
        this._pktHandlers[code] = {obj: obj, fun: fun};
        return this;
    },

    registerNotifyHandler: function(name,fun,obj) {
        this._notifyHandlers[name] = {obj:obj,fun: fun};
        return this
    },
    registerChannelChatHandler: function(fun,obj){
        this.registerNotifyHandler('channel_chat_message',fun,obj)
    },
    registerPrivateChatHandler: function(fun,obj){
        this.registerNotifyHandler('private_chat_message',fun,obj)
    },
    registerServerCodesHandler: function(fun,obj){
        this.registerNotifyHandler('code_names',fun,obj)
    },
    registerAllNotify : function(fun,obj){
        this.registerNotifyHandler('all',fun,obj)
    },

    doConnect: function (wsUrl) {
        if (this._connected) {
            return;
        }
        this._wsUrl = wsUrl;
        var self = this;
        this._client = shared.Client;
        this._client.setEvtHandler({
            obj: self,
            onReceive: self._onReceive,
            onClose: self._onClose,
            onConnect: self._onConnect,
            onError: self._onError
        });
        var result = this._client.connect(this._wsUrl);
    },

    /**
     * 重连
     */
    reconnect: function () {
        if(this._wsUrl) {
            this.doConnect(this._wsUrl);
        }
    },

    /**
     *
     * @param pktout {shared.PacketOut}
     */
    send: function (pktout) {
        this._client&&this._client.send(pktout);
    },

    apiCall : function(name,data,callback,obj){
        console.log('apiCall(req): ',name,data);
        cn = this._serverCodes[name];
        if(cn){
            pout = new shared.PacketOut(cn.code,data);
            api_callback = function(pktin){
                result = pktin.readJson();
                console.log('apiCall(res): ',name,result);
                callback.call(obj,result);
            };
            this._rpcCall(pout,api_callback,this);
        }
        else{
            console.log('rpcCall: ',name,'not_found')
        }
    },

    rpcCall : function(name,data,callback,obj){
        cn = this._serverCodes[name];
        if(cn){
            pout = new shared.PacketOut(cn.code,data);
            this._rpcCall(pout,callback,obj);
        }
        else{
            console.log('rpcCall: ',name,'not_found')
        }
    },

    /**
     *
     * @param pktout {shared.PacketOut}
     * @param callback {Function}
     * @param [obj]
     */
    _rpcCall: function (pktout, callback, obj) {
        if (callback) {
            var session = this._generateSession();
            pktout.setSession(session);
            this._sessionHandlers[session] = {obj: obj, fun: callback};
        }
        this.send(pktout);
    },
    sendClose : function(){
        console.log("=======sendClose==========");
        this._client&&this._client.setEvtHandler({
            obj: null,
            onReceive: function(){},
            onClose: function(){},
            onConnect: function(){},
            onError: function(){}
        });
        this._client&&this._client.close();
        this._client = null;
        this._connected = false;
    },
    timestamp : function(){
        var tm = Date.parse(new Date());
        tm = tm / 1000;
        return tm;
    },

    fetch_session : function(){
        var session = shared.utils.get_cookie('front_session');
        return session;
    },

    save_session : function(session,seconds){
        if(!seconds){
            seconds = 86400;
        }
        shared.utils.set_cookie('front_session',session,seconds)
    },

    //-----------------------------------------------------------------------------------------------------------------
    ping : {
        sequence : 0,
        timeout : 0,
        last_time : 0
    },
    _onServerConfirm: function (pktin) {
        var old_identity = this.fetch_session();

        this.identity = pktin.readString();
        this.token = pktin.readString();

        console.log('onServerConfirm ~ ',this.identity,this.token);

        var pout = new shared.PacketOut(this.proto.SERVER_CONFIRM);
        pout.writeString(this.identity);
        pout.writeString(old_identity);
        this._rpcCall(pout,function(pktin2){
            result = pktin2.readJson();
            if(result.rc=="ok"){
                this.identity = result.msg.identity;
                this.token = result.msg.token;
                console.log('onServerConfirm(callback) ~ ',this.identity,this.token);

                this.save_session(this.identity)
            }
        },this)
        //this.send(pout);
    },
    _onPing :function(pktin){
        this.ping.sequence = pktin.readInteger();
        var pout = new shared.PacketOut(this.proto.PING_REPLY);
        pout.writeInteger(this.ping.sequence);
        this.send(pout);
        this.ping.last_time = this.timestamp();
    },
    _onPingResult : function(pktin){
        this.ping.timeout = pktin.readInteger();
    },
    _onNotify : function(pktin) {
        data = pktin.readJson();
        if(data.name && data.data){
            hd = this._notifyHandlers[data.name];
            if(hd){
                hd.fun.call(hd.obj,data.data);
                return;
            }
            else{
                hd = this._notifyHandlers['all'];
                if(hd) {
                    hd.fun.call(hd.obj,data);
                    return;
                }
            }
        }
        console.log('onNotify: [%o] no handler',data);
    },

    //-----------------------------------------------------------------------------------------------------------------
    // 可调用函数通知
    onServerCodes : function(result){
        var code_names = result;
        this._serverCodes = {};
        for(var i=0; i < code_names.length;i++){
            cn = code_names[i];
            this._serverCodes[cn[1]] = {code:cn[0],name:cn[1]};
        }

        this.evtConnect.trigger();
    },

    //-----------------------------------------------------------------------------------------------------------------
    test : function (str){
        var pout = new shared.PacketOut(this.proto.TEST);
        pout.writeString(str);
        console.log("test: send ~ ",str);
        this._rpcCall(pout,function(pout){
            str2 = pout.readString();
            console.log("test: receive ~ ",str2);
        })
    },

    get_mobile_code : function(mobile,callback) {
        var data = {'mobile':mobile};
        this.apiCall('visitor.get_mobile_code',data,function(result){
            callback(result);
        })
    },

    register: function (mobile,mobile_code,password,callback) {
        var data = {'mobile':mobile,'mobile_code':mobile_code,'password':password};
        this.apiCall('visitor.register',data,function (result) {
            if(result.rc=='ok'){
                this.uid = this.msg.uid;
                this.user_token  = result.msg.token;
                var code_names = result.msg.code_names;
                this._serverCodes = {};
                for(var i=0; i < code_names.length;i++){
                    cn = code_names[i];
                    this._serverCodes[cn[1]] = {code:cn[0],name:cn[1]};
                }

                this.evtLogin.trigger();

            }
            callback&&callback(result);
        }, this);
    },

    login: function (username,password,callback) {
        var data = {'username':username,'password':hex_md5(password)};
        this.apiCall('visitor.login',data,function (result) {
            if(result.rc=='ok'){
                this.uid = result.msg.uid;
                this.user_token  = result.msg.token;
                var code_names = result.msg.code_names;
                this._serverCodes = {};
                for(var i=0; i < code_names.length;i++){
                    cn = code_names[i];
                    this._serverCodes[cn[1]] = {code:cn[0],name:cn[1]};
                }

                this.evtLogin.trigger();

            }
            callback&&callback(result);
        }, this);
    },

    mobile_code_login : function(mobile,mobile_code,callback){
        var data = {'mobile':mobile,'mobile_code':mobile_code};
        this.apiCall('visitor.mobile_code_login',data,function (result) {
            if(result.rc=='ok'){
                this.uid = result.msg.uid;
                this.user_token  = result.msg.token;
                var code_names = result.msg.code_names;
                this._serverCodes = {};
                for(var i=0; i < code_names.length;i++){
                    cn = code_names[i];
                    this._serverCodes[cn[1]] = {code:cn[0],name:cn[1]};
                }

                this.evtLogin.trigger();

            }
            callback&&callback(result);
        }, this);
    },

    session_login : function(uid,token,callback){
        var data = {'uid':uid,'token':token};
        this.apiCall('visitor.session_login',data,function(result){
            if(result.rc=='ok'){
                this.uid = result.msg.uid;
                this.user_token  = result.msg.token;
                var code_names = result.msg.code_names;
                this._serverCodes = {};
                for(var i=0; i < code_names.length;i++){
                    cn = code_names[i];
                    this._serverCodes[cn[1]] = {code:cn[0],name:cn[1]};
                }

                this.evtLogin.trigger();

            }
            callback&&callback(result);
        },this)
    },

    logout : function(callback){
        var data = {};
        dal.API.clear_user_token();
        dal.uid = 0;
        dal.user_token = '';
        dal.user   = null;
        this.apiCall('user.logout',data,function(result){
            callback&&callback(result);
        })
    }

    //-----------------------------------------------------------------------------------------------------------------
};
