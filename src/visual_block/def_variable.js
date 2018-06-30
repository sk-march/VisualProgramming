class def_variable extends visual_block
{
  constructor(vb={name:'none', x:0, y:0, z:0}){
    vb.type = 'def_variable';
    super(vb)
    this.type = 'def_variable'
    this.definition_link = null
    this.definition = 'var'
    this.is_member = false
    this.holder = null
    this.base_tag = null
    this.collider = []
  }
  set_holder(h){
    this.holder = h
  }
  set_type(t){
    this.definition = t
    if(this.cjtext != null){
      this.cjtext.text = this.definition +' '+this.name
      var w = this.cjtext.getMeasuredWidth();
      if(w > 180){
        this.cjtext.text = (this.definition +' '+this.name).slice(0,20)+'...'
      }  
    }
  }
  reflesh_type(){
    if(this.definition_link!=null){
      this.set_type(this.definition_link.name)
    }
  }
  rename(newname){
    if(newname!==undefined && newname!=''){
      this.name = newname
      this.cjtext.text = this.definition +' '+this.name
      var w = this.cjtext.getMeasuredWidth();
      if(w > 180){
        this.cjtext.text = (this.definition +' '+this.name).slice(0,20)+'...'
      }
    }
  }
  init_render(pm, afterInit=()=>{}){
    var me = this
    me.pm = pm
    me.base_tag = new tag(pm, this.x, this.y, 25, 25, 'src/tag/tack_red.png', onInit);
    me.base_tag.f_mobility = true
    me.base_tag.f_mouseover_shift = false
    me.base_tag.set_visualblock(this)
    
    me.base_tag.onDblclick = (e)=>{
      var ex = (e.stageX - pm.top.x)/pm.top.scaleX 
      var ey = (e.stageY - pm.top.y)/pm.top.scaleY
      var gx = ex -20
      var gy = ey -20

      var re = reference.create(me.pm, 'reference:'+me.name, ex,ey)
      re.set_refer(me)
      re.reflesh_link()
      setTimeout(()=>{
        re.base_tag.tween()
          .to({y:ey + 30}, 100)
          .call(()=>{
            var t = me.pm.hit_test(e.stageX, e.stageY, re.base_tag.bg)
            if(t!=null){
              t.base_tag.onDrop(re.base_tag)
            }  
          })    
      }, 50)  
    }    
    me.base_tag.onClick = function(e){
      me.reflesh_type()
      if(!pm.clear_menu()){
        if(me.definition_link!=null){
          if(me.definition_link.base_tag==null){
            me.definition_link = null
            me.base_tag.vibrate()
          }else{
            me.definition_link.base_tag.vibrate()
          }
        }else{
          // me.base_tag.vibrate()
        }
        var ex = (e.stageX - pm.top.x)/pm.top.scaleX 
        var ey = (e.stageY - pm.top.y)/pm.top.scaleY
        var gx = ex -20
        var gy = ey -20

        var sw = []
        sw.push({text:'Make reference', img:'src/tag/tag_red.png', callback:(e,b)=>{
          var re = reference.create(me.pm, 'reference:'+me.name, ex,ey)
          re.set_refer(me)
          re.reflesh_link()
          setTimeout(()=>{
            re.base_tag.tween()
              .to({y:ey + 30}, 100)
              .call(()=>{
                var t = me.pm.hit_test(e.stageX, e.stageY, re.base_tag.bg)
                if(t!=null){
                  t.base_tag.onDrop(re.base_tag)
                }
              })    
          }, 50)
        }})

        if(me.definition_link==null){
          sw.push({text:'Set type', img:'src/tag/tag_red.png', callback:(e,b)=>{
            var bgx = gx+10
            var bgy = gy
            var it = new tagInput(pm, 'new type', 'type_name_'+me.id, bgx, bgy, 280, 40, (text)=>{
              me.set_type(text)
              console.log(text);
            })  
          }})  
        }else{
          sw.push({text:'Reflesh type', img:'src/tag/tag_red.png', callback:(e,b)=>{
            me.reflesh_type()
          }})
        }
        sw.push({text:'Rename', img:'src/tag/tag_red.png', callback:(e,b)=>{
          var bgx = gx+10
          var bgy = gy
          var it = new tagInput(pm, 'new name', 'inst_name_'+me.id, bgx, bgy, 280, 40, (text)=>{
            me.rename(text)
            console.log(text);
          })
        }})
        sw.push({text:'Remove variable', img:'src/tag/tag_red.png', callback:(e,b)=>{
          me.holder.rid_visualblock(me)
          me.finit_render(me.pm)
        }})
        var ts = new tagSwitch(pm, gx, gy, 200, 50, sw)
      }
    }
    function onInit(){
      me.base_tag.bg.addEventListener('mousedown',()=>{
        me.base_tag.z_top()
      })
      me.base_tag.bg.addEventListener('pressmove',()=>{
        me.base_tag.z_top()
      })
      var text = me.definition + " " + me.name
      var t = new createjs.Text(text, "20px serif", "Black")
      var w = t.getMeasuredWidth();
      if(w > 180){
        t.text = text.slice(0,20)+'...'
      }
      t.x = 30
      t.y = 0
      me.base_tag.container.addChild(t);
      me.cjtext = t

      //me.collider=[me.base_tag.bg]
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
    return this.collider
  }
  get_visual_block_from_collider_recursive(c)
  {
    for(var i of this.collider){
      if(i == c) return this
    }
    return null
  }

  emit(tab=''){
    this.reflesh_type()
    if(this.is_member){
      if(this.definition == 'var'){
        return tab + 'this.'+this.name;
      }else{
        if(this.definition_link==null){
          return tab + 'this.'+this.name+' = new '+this.definition.name+'()'
        }else{
          return tab + 'this.'+this.name+' = new '+this.definition_link.name+'()'
        }
      }  
    }else{
      if(this.definition == 'var'){
        return tab + 'var '+this.name;
      }else{
        if(this.definition_link==null){
          return tab + 'var '+this.name+' = new '+this.definition.name+'()'      
        }else{
          return tab + 'var '+this.name+' = new '+this.definition_link.name+'()'
        }
      }  
    }
  }
  serialize(){
    var ret = super.serialize()
    ret.is_member = this.is_member
    ret.definition = this.definition
    if(this.definition_link) ret.definition_link_id = this.definition_link.id
    // if(this.holder) ret.holder_id = this.holder.id // いらない、デシリアライズで親に作られて、set_parentするからいい。
    return ret
  }
  static deserialize(pm, json_obj, afterInit=(e)=>{}){
    var ret = def_variable.create(pm, json_obj.name, json_obj.x, json_obj.y, ()=>{
      pm.set_serialized_idmap(json_obj.id, ret.id)

      ret.is_member = json_obj.is_member
      ret.definition = json_obj.definition
      if('definition_link_id' in json_obj){
        pm.find_visual_block_by_id(json_obj.definition_link_id, (r)=>{
          ret.definition_link=r
          ret.reflesh_type()
          afterInit(ret)
        })  
      }else{
        ret.reflesh_type()
        afterInit(ret)      
      }
    })
    return ret
  }
  static create(pm, name, x, y, afterInit=()=>{}){
    var c = new def_variable({name:name, x:x, y:y})
    c.id = pm.num_obj
    pm.num_obj += 1
    c.init_render(pm,afterInit)
    pm.id_obj_map[c.id] = c
    pm.add_visualblock(c)
    return c
  }
}
