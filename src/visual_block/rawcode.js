class rawcode extends visual_block
{
  constructor(vb={name:'none', x:0, y:0, z:0}){
    vb.type = 'rawcode'
    super(vb)
    this.code = ''
    this.holder = null
    this.base_tag = null
    this.collider = []
  }

  set_holder(h){
    this.holder = h
  }
  set_code(c){
    this.code = c;
    this.edit.setValue(c)
  }
  init_render(pm, afterInit=()=>{}){
    var me =this
    me.pm = pm

    this.edit = create_editor(pm, 'raw_code'+me.id)
    this.edit.setTopAnchor(pm.top.x, pm.top.y);
    this.edit.setPosition(pm.stage.canvas.width, 0);
    this.edit.setSize(pm.stage.canvas.width, pm.stage.canvas.height)    
    this.edit.setFontSize(10)
    this.edit.visible(false)
    this.edit.onChange =()=>{
      me.code = me.edit.getValue() 
    }

    me.base_tag = new tag(pm, this.x, this.y, 25, 25, 'src/tag/tack_white.png', onInit);
    me.base_tag.f_mobility = true
    me.base_tag.f_mouseover_shift = false
    me.base_tag.set_visualblock(this)
    
    me.base_tag.onDblclick = ()=>{
      me.flip_openclose()
    }
    me.base_tag.onClick = function(e){
      if(!pm.clear_menu()){
        var gx = (e.stageX - pm.top.x)/pm.top.scaleX
        var gy = (e.stageY - pm.top.y)/pm.top.scaleY

        var ts = new tagSwitch(me.pm, gx, gy, 200, 50, [
          {text:'Remove rawcode', img:'src/tag/tag_white.png'},
          {text:'Download', img:'src/tag/tag_white.png'},
          {text:'Deserialize', img:'src/tag/tag_white.png'}
        ])
        ts.get_callback('Remove rawcode', (e, b)=>{
          me.holder.rid_visualblock(me)
          me.finit_render(me.pm)
        })
        ts.get_callback('Download', (e, b)=>{
          var txt = me.edit.getValue()
          if(txt==''){
            var assertTag = new tagButton(pm, gx, gy, 150, 50, 'Empty!', 'src/tag/tag_white.png', ()=>{})
            setTimeout(()=>{assertTag.remove()}, 500)
          }else{
            var it = new tagInput(pm, 'Enter name', 'file_name_'+me.id, gx, gy, 280, 40, (text)=>{
              if(text==null){
                var assertTag = new tagButton(pm, gx, gy, 150, 50, 'Cancel!', 'src/tag/tag_white.png', ()=>{})
                setTimeout(()=>{assertTag.remove()}, 500)
              }else{
                if(text!=''){
                  me.pm.download_data(text, txt)
                }
              }
            })
            it.edit.setValue(me.pm.project_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()+'.txt')
          }
        })
        ts.get_callback('Deserialize', (e, b)=>{
          var c = me.edit.getValue()
          me.pm.deserialize(c)
        })
      }
    }
    function onInit(){
      me.base_tag.bg.addEventListener('mousedown',()=>{
        me.base_tag.z_top()
      })
      me.base_tag.bg.addEventListener('pressmove',()=>{
        me.base_tag.z_top()
      })
      var text =  'Raw code'
      var t = new createjs.Text(text, "20px serif", "Gray")
      t.x = 25
      t.y = 3
      me.base_tag.container.addChild(t);
      me.cjtext = t

      me.pm.collider[0].addEventListener('click', function(e){
        me.openclose(false)
      })

      me.collider = [me.base_tag.bg]
      afterInit()
    }
  }
  finit_render(pm){
    this.base_tag.parent.removeChild(this.base_tag.container)
    this.holder = null
    this.base_tag = null
    this.collider = []
    this.edit.remove()
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
  openclose(f){
    var me = this
    if(f==me.edit.is_visible()) return
    this.flip_openclose()   
  }
  flip_openclose(){
    var me = this
    if(!me.edit.is_visible()){
      if(rawcode.f_open) return
      rawcode.f_open = true
      me.edit.focus()
      me.pm.set_pos(-me.pm.stage.canvas.width*0.8, 0, true, 300)
      me.pm.cj.Tween
        .get(me.edit, { override: true, onChange:function(){
          me.edit.setPosition(me.edit.x, me.edit.y, true)
          me.edit.setSize(me.pm.stage.canvas.width - me.edit.x+1, me.edit.h, true)
          me.pm.minimap.x = me.edit.x - me.pm.bg1.image.width*2*0.08 - 10
        }})
        .call(()=>{
          me.edit.flip_visible()
        })
        .to({x:me.pm.stage.canvas.width*0.2},300)
    }else{
      rawcode.f_open = false
      me.pm.set_pos(0, 0, true, 300)
      me.pm.cj.Tween
        .get(me.edit, { override: true, onChange:function(){
          me.edit.setPosition(me.edit.x, me.edit.y, true)
          me.edit.setSize(me.pm.stage.canvas.width - me.edit.x+1, me.edit.h, true)
          me.pm.minimap.x = me.edit.x - me.pm.bg1.image.width*2*0.08 - 10
        }})
        .to({x:me.pm.stage.canvas.width},300)
        .call(()=>{
          me.edit.flip_visible()
        })
    }    
  }

  emit(tab=''){  
    var ret =tab+'// rawcode: '+this.name+'\n'
    ret += tab+this.code.split('\n').join('\n'+tab)+'\n'
    return ret;
  }
  serialize(){
    var ret = super.serialize()
    ret.code = this.code
    return ret
  }
  static deserialize(pm, json_obj, afterInit=(e)=>{}){
    var ret = rawcode.create(pm, json_obj.name, json_obj.x, json_obj.y, ()=>{
      pm.set_serialized_idmap(json_obj.id, ret.id)

      ret.set_code(json_obj.code)
      afterInit(ret)
    })
    return ret
  }
  static create(pm, name,x, y, afterInit=()=>{}){
    var c = new rawcode({name:name, x:x, y:y})
    c.id = pm.num_obj
    pm.num_obj += 1
    c.init_render(pm,afterInit)
    pm.id_obj_map[c.id] = c
    pm.add_visualblock(c)
    return c
  }
}
rawcode.f_open = false