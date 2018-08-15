class statementReturn extends visual_block
{
  constructor(vb={name:'none', x:0, y:0, z:0}){
    vb.type = 'statementReturn'
    super(vb)
    this.block=[]

    this.block_space = 5

    this.base_tag = null
    this.test_tag = null
    this.body_tags = null
  }
  set_holder(h){
    this.holder = h
  }
  add_visualblock(a){
    var me = this
    var old = null
    if(this.block.length>0) old = this.block[0]
    this.block[0] = a
    if(old){
      old.base_tag.set_pos(old.base_tag.x, old.base_tag.y+me.base_tag.h, ()=>{
        setTimeout(()=>{
          me.pm.onDrop(old.base_tag)
          old.base_tag.z_last()
        },100)
      }, 100)  
    }
    me.update_children_pos()   
  }
  rid_visualblock(b){
    this.block = this.block.filter((v)=>{
      return v != b;
    })        
    this.update_children_pos()
  }

  update_children_pos(){
    if(this.ctrltext!=null){
      this.ctrltext.text = "return"
      this.base_tag.bg.x = 0
      if(this.ctrltext!=null){
        var pm = this.pm
        var tx = this.ctrltext.x + this.ctrltext.getMeasuredWidth() + this.block_space
        if(this.block.length==1){
        //  this.block[0].base_tag.set_pos(tx, 2, ()=>{pm.dirty=true}, 200)
        //  this.base_tag.resize(tx+this.block[0].base_tag.w+this.block_space, 27)
        }else{
        //  this.base_tag.resize(tx+30, 27)              
        }
        //var me = this
        //setTimeout(()=>{me.reflesh_text()},300)  
      }
    }
  }

  init_render(pm, afterInit=()=>{}){
    var me = this
    me.pm = pm

    me.base_tag = new tag(pm, this.x, this.y, 25, 25, 'src/tag/tack_white.png', onInit);
    me.base_tag.f_mobility = true
    me.base_tag.f_mouseover_shift = false
    me.base_tag.set_visualblock(this)
    
    var t = new createjs.Text("return", "20px serif", "Blue")
    t.x = 5
    t.y = 3
    me.ctrltext = t

    me.base_tag.onDrop = (t)=>{
      var e = t.visual_block
      if(e==null || e.type === undefined) return
      if(me.block.length>0 || ( e.type != "def_variable" && e.type != 'reference' && e.type != 'operator' && e.type !='literal' && e.type != 'function_advocation' && e.type != 'rawcode')){
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
        var gx = (e.stageX - pm.top.x)/pm.top.scaleX -50
        var gy = (e.stageY - pm.top.y)/pm.top.scaleY -20

        var sw0 = []
        var sw1 = []
        var sw2 = []
        var sw3 = []
        var sw4 = []

        sw0.push({text:'Remove', img:'src/tag/tag_white.png', callback:(e,b)=>{
          me.holder.rid_visualblock(me)
          me.finit_render(me.pm)
        }})
      }
    }
    function onInit(){
      me.base_tag.bg.addEventListener('mousedown',()=>{
        me.base_tag.z_top()
      })
      me.base_tag.bg.addEventListener('pressmove',()=>{
        me.base_tag.z_top()
      })

      me.base_tag.container.addChild(me.ctrltext);
      me.update_children_pos()

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
    for(var i of this.block){
      ret = ret.concat(i.get_collider_recursive())
    }
    ret = ret.concat(this.collider)
    return ret
  }
  get_visual_block_from_collider_recursive(c)
  {
    for(var i of this.block){
      var r = i.get_visual_block_from_collider_recursive(c)
      if(r!=null) return r
    }
    for(var i of this.collider){
      if(i == c) return this
    }
    return null
  }
  find_by_name(name, check_holder=true){
    for(var b of this.block){
      var t = b.find_by_name(name, false)
      if(t) return t
    }
    if(this.name==name){
      return this
    }else if(this.holder&&check_holder){
      return this.holder.find_by_name(name)
    }else{
      return null
    }
  }
  
  emit(tab=''){
    var ret = tab
    ret += "return "
    if(this.block.length==1){
      ret +=this.block[0].emit()
    }
    return ret
  }
  serialize(){
    var ret = super.serialize()
    ret.block = this.block.map((i)=>{return i.serialize()})
    return ret
  }
  static deserialize(pm, json_obj, afterInit=(e)=>{}){
    var ret = statementReturn.create(pm, json_obj.name, json_obj.x, json_obj.y, ()=>{
      pm.set_serialized_idmap(json_obj.id, ret.id)

      var count = 0
      for(var vb of json_obj.block){
        count++
        pm.deserialize_any(vb, (e)=>{
          ret.base_tag.onDrop(e.base_tag)
          count--
        })
      }

      var iId = setInterval(()=>{
        if(count==0){
          ret.update_children_pos()
          afterInit(ret)
          clearInterval(iId)
        }
      },300)

    })
    return ret
  }
  static deserializeAST(pm, ast, afterInit=(e)=>{}){
    var ret = statementReturn.create(pm, "control", 100, 100, ()=>{
      var count = 0
      pm.deserialize_any(ast.argument, (e)=>{
        ret.base_tag.onDrop(e.base_tag)
        ret.update_children_pos()
        afterInit(ret)
      })  
    })
    return ret    
  }

  static create(pm, name, x, y, afterInit=()=>{}){
    var c = new statementReturn({name:name, x:x, y:y})
    c.id = pm.num_obj
    pm.num_obj += 1
    c.init_render(pm,afterInit)
    pm.id_obj_map[c.id] = c
    pm.add_visualblock(c)
    return c
  }
}