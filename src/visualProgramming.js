//
// load script
//
function get_base_path() {
    var scripts = document.getElementsByTagName('script');
    var script = scripts[scripts.length - 1];
    for(var i of scripts){
      var f = i.src.indexOf('visualProgramming.js');
      if(f!=-1){
        return i.src.substr(0, f);
      }    
    }
    return "";  
  }
  
  function loadScript(url, callback) {
    var bpath = get_base_path();
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = bpath+url;
  
    if ( script.readyState ) {
      script.onreadystatechange = function() {
        if ( script.readyState === 'loaded' || script.readyState === 'complete' ) {
          script.onreadystatechange = null;
          callback();
        };
      };
    } else {
      script.onload = function() {
        callback();
      };
    };
    document.getElementsByTagName('head')[0].appendChild(script);
  };
  
  //
  // microthread
  //
  $.extend({
    sleep: (t)=>{
      var d = $.Deferred();
      setTimeout(()=>{d.resolve();}, t);
      return d;
    },
    microthread: (gen)=>{
      var d = $.Deferred();
      var step =(a)=>{
        if(a.value!==undefined){
          $.when(a.value)
          .done(function(result){
            a = g.next(result);
            step(a);
          })
          .fail(function(){
            d.reject.apply(this, arguments);
          });
        }else{
          d.resolve();
        }
      };
      var g = gen();
      step(g.next());
      return d;
    },
    async: (fun)=>{
      var d = $.Deferred();
      setTimeout(()=>{ fun(); d.resolve();}, 0);
      return d;
    },
    asyncCallBack: (fun, ...args)=>{
      var d = $.Deferred();
      setTimeout(()=>{ fun(...args, ()=>{d.resolve();});}, 0);
      return d;    
    },
    asyncLoad:(path)=>{
      return $.asyncCallBack(loadScript, path);  
    }
  });
  
  function* task(){
    yield $.asyncLoad('visual_block/visual_block.js');
    yield $.asyncLoad('visual_block/rawcode.js');
    yield $.asyncLoad('visual_block/def_class.js');
    yield $.asyncLoad('visual_block/def_variable.js');
    yield $.asyncLoad('visual_block/def_function.js');
    yield $.asyncLoad('visual_block/reference.js');
    yield $.asyncLoad('visual_block/operator.js');
    yield $.asyncLoad('visual_block/literal.js');
    yield $.asyncLoad('visual_block/function_advocation.js');
  
    yield $.asyncLoad('tag/tag.js');
    yield $.asyncLoad('tag/tagButton.js');
    yield $.asyncLoad('tag/tagInput.js');
    yield $.asyncLoad('tag/tagSwitch.js');
    yield $.asyncLoad('tag/create_editor.js');
  
    yield $.asyncLoad('program_manager_impl.js');
    yield $.asyncLoad('visual_programming_test.js');
  }
  
  var d = $.microthread(task);
  
  // pure interface
  class program_manager{
    constructor(canvas_id, createjs, ace){
      this.inst = null;
      d.then(()=>{
        this.inst = new program_manager_impl(...arguments);
        this.set_deserializer('rawcode', rawcode.deserialize)
        this.set_deserializer('def_class', def_class.deserialize)
        this.set_deserializer('def_variable', def_variable.deserialize)
        this.set_deserializer('def_function', def_function.deserialize)
        this.set_deserializer('reference', reference.deserialize)
        this.set_deserializer('operator', operator.deserialize)
        this.set_deserializer('literal', literal.deserialize)
        this.set_deserializer('function_advocation', function_advocation.deserialize)
      })
    }
    afterload(func, ...args){
      d.then(()=>{
        func(...args);
      })
    }
  
    set_size(tx, ty){
      if(this.inst===null) console.log('yet load');
      return this.inst.set_size(...arguments);
    }
    set_deserializer(){
      if(this.inst===null) console.log('yet load');
      return this.inst.set_deserializer(...arguments);
    }
  /*  
    clear_menu(){
      if(this.inst===null) console.log('yet load');
      return this.inst.clear_menu(...arguments);
    }
    create_variable(name, x, y){
      if(this.inst===null) console.log('yet load');
      return this.inst.create_variable(...arguments);
    }
    create_function(name, x, y){
      if(this.inst===null) console.log('yet load');
      return this.inst.create_function(...arguments);
    }
    create_reference(x, y){
      if(this.inst===null) console.log('yet load');
      return this.inst.create_reference(...arguments);
    }
    create_operator(x, y){
      if(this.inst===null) console.log('yet load');
      return this.inst.create_operator(...arguments);
    }
    create_function_advocation(x, y){
      if(this.inst===null) console.log('yet load');
      return this.inst.create_function_advocation(...arguments);
    }
    create_class(name, x, y){
      if(this.inst===null) console.log('yet load');
      return this.inst.create_class(...arguments);
    }
    create_rawcode(x, y){
      if(this.inst===null) console.log('yet load');
      return this.inst.create_rawcode(...arguments);
    }
    rid_visualblock(c){
      if(this.inst===null) console.log('yet load');
      return this.inst.rid_visualblock(...arguments);
    }
    set_pos(tx, ty){
      if(this.inst===null) console.log('yet load');
      return this.inst.set_pos(...arguments);
    }
    set_scale(s){
      if(this.inst===null) console.log('yet load');
      return this.inst.set_scale(...arguments);
    }
    set_scale_pos(s, tx, ty){
      if(this.inst===null) console.log('yet load');
      return this.inst.set_scale_pos(...arguments);
    }  
    get_scale(){
      if(this.inst===null) console.log('yet load');
      return this.inst.get_scale(...arguments);
    }
    emit(){
      if(this.inst===null) console.log('yet load');
      return this.inst.emit(...arguments);
    }
    serialize(){
      if(this.inst===null) console.log('yet load');
      return this.inst.serialize(...arguments);
    }
    deserialize(){
      if(this.inst===null) console.log('yet load');
      return this.inst.deserialize(...arguments);
    }
  */  
  }
  
  