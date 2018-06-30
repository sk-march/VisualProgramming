class operator extends visual_block
{
  constructor(vb={name:'none', x:0, y:0, z:0}){
    vb.type = 'operator'
    super(vb)
    this.ope = '+';
    this.left=null;
    this.right=null;

    this.holder = null
    this.base_tag = null
    this.collider = []
  }
  set_holder(h){
    this.holder = h
  }
  add_visualblock(a){
    var me = this
    if(this.opetext!=null){
      var old = null
      if(a.base_tag.x < this.opetext.x){
        if(me.left){
          old = me.left
        }
        me.left = a
      }else{
        if(me.right){
          old = me.right
        }
        me.right = a
      }
      if(old){
        old.base_tag.set_pos(old.base_tag.x, old.base_tag.y+me.base_tag.h, ()=>{
          setTimeout(()=>{
            me.pm.onDrop(old.base_tag)
            old.base_tag.z_last()
          },100)
        }, 100)  
      }
    }
    me.update_children_pos()   
  }
  rid_visualblock(b){
    if(this.right == b){
      this.right = null
    }
    if(this.left == b){
      this.left = null
    }
    this.update_children_pos()
  }

  update_children_pos(){
    if(this.opetext!=null){
      this.opetext.text = this.ope
      var lw = 50
      var rw = 50
      var tw = 0
      var pm = this.pm
      if(this.left && this.left.base_tag){
        lw = 10+this.left.base_tag.w
        this.left.base_tag.set_pos(10, 0, ()=>{pm.dirty=true}, 200)      
      }
      if(this.right && this.right.base_tag){
        rw = this.right.base_tag.w+10
      }
      tw = this.opetext.getMeasuredWidth()
      this.opetext.x = lw + 5;
      if(this.right && this.right.base_tag){
        this.right.base_tag.set_pos(lw+5+tw+5, 0, ()=>{pm.dirty=true}, 200)      
      }
      this.base_tag.resize(lw+tw+rw+15, this.base_tag.h)
    }
  }

  init_render(pm, afterInit=()=>{}){
    var me = this
    me.pm = pm

    me.base_tag = new tag(pm, this.x, this.y, 100, 27, 'src/tag/tag_white.png', onInit);
    me.base_tag.f_mobility = true
    me.base_tag.f_mouseover_shift = false
    me.base_tag.set_visualblock(this)
    
    var t = new createjs.Text(me.ope, "20px serif", "Black")
    t.x = 15
    t.y = 3
    me.opetext = t

    me.base_tag.onDrop = (t)=>{
      var e = t.visual_block
      if(e==null || e.type === undefined) return
      if(e.type != 'reference' && e.type != 'operator' && e.type !='literal' && e.type != 'function_advocation' && e.type != 'rawcode' && e.type != 'def_function' && e.type != 'def_class'){
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
        var sw5 = []
        var sw6 = []

        sw0.push({text:'Remove', img:'src/tag/tag_white.png', callback:(e,b)=>{
          me.holder.rid_visualblock(me)
          me.finit_render(me.pm)
        }})

        function addope(ope, sw){
          sw.push({text:ope, img:'src/tag/tag_red.png', callback:(e,b)=>{
            me.ope = ope
            me.opetext.text = ope
            me.update_children_pos()
          }})  
        }
        addope('+', sw1); addope('-', sw1); addope('*', sw1); addope('/', sw1);
        addope('%', sw2); addope('^', sw2); addope('~', sw2); addope('!', sw2);
        addope('<', sw3); addope('<=', sw3); addope('>', sw3); addope('>=', sw3);
        addope('=', sw4); addope('==', sw4);
        addope('+=', sw5); addope('-=', sw5); addope('*=', sw5); addope('/=', sw5);
        addope('%=', sw6); addope('^=', sw6); addope('~=', sw6); addope('!=', sw6);

        var ts0 = new tagSwitch(pm, gx, gy+140, 150, 50, sw0)
        var ts1 = new tagSwitch(pm, gx+40*0, gy, 35, 30, sw1)
        var ts2 = new tagSwitch(pm, gx+40*1, gy, 35, 30, sw2)
        var ts3 = new tagSwitch(pm, gx+40*2, gy, 35, 30, sw3)
        var ts4 = new tagSwitch(pm, gx+40*3, gy, 35, 30, sw4)
        var ts5 = new tagSwitch(pm, gx+40*4, gy, 35, 30, sw5)
        var ts6 = new tagSwitch(pm, gx+40*5, gy, 35, 30, sw6)
      }
    }
    function onInit(){
      me.base_tag.bg.addEventListener('mousedown',()=>{
        me.base_tag.z_top()
      })
      me.base_tag.bg.addEventListener('pressmove',()=>{
        me.base_tag.z_top()
      })

      me.base_tag.container.addChild(me.opetext);
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
    if(this.left)  ret = ret.concat(this.left.get_collider_recursive())
    if(this.right) ret = ret.concat(this.right.get_collider_recursive())
    ret = ret.concat(this.collider)
    return ret
  }
  get_visual_block_from_collider_recursive(c)
  {
    if(this.left){
      var r = this.left.get_visual_block_from_collider_recursive(c)
      if(r!=null) return r  
    }
    if(this.right){
      var r = this.right.get_visual_block_from_collider_recursive(c)
      if(r!=null) return r
    }
    for(var i of this.collider){
      if(i == c) return this
    }  
    return null
  }

  emit(tab=''){
    return tab + this.left.emit() + this.ope + this.right.emit();
  }
  serialize(){
    var ret = super.serialize()
    if(this.left) ret.left = this.left.serialize()
    ret.ope = this.ope
    if(this.right) ret.right = this.right.serialize()

    return ret
  }
  static deserialize(pm, json_obj, afterInit=(e)=>{}){
    var ret = operator.create(pm, json_obj.name, json_obj.x, json_obj.y, ()=>{
      pm.set_serialized_idmap(json_obj.id, ret.id)
 
      var count = 0
      count++
      pm.deserialiser[json_obj.left.type](pm, json_obj.left, (r)=>{
        ret.left = r
        r.base_tag.set_pos(0,0,()=>{
          ret.base_tag.onDrop(r.base_tag)
          count--  
        },0)
      })

      count++
      pm.deserialiser[json_obj.right.type](pm, json_obj.right, (r)=>{
        ret.right = r
        r.base_tag.set_pos(ret.base_tag.w,0,()=>{
          ret.base_tag.onDrop(r.base_tag)
          count--  
        },0)
      })

      var iId = setInterval(()=>{
        if(count==0){
          ret.ope = json_obj.ope
          ret.update_children_pos()
          afterInit(ret)
          clearInterval(iId)
        }
      },300)

    })
    return ret
  }
  static create(pm, name, x, y, afterInit=()=>{}){
    var c = new operator({name:name, x:x, y:y})
    c.id = pm.num_obj
    pm.num_obj += 1
    c.init_render(pm,afterInit)
    pm.id_obj_map[c.id] = c
    pm.add_visualblock(c)
    return c
  }
}