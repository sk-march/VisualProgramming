if(!('$' in this)){
  console.log("jloader.js require jquery!!!")
}else{
  async function jloader_load_chamber(){
    var counter=0
    while(true){
      if($.jloader.load_target.length!=0){
        counter=0
        await $.jloader.loadScript($.jloader.load_target[0])
        $.jloader.f_loaded_path.push($.jloader.load_target[0])
        $.jloader.load_target.shift()
      }else{
        counter++
        if(counter < 100){
          await new Promise(resolve => setTimeout(resolve, 0))
        }else{
          $.jloader.loadDiffer=null
          break
        }
      }
    }
  }
  $.extend({
    jloader:{
      load_target: [],
      f_loaded_path: [],
      loadDiffer:null,

      condition: (cond, do_then, check_period=0)=>{
        var d = $.Deferred()
        var id = setInterval(()=>{
          if(typeof(cond)==='function' && cond()){
            do_then()
            clearInterval(id)
            d.resolve();
          }
        }, check_period)
        return d;
      },

      // find base path from caller html file
      get_base_path: ()=> {
        var scripts = document.getElementsByTagName('script');
        var script = scripts[scripts.length - 1];
        for(var i of scripts){
          var f = i.src.indexOf('jloader.js');
          if(f!=-1){
            return i.src.substr(0, f);
          }    
        }
        return "";  
      },
      // Load Script
      loadScript:(url)=>{
        var bpath = $.jloader.get_base_path();
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = bpath+url;
    
        var d = $.Deferred();

        if ( script.readyState ) {
          script.onreadystatechange = function() {
            if ( script.readyState === 'loaded' || script.readyState === 'complete' ) {
              script.onreadystatechange = null;
            };
          };
        } else {
          script.onload = function() {
            d.resolve()
          };
        };
        document.getElementsByTagName('head')[0].appendChild(script);  
        return d;
      },

      from: (path)=>{
        if(Array.isArray(path)){
          $.jloader.load_target = $.jloader.load_target.concat(path)
        }else{
          $.jloader.load_target.push(path)
        }
        if($.jloader.loadDiffer==null){
          $.jloader.loadDiffer = jloader_load_chamber()
        }
        return $.jloader.loadDiffer
      },
      after:(path, callback)=>{
        $.jloader.condition(()=>{return ($.jloader.f_loaded_path.indexOf(path)!=-1)},()=>{
          callback();
        })
      }     
    }
  })
}
