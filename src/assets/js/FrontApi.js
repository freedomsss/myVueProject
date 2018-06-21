//-------------------------------------API类-------------------------------------
function FrontApi() {
    this.m_api = "https://www.easyai.xin:8666/api";
    this.m_sess_id = '';
    this.m_token = '';

    this.m_uid = 0;
    this.m_user_token = '';

    this.m_result = null;

    this.info = function () {
        info = {};
        info.api = this.m_api;
        info.sess_id = this.m_sess_id;
        info.token = this.m_token;
        info.uid = this.uid;
        info.user_token = this.user_token;
        return info;
    };

    this.set_api = function (url)
    {
        this.m_api = url;
    };

    this.set_token = function (sess_id, token)
    {
        this.m_sess_id = sess_id;
        this.m_token = token;
    };

    this.set_user_token = function(uid,user_token)
    {
        this.m_uid = uid;
        this.m_user_token = user_token;
    };

    this.timestamp = function () {
        var tm = Date.parse(new Date());
        tm = tm / 1000;
        return tm;
    };

    this.json_api = function (url, data, callback) {
        $.getJSON(url, data, callback);
    };

    this.ease_ajax = function (url, data, callback) {
        $.ajax({url: url, dataType: "json", data: data, success: callback});
    };

    this.post_api = function (url, data, callback) {
        $.post(url, data, callback, 'json')
    };

    this.make_link = function (module, action, params) {
        var pd = this.make_pd(params);
        var link = "{api_root}/{module}/{action}?data={data}&timestamp={timestamp}&sign={sign}&sess_id={sess_id}";
        link = link.replace('{api_root}', this.m_api).replace('{module}', module).replace('{action}', action).replace('{data}', pd.data).replace('{sess_id}', pd.sess_id).replace('{timestamp}', pd.timestamp).replace('{sign}', pd.sign);
        return link;
    };

    this.make_api_url = function (module, action)
    {
        var api_url = "{api_root}/{module}/{action}";
        api_url = api_url.replace('{api_root}', this.m_api).replace('{module}', module).replace('{action}', action);
        return api_url;
    };

    this.make_pd = function(params)
    {
        var data = JSON.stringify(params);
        var timestamp = this.timestamp();
        var sign = hex_md5(data + timestamp + this.m_token);
        var pd = {'data': data, 'timestamp': timestamp, 'sign': sign, 'sess_id': this.m_sess_id};
        return pd
    };

    this.call_api = function (module,action, params, callFun) {
        var pd = this.make_pd(params);
        var api_url = this.make_api_url(module,action);
        this.post_api(api_url, pd, function(result){
            this.result = result;
            if(callFun) {
                callFun(result);
            }
        });
    };

    // file为input的type=file的对象
    this.file_base64 = function(file_path,callFun){
        var reader = new FileReader();
        reader.onload = function (e) {
            // callFun(this.result)
            callFun(e.target.result);
        };
        reader.readAsDataURL(file_path);
    };

    this.file_data = function(file_path,callFun){
        var reader = new FileReader();
        reader.onload = function (e) {
            // callFun(this.result)
            callFun(e.target.result);
        };
        reader.readAsBinaryString();
    };

    this.get_cookie = function(name)
    {
	    var cookie_start = document.cookie.indexOf(name);
	    var cookie_end = document.cookie.indexOf(";", cookie_start);
	    return cookie_start == -1 ? '' : decodeURI(document.cookie.substring(cookie_start + name.length + 1, (cookie_end > cookie_start ? cookie_end : document.cookie.length)));
    };


    this.set_cookie = function(name,value, seconds, path, domain, secure) {
        var expires = new Date();
        expires.setTime(expires.getTime() + seconds * 1000);
        document.cookie = name + '=' + encodeURI(value)
            + (expires ? '; expires=' + expires.toGMTString() : '')
            + (path ? '; path=' + path : '/')
            + (domain ? '; domain=' + domain : '')
            + (secure ? '; secure' : '');
    };

    this.load_token = function()
    {
        var token = JSON.stringify({sess_id:this.m_sess_id,token:this.m_token});
        this.set_cookie('token',token,30*60);
    };

    this.save_token = function()
    {
        var token = this.get_cookie('token');
        if(token){
            token = JSON.parse(token);
            this.m_sess_id = token.sess_id;
            this.m_token = token.token;
        }
    };

    this.clear_token = function()
    {
        this.set_cookie('token','',0);
    };

    this.load_user_token = function()
    {
        var user_token = this.get_cookie('user_token');
        if(user_token){
            user_token = JSON.parse(user_token);
            this.m_uid = user_token.uid;
            this.m_user_token = user_token.user_token;
        }
    };

    this.save_user_token = function()
    {
        var user_token = JSON.stringify({uid:this.m_uid,user_token:this.m_user_token});
        this.set_cookie('user_token',user_token,30*60);
    };

    this.clear_user_token = function()
    {
        this.set_cookie('user_token','',0);
    };
    //--------------------------------------------------------------------
    // api接口
    this.get_token = function (params, callFun)
    {
        this.call_api('front','get_token',params,function(result)
        {
            if(result.rc=='ok'){
                this.m_token = result.msg.token;
                this.m_sess_id = result.msg.sess_id;

                this.save_token();
            }
            if(callFun) {
                callFun(result)
            }
        })
    };

    this.get_mobile_code = function (mobile, callFun) {
        var params = {'mobile': mobile};
        this.call_api('get_mobile_code',params,callFun)
    };

    this.register = function(mobile,code,password,callFun)
    {
        var password2 = hex_md5(password);
        var params = {mobile:mobile,code:code,password:password2};
        this.call_api('front','login',params,function(result){
            if(result.rc=="ok"){
                this.m_uid = result.msg.uid;
                this.m_user_token = result.msg.token;
            }
            callFun(result)
        });
    };

    this.login = function (mobile, password, callFun) {
        var password2 = hex_md5(password);
        var params = {username:mobile,password:password2};
        this.call_api('front','login',params,function(result){
            if(result.rc=="ok"){
                this.m_uid = result.msg.uid;
                this.m_user_token = result.msg.token;
                this.save_user_token();
            }
            callFun(result)
        });
    };

    this.session_login = function(callFun)
    {
        if(this.m_uid > 0 && this.m_user_token){
            var params = {uid:this.m_uid,token:this.m_user_token};
            this.call_api('front','login2',params,function(result){
                if(result.rc=="ok"){

                }
                callFun(result);
            })
        }
    };

    this.mobile_code_login = function (mobile, code, callFun) {
        var params = {'mobile': mobile, 'code': code};
        this.call_api('front','mobile_code_login',params,function(result){
            callFun(result);
        })
    };

    this.logout = function (callFun) {
        if(this.m_uid > 0) {
            this.m_uid = 0;
            this.m_user_token = '';
            this.clear_user_token();

            var params = {uid: this.m_uid};
            this.call_api('front', 'logout', params, function (result) {
                callFun(result);
            })
        }
    };

    // type=jpg/png/gif
    this.upload_image = function (type,image_base64, callFun) {
        var  params = {type:type,image_base64 : image_base64};
        this.call_api('front','upload_image',params,callFun);
    };

    this.get_image_file = function(image_id,callFun)
    {
        var params = {'image_id': image_id};
        this.call_api('front','get_image_file',params,callFun);
    };

}

dal = dal || {};
dal.API = new FrontApi();

