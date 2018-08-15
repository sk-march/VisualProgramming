class control extends visual_block
{
  constructor(vb={name:'none', x:0, y:0, z:0}){
    vb.type = 'control'
    super(vb)
    this.ctrltype = 'if'
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
    switch(this.ctrltype){
      case "break":
      case "continue":
        // nothing to do with this
        break
      case "if":
      case "elif":
      case "while":
      case "switch":
      case "case":
      case "return":
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
        break
      case "for":
      case "forEach":
        var tx = this.ctrltext.x + this.ctrltext.getMeasuredWidth() + 5
        for(var i=0; i<me.block.length; i++){
          if(me.block[i].base_tag.x > a.base_tag.x){
            me.block.splice(i, 0, a)
            a.base_tag.tween().to({x:tx, y:2},200)
            a.base_tag.x = tx
            a.base_tag.y = 2
            a.x = tx
            a.y = 2
            me.update_children_pos()   
            return
          }
          tx+=me.block[i].base_tag.w + this.block_space 
        }        
        me.block.push(a);
        break
      case "do":
      case "else":
      case "default":
      case "block":
        var th = 5
        for(var i=0; i<me.block.length; i++){
          if(me.block[i].base_tag.y > a.base_tag.y){
            me.block.splice(i, 0, a)
            a.base_tag.tween().to({x:30, y:th},200)
            a.base_tag.visual_block.x = 30
            a.base_tag.visual_block.y = th  
            a.base_tag.x = 30
            a.base_tag.y = th
            me.update_children_pos()   
            return    
          }
          th+=me.block[i].base_tag.h
        }
        me.block.push(a);
        break
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
      if(this.ctrltype=="block"){
        this.ctrltext.text = ""
      }else{
        this.ctrltext.text = this.ctrltype
      }
      this.base_tag.bg.x = 0
      switch(this.ctrltype){
        case "break":
        case "continue":
          // nothing to do with this
          break
        case "if":
        case "elif":
        case "while":
        case "switch":
        case "case":
        case "return":
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
          break
        case "for":
          if(this.ctrltext!=null){
            var pm = this.pm
            var tx = this.ctrltext.x + this.ctrltext.getMeasuredWidth() + this.block_space
            if(this.block.length>0){
              if(this.block.length>0){
                this.block[0].base_tag.set_pos(tx, 2, ()=>{pm.dirty=true}, 200)
                tx += this.block[0].base_tag.w + this.block_space
              }
              if(this.block.length>1){
                this.block[1].base_tag.set_pos(tx, 2, ()=>{pm.dirty=true}, 200)
                tx += this.block[1].base_tag.w + this.block_space
              }
              if(this.block.length>2){
                this.block[2].base_tag.set_pos(tx, 2, ()=>{pm.dirty=true}, 200)
                tx += this.block[2].base_tag.w + this.block_space
              }
            //  this.base_tag.resize(tx+30, 27)              
            }else{
            //  this.base_tag.resize(tx+30, 27)              
            }
            //var me = this
            //setTimeout(()=>{me.reflesh_text()},300)  
          }
          break
        case "forEach":
          if(this.ctrltext!=null){
            var pm = this.pm
            var tx = this.ctrltext.x + this.ctrltext.getMeasuredWidth() + this.block_space
            if(this.block.length==2){
              this.block[0].base_tag.set_pos(tx, 2, ()=>{pm.dirty=true}, 200)
              tx += this.block[0].base_tag.w + this.block_space
              this.block[1].base_tag.set_pos(tx, 2, ()=>{pm.dirty=true}, 200)
              //this.base_tag.resize(tx+this.block[1].base_tag.w+this.block_space, 27)              
            }else{
              //this.base_tag.resize(tx+30, 27)              
            }
            //var me = this
            //setTimeout(()=>{me.reflesh_text()},300)  
          }
          break
        case "default":
        case "do":
        case "else":  
        case "block":
          var th = 5
          if(this.ctrltype!="block") th = 30
          for(var i=0; i<this.block.length; i++){
            if(this.block[i].base_tag!=null &&  !this.block[i].base_tag.f_drag){
              this.block[i].base_tag.tween().to({x:30, y:th},200)
              this.block[i].base_tag.visual_block.x = 30
              this.block[i].base_tag.visual_block.y = th  
              this.block[i].base_tag.x = 30
              this.block[i].base_tag.y = th
              th+=this.block[i].base_tag.h
            }
          }
          //this.base_tag.bg.x = 20
          //this.base_tag.resize(this.base_tag.w, th+30)
          break
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
    
    var t = new createjs.Text(me.ctrltype, "20px serif", "Blue")
    t.x = 5
    t.y = 3
    me.ctrltext = t

    me.base_tag.onDrop = (t)=>{
      var e = t.visual_block
      if(e==null || e.type === undefined) return
      switch(me.ctrltype){
        case "break":
        case "continue":
          me.base_tag.vibrate()
          return
        case "if":
        case "elif":
        case "while":
        case "switch":
        case "return":
          if(me.block.length>0 || ( e.type != "def_variable" && e.type != 'reference' && e.type != 'operator' && e.type !='literal' && e.type != 'function_advocation' && e.type != 'rawcode')){
            me.base_tag.vibrate()
            return
          }
          break
        case "for":
          if(me.block.length>2 || ( e.type != "def_variable" && e.type != 'reference' && e.type != 'operator' && e.type !='literal' && e.type != 'function_advocation' && e.type != 'rawcode')){
            me.base_tag.vibrate()
            return
          }
          break
        case "forEach":
          if(me.block.length>1 || ( e.type != "def_variable" && e.type != 'reference' && e.type != 'operator' && e.type !='literal' && e.type != 'function_advocation' && e.type != 'rawcode')){
            me.base_tag.vibrate()
            return
          }
          break
        case "case":
        case "default":
        case "do":
        case "else":  
        case "block":
          if(e==null || e.type === undefined){
            me.base_tag.vibrate()
            return
          }
          break
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

        function addsw(ctrltype, sw){
          sw.push({text:ctrltype, img:'src/tag/tag_red.png', callback:(e,b)=>{
            me.ctrltype = ctrltype
            me.ctrltext.text = ctrltype
            me.update_children_pos()
          }})
        }
        addsw('if', sw1); addsw('elif', sw1); addsw('else', sw1);
        addsw('for', sw2); addsw('forEach', sw2); addsw('while', sw2); addsw('do', sw2);
        addsw('switch', sw3); addsw('case', sw3);
        addsw('block', sw4); addsw('break', sw4); addsw('continue', sw4), addsw('return', sw4)
        
        var ts0 = new tagSwitch(pm, gx, gy+140, 150, 50, sw0)
        var ts1 = new tagSwitch(pm, gx+90*0, gy, 70, 30, sw1)
        var ts2 = new tagSwitch(pm, gx+90*1-10, gy, 100, 30, sw2)
        var ts3 = new tagSwitch(pm, gx+90*2, gy, 90, 30, sw3)
        var ts4 = new tagSwitch(pm, gx+90*3, gy, 110, 30, sw4)
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
    switch(this.ctrltype){
      case "break":
      case "continue":
        ret += this.ctrltype
        break
      case "if":
      case "elif":
      case "while":
      case "switch":
        ret += this.ctrltype +"("
        if(this.block.length==1){
          ret +=this.block[0].emit()
        }
        ret += ")"
        break
      case "return":
        ret += this.ctrltype +" "
        if(this.block.length==1){
          ret +=this.block[0].emit()
        }
        break        
      case "for":
        ret += this.ctrltype +"("
        if(this.block.length==3){
          ret += this.block[0].emit() + "; " + this.block[1].emit() + "; " + this.block[2].emit()
        }
        ret += ")"
        break
      case "forEach":
        ret += this.ctrltype +"("
        if(this.block.lenght==2){
          ret += this.block[0].emit() + " of " + this.block[1].emit()
        }
        ret += ")"
        break
      case "case":
      case "default":
        ret += this.ctrltype+=":"
        ret += "{\n"
        for(var i of this.block){
          ret += i.emit(tab+_visual_block.tab_size)+"\n"
        }
        ret += tab + "}\n"
        break  
      case "do":
      case "else":
        ret += this.ctrltype  
        ret += "{\n"
        for(var i of this.block){
          ret += i.emit(tab+_visual_block.tab_size)+"\n"
        }
        ret += tab + "}\n"
        break
      case "block":
        ret += "{\n"
        for(var i of this.block){
          ret += i.emit(tab+_visual_block.tab_size)+"\n"
        }
        ret += tab + "}\n"
        break;
    }
    return ret
  }
  serialize(){
    var ret = super.serialize()
    ret.ctrltype = this.ctrltype
    ret.block = this.block.map((i)=>{return i.serialize()})
    return ret
  }
  static deserialize(pm, json_obj, afterInit=(e)=>{}){
    var ret = control.create(pm, json_obj.name, json_obj.x, json_obj.y, ()=>{
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
          ret.ctrltype = json_obj.ctrltype
          ret.update_children_pos()
          afterInit(ret)
          clearInterval(iId)
        }
      },300)

    })
    return ret
  }
  static deserializeAST(pm, ast, afterInit=(e)=>{}){
    var ret = control.create(pm, "control", 100, 100, ()=>{
      var count = 0
      switch(ast.type){
        case "ReturnStatement":
          ret.ctrltype = "return"
          pm.deserialize_any(ast.argument, (e)=>{
            ret.base_tag.onDrop(e.base_tag)
            ret.update_children_pos()
            afterInit(ret)
          })  
          break

        case "BlockStatement":
          ret.ctrltype = "block"
          for(var b of ast.body){
            count++
            var t = pm.deserialize_any(b, (e)=>{
              count--
            })
            ret.base_tag.onDrop(t.base_tag)
          }

          var iId = setInterval(()=>{
            if(count==0){
              ret.update_children_pos()
              afterInit(ret)
              clearInterval(iId)
            }
          },300)

          break
        case "IfStatement":
          ret.ctrltype = "if"
          var getVB = async(ast)=>{
            return new Promise((resolve) => {
              pm.deserialize_any(ast, (e)=>{
                resolve(e);
              })  
            });
          }
          var parseIf = async(ast)=>{
            var t = await getVB(ast.test)
            ret.base_tag.onDrop(t.base_tag)
            var c = await getVB(ast.consequent)
            ret.holder.base_tag.onDrop(c.base_tag)

            if(ast.alternate != null){
              var a = await getVB(ast.alternate)
              if(ast.consequent.type == "IfStatement"){
                a.ctrltype = "elif"
                var t = await getVB(ast.consequent.test)
                a.base_tag.onDrop(t.base_tag)
                ret.holder.base_tag.onDrop(a.base_tag)

                var c = await getVB(ast.consequent)
                ret.holder.base_tag.onDrop(c.base_tag)
                        
              }else{
                a.ctrltype = "else"
                ret.holder.base_tag.onDrop(a.base_tag)
              }
            }
            return
          }
          parseIf(ast)
          count++
          pm.deserialize_any(ast.test, (e)=>{
            ret.base_tag.onDrop(e.base_tag)
            count--
          })

          var c
          count++
          pm.deserialize_any(ast.consequent, (e)=>{
            c = e
            count--
          })

          var a
          count++
          pm.deserialize_any(ast.alternate, (e)=>{
            a = e
            count--
          })

          var iId = setInterval(()=>{
            if(count==0){
              ret.holder.base_tag.onDrop(c.base_tag)
              ret.holder.base_tag.onDrop(a.base_tag)

              ret.update_children_pos()
              afterInit(ret)
              clearInterval(iId)
            }
          },300)          
          break

        default:
          console.log(ast.type + "is not support!!!")
          return pm.deserializer["error"](pm, ast, afterInit)
          break
      }
    })
    return ret    
  }

  static create(pm, name, x, y, afterInit=()=>{}){
    var c = new control({name:name, x:x, y:y})
    c.id = pm.num_obj
    pm.num_obj += 1
    c.init_render(pm,afterInit)
    pm.id_obj_map[c.id] = c
    pm.add_visualblock(c)
    return c
  }
}