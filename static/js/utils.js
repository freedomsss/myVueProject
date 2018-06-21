/**
 * Created by easeliu on 2017/12/20.
 */

var shared = shared || {};

shared.utils = {
//深复制对象方法
    clone : function (obj) {
        var newObj = {};
        if (obj instanceof Array) {
            newObj = [];
        }
        for (var key in obj) {
            var val = obj[key];
            //newObj[key] = typeof val === 'object' ? arguments.callee(val) : val; //arguments.callee 在哪一个函数中运行，它就代表哪个函数, 一般用在匿名函数中。
            newObj[key] = typeof val === 'object' ? clone(val) : val;
        }
        return newObj;
    },

    get_cookie : function(name)
    {
	    var cookie_start = document.cookie.indexOf(name);
	    var cookie_end = document.cookie.indexOf(";", cookie_start);
	    return cookie_start == -1 ? '' : decodeURI(document.cookie.substring(cookie_start + name.length + 1, (cookie_end > cookie_start ? cookie_end : document.cookie.length)));
    },


    set_cookie : function(name,value, seconds, path, domain, secure) {
        var expires = new Date();
        expires.setTime(expires.getTime() + seconds * 1000);
        document.cookie = name + '=' + encodeURI(value)
            + (expires ? '; expires=' + expires.toGMTString() : '')
            + (path ? '; path=' + path : '/')
            + (domain ? '; domain=' + domain : '')
            + (secure ? '; secure' : '');
    },

    check_mobile : function(mobile){
        var pattern = /^(0|86)?(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])[0-9]{8}$/;
        return pattern.test(mobile);
    },

    choose_select_option : function(obj,value){
        obj.find("option").each(function(){
            if($(this).val()==value) $(this).prop('selected',true);
            else $(this).prop('selected',false);
        })
        layui.form.render('select');
    },

    choose_radio : function(objs,value){
        objs.each(function(){
            if(this.value==value) $(this).prop('checked',true);
            else $(this).prop('checked',false);
        })
    },

    // value=0/1
    set_checkbox_value: function(obj,value){
        obj.prop('checked',value==1);
    },

    // return: 0/1
    get_checkbox_value : function(obj){
        return obj.prop('checked') ? 1 : 0;
    },

    add_agents_options : function(){
        var sobj = $("#agents");
        for(var agent_id in  dal.platServer.agents){
            var agent  = dal.platServer.agents[agent_id]
            var option = "<option value='" + agent.id + "'>" + agent.name + "</option>";
            sobj.append(option);
            for(var i=0;i < agent.list.length;i++){
                var agent2 = agent.list[i];
                option = "<option value='" + agent.id + "'>-->" + agent.name + "</option>";
                sobj.append(agent2);
            }
        }
        sobj.find("option:first").prop('selected',true);
    }

};
