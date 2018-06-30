class def_function extends visual_block
{
  constructor(vb={name:'none', x:0, y:0, z:0}){
    vb.type = 'def_function'
    super(vb)
    this.args = ''
    this.body = []
    this.is_member=false;
    this.holder = null
    this.base_tag = null
    this.collider = []
    this.impl_tag = null
    this.impl_line = null
  }
  set_holder(h){
    this.holder = h
    this.reflesh_text()
  }
  set_args(a){
    this.args = a;
    this.reflesh_text()
  }
  add_visualblock(b){
    var me = this
    var th = 30
    for(var i=0; i<me.body.length; i++){
      if(me.body[i].base_tag.y > b.base_tag.y){
        me.body.splice(i, 0, b)
        b.base_tag.tween().to({x:30, y:th},200)
        b.base_tag.visual_block.x = 30
        b.base_tag.visual_block.y = th  
        b.base_tag.x = 30
        b.base_tag.y = th
  
        me.update_children_pos()
        return
      }
      th+=me.body[i].base_tag.h
    }
    me.body.push(b);
    me.update_children_pos()
  }
  rid_visualblock(b){
    this.body = this.body.filter((v)=>{
      return v != b;
    })
    this.update_children_pos()
  }
  update_children_pos(){
    var th = 30
    for(var i=0; i<this.body.length; i++){
      if(this.body[i].base_tag!=null &&  !this.body[i].base_tag.f_drag){
        this.body[i].base_tag.tween().to({x:30, y:th},200)
        this.body[i].base_tag.visual_block.x = 30
        this.body[i].base_tag.visual_block.y = th  
        this.body[i].base_tag.x = 30
        this.body[i].base_tag.y = th

        th+=this.body[i].base_tag.h
      }
    }  
  }
  sort_visualblock(type='z_order'){
    var me = this
    if(type == 'z_order'){
      this.body.sort((i1,i2)=>{
        var ind1 = me.impl_tag.container.getChildIndex(i1.base_tag.container)
        var ind2 = me.impl_tag.container.getChildIndex(i2.base_tag.container)
        if( ind1 > ind2 ) return -1;
        if( ind1 < ind2 ) return 1;
        return 0;
      })     
    }else if(type=='name'){
      this.body.sort((i1,i2)=>{
        if( i1.name < i2.name ) return -1;
        if( i1.name > i2.name ) return 1;
        return 0;
      })           
    }
  }
  rename(newname){
    if(newname!==undefined && newname!=''){
      this.name = newname
      this.reflesh_text()
    }
  }
  reflesh_text(){
    if(this.cjtext) this.cjtext.text = this.emit_name_args()
    if(this.impl_tag) this.impl_tag.update_text()
    if(this.impl_line)this.impl_line.update_line()
  }
  init_render(pm, afterInit=()=>{}){
    var me = this
    me.pm = pm
    me.base_tag = new tag(pm, this.x, this.y, 25, 25, 'src/tag/tack_blue.png', onInit);
    me.base_tag.f_mobility = true
    me.base_tag.f_mouseover_shift = false
    me.base_tag.set_visualblock(this)

    me.base_tag.onDblclick = ()=>{
      if(me.impl_tag.is_visible()){
        me.impl_tag.tween()
        .to({alpha:1}, 0)
        .to({alpha:0, x:me.impl_tag.x+10}, 100)
        .call(()=>{
          me.impl_tag.x -=10
          me.impl_tag.visible(false)
          me.collider=[]
          me.impl_line.update_line()
          me.base_tag.z_top()
          me.pm.clear_menu()              
        })
      }else{
        me.impl_tag.tween()
        .call(()=>{
          me.impl_tag.visible(true)
          me.collider=[me.impl_tag.bg]
          me.impl_line.update_line()
          me.base_tag.z_top()
          me.pm.clear_menu()              
        })        
        .to({alpha:1}, 0)
      }
    }
    me.base_tag.onClick = function(e){
      if(!pm.clear_menu()){
        me.reflesh_text()
        var gx = (e.stageX - pm.top.x)/pm.top.scaleX -20
        var gy = (e.stageY - pm.top.y)/pm.top.scaleY -20

        var ts = new tagSwitch(me.pm, gx, gy, 210, 50, [
          {text:'Set arguments', img:'src/tag/tag_blue.png'},
          {text:'Call statement', img:'src/tag/tag_white.png'},
          {text:'Rename', img:'src/tag/tag_blue.png'},
          {text:'Remove function', img:'src/tag/tag_white.png'},
          {text:'Run instantly', img:'src/tag/tag_white.png'}
        ])
        ts.buttons[0].callback = (e, b)=>{
          var it = new tagInput(me.pm, 'Enter args', 'arguments_'+me.id, gx, gy, 500, 40, function(text){
            if(text!==undefined && text!=''){
              me.set_args(text)
            }
          })
        }
        ts.buttons[1].callback = (e, b)=>{
          var fa = function_advocation.create(me.pm,'call:'+me.name,gx,gy)
          fa.set_func(me)
          fa.reflesh_text()
          setTimeout(()=>{
            fa.base_tag.tween()
              .to({y:gy + 30}, 100)
              .call(()=>{
                var t = me.pm.hit_test(e.stageX, e.stageY, fa.base_tag.bg)
                if(t!=null){
                  t.base_tag.onDrop(fa.base_tag)
                }  
              })              
          }, 50)                        
        }
        ts.buttons[2].callback = (e, b)=>{
          b.remove()
          var bgx = gx+10
          var bgy = gy
          var it = new tagInput(pm, 'new name', 'inst_name_'+me.id, bgx, bgy, 280, 40, (text)=>{
            me.rename(text)
          })
        }        
        ts.buttons[3].callback = (e, b)=>{
          me.holder.rid_visualblock(me)
          me.finit_render(me.pm)
        }
        ts.buttons[4].callback = (e, b)=>{
          //console.log(me.emit())
          me.run()
        }
      }
    }
    me.base_tag.onDrop =(t)=>{
      // add body
      var e = t.visual_block
      if(e==null || e.type === undefined) return
      // check duplicate
      for(var i=0; i<me.impl_tag.container.numChildren; i++){
        var c = me.impl_tag.container.getChildAt(i)
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
      t.set_parent(me.impl_tag.container)
      e.set_holder(me)
      setTimeout(()=>{
        me.add_visualblock(e)
      },100)              
    }
    function onInit(){
      me.base_tag.bg.addEventListener('mousedown',()=>{
        me.base_tag.z_top()
      })
      me.base_tag.bg.addEventListener('pressmove',()=>{
        me.base_tag.z_top()
      })

      var t = new createjs.Text('', "20px serif", "Black")
      t.x = 30
      t.y = 0
      me.base_tag.container.addChild(t);
      me.cjtext = t
      me.reflesh_text()

      me.impl_line = new createjs.Shape()
      me.impl_line.update_line=()=>{
        var w = me.cjtext.getMeasuredWidth();
        var x1,x2,y1,y2,x3,y3;
        x1 = me.impl_tag.w/2
        y1 = me.impl_tag.h/2

        if(me.impl_tag.x+x1 > (w+50)/2){
          x2 = -me.impl_tag.x+30+w
        }else{
          x2 = -me.impl_tag.x+12          
        }
        if(me.impl_tag.y < -y1){
          y2 = -me.impl_tag.y+12
        }else{
          y2 = -me.impl_tag.y+12          
        }

        if(me.impl_tag.x>-me.impl_tag.w && me.impl_tag.x<w){
          x3 = me.impl_tag.w/2
        }else if(me.impl_tag.x<-me.impl_tag.w){
          x3 = me.impl_tag.w
        }else{
          x3 = 0
        }
        if(me.impl_tag.y>-me.impl_tag.h && me.impl_tag.y<20){
          y3 = me.impl_tag.h/2
        }else if(me.impl_tag.y<-me.impl_tag.h){
          y3 = me.impl_tag.h
        }else{
          y3 = 0
        }
        
        me.impl_line.graphics.clear()
        me.impl_line.graphics.beginStroke("#5555ff")
        me.impl_line.graphics.setStrokeDash([10,15],0)
        me.impl_line.graphics.setStrokeStyle(2)
        me.impl_line.graphics.moveTo(x3, y3)
        me.impl_line.graphics.lineTo(x2, y2)
        me.impl_line.graphics.endStroke()
      }
      me.impl_tag = new tag(pm, me.x+5, me.y+30, 200, 200, 'src/tag/tag_blue.png',()=>{
        me.impl_tag.f_dropout = false
        me.impl_tag.set_visualblock(null)
        me.impl_tag.f_mobility = true
        me.impl_tag.f_mouseover_shift = false
        me.impl_tag.set_parent(me.base_tag.container)              
        me.impl_line.update_line()
        me.impl_tag.container.addChild(me.impl_line)  
        me.impl_tag.container.setChildIndex(me.impl_line,0)

        var t = new createjs.Text('', "20px serif", "Black");
        t.x = 20
        t.y = 10
        me.impl_tag.container.addChild(t);
        me.impl_tag.cjtext = t
        me.impl_tag.update_text()

        afterInit()
      })
      me.impl_tag.update_text=()=>{
        me.impl_tag.cjtext.text = me.emit_name_args()
      }
      me.impl_tag.onDrag = ()=>{
        me.impl_line.update_line()
        me.base_tag.z_top()
      }
      me.impl_tag.onDblclick = ()=>{
        me.base_tag.onDblclick()
      }
      me.impl_tag.onClick = (e)=>{
        if(!pm.clear_menu()){
          me.reflesh_text()
          me.base_tag.z_top()
          var x = (e.stageX - pm.top.x)/pm.top.scaleX
          var y = (e.stageY - pm.top.y)/pm.top.scaleY
        }
      }

      var id = setInterval(()=>{
        if(me.base_tag==null || me.impl_tag==null) clearInterval(id)
        if(me.impl_tag && me.impl_tag.container && me.impl_tag.container.visible){
          var f = false
          for(var s of me.body){
            if(s.base_tag.f_drag){
              f = true
              break
            }
          }
          if(f){
            me.body.sort((i1,i2)=>{
              var ind1 = i1.base_tag.y
              var ind2 = i2.base_tag.y
              if( ind1 > ind2 ) return 1;
              if( ind1 < ind2 ) return -1;
              return 0;
            })
            me.update_children_pos()
          }
        }
      }, 100)

      me.impl_tag.container.visible = false
      me.collider=[]
    }
  }
  finit_render(pm){
    this.base_tag.parent.removeChild(this.base_tag.container)
    this.holder = null
    this.base_tag = null
    this.collider = []
    this.impl_tag = null
    this.impl_line = null
    this.body = []
  }  
  get_collider_recursive(){
    var ret = []
    if(this.impl_tag!=null && this.impl_tag.container.visible ){
      var tb = this.body.concat()
      this.sort_visualblock('z_order')
      for(var i of this.body){
        ret = ret.concat(i.get_collider_recursive())
      }
      ret = ret.concat(this.collider)
      this.body = tb
    }
    return ret
  }
  get_visual_block_from_collider_recursive(c)
  {
    if(this.impl_tag.container.visible ){
      for(var i of this.body){
        var r = i.get_visual_block_from_collider_recursive(c)
        if(r!=null) return r
      }
      for(var i of this.collider){
        if(i == c) return this
      }  
    }
    return null
  }

  emit_name_args(){
    var ret;
    if(this.is_member){
      ret = this.name + '(' + this.args + ')';
    }else{
      ret = 'function '+this.name + '(' + this.args + ')';
    }
    return ret;
  } 
  emit_body(tab, head="", tail=""){
    var ret;
    if(this.is_member){
      ret = '{\n';
      ret += head
      for(var s of this.body){
        ret += s.emit(tab+_visual_block.tab_size) + '\n';
      }
      ret += tail
      ret+= tab+'}\n'
    }else{
      ret = '{\n';
      ret += head
      for(var s of this.body){
        ret += s.emit(tab+_visual_block.tab_size) + '\n';
      }
      ret += tail
      ret+= tab+'}\n'
    }
    return ret;    
  }
  emit(tab='', head="", tail=""){
    var ret = tab + this.emit_name_args() + ' ' + this.emit_body(tab, head, tail)
    return ret;
  }
  serialize(){
    var ret = super.serialize()
    ret.args = this.args
    ret.is_member = this.is_member
    ret.impl_tag_pos = {x:this.impl_tag.x, y:this.impl_tag.y}
    ret.body = this.body.map((i)=>{return i.serialize()})
    ret.is_open = this.impl_tag.is_visible()
    return ret
  }

  static deserialize(pm, json_obj, afterInit=(e)=>{}){
    var ret = def_function.create(pm, json_obj.name, json_obj.x, json_obj.y, ()=>{
      pm.set_serialized_idmap(json_obj.id, ret.id)

      ret.args = json_obj.args
      ret.is_member = json_obj.is_member
  
      var count = 0
      for(var vb of json_obj.body){
        count++
        pm.deserialiser[vb.type](pm, vb, (e)=>{
          ret.base_tag.onDrop(e.base_tag)
          count--
        })
      }
      var iId = setInterval(()=>{
        if(count == 0){
          setTimeout(()=>{
            // wait set_pos
            ret.body=[]
            for(var r of json_obj.body){
              var nId = pm.serialized_idmap[r.id]
              ret.body.push(pm.get_obj_by_id(nId))
            }
            ret.update_children_pos()
            ret.impl_line.update_line()
            ret.impl_tag.set_pos(json_obj.impl_tag_pos.x, json_obj.impl_tag_pos.y)
            if(json_obj.is_open){
              ret.impl_tag.visible(true)
              ret.collider=[ret.impl_tag.bg]
              ret.impl_line.update_line()
              ret.base_tag.z_top()
              ret.pm.clear_menu()
            }
            afterInit(ret)
          }, 100)
          clearInterval(iId)
        }
      },100)
    })
    return ret
  }
  static create(pm, name, x, y, afterInit=()=>{}){
    var c = new def_function({name:name, x:x, y:y})
    c.id = pm.num_obj
    pm.num_obj += 1
    c.init_render(pm,afterInit)
    pm.id_obj_map[c.id] = c
    pm.add_visualblock(c)
    return c
  }

  run(){
    var me = this
    eval('var tmp = '+this.emit()+';'+'tmp()')
  }
}
