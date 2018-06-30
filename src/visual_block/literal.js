class literal extends visual_block
{
  constructor(vb={name:'none', x:0, y:0, z:0}){
    vb.type = 'literal';
    super(vb)
    this.value = 'null'
    this.holder = null
    this.base_tag = null
    this.collider = []
  }
  set_holder(h){
    this.holder = h
  }
  refresh(){
    this.cjtext.text = this.value
    var tw = this.cjtext.getMeasuredWidth()
    this.base_tag.resize(tw+10, this.base_tag.h)      
  }
  init_render(pm, afterInit=()=>{}){
    var me = this
    me.pm = pm
    me.base_tag = new tag(pm, this.x, this.y, 25, 27, 'src/tag/tag_white.png', onInit);
    me.base_tag.f_mobility = true
    me.base_tag.f_mouseover_shift = false
    me.base_tag.set_visualblock(this)
    
    me.base_tag.onClick = function(e){
      me.refresh()
      if(!pm.clear_menu()){
        if(me.head_link!=null){
          me.head_link.base_tag.vibrate()
        }else{
          me.base_tag.vibrate()
        }
        var ex = (e.stageX - pm.top.x)/pm.top.scaleX 
        var ey = (e.stageY - pm.top.y)/pm.top.scaleY
        var gx = ex -20
        var gy = ey -20

        var sw = []
        sw.push({text:'Set value', img:'src/tag/tag_red.png', callback:(e,b)=>{
          var it = new tagInput(me.pm, 'Enter value', 'literal_value_'+me.id, gx, gy, 280, 40, function(text){
            if(text!==undefined && text!=''){
              me.value = text
              me.refresh()
            }
          })
        }})
        sw.push({text:'Remove literal', img:'src/tag/tag_red.png', callback:(e,b)=>{
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
      if(me.head_link!=null) text =  me.value
      var t = new createjs.Text(text, "20px serif", "Black")
      var w = t.getMeasuredWidth()
      t.x = 5
      t.y = 2
      me.base_tag.resize(w+10, me.base_tag.h)
      me.base_tag.container.addChild(t);
      me.cjtext = t

      //me.collider=[me.base_tag.bg]
      afterInit()
      me.refresh()
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
      return tab + this.value
  }
  serialize(){
    var ret = super.serialize()
    ret.value = this.value
    return ret
  }
  static deserialize(pm, json_obj, afterInit=(e)=>{}){
    var ret = literal.create(pm, json_obj.name, json_obj.x, json_obj.y, ()=>{
      pm.set_serialized_idmap(json_obj.id, ret.id)

      ret.value = json_obj.value
      afterInit(ret)
      ret.refresh()
    })
    return ret
  }
  static create(pm, name, x, y, afterInit=()=>{}){
    var c = new literal({name:name, x:x, y:y})
    c.id = pm.num_obj
    pm.num_obj += 1
    c.init_render(pm,afterInit)
    pm.id_obj_map[c.id] = c
    pm.add_visualblock(c)
    return c
  }
}
