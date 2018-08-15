class function_advocation extends visual_block
{
  constructor(vb={name:'none', x:0, y:0, z:0}){
    vb.type = 'function_advocation'
    super(vb)
    this.func=null;
    this.inst=null;
    this.args = [];
    this.arg_space = 5
    this.base_tag = null
  }
  set_holder(h){
    this.holder = h
  }
  set_func(func){
    if(func.type != 'def_function'){
      console.log('this is not function definition:'+func.emit());
    }else{
      this.func = func;
    }
  }  
  set_inst(inst){
    if(inst.type != 'reference' && inst.type != 'function_advocation'){
      console.log('this is not variable or function advocation:'+inst.emit());
    }else{
      this.inst = inst;
      inst.holder.rid_visualblock(inst)
      inst.base_tag.set_parent(this.base_tag.container)
      inst.set_holder(this)

      inst.base_tag.visible(false)
      inst.collider = []
    }
  }
  push_argument(e, callback=()=>{}){
    var me = this
    // add body
    var t = e.base_tag
    if(e==null || e.type === undefined) return
    // check duplicate
    for(var i=0; i<me.base_tag.container.numChildren; i++){
      var c = me.base_tag.container.getChildAt(i)
      if(c == t.container){
        me.rid_visualblock(e)
        setTimeout(()=>{
          me.args.push(e)
          me.update_children_pos()     
          callback()     
        },100)              
        return
      }
    }
    // add to array
    e.holder.rid_visualblock(e)
    // exchange parent
    t.set_parent(me.base_tag.container)
    e.set_holder(me)
    setTimeout(()=>{
      me.args.push(e)
      me.update_children_pos()    
      callback()     
    },100)    
    return
  }
  
  add_visualblock(arg){
    var me = this
    if(this.cjtext!=null){
      var tx = this.cjtext.x + this.cjtext.getMeasuredWidth() + 5
      for(var i=0; i<me.args.length; i++){
        if(me.args[i].base_tag.x > arg.base_tag.x){
          me.args.splice(i, 0, arg)
          arg.base_tag.tween().to({x:tx, y:2},200)
          arg.base_tag.x = tx
          arg.base_tag.y = 2
          arg.x = tx
          arg.y = 2
          me.update_children_pos()
          return
        }
        tx+=me.args[i].base_tag.w + this.arg_space 
      }  
    }
    me.args.push(arg);
    me.update_children_pos()
  }
  rid_visualblock(b){
    this.args = this.args.filter((v)=>{
      return v != b;
    })
    this.update_children_pos()
  }

  update_children_pos(){
    if(this.cjtext!=null){
      var pm = this.pm
      var tx = this.cjtext.x + this.cjtext.getMeasuredWidth() + 5
      for(var i=0; i<this.args.length; i++){
        if(this.args[i].base_tag!=null &&  !this.args[i].base_tag.f_drag){
          this.args[i].base_tag.set_pos(tx, 2, ()=>{pm.dirty=true}, 200)
          tx+=this.args[i].base_tag.w + this.arg_space 
        }
      }
      var me = this
      setTimeout(()=>{me.reflesh_text()},300)  
    }
  }
  reflesh_text(){
    this.cjtext.text = this.emit_inst_func() + '('
    this.cjtext_args.text = ')'
    if(this.args.length==0){
      this.cjtext_args.x = this.cjtext.x+this.cjtext.getMeasuredWidth()+5
    }else{
      this.cjtext_args.x = this.args[this.args.length-1].base_tag.x + this.args[this.args.length-1].base_tag.w
    }
    this.base_tag.resize(this.cjtext_args.x+30, this.base_tag.h)
    this.pm.dirty = true
  }

  init_render(pm, afterInit=()=>{}){
    var me = this
    me.pm = pm

    me.base_tag = new tag(pm, this.x, this.y, 200, 27, 'src/tag/tag_gray.png', onInit);
    me.base_tag.f_mobility = true
    me.base_tag.f_mouseover_shift = false
    me.base_tag.set_visualblock(this)
    
    var t = new createjs.Text(me.emit_inst_func(), "20px serif", "Black")
    t.x = 15
    t.y = 3
    me.cjtext = t
    var t = new createjs.Text(me.emit_args(), "20px serif", "Black")
    t.x = 10
    t.y = 3
    me.cjtext_args = t

    me.base_tag.onDrop = (t)=>{
      var e = t.visual_block
      if(e==null || e.type === undefined) return
      if(e.type != 'reference' && e.type != 'operator' && e.type !='literal' && e.type != 'function_advocation' && e.type != 'expressionArray'){
        me.base_tag.vibrate()
        return
      }
      // check duplicate
      for(var i=0; i<me.base_tag.container.numChildren; i++){
        var c = me.base_tag.container.getChildAt(i)
        if(c == t.container){
          me.rid_visualblock(e)
          setTimeout(()=>{
            me.add_visualblock(e)
          },100)
          return
        }
      }
      // add to array
      e.holder.rid_visualblock(e)
      // exchange parent
      t.set_parent(me.base_tag.container)
      e.set_holder(me)
      setTimeout(()=>{
        me.add_visualblock(e)
      },100)
    }
    
    me.base_tag.onClick = function(e){
      me.update_children_pos()
      if(!pm.clear_menu()){
        if(me.func!=null){
          if(me.func.base_tag==null){
            me.func = null
          }else{
            me.func.base_tag.vibrate()
            if(me.func.is_member){
              if(me.func.holder.base_tag==null){
                me.inst = null
                me.func = null
              }else{
                me.func.holder.base_tag.vibrate()
              }
            }  
          }
        }else{
          me.base_tag.vibrate()
        }
        if(me.inst!=null){
          if(me.inst.base_tag==null){
            me.inst=null
          }else{
            me.inst.base_tag.vibrate()
          }
        }

        var gx = (e.stageX - pm.top.x)/pm.top.scaleX -50
        var gy = (e.stageY - pm.top.y)/pm.top.scaleY -20

        var sw = []
//        sw.push({text:'Add args', img:'src/tag/tag_red.png', callback:(e,b)=>{
//        }})
        sw.push({text:'Remove', img:'src/tag/tag_white.png', callback:(e,b)=>{
          me.holder.rid_visualblock(me)
          me.finit_render(me.pm)
        }})
        var ts = new tagSwitch(pm, gx, gy, 150, 50, sw)
      }
    }
    function onInit(){
      me.base_tag.bg.addEventListener('mousedown',()=>{
        me.base_tag.z_top()
      })
      me.base_tag.bg.addEventListener('pressmove',()=>{
        me.base_tag.z_top()
      })

      me.base_tag.container.addChild(me.cjtext);
      me.base_tag.container.addChild(me.cjtext_args);
      me.update_children_pos()

      var id = setInterval(()=>{
        try{
          if(me.base_tag.container.visible){
            var f = false
            for(var s of me.args){
              if(s.base_tag.f_drag){
                f = true
                break
              }
            }
            if(f){
              me.args.sort((i1,i2)=>{
                var ind1 = i1.base_tag.x
                var ind2 = i2.base_tag.x
                if( ind1 > ind2 ) return 1;
                if( ind1 < ind2 ) return -1;
                return 0;
              })
              me.update_children_pos()
            }
          }  
        }catch(e){
          clearInterval(id)
        }
      }, 100)

      me.collider=[me.base_tag.bg]
      afterInit()
    }    
  }
  finit_render(pm){
    this.base_tag.parent.removeChild(this.base_tag.container)
    this.holder = null
    this.base_tag = null
    this.collider = []
  }
  get_collider_recursive(){
    var ret = []
    for(var i of this.args){
      ret = ret.concat(i.get_collider_recursive())     
    }
    ret = ret.concat(this.collider)
    return ret
  }
  get_visual_block_from_collider_recursive(c)
  {
    for(var i of this.args){
      var r = i.get_visual_block_from_collider_recursive(c)
      if(r!=null) return r  
    }
    for(var i of this.collider){
      if(i == c) return this
    }  
    return null
  }

  emit_inst_func(){
    var ret;
    if(this.func!=null){
      if(this.inst!=null){
        ret = this.inst.emit()+'.'+this.func.name;
      }else{
        if(this.func.is_member){
          ret = this.func.holder.name+'.'+this.func.name;
        }else{
          ret = this.func.name;
        }
      }  
    }
    return ret
  }
  emit_args(){
    var txt = this.args.map((i)=>{return i.emit()})
    var ARGS = txt.length==0?'':txt.reduce((x,y)=>{return x+', '+y})
    return ARGS
  }
  emit(tab=''){
    return tab+this.emit_inst_func()+'('+this.emit_args()+')';
  }
  serialize(){
    var ret = super.serialize()
    ret.func_id = this.func.id
    if(this.inst!=null){
      ret.inst = this.inst.serialize()
    }
    ret.args = this.args.map((i)=>{return i.serialize()})
    return ret
  }
  static deserialize(pm, json_obj, afterInit=(e)=>{}){
    var ret = function_advocation.create(pm, json_obj.name, json_obj.x, json_obj.y, ()=>{
      pm.set_serialized_idmap(json_obj.id, ret.id)
      
      async function get_args_and_init(){
        var r = await pm.async_run('find_visual_block_by_id', json_obj.func_id)
        ret.set_func(r)

        if('inst' in json_obj){
          var ti = await pm.async_run('deserialize_any', json_obj.inst)
          ret.set_inst(ti)
        }

        for(var a of json_obj.args){
          var r = await pm.async_run('deserialize_any', a)
          ret.push_argument(r)
        }
  
        ret.update_children_pos()
        afterInit(ret)
      }
      get_args_and_init()
  
    })
    return ret
  }
  static deserializeAST(pm, ast, afterInit=(e)=>{}){
    var n
    if(ast.callee.type == "Identifier"){
      n = ast.callee.name
    }else{
      n = ast.callee.property.name
    }
    var ret = function_advocation.create(pm, "call:"+n, 100, 100, ()=>{
      var count = 0

      pm.find_visual_block_by_name(n, ret, (t)=>{
        ret.set_func(t)
        ret.update_children_pos()
      })

      async function get_args_and_init(){
        if(ast.callee.type != "Identifier"){
          var r = await pm.async_run('deserialize_any', ast.callee.object)
          ret.set_inst(r)
         ret.update_children_pos()
        }

        for(var a of ast.arguments){
          var r = await pm.async_run('deserialize_any', a)
          ret.push_argument(r)
        }
  
        ret.update_children_pos()
        afterInit(ret)
      }
      get_args_and_init()
    })
    return ret
  }
  static deserializeAST_new(pm, ast, afterInit=(e)=>{}){
    var ret = function_advocation.create(pm, "new:"+ast.callee.name, 100, 100, ()=>{
      var count = 0

      pm.find_visual_block_by_name("new "+ast.callee.name, ret, (t)=>{
        ret.set_func(t)
      })
  
      async function get_args_and_init(){
        for(var a of ast.arguments){
          var r = await pm.async_run('deserialize_any', a)
          ret.push_argument(r)
        }
  
        ret.update_children_pos()
        afterInit(ret)
      }
      get_args_and_init()
    })
    return ret
  }
  static create(pm, name, x, y, afterInit=()=>{}){
    var c = new function_advocation({name:name, x:x, y:y})
    c.id = pm.num_obj
    pm.num_obj += 1
    c.init_render(pm,afterInit)
    pm.id_obj_map[c.id] = c
    pm.add_visualblock(c)
    return c
  }
}