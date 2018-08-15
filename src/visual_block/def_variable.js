class def_variable extends visual_block
{
  constructor(vb={name:'none', x:0, y:0, z:0}){
    vb.type = 'def_variable';
    super(vb)
    this.type = 'def_variable'
    this.definition_link = null
    this.init = null
    this.definition = 'var'
    this.is_member = false
    this.base_tag = null
  }
  set_holder(h){
    this.holder = h
  }
  set_type(t){
    this.definition = t
    this.reflesh()
  }
  set_name(newname){
    if(newname!==undefined && newname!=''){
      this.name = newname
      this.reflesh()
    }
  }
  reflesh(){
    // text
    if(this.cjtext != null){
      this.cjtext.text = this.definition +' '+this.name
      if(this.init) this.cjtext.text += ' = '
      var tx = this.cjtext.x + this.cjtext.getMeasuredWidth();
      if(this.init){
        this.init.base_tag.set_pos(tx, 0)
        tx += this.init.base_tag.w + 10
      }else{
        tx += 40
      }
      this.base_tag.resize(tx, this.base_tag.h)
    }
  }
  add_visualblock(i){
    var old = this.init
    this.init = i
    if(old){
      old.base_tag.set_pos(old.base_tag.x, old.base_tag.y+me.base_tag.h, ()=>{
        setTimeout(()=>{
          me.pm.onDrop(old.base_tag)
          old.base_tag.z_last()
        },100)
      }, 100)  
    }
    this.reflesh()
  }
  rid_visualblock(b){
    if(this.init == b){
      this.init = null
    }
    this.reflesh()
  }

  init_render(pm, afterInit=()=>{}){
    var me = this
    me.pm = pm

    me.base_tag = new tag(pm, this.x, this.y, 100, 27, 'src/tag/tag_white.png', onInit);
    me.base_tag.f_mobility = true
    me.base_tag.f_mouseover_shift = false
    me.base_tag.set_visualblock(this)

    me.base_tag.onDrop = (t, callback=()=>{})=>{
      var e = t.visual_block
      if(e==null || e.type === undefined) return
      if(me.init!=null || ['rawcode', 'reference', 'operator', 'literal', 'def_function', 'function_advocation', 'expressionArray'].indexOf(e.type)==-1){
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
        me.add_visualblock(e)
        callback()
      },100)
    }

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
      me.reflesh()
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
            me.reflesh()
          }})
        }
        sw.push({text:'Rename', img:'src/tag/tag_red.png', callback:(e,b)=>{
          var bgx = gx+10
          var bgy = gy
          var it = new tagInput(pm, 'new name', 'inst_name_'+me.id, bgx, bgy, 280, 40, (text)=>{
            me.set_name(text)
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
      me.reflesh()
      
      me.bg = new createjs.Bitmap('src/tag/tack_red.png');
      me.bg.image.onload = function() {
        me.bg.scaleX = 25 / me.bg.getBounds().width;
        me.bg.scaleY = 25 / me.bg.getBounds().height;
        me.base_tag.container.addChild(me.bg);
        pm.dirty = true
      };  

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
    if(this.init){
      ret = ret.concat(this.init.get_collider_recursive())
    }
    ret = ret.concat(this.collider)
    return ret
  }
  get_visual_block_from_collider_recursive(c)
  {
    if(this.init){
      var r = this.init.get_visual_block_from_collider_recursive(c)
      if(r!=null) return r  
    }
    for(var i of this.collider){
      if(i == c) return this
    }
    return null
  }

  emit(tab=''){
    this.reflesh()
    var ret = ''
    if(this.is_member){
      if(this.definition == 'var' || this.definition == 'let' || this.definition=='const'){
        ret = tab + 'this.'+this.name;
      }else{
        if(this.definition_link==null){
          ret = tab + 'this.'+this.name //+' = new '+this.definition.name+'()'
        }else{
          ret = tab + 'this.'+this.name //+' = new '+this.definition_link.name+'()'
        }
      }  
    }else{
      if(this.definition == 'var' || this.definition == 'let' || this.definition=='const'){
        ret = tab + this.definition+' '+this.name;
      }else{
        if(this.definition_link==null){
          ret = tab + 'var '+this.name //+' = new '+this.definition.name+'()'      
        }else{
          ret = tab + 'var '+this.name //+' = new '+this.definition_link.name+'()'
        }
      }  
    }
    if(this.init){
      var init_txt = this.init.emit(tab)
      ret += " = " + init_txt.slice(tab.length)
    }
    return ret
  }
  serialize(){
    var ret = super.serialize()
    ret.is_member = this.is_member
    ret.definition = this.definition
    if(this.definition_link) ret.definition_link_id = this.definition_link.id
    if(this.init){
      ret.init = this.init.serialize()
    }
    // if(this.holder) ret.holder_id = this.holder.id // いらない、デシリアライズで親に作られて、set_parentするからいい。
    return ret
  }
  static deserialize(pm, json_obj, afterInit=(e)=>{}){
    var ret = def_variable.create(pm, json_obj.name, json_obj.x, json_obj.y, ()=>{
      pm.set_serialized_idmap(json_obj.id, ret.id)

      ret.is_member = json_obj.is_member
      ret.definition = json_obj.definition

      var count = 0
      if('definition_link_id' in json_obj){
        count++
        pm.find_visual_block_by_id(json_obj.definition_link_id, (r)=>{
          ret.definition_link=r
          count--
        })  
      }
      if('init' in json_obj){
        count++
        pm.deserialize_any(json_obj.init, (e)=>{
          ret.base_tag.onDrop(e.base_tag)
          count--
        })
      }

      var iId = setInterval(()=>{
        if(count == 0){
          setTimeout(()=>{
            ret.reflesh()
            afterInit(ret)
          }, 100)
          clearInterval(iId)
        }
      },100)
    })
    return ret
  }
  static deserializeAST(pm, ast, afterInit=(e)=>{}){
    var me = this
    var ret = def_variable.create(pm, ast.declarations[0].id.name, 100, 100, ()=>{
      //ret.is_member = json_obj.is_member
      ret.definition = ast.kind
      ret.name = ast.declarations[0].id.name
      if(ast.declarations[0].init != null){
        if(ast.declarations[0].init.type == "NewExpression"){
          ret.definition = ast.declarations[0].init.callee.name
          pm.find_visual_block_by_name(ret.definition, ret, (r)=>{
            ret.definition_link = r
            ret.reflesh()
            afterInit(ret)
          })
          var i = pm.deserialize_any(ast.declarations[0].init, ()=>{
            ret.base_tag.onDrop(i.base_tag)
          })
        }else{
          var i = ast.declarations[0].init
          var t = pm.deserialize_any(i, (r)=>{
            ret.base_tag.onDrop(t.base_tag, ()=>{
              ret.reflesh()
              afterInit(ret)        
            })
          })  
        }
      }else{
        ret.reflesh()
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
