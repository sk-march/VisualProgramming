class statementIf extends visual_block
{
  constructor(vb={name:'none', x:0, y:0, z:0}){
    vb.type = 'statementIf'
    super(vb)
    this.test = null
    this.yes = []
    this.no = []

    this.base_tag = null
    this.yes_tag = null
    this.yes_line = null    
    this.no_tag = null
    this.no_line = null

    this.drop_target = null
  }
  set_holder(h){
    this.holder = h
    this.reflesh()
  }
  push_statement_yes(e, callback=()=>{}){
    var me = this
    // add yes
    var t = e.base_tag
    if(e==null || e.type === undefined) return
    // check duplicate
    for(var i=0; i<me.yes_tag.container.numChildren; i++){
      var c = me.yes_tag.container.getChildAt(i)
      if(c == t.container){
        me.rid_visualblock(e)
        setTimeout(()=>{
          me.yes.push(e)
          me.update_children_pos()     
          callback()     
        },100)              
        return
      }
    }
    // add to array
    e.holder.rid_visualblock(e)
    // exchange parent
    t.set_parent(me.yes_tag.container)
    e.set_holder(me)
    setTimeout(()=>{
      me.yes.push(e)
      me.update_children_pos()    
      callback()     
    },100)
    return
  }
  push_statement_no(e, callback=()=>{}){
    var me = this
    // add no
    var t = e.base_tag
    if(e==null || e.type === undefined) return
    // check duplicate
    for(var i=0; i<me.no_tag.container.numChildren; i++){
      var c = me.no_tag.container.getChildAt(i)
      if(c == t.container){
        me.rid_visualblock(e)
        setTimeout(()=>{
          me.no.push(e)
          me.update_children_pos()     
          callback()     
        },100)              
        return
      }
    }
    // add to array
    e.holder.rid_visualblock(e)
    // exchange parent
    t.set_parent(me.no_tag.container)
    e.set_holder(me)
    setTimeout(()=>{
      me.no.push(e)
      me.update_children_pos()    
      callback()     
    },100)
    return
  }

  add_visualblock(b){
    if(this.drop_target == this.base_tag.bg){
      this.drop_target = null
      var old = this.test
      this.test = b
      this.test.base_tag.tween().to({x:25, y:2},200)
      this.test.base_tag.x = 25
      this.test.base_tag.y = 2
      this.test.x = 25
      this.test.y = 2
  
      if(old!=null){
        this.pm.onDrop(old.base_tag)
        old.base_tag.z_last()  
      }
      this.update_children_pos()  
    }
    else if(this.drop_target == this.yes_tag.bg){
      this.drop_target = null
      var me = this
      var th = 30
      for(var i=0; i<me.yes.length; i++){
        if(me.yes[i].base_tag.y > b.base_tag.y){
          me.yes.splice(i, 0, b)
          me.update_children_pos()
          return
        }
        th+=me.yes[i].base_tag.h
      }
      me.yes.push(b);
      this.update_children_pos()  
    }
    else if(this.drop_target == this.no_tag.bg){
      this.drop_target = null
      var me = this
      var th = 30
      for(var i=0; i<me.no.length; i++){
        if(me.no[i].base_tag.y > b.base_tag.y){
          me.no.splice(i, 0, b)
          me.update_children_pos()
          return
        }
        th+=me.no[i].base_tag.h
      }
      me.no.push(b);
      this.update_children_pos()  
    }

  }

  rid_visualblock(b){
    this.yes = this.yes.filter((v)=>{
      return v != b;
    })
    this.no = this.no.filter((v)=>{
      return v != b;
    })
    if(this.test == b){
      this.test = null
    }
    this.update_children_pos()
  }
  update_children_pos(){
    var th = 30
    for(var i=0; i<this.yes.length; i++){
      if(this.yes[i].base_tag!=null &&  !this.yes[i].base_tag.f_drag){
        this.yes[i].base_tag.tween().to({x:20, y:th},200)
        this.yes[i].base_tag.visual_block.x = 20
        this.yes[i].base_tag.visual_block.y = th  
        this.yes[i].base_tag.x = 20
        this.yes[i].base_tag.y = th

        th+=this.yes[i].base_tag.h
      }
    }
    this.yes_tag.max_h = th

    th = 30
    if(this.no.length==1 && this.no[0].type=="statementIf"){
      this.no[0].base_tag.tween().to({x:55, y:5},200)
      this.no[0].base_tag.visual_block.x = 55
      this.no[0].base_tag.visual_block.y = 5  
      this.no[0].base_tag.x = 55
      this.no[0].base_tag.y = 5
      this.no_tag.max_h = 35
    }else{
      for(var i=0; i<this.no.length; i++){
        if(this.no[i].base_tag!=null &&  !this.no[i].base_tag.f_drag){
          this.no[i].base_tag.tween().to({x:20, y:th},200)
          this.no[i].base_tag.visual_block.x = 20
          this.no[i].base_tag.visual_block.y = th  
          this.no[i].base_tag.x = 20
          this.no[i].base_tag.y = th
  
          th+=this.no[i].base_tag.h
        }
      }
      this.no_tag.max_h = th
    }
    this.reflesh()
  }
/*
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
*/

  reflesh(){
    if(this.test){
      this.base_tag.resize(this.test.base_tag.w+30, this.base_tag.h)
    }else{
      this.base_tag.resize(50, this.base_tag.h)      
    }
    if(this.yes_tag) this.yes_tag.update_text()
    if(this.yes_line)this.yes_line.update_line()
    if(this.no_tag) this.no_tag.update_text()
    if(this.no_line)this.no_line.update_line()
    if(this.yes_tag){
      this.yes_tag.resize(this.yes_tag.w, this.yes_tag.max_h+30);
    }
    if(this.no_tag){
      if(this.no.length==1 && this.no[0].type=="statementIf"){
        this.no_tag.resize(this.no[0].w+this.no[0].x, 35);
      }else{
        this.no_tag.resize(this.no_tag.w, this.no_tag.max_h+30);        
      }  
    }
  }
  init_render(pm, afterInit=()=>{}){
    var me = this
    me.pm = pm
    me.base_tag = new tag(pm, this.x, this.y, 25, 27, 'src/tag/tag_white.png', onInit);
    me.base_tag.f_mobility = true
    me.base_tag.f_mouseover_shift = false
    me.base_tag.set_visualblock(this)

    me.base_tag.onDblclick = ()=>{
      if(me.yes_tag.is_visible()){
        me.yes_tag.tween()
        .to({alpha:1}, 0)
        .to({alpha:0, x:me.yes_tag.x+10}, 100)
        .call(()=>{
          me.yes_tag.x -=10
          me.yes_tag.visible(false)
          me.collider=[me.base_tag.bg]
          me.yes_line.update_line()
          me.base_tag.z_top()
          me.pm.clear_menu()              
        })
        me.no_tag.tween()
        .to({alpha:1}, 0)
        .to({alpha:0, x:me.no_tag.x+10}, 100)
        .call(()=>{
          me.no_tag.x -=10
          me.no_tag.visible(false)
          me.no_line.update_line()
          me.base_tag.z_top()
          me.pm.clear_menu()              
        })        
      }else{
        me.yes_tag.tween()
        .call(()=>{
          me.yes_tag.visible(true)
          me.collider=[me.yes_tag.bg, me.no_tag.bg, me.base_tag.bg]
          me.yes_line.update_line()
          me.base_tag.z_top()
          me.pm.clear_menu()              
        })        
        .to({alpha:1}, 0)
        me.no_tag.tween()
        .call(()=>{
          me.no_tag.visible(true)
          me.no_line.update_line()
          me.base_tag.z_top()
          me.pm.clear_menu()              
        })        
        .to({alpha:1}, 0)
      }
    }
    me.base_tag.onClick = function(e){
      if(!pm.clear_menu()){
        me.reflesh()
        var gx = (e.stageX - pm.top.x)/pm.top.scaleX -20
        var gy = (e.stageY - pm.top.y)/pm.top.scaleY -20

        var ts = new tagSwitch(me.pm, gx, gy, 210, 50, [
          {text:'Remove', img:'src/tag/tag_white.png'}
        ])
        ts.buttons[0].callback = (e, b)=>{
          me.holder.rid_visualblock(me)
          me.finit_render(me.pm)
        }
      }
    }    
    me.base_tag.onDrop =(t)=>{
      // add test
      var e = t.visual_block
      if(e==null || e.type === undefined) return
      // check duplicate
      if(this.test && this.drop_target == this.base_tag.bg){
        if(this.test.base_tag == t){
          me.rid_visualblock(e)
          setTimeout(()=>{
            me.add_visualblock(e)
          },100)              
          return
        }
      }
      else if(this.drop_target == this.yes_tag.bg){
        for(var i=0; i<me.yes_tag.container.numChildren; i++){
          var c = me.yes_tag.container.getChildAt(i)
          if(c == t.container){
            me.rid_visualblock(e)
            setTimeout(()=>{
              me.add_visualblock(e)
            },100)              
            return
          }
        }  
      }
      else if(this.drop_target == this.no_tag.bg){
        for(var i=0; i<me.no_tag.container.numChildren; i++){
          var c = me.no_tag.container.getChildAt(i)
          if(c == t.container){
            me.rid_visualblock(e)
            setTimeout(()=>{
              me.add_visualblock(e)
            },100)              
            return
          }
        }  
      }      
      // add to array
      e.holder.rid_visualblock(e)
      // exchange parent
      if(this.drop_target == this.base_tag.bg){
        t.set_parent(me.base_tag.container)
      }
      else if(this.drop_target == this.yes_tag.bg){
        t.set_parent(me.yes_tag.container)
      }
      else if(this.drop_target == this.no_tag.bg){
        t.set_parent(me.no_tag.container)
      }
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
      t.x = 10
      t.y = 5
      t.text = "if"
      me.base_tag.container.addChild(t);
      me.cjtext = t
      me.reflesh()

      // yes
      me.yes_line = new createjs.Shape()
      me.yes_line.update_line=()=>{
        var w = me.cjtext.getMeasuredWidth();
        var x1,x2,y1,y2,x3,y3;
        x1 = me.yes_tag.w/2
        y1 = me.yes_tag.h/2

        if(me.yes_tag.x+x1 > (w+50)/2){
          x2 = -me.yes_tag.x+30+w
        }else{
          x2 = -me.yes_tag.x+12          
        }
        if(me.yes_tag.y < -y1){
          y2 = -me.yes_tag.y-5
        }else{
          y2 = -me.yes_tag.y+25          
        }

        if(me.yes_tag.x>-me.yes_tag.w && me.yes_tag.x<w){
          x3 = me.yes_tag.w/2
        }else if(me.yes_tag.x<-me.yes_tag.w){
          x3 = me.yes_tag.w
        }else{
          x3 = 0
        }
        if(me.yes_tag.y>-me.yes_tag.h && me.yes_tag.y<20){
          y3 = me.yes_tag.h/2
        }else if(me.yes_tag.y<-me.yes_tag.h){
          y3 = me.yes_tag.h
        }else{
          y3 = 0
        }
        
        me.yes_line.graphics.clear()
        me.yes_line.graphics.beginStroke("#5555ff")
        me.yes_line.graphics.setStrokeDash([10,15],0)
        me.yes_line.graphics.setStrokeStyle(2)
        me.yes_line.graphics.moveTo(x3, y3)
        me.yes_line.graphics.lineTo(x2, y2)
        me.yes_line.graphics.endStroke()
      }

      var count = 2;
      me.yes_tag = new tag(pm, me.x+5, me.y+30, 200, 60, 'src/tag/tag_white.png',()=>{
        me.yes_tag.f_dropout = false
        me.yes_tag.set_visualblock(null)
        me.yes_tag.f_mobility = true
        me.yes_tag.f_mouseover_shift = false
        me.yes_tag.set_parent(me.base_tag.container)              
        me.yes_line.update_line()
        me.yes_tag.container.addChild(me.yes_line)  
        me.yes_tag.container.setChildIndex(me.yes_line,0)

        var t = new createjs.Text('', "20px serif", "Black");
        t.x = 20
        t.y = 10
        me.yes_tag.container.addChild(t);
        me.yes_tag.cjtext = t
        me.yes_tag.update_text()
        
        count--
      })
      me.yes_tag.update_text=()=>{
        me.yes_tag.cjtext.text = "then"
      }
      me.yes_tag.onDrag = ()=>{
        me.yes_line.update_line()
        me.base_tag.z_top()
      }
      me.yes_tag.onDblclick = ()=>{
        me.base_tag.onDblclick()
      }
      me.yes_tag.onClick = (e)=>{
        if(!pm.clear_menu()){
          me.reflesh()
          me.base_tag.z_top()
          var x = (e.stageX - pm.top.x)/pm.top.scaleX
          var y = (e.stageY - pm.top.y)/pm.top.scaleY
        }
      }

      // no
      me.no_line = new createjs.Shape()
      me.no_line.update_line=()=>{
        var w = me.cjtext.getMeasuredWidth();
        var x1,x2,y1,y2,x3,y3;
        x1 = me.no_tag.w/2
        y1 = me.no_tag.h/2

        if(me.no_tag.x+x1 > (w+50)/2){
          x2 = -me.no_tag.x+30+w
        }else{
          x2 = -me.no_tag.x+12          
        }
        if(me.no_tag.y < -y1){
          y2 = -me.no_tag.y-5
        }else{
          y2 = -me.no_tag.y+25          
        }

        if(me.no_tag.x>-me.no_tag.w && me.no_tag.x<w){
          x3 = me.no_tag.w/2
        }else if(me.no_tag.x<-me.no_tag.w){
          x3 = me.no_tag.w
        }else{
          x3 = 0
        }
        if(me.no_tag.y>-me.no_tag.h && me.no_tag.y<20){
          y3 = me.no_tag.h/2
        }else if(me.no_tag.y<-me.no_tag.h){
          y3 = me.no_tag.h
        }else{
          y3 = 0
        }
        
        me.no_line.graphics.clear()
        me.no_line.graphics.beginStroke("#5555ff")
        me.no_line.graphics.setStrokeDash([10,15],0)
        me.no_line.graphics.setStrokeStyle(2)
        me.no_line.graphics.moveTo(x3, y3)
        me.no_line.graphics.lineTo(x2, y2)
        me.no_line.graphics.endStroke()
      }
      me.no_tag = new tag(pm, me.x+5, me.y+30, 200, 60, 'src/tag/tag_white.png',()=>{
        me.no_tag.f_dropout = false
        me.no_tag.set_visualblock(null)
        me.no_tag.f_mobility = true
        me.no_tag.f_mouseover_shift = false
        me.no_tag.set_parent(me.base_tag.container)              
        me.no_line.update_line()
        me.no_tag.container.addChild(me.no_line)  
        me.no_tag.container.setChildIndex(me.no_line,0)

        var t = new createjs.Text('', "20px serif", "Black");
        t.x = 20
        t.y = 10
        me.no_tag.container.addChild(t);
        me.no_tag.cjtext = t
        me.no_tag.update_text()

        count--
      })
      me.no_tag.update_text=()=>{
        me.no_tag.cjtext.text = "else"
      }
      me.no_tag.onDrag = ()=>{
        me.no_line.update_line()
        me.base_tag.z_top()
      }
      me.no_tag.onDblclick = ()=>{
        me.base_tag.onDblclick()
      }
      me.no_tag.onClick = (e)=>{
        if(!pm.clear_menu()){
          me.reflesh()
          me.base_tag.z_top()
          var x = (e.stageX - pm.top.x)/pm.top.scaleX
          var y = (e.stageY - pm.top.y)/pm.top.scaleY
        }
      }      

      var id = setInterval(()=>{
        if(me.base_tag==null || me.yes_tag==null || me.no_tag==null) clearInterval(id)
        if(me.yes_tag && me.no_tag && me.yes_tag.container && me.yes_tag.container.visible
          && me.no_tag.container && me.no_tag.container.visible){
          var f = false
          for(var s of me.yes){
            if(s.base_tag.f_drag){
              f = true
              break
            }
          }
          for(var s of me.no){
            if(s.base_tag.f_drag){
              f = true
              break
            }
          }          
          if(f){
            me.yes.sort((i1,i2)=>{
              var ind1 = i1.base_tag.y
              var ind2 = i2.base_tag.y
              if( ind1 > ind2 ) return 1;
              if( ind1 < ind2 ) return -1;
              return 0;
            })
            me.no.sort((i1,i2)=>{
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

      me.yes_tag.container.visible = false
      me.no_tag.container.visible = false      
      me.collider=[me.base_tag.bg]
      me.drop_target = me.base_tag.bg
      var id2 = setInterval(()=>{
        if(count==0){
          clearInterval(id2)
          afterInit()          
        }  
      }, 100)

    }
  }
  finit_render(pm){
    this.base_tag.parent.removeChild(this.base_tag.container)
    this.holder = null
    this.base_tag = null
    this.collider = []
    this.yes_tag = null
    this.yes_line = null
    this.no_tag = null
    this.no_line = null
    this.yes = []
    this.no = []
  }  
  get_collider_recursive(){
    var ret = []
    if(this.yes_tag!=null && this.yes_tag.container.visible ){
      var tb = this.yes.concat()
      //this.sort_visualblock('z_order')
      for(var i of this.yes){
        ret = ret.concat(i.get_collider_recursive())
      }
      for(var i of this.no){
        ret = ret.concat(i.get_collider_recursive())
      }
      ret = ret.concat(this.collider)
      this.yes = tb
    }else{
      ret = this.collider
    }
    return ret
  }
  get_visual_block_from_collider_recursive(c)
  {
    if(this.yes_tag.container.visible ){
      for(var i of this.yes){
        var r = i.get_visual_block_from_collider_recursive(c)
        if(r!=null) return r
      }
      for(var i of this.no){
        var r = i.get_visual_block_from_collider_recursive(c)
        if(r!=null) return r
      }
    }
    for(var i of this.collider){
      if(i == c){
        this.drop_target = c
        return this
      }
    }  
    return null
  }
  find_by_name(name, check_holder=true){
    for(var b of this.yes){
      var t = b.find_by_name(name, false)
      if(t) return t
    }
    for(var b of this.no){
      var t = b.find_by_name(name, false)
      if(t) return t
    }    
    if(this.holder && check_holder){
      return this.holder.find_by_name(name)
    }else{
      return null
    }
  }

  emit(tab='', head="", tail=""){
    var ret = tab+"if(" + this.test.emit() + "){\n"
    for(var i of this.yes){
      ret += i.emit(tab+_visual_block.tab_size) + "\n"
    }
    if(this.no.length == 0){
      ret += tab+"}\n"
    }else if(this.no.length == 1 && this.no[0].type=="statementIf"){
      ret += tab+"}else " + this.no[0].emit(tab).slice(_visual_block.tab_size.length)
    }else{
      ret += tab+"}else{\n"
      for(var i of this.no){
        ret += i.emit(tab+_visual_block.tab_size) + "\n"
      }
      ret += tab+"}\n"  
    }
    return ret;
  }
  
  serialize(){
    var ret = super.serialize()
    ret.test = this.test.serialize()
    ret.yes = this.yes.map((i)=>{return i.serialize()})
    ret.no = this.no.map((i)=>{return i.serialize()})
    ret.yes_tag_pos = {x:this.yes_tag.x, y:this.yes_tag.y}
    ret.no_tag_pos = {x:this.no_tag.x, y:this.no_tag.y}
    ret.is_open = this.yes_tag.is_visible()
    return ret
  }

  static deserialize(pm, json_obj, afterInit=(e)=>{}){
    var ret = statementIf.create(pm, json_obj.name, json_obj.x, json_obj.y, ()=>{
      pm.set_serialized_idmap(json_obj.id, ret.id)

      var count = 0
      for(var b of json_obj.yes){
        count++
        pm.deserialize_any(b, (r)=>{
          ret.push_statement_yes(r, ()=>{
            count--  
          })
        })  
      }
      for(var b of json_obj.no){
        count++
        pm.deserialize_any(b, (r)=>{
          ret.push_statement_no(r, ()=>{
            count--  
          })
        })  
      }

      count++
      pm.deserialize_any(json_obj.test, (r)=>{
        ret.base_tag.onDrop(r.base_tag)
        count--  
      })      

      var iId = setInterval(()=>{
        if(count==0){
          clearInterval(iId)
          setTimeout(()=>{
            ret.yes_tag.set_pos(json_obj.yes_tag_pos.x, json_obj.yes_tag_pos.y)
            ret.no_tag.set_pos(json_obj.no_tag_pos.x, json_obj.no_tag_pos.y)
            if(json_obj.is_open){
              ret.yes_tag.visible(true)
              ret.no_tag.visible(true)
              ret.collider=[ret.yes_tag.bg, ret.no_tag.bg, ret.base_tag.bg]
              ret.yes_line.update_line()
              ret.no_line.update_line()
              ret.base_tag.z_top()
              ret.pm.clear_menu()
            }            
            afterInit(ret)
          }, 100)          
        }
      },100)
      
    })
    return ret
  }
  static deserializeAST(pm, ast, afterInit=(e)=>{}){
    var ret = statementIf.create(pm, "if", 100, 100, ()=>{

      var count = 0
      for(var b of ast.consequent.body){
        count++
        pm.deserialize_any(b, (r)=>{
          ret.push_statement_yes(r, ()=>{
            count--  
          })
        })  
      }
      if(ast.alternate){
        if(ast.alternate.type == "BlockStatement"){
          for(var b of ast.alternate.body){
            count++
            pm.deserialize_any(b, (r)=>{
              ret.push_statement_no(r, ()=>{
                count--  
              })
            })  
          }
        }else{
          count++
          pm.deserialize_any(ast.alternate, (r)=>{
            ret.push_statement_no(r, ()=>{
              count--  
            })
          })      
        }  
      }

      count++
      pm.deserialize_any(ast.test, (r)=>{
        ret.base_tag.onDrop(r.base_tag)
        count--  
      })      

      var iId = setInterval(()=>{
        if(count==0){
          ret.yes_tag.set_pos(200,0)
          ret.no_tag.set_pos(400,0)
          afterInit(ret)
          clearInterval(iId)
        }
      },100)

    })
    return ret
  }

  static create(pm, name, x, y, afterInit=()=>{}){
    var c = new statementIf({name:name, x:x, y:y})
    c.id = pm.num_obj
    pm.num_obj += 1
    c.init_render(pm,()=>{
      setTimeout(()=>{
        c.yes_tag.set_pos(200,0)
        c.no_tag.set_pos(400,0)
        c.update_children_pos()
        afterInit()
      },100)
    })
    pm.id_obj_map[c.id] = c
    pm.add_visualblock(c)
    return c
  }
}
