class reference extends visual_block
{
  constructor(vb={name:'none', x:0, y:0, z:0}){
    vb.type = 'reference';
    super(vb)
    this.type = 'reference'
    this.head_link = null
    this.tail_links = []
    this.base_tag = null
  }
  set_refer(r){
    this.head_link = r
    this.tail_links = [r]
    this.name = this.head_link.name
    this.reflesh_link()
  }
  set_holder(h){
    this.holder = h
  }
  reflesh_link(){
    if(this.head_link!=null && this.cjtext!=null){
      var tarray = this.tail_links.map((i)=>{
        if(i.holder.type == "expressionArray"){
          return "[" + i.holder.getIndexFromArg(i) + "]"
        }else{
          return i.name
        }
      })
      this.name = tarray.reduce((x,y)=>{return x+'.'+y})
      this.name = this.name.replace(".[", "[")
      this.cjtext.text = this.name
      var w = this.cjtext.getMeasuredWidth()
      this.base_tag.resize(w+10, this.base_tag.h)
    }
  }
  init_render(pm, afterInit=()=>{}){
    var me = this
    me.pm = pm
    me.base_tag = new tag(pm, this.x, this.y, 25, 27, 'src/tag/tag_red.png', onInit);
    me.base_tag.f_mobility = true
    me.base_tag.f_mouseover_shift = false
    me.base_tag.set_visualblock(this)
    
    me.base_tag.onClick = function(e){
      me.reflesh_link()
      if(!pm.clear_menu()){
        if(me.head_link!=null && me.head_link.base_tag!=null && me.head_link.base_tag.vibrate!=null){
          me.head_link.base_tag.vibrate()
        }else{
          me.base_tag.vibrate()
        }
        var ex = (e.stageX - pm.top.x)/pm.top.scaleX 
        var ey = (e.stageY - pm.top.y)/pm.top.scaleY
        var gx = ex -20
        var gy = ey -20

        var sw = []
        if(me.head_link!=null && me.head_link.type == 'def_variable' && me.head_link.definition_link !=null){
          if(me.head_link.definition_link.methods.length + me.head_link.definition_link.variables.length!=0){
            sw.push({text:'Add dot operator', img:'src/tag/tag_red.png', callback:(e,b)=>{
              var tm = me.head_link.definition_link.methods.concat()
              var tv = me.head_link.definition_link.variables.concat()
              me.head_link.definition_link.sort_visualblock('name')
              var all = me.head_link.definition_link.variables.concat(me.head_link.definition_link.methods)
              this.methods = tm
              this.variables = tv
              var sw2 = all.map((f)=>{
                return {text:'.'+f.name, img:'src/tag/tag_red.png', callback:(e,b)=>{
                  me.head_link = f
                  me.tail_links.push(f)
                  me.reflesh_link()
                }}
              })
              if(sw2.length>0){
                var ts = new tagSwitch(pm, gx, gy, 150, 25, sw2)
              }
            }})  
            if(me.head_link.definition_link!=null && me.head_link.definition_link.type == 'def_class' && me.head_link.definition_link.methods.length>0){
              sw.push({text:'Call statement', img:'src/tag/tag_white.png', callback:(e,b)=>{
                me.head_link.definition_link.sort_visualblock('name')
                var sw2 = me.head_link.definition_link.methods.map((f)=>{
                  return {text:'call:'+f.name, img:'src/tag/tag_white.png', callback:(e,b)=>{
                    var fa = function_advocation.create(me.pm, 'call:'+me.name,ex,ey)
                    fa.set_func(f)
                    fa.set_inst(me)
                    fa.reflesh_text()
                    setTimeout(()=>{
                      fa.base_tag.tween()
                        .to({y:ey + 30}, 100)
                        .call(()=>{
                          var t = me.pm.hit_test(e.stageX, e.stageY, fa.base_tag.bg)
                          if(t!=null){
                            t.base_tag.onDrop(fa.base_tag)
                          }  
                        })    
                    }, 50)                        
                  }}
                })
                if(sw2.length>0){
                  var ts = new tagSwitch(pm, gx, gy, 150, 25, sw2)
                }
              }})
            }     
          }      
        }
        if(me.tail_links.length>1){
          sw.push({text:'Pop tail dot', img:'src/tag/tag_red.png', callback:(e,b)=>{
            me.tail_links.pop()
            me.head_link = me.tail_links[me.tail_links.length-1]
            me.reflesh_link()
          }})
        }
        sw.push({text:'Reflesh reference', img:'src/tag/tag_red.png', callback:(e,b)=>{
          me.reflesh_link()
        }})
        sw.push({text:'Remove reference', img:'src/tag/tag_red.png', callback:(e,b)=>{
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

      var text
      if(me.head_link!=null) text =  me.head_link.name
      var t = new createjs.Text(text, "20px serif", "Black")
      var w = t.getMeasuredWidth()
      t.x = 5
      t.y = 2
      me.base_tag.resize(w+10, me.base_tag.h)
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
    this.reflesh_link()
    if(this.head_link!=null){
      return tab + this.name
    }else{
      return tab + '/*Null reference Error!!!*/'
    }
  }
  serialize(){
    var ret = super.serialize()
    ret.head_link_id = this.head_link.id
    ret.tail_link_ids = this.tail_links.map((i)=>{return i.id})
    return ret
  }
  static deserialize(pm, json_obj, afterInit=(e)=>{}){
    var ret = reference.create(pm, json_obj.name, json_obj.x, json_obj.y, ()=>{
      pm.set_serialized_idmap(json_obj.id, ret.id)

      var count =0

      count++
      pm.find_visual_block_by_id(json_obj.head_link_id, (r)=>{
        ret.head_link = r
        count--
      })

      ret.tail_links = new Array(json_obj.tail_link_ids.length)
      json_obj.tail_link_ids.forEach(function(id, i) {
        count++
        pm.find_visual_block_by_id(id, (r)=>{
          ret.tail_links[i]=r
          count--
        })
      });
      var iId = setInterval(()=>{
        if(count==0){
          ret.reflesh_link()
          afterInit(ret)
          clearInterval(iId)
        }
      }, 100)
    })
    return ret
  }
  static deserializeAST_identifier(pm, ast, afterInit=(e)=>{}){
    var ret = reference.create(pm, ast.name, 100, 100, ()=>{
      pm.find_visual_block_by_name(ast.name, ret, (r)=>{
        ret.set_refer(r)
        afterInit(ret)
      })
    })
    return ret
  }
  static deserializeAST_this(pm, ast, afterInit=(e)=>{}){
    var ret = reference.create(pm, ast.name, 100, 100, ()=>{
      pm.find_visual_block_by_name("this", ret, (r)=>{
        ret.set_refer(r)
      })
    })
    afterInit(ret)
    return ret
  }
  static deserializeAST_member(pm, ast, afterInit=(e)=>{}){
    var ret = reference.create(pm, ast.name, 100, 100, ()=>{
      var names = []
      function find_origin(ast){
        if(ast.type == "Identifier"){
          names.push(ast.name)
          return ast
        }else if(ast.type == "ThisExpression"){
          names.push('this')
          return ast
        }else{
          var ret = find_origin(ast.object)
          if("name" in ast.property){
            names.push(ast.property.name)
          }else if(ast.property.type == "Literal"){
            names.push("["+ast.property.raw+"]")
          }
          return ret
        }
      }
      var o = find_origin(ast)

      if(ast.object.type == "ThisExpression"){
        pm.find_visual_block_by_name("this", ret, (r)=>{
          names.shift()
          ret.tail_links.push(r)
          var p = ret.find_by_name(ast.property.name, false)
          if(p){
            names.shift()
            ret.tail_links.push(p)
            ret.set_refer(p)
            for(var i of names){
              var p = ret.head_link.find_by_name(i, false)
              ret.tail_links.push(p)
              ret.head_link = p        
            }  
          }else{
            if(ast.property.type == "Identifier"){
              var p = def_variable.create(pm, ast.property.name, 0, 0, ()=>{
                function find_child(){
                  pm.find_visual_block_by_name(names[0], ret.head_link, (r)=>{
                    ret.tail_links.push(r)
                    ret.head_link = r
                    names.shift()
                    if(names.length!=0){
                      find_child()
                    }else{
                      ret.reflesh_link()                      
                    }
                  })
                }
                if(names.length!=0) find_child()
              })
              names.shift()
              r.definition_link.base_tag.onDrop(p.base_tag)
              ret.tail_links.push(p)
              ret.head_link = p
            }
          }
          ret.reflesh_link()
        })
      }else if(ast.type == "MemberExpression"){
        pm.find_visual_block_by_name(o.name, ret, (r)=>{
          ret.tail_links.push(r)
          ret.head_link = r
          names.shift()

          function find_child(){
            if(names[0][0]=="["){
              var raw = names[0].slice(1).slice(0, -1)
              if(isNaN(raw)){
                // 文字列
                pm.find_visual_block_by_name(raw, ret.head_link, (r)=>{
                  ret.tail_links.push(r)
                  ret.head_link = r
                  names.shift()
                  if(names.length!=0){
                    find_child()
                  }else{
                    ret.reflesh_link()                      
                  }
                })    
              }else{
                // 数字
                pm.find_visual_block_by_index(parseInt(raw), ret.head_link, (r)=>{
                  ret.tail_links.push(r)
                  ret.head_link = r
                  names.shift()
                  if(names.length!=0){
                    find_child()
                  }else{
                    ret.reflesh_link()                      
                  }
                }) 
              }

            }else{
              pm.find_visual_block_by_name(names[0], ret.head_link, (r)=>{
                ret.tail_links.push(r)
                ret.head_link = r
                names.shift()
                if(names.length!=0){
                  find_child()
                }else{
                  ret.reflesh_link()                      
                }
              })  
            }
          }
          find_child()
        })
      }
    })
    afterInit(ret)
    return ret
  }
  
  static create(pm, name, x, y, afterInit=()=>{}){
    var c = new reference({name:name, x:x, y:y})
    c.id = pm.num_obj
    pm.num_obj += 1
    c.init_render(pm,afterInit)
    pm.id_obj_map[c.id] = c
    pm.add_visualblock(c)
    return c
  }
}
