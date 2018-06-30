class def_class extends visual_block
{
  constructor(vb={name:'none', x:0, y:0, z:0}){
    vb.type = 'def_class'
    super(vb)
    //this.super = 'null'; // not support extends
    this.variables = [];
    this.methods = [];
    this.click_pos = {x:-1, y:-1}
    this.mouse_moved = false
    this.holder = null
    this.base_tag = null
    this.collider = []
    this.impl_tag = null
    this.impl_line = null
  }
  set_holder(h){
    this.holder = h
  }
  add_visualblock(vb){
    if(vb.type!='def_variable' && vb.type!='def_function'){
      console.log('this is not variable or function:'+vb.emit());
      return
    }
    var me = this
    vb.is_member = true
    vb.set_holder(this)
    var target
    var th
    if(vb.type=='def_variable'){
      target = this.variables
      var th = 30
    }else if(vb.type=='def_function'){
      target = this.methods;
      var th = 30
      for(var v of this.variables){
        if(v.base_tag!=null) th += v.base_tag.h
      }
    }
    for(var i=0; i<target.length; i++){
      if(target[i].base_tag.y > vb.base_tag.y){
        target.splice(i, 0, vb)
        vb.base_tag.tween().to({x:30,y:th},200)
        me.update_children_pos()
        return
      }
      th+=target[i].base_tag.h
    }
    target.push(vb);
    me.update_children_pos()
  }
  rid_visualblock(vb){
    if(vb.type!='def_variable' && vb.type!='def_function'){
      console.log('this is not variable or function:'+vb.emit());
      return
    }
    var a;
    if(vb.type=='def_variable'){
      a = this.variables
    }else if(vb.type=='def_function'){
      a = this.methods
    }
    vb.is_member = false
    a.some(function(v, i){
      if (v.id==vb.id){
        a.splice(i,1);  
      }
    });
    this.update_children_pos()
  }
  update_children_pos(){
    var th = 30
    var all = this.variables.concat(this.methods)
    for(var i=0; i<all.length; i++){
      if(all[i].base_tag!=null &&  !all[i].base_tag.f_drag){
        all[i].base_tag.tween().to({x:30,y:th},200)
        th+=all[i].base_tag.h
      }
    }
  }
  sort_visualblock(type='z_order'){
    var me = this
    if(type == 'z_order'){
      this.methods.sort((i1,i2)=>{
        var ind1 = me.impl_tag.container.getChildIndex(i1.base_tag.container)
        var ind2 = me.impl_tag.container.getChildIndex(i2.base_tag.container)
        if( ind1 > ind2 ) return -1;
        if( ind1 < ind2 ) return 1;
        return 0;
      })     
    }else if(type=='name'){
      this.methods.sort((i1,i2)=>{
        if( i1.name < i2.name ) return -1;
        if( i1.name > i2.name ) return 1;
        return 0;
      })           
    }
  }
  rename(newname){
    if(newname!==undefined && newname!=''){
      this.name = newname
      this.cjtext.text = this.name
      var w = this.cjtext.getMeasuredWidth();
      if(w > 180){
        this.cjtext.text = (this.name).slice(0,20)+'...'
      }

      this.this_vb.rename(this.name)
    }
  }
  init_render(pm, afterInit=()=>{}){
    this.this_vb = def_variable.create(pm, "this", 0, 0)
    this.this_vb.set_type(this.name)
    this.this_vb.definition_link = this
    this.this_vb.base_tag.visible(false)
    this.this_vb.holder.rid_visualblock(this.this_vb)


    var me = this
    me.pm = pm
    me.base_tag = new tag(pm, this.x, this.y, 25, 25, 'src/tag/tack_yellow.png', onInit);
    me.base_tag.f_mobility = true
    me.base_tag.f_mouseover_shift = false
    me.base_tag.set_visualblock(this)
    
    me.base_tag.onDblclick = (e)=>{
      if(me.impl_tag.is_visible()){
        me.impl_tag.tween()
        .to({alpha:1}, 0)
        .to({alpha:0, x:me.impl_tag.x+10}, 100)
        .call(()=>{
          me.impl_tag.container.x -=10
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
    me.base_tag.onClick = (e)=>{
      if(!pm.clear_menu()){
        var gx = (e.stageX - pm.top.x)/pm.top.scaleX -20
        var gy = (e.stageY - pm.top.y)/pm.top.scaleY -20
        
        var ts = new tagSwitch(me.pm, gx, gy, 190, 50, [
          {text:'New instance', img:'src/tag/tag_red.png'},
          {text:'Referer this', img:'src/tag/tag_red.png'},
          {text:'Rename', img:'src/tag/tag_yellow.png'},
          {text:'Remove class', img:'src/tag/tag_yellow.png'}
        ])
        ts.buttons[0].callback = (e, b)=>{
          var it = new tagInput(pm, 'Enter name', 'instance_name_'+me.id, gx, gy, 280, 40, function(text){
            if(text!==undefined && text!=''){
              var i = def_variable.create(pm, text, gx, gy)
              i.set_type(me.name)
              i.definition_link = me
              setTimeout(()=>{
                i.base_tag.tween()
                  .to({y:gy + 30}, 100)
                  .call(()=>{
                    var t = me.pm.hit_test(e.stageX, e.stageY, i.base_tag.bg)
                    if(t!=null){
                      t.base_tag.onDrop(i.base_tag)
                    }  
                  })
              }, 50)
            }
          })                    
        }
        ts.buttons[1].callback = (e, b)=>{
          var this_ref = reference.create(me.pm, 'reference:'+me.name+'[this]', gx,gy+50)
          this_ref.set_refer(this.this_vb)
          this_ref.reflesh_link()              
        }
        ts.buttons[2].callback = (e, b)=>{
          var bgx = gx+10
          var bgy = gy
          var it = new tagInput(pm, 'new name', 'inst_name_'+me.id, bgx, bgy, 280, 40, (text)=>{
            me.rename(text)
            console.log(text);
          })
        }        
        ts.buttons[3].callback = (e, b)=>{
          me.holder.rid_visualblock(me)
          me.finit_render(me.pm)
        }
      }
    }
    me.base_tag.onDrop = (t)=>{
      var e = t.visual_block
      if(e==null || e.type === undefined) return
      if(e.type != 'def_variable' && e.type != 'def_function'){
        me.impl_tag.vibrate()
        return
      }
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
      var text = "class " + me.name
      var t = new createjs.Text(text, "20px serif", "Black")
      var w = t.getMeasuredWidth();
      if(w > 180){
        t.text = text.slice(0,20)+'...'
      }
      t.x = 30
      t.y = 0
      me.base_tag.container.addChild(t);
      me.cjtext = t

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
          y2 = -me.impl_tag.y+12//-5
        }else{
          y2 = -me.impl_tag.y+12//+25          
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
        me.impl_line.graphics.beginStroke("#C5AF32")
        me.impl_line.graphics.setStrokeDash([10,15],0)
        me.impl_line.graphics.setStrokeStyle(2)
        me.impl_line.graphics.moveTo(x3, y3)
        me.impl_line.graphics.lineTo(x2, y2)
        me.impl_line.graphics.endStroke()
      }
      me.impl_tag = new tag(pm, me.x+5, me.y+30, 200, 200, 'src/tag/tag_yellow.png', ()=>{
        me.impl_tag.f_dropout = false
        me.impl_tag.set_visualblock(null)
        me.impl_tag.f_mobility = true
        me.impl_tag.f_mouseover_shift = false
        me.impl_tag.set_parent(me.base_tag.container)              
        me.impl_line.update_line()
        me.impl_tag.container.addChild(me.impl_line)  
        me.impl_tag.container.setChildIndex(me.impl_line,0)

        me.impl_tag.update_text=()=>{
          me.impl_tag.cjtext.text = 'class '+me.name
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
            me.base_tag.z_top()
            var x = (e.stageX - pm.top.x)/pm.top.scaleX
            var y = (e.stageY - pm.top.y)/pm.top.scaleY
          }
        }

        var id = setInterval(()=>{
          if(me.base_tag==null || me.impl_tag==null) clearInterval(id)
          if(me.impl_tag.container.visible){
            var f = false
            var all = me.methods.concat(me.variables)
            for(var s of all){
              if(s.base_tag.f_drag){
                f = true
                break
              }
            }
            if(f){
              all.sort((i1,i2)=>{
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

        var t = new createjs.Text('', "20px serif", "Black");
        t.x = 20
        t.y = 10
        me.impl_tag.container.addChild(t);
        me.impl_tag.cjtext = t
        me.impl_tag.update_text()

        me.impl_tag.container.visible = false
        me.collider=[]
  
        afterInit()
      })
    }
  }
  finit_render(pm){
    this.base_tag.parent.removeChild(this.base_tag.container)
    this.variables = []
    this.methods = []
    this.holder = null
    this.base_tag = null
    this.collider = []
  }
  get_collider_recursive(){
    var ret = []
    var me = this
    var tm = this.methods.concat()
    var tv = this.variables.concat()
    this.sort_visualblock()
    for(var i of this.methods){
      ret = ret.concat(i.get_collider_recursive())
    }
    for(var i of this.variables){
      ret = ret.concat(i.get_collider_recursive())
    }
    ret = ret.concat(this.collider)
    this.methods = tm
    this.variables = tv
    return ret
  }
  get_visual_block_from_collider_recursive(c)
  {
    for(var i of this.methods){
      var r = i.get_visual_block_from_collider_recursive(c)
      if(r!=null) return r
    }
    for(var i of this.variables){
      var r = i.get_visual_block_from_collider_recursive(c)
      if(r!=null) return r
    }
    for(var i of this.collider){
      if(i == c) return this
    }
    return null
  }

  emit(tab=''){
    var ret = [ 
      tab+'class '+this.name,
      tab+'{'
    ];
    var f_constructor_exist = false

    // define method
    for(var f of this.methods){
      if(f.name == "constructor"){
        f_constructor_exist = true
        var tmp = []
        for(var m of this.variables){
          tmp.push(m.emit(tab+_visual_block.tab_size+_visual_block.tab_size));
        }
        tmp.push('\n')
        ret.push(f.emit(tab+_visual_block.tab_size, tmp.join('\n')))
      }else{
        ret.push(f.emit(tab+_visual_block.tab_size))
      }
    }

    if(!f_constructor_exist){
      // define default constructor and members
      ret.push(tab + _visual_block.tab_size+'constructor(){');
      for(var m of this.variables){
        ret.push(m.emit(tab+_visual_block.tab_size+_visual_block.tab_size));
      }
      ret.push(tab+_visual_block.tab_size+'}')
    }

    ret.push(tab+'}')

    return ret.join('\n');
  }
  serialize(){
    var ret = super.serialize()
    ret.impl_tag_pos = {x:this.impl_tag.x, y:this.impl_tag.y}
    ret.this_vb = this.this_vb.serialize()
    ret.variables = this.variables.map((i)=>{return i.serialize()})
    ret.methods = this.methods.map((i)=>{return i.serialize()})
    ret.is_open = this.impl_tag.is_visible()
    return ret
  }
  static deserialize(pm, json_obj, afterInit=(e)=>{}){
    var ret = def_class.create(pm, json_obj.name, json_obj.x, json_obj.y, ()=>{
      pm.set_serialized_idmap(json_obj.id, ret.id)

      ret.this_vb = pm.deserialiser[json_obj.this_vb.type](pm, json_obj.this_vb, (e)=>{})
      ret.this_vb.holder.rid_visualblock(ret.this_vb)
      ret.this_vb.base_tag.visible(false)
  

      var count = 0
      for(var vb of json_obj.variables){
        count++
        pm.deserialiser[vb.type](pm, vb, (e)=>{
          ret.base_tag.onDrop(e.base_tag)
          count--
        })
      }
      for(var vb of json_obj.methods){
        count++
        pm.deserialiser[vb.type](pm, vb, (e)=>{
          count--
          ret.base_tag.onDrop(e.base_tag)
        })
      }
      var iId = setInterval(()=>{
        if(count==0){
          ret.impl_tag.set_pos(json_obj.impl_tag_pos.x, json_obj.impl_tag_pos.y)
          setTimeout(()=>{
            ret.update_children_pos()
            ret.impl_line.update_line()
            if(json_obj.is_open){
              ret.impl_tag.visible(true)
              ret.collider=[ret.impl_tag.bg]
              ret.impl_line.update_line()
              ret.base_tag.z_top()
              ret.pm.clear_menu()
            }    
            afterInit(ret)
          },100)
          clearInterval(iId)    
        }
      },100)
    })
    return ret
  }
  static create(pm, name, x, y, afterInit=(e)=>{}){
    var c = new def_class({name:name, x:x, y:y})
    c.id = pm.num_obj
    pm.num_obj += 1
    c.init_render(pm,afterInit)
    pm.id_obj_map[c.id] = c
    pm.add_visualblock(c)
    return c
  }
}
