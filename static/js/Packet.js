var shared = shared || {};

if (!shared.Client) {
    /**
     *
     * @param ab {Uint8Array}
     * @constructor
     */
    shared.PacketIn = function (ab) {
        this.headerSize = 6;
        this._dataView = undefined;
        this._pos = this.headerSize;
        this.code = 0;
        this.session = 0;
        this.length = 0;

        this._dataView = new DataView(ab);
        // read head
        this.length = this._dataView.getUint16(0, true);
        this.code = this._dataView.getUint16(2, true);
        this.session = this._dataView.getUint16(4, true);
    };

    shared.PacketIn.prototype.isTail = function(){
        return this.length == this._pos;
    };

    shared.PacketIn.prototype.getLength = function () {
        return this.length;
    };

    shared.PacketIn.prototype.getCode = function () {
        return this.code;
    };

    shared.PacketIn.prototype.getSession = function () {
        return this._session;
    };

    shared.PacketIn.prototype.readBool = function () {
        this._dataView.getInt8(this.pos)
        ++this._pos;
        var b = this._dataView.getInt8(this._pos);
        ++this._pos;
        return b == 1;
    };

    shared.PacketIn.prototype.readBoolean = shared.PacketIn.prototype.readBool;

    shared.PacketIn.prototype.readInteger = function () {
        var r = 0;
        var first = this._dataView.getUint8(this._pos);
        this._pos += 1;
        switch (first) {
            case 255:
                r = this._dataView.getInt8(this._pos);
                this._pos += 1;
                break;
            case 254:
                r = this._dataView.getInt16(this._pos, true);
                this._pos += 2;
                break;
            case 253:
                r = this._dataView.getUint16(this._pos, true);
                this._pos += 2;
                break;
            case 252:
                r = this._dataView.getInt32(this._pos, true);
                this._pos += 4;
                break;
            case 251:
                r = this._dataView.getUint32(this._pos, true);
                this._pos += 4;
                break;
            case 250:
            {
                var str = '';
                for (var i = 0; i < 8; ++i) {
                    var v = this._dataView.getUint8(this._pos);
                    v = v.toString(2);
                    str = v + str;
                    for (var j = v.length; j < 8; ++j) {
                        str = '0' + str;
                    }
                    this._pos += 1;
                }
                r = parseInt(str, 2);
            }
                break;
            case 249:
            {
                var str = '';
                for (var i = 0; i < 8; ++i) {
                    var v = this._dataView.getUint8(this._pos);
                    v = v.toString(2);
                    str = v + str;
                    for (var j = v.length; j < 8; ++j) {
                        str = '0' + str;
                    }
                    this._pos += 1;
                }
                r = parseInt(str, 2);
            }
                break;
            case 248:
                r = this._dataView.getUint8(this._pos,true);
                this._pos++;
                break;
        }
        return r;
    };

    shared.PacketIn.prototype.readInt = shared.PacketIn.prototype.readInteger;

    /**
     * @returns {String}
     */
    shared.PacketIn.prototype.readString = function () {
        var bytes = this.readByteArray();
        return shared.UTF8.byteArrayToString(bytes);
    };

    /**
     * @returns {JSON}
     */

    shared.PacketIn.prototype.readJson = function () {
        var bytes = this.readByteArray();
        var str =  shared.UTF8.byteArrayToString(bytes);
        return JSON.parse(str)
    };

    /**
     * @returns {Uint8Array}
     */
    shared.PacketIn.prototype.readByteArray = function () {
        this._dataView.getUint8(this._pos);
        this._pos++;
        var len = this._dataView.getUint16(this._pos, true);
        this._pos += 2;
        var arr = new Uint8Array(len);
        for (var i = 0; i < len; ++i) {
            arr[i] = this._dataView.getUint8(this._pos);
            this._pos += 1;
        }
        return arr;
    };

    /**
     * @returns {number}
     */
    shared.PacketIn.prototype.readFloat = function () {
        this._dataView.getUint8(this._pos);
        this._pos++;
        var f = this._dataView.getFloat64(this._pos, true);
        this._pos += 8;
        return f;
    };

    /**
     * @returns {array}
     */
    shared.PacketIn.prototype.readList = function(){
        this._dataView.getUint8(this._pos);
        this._pos++;
        var len = this._dataView.getUint16(this._pos,true);
        this._pos += 2;
        var arr = [];
        for(var i=0; i < len; i++){
            v = this.read();
            arr.push(v);
        }
    };

    /**
     * @returns {any}
     */
    shared.PacketIn.prototype.read = function(){
        var type = this.dataView.getUint8(this._pos);
        var v = undefined;
        switch(type) {
            case 255:
            case 254:
            case 253:
            case 252:
            case 251:
            case 250:
            case 249:
            case 248:
                v = this.readInteger();
                break;
            case 247:
                v = this.readBoolean();
                break;
            case 246:
                v = this.readString();
                break;
            case 245:
                v = this.readByteArray();
                break;
            case 244:
                v = this.readJson();
                break;
            case 243:
                v = this.readFloat();
                break;
            case 242:
                v = this.readList();
                break;
        }
        return v;

    };

    shared.PacketIn.prototype.readAll = function(){
        var result = this.read();
        if(!this.isTail()){
            result = [result];
            v = this.read();
            result.push(v);
        }
        return result;
    };


    /**
     *
     * @param code
     * @param data
     * @constructor
     */
    shared.PacketOut = function (code,data) {
        this.headerSize = 6;
        this._session = 0;
        this._code = code;
        this._length = 0;
        this._pos = this.headerSize;
        var size = 1024;
        if(data && typeof(data)=='object'){
            var dd = JSON.stringify(data);
            var dd2 = shared.UTF8.stringToByteArray(dd);
            size = dd2.length + 20;
            this._buffer = new ArrayBuffer(size);
            this._dataView = new DataView(this._buffer, 0);
            this.writeData(dd2);
            return
        }
        else if(typeof(data)=='number' && data > 0){
            size = data;
        }
        this._buffer = new ArrayBuffer(size);
        this._dataView = new DataView(this._buffer, 0);

    };

    shared.PacketOut.prototype.getBuffer = function () {
        this._length = this._pos;
        this._dataView.setUint16(0, this._length, true);
        this._dataView.setUint16(2, this._code, true);
        this._dataView.setUint16(4, this._session, true);
        return this._buffer.slice(0, this._length);
    };

    shared.PacketOut.prototype.setSession = function (session) {
        this._session = session;
    };

    /**
     *
     * @param v {Number}
     */
    shared.PacketOut.prototype.writeInteger = function (v) {
        if (v >= 0) {
            if (v < 248) {
                this._dataView.setUint8(this._pos, 248);
                this._pos += 1;
                this._dataView.setUint8(this._pos, v);
                this._pos += 1;
            } else if (v <= 32767) {
                this._dataView.setUint8(this._pos, 254);
                this._pos += 1;
                this._dataView.setInt16(this._pos, v, true);
                this._pos += 2;
            } else if (v <= 2147483647) {
                this._dataView.setUint8(this._pos, 252);
                this._pos += 1;
                this._dataView.setInt32(this._pos, v, true);
                this._pos += 4;
            } else {
                this._dataView.setUint8(this._pos, 250);
                this._pos += 1;
                var str = v.toString(2);
                var pos = str.length;
                var max = 8;
                while (max > 0) {
                    var v;
                    if (pos > 0) {
                        if (pos >= 8) {
                            v = parseInt(str.substr(pos - 8, 8), 2);
                            pos -= 8;
                        } else {
                            v = parseInt(str.substr(0, pos), 2);
                            pos = 0;
                        }
                    } else {
                        v = 0;
                    }
                    this._dataView.setUint8(this._pos, v);
                    this._pos += 1;
                    --max;
                }
            }
        } else {
            if (v >= -128) {
                this._dataView.setUint8(this._pos, 255);
                this._pos += 1;
                this._dataView.setInt8(this._pos, v);
                this._pos += 1;
            } else if (v >= -32768) {
                this._dataView.setUint8(this._pos, 254);
                this._pos += 1;
                this._dataView.setInt16(this._pos, v, true);
                this._pos += 2;
            } else if (v >= -2147483648) {
                this._dataView.setUint8(this._pos, 252);
                this._pos += 1;
                this._dataView.setInt32(this._pos, v, true);
                this._pos += 4;
            } else {
                this._dataView.setUint8(this._pos, 250);
                this._pos += 1;
                var str = v.toString(2);
                var pos = str.length;
                var max = 8;
                while (max > 0) {
                    var v;
                    if (pos > 0) {
                        if (pos >= 8) {
                            v = parseInt(str.substr(pos - 8, 8), 2);
                            pos -= 8;
                        } else {
                            v = parseInt(str.substr(0, pos), 2);
                            pos = 0;
                        }
                    } else {
                        v = 0;
                    }
                    this._dataView.setUint8(this._pos, v);
                    this._pos += 1;
                    --max;
                }
            }
        }
    };

    /**
     * @param str {String}
     */
    shared.PacketOut.prototype.writeString = function (str) {
        str = str || '';
        var byteArray = shared.UTF8.stringToByteArray(str);
        this._dataView.setUint8(this._pos,246);
        this._pos++;
        this._dataView.setUint16(this._pos,byteArray.length,true);
        this._pos += 2;
        for (var i = 0; i < byteArray.length; ++i) {
            this._dataView.setUint8(this._pos, byteArray[i]);
            this._pos += 1;
        }
    };

    /**
     * @param bytes {ArrayBuffer}
     */
    shared.PacketOut.prototype.writeBytes = function (bytes) {
        this._dataView.setUint8(this._pos,245);
        this._pos++;
        this._dataView.setUint16(this._pos,bytes.length,true);
        this._pos += 2;
        for (var i = 0; i < bytes.length; ++i) {
            this._dataView.setUint8(this._pos, bytes[i]);
            this._pos += 1;
        }
    };

    /**
     * @param bytes {JSON}
     */

    shared.PacketOut.prototype.writeData = function (bytes) {
        this._dataView.setUint8(this._pos,244);
        this._pos++;
        this._dataView.setUint16(this._pos,bytes.length,true);
        this._pos += 2;
        for (var i = 0; i < bytes.length; ++i) {
            this._dataView.setUint8(this._pos, bytes[i]);
            this._pos += 1;
        }
    };


    /**
     * @param jd {JSON}
     */
    shared.PacketOut.prototype.writeJson = function (jd) {
        str = JSON.stringify(jd);
        var byteArray = shared.UTF8.stringToByteArray(str);
        this._dataView.setUint8(this._pos,244);
        this._pos++;
        this._dataView.setUint16(this._pos,byteArray.length,true);
        this._pos += 2;
        for (var i = 0; i < byteArray.length; ++i) {
            this._dataView.setUint8(this._pos, byteArray[i]);
            this._pos += 1;
        }
    };

    /**
     * @param b {boolean}
     */
    shared.PacketOut.prototype.writeBoolean = function (b) {
        this._dataView.setUint8(this._pos,247);
        this._pos++;
        this._dataView.setInt8(this._pos, b ? 1 : 0);
        this._pos++;
    };

    /**
     * @param v {float}
     */
    shared.PacketOut.prototype.writeFloat = function (v) {
        this._dataView.setUint8(this._pos,243);
        this._pos++;
        this._dataView.setFloat64(this._pos, v, true);
        this._pos += 8;
    };

    /**
     * @param v {Array}
     */
    shared.PacketOut.prototype.writeList = function(v){
        this._dataView.setUint8(this._pos,242);
        this._pos++;
        this.dataView.setUint16(this._pos,v.length, true);
        for( var i=0; i < v.length; i++){
            v2 = v[i];

        }
    };

    shared.PacketOut.prototype.write = function(v){
        if(Array.isArray(v)){
            this.writeList(v);
        }
        else {
            switch(typeof(v)){
                case 'object':
                    this.writeJson(v);
                    break;
                case 'string':
                    this.writeString(v);
                    break;
                case 'bool':
                    this.writeBoolean(v);
                    break;
                case 'number':
                    if(v == parseInt(v)){
                        this.writeInteger(v);
                    }
                    else{
                        this.writeFloat(v);
                    }
            }
        }
    };

    /**
     *
     * @class
     */
    shared.Client = {
        _connected: false,
        _sock: undefined,
        _evtHandler: {
            obj: undefined,
            onReceive: undefined,
            onClose: undefined,
            onConnect: undefined,
            onError: undefined
        },
        setEvtHandler: function (param) {
            this._evtHandler = {};
            this._evtHandler.obj = param.obj || null;
            this._evtHandler.onReceive = param.onReceive || function () {
            };
            this._evtHandler.onConnect = param.onConnect || function () {
            };
            this._evtHandler.onClose = param.onClose || function () {
            };
            this._evtHandler.onError = param.onError || function () {
            };
        },

        /**
         *
         * @param wsUrl {String}
         */
        connect: function (wsUrl) {
            var WebSocket = WebSocket || window.WebSocket || window.MozWebSocket;
            var self = this;
            this._sock = new WebSocket(wsUrl);
            this._sock.binaryType = "arraybuffer";
            this._sock.onopen = function () {
                self._evtHandler.onConnect.call(self._evtHandler.obj);
                self._connected = true;
            };
            this._sock.onerror = function (evt) {
                self._evtHandler.onError.call(self._evtHandler.obj, 'connect fail');
            };
            this._sock.onclose = function () {
                if (self._connected) {
                    self._connected = false;
                    self._evtHandler.onClose.call(self._evtHandler.obj);
                }
            };
            this._sock.onmessage = function (evt) {
                var pktin = new shared.PacketIn(evt.data);
                self._evtHandler.onReceive.call(self._evtHandler.obj, pktin);
            };
        },

        /**
         *
         * @param pktout {shared.PacketOut}
         */
        send: function (pktout) {
            this._sock.send(pktout.getBuffer());
        },
        close : function(){
            this._sock&&this._sock.close();
            this._sock = null;
        }
    };
}
