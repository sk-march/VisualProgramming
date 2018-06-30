class tag
{
  constructor(pm, x, y, w, h, img, onInit=()=>{}){
    this.pm = pm
    this.onRemove = ()=>{}
    this.onClick = ()=>{}
    this.onDblclick = ()=>{}    
    this.onDrop = ()=>{}
    this.onDrag = ()=>{}
    this.onMouseover = ()=>{}
    this.onMouseout = ()=>{}
    this.onPressmove = ()=>{}
    this.onInit = onInit
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.click_pos = {x:0, y:0}
    this.f_mobility = false
    this.f_mouseover_shift = true
    this.f_drag = false
    this.f_dropout = true
    this.f_remove = false
    this.container = new createjs.Container();
    this.visual_block = null

    var me = this;
    var bg = new createjs.Bitmap(img);
    this.bg = bg
    me.pm.top.addChild(me.container)
    me.parent = pm.top

    bg.image.onload = function() {
      me.container.x = me.x
      me.container.y = me.y
      //me.x = me.container.x = me.x + 10 + Math.random()*10-5;
      //me.y = me.container.y = me.y + 10 + Math.random()*10-5;
      //me.set_pos(me.x, me.y)
      me.container.rotation = 0;//Math.random()*20/10;
      me.container.addChild(bg);

      bg.scaleX = me.w / bg.getBounds().width;
      bg.scaleY = me.h / bg.getBounds().height;

      bg.addEventListener('click', function(e){
        if(!me.f_drag){
          me.onClick(e, me)
        }
      });
      bg.addEventListener('dblclick', function(e){
        if(!me.f_drag){
          me.onDblclick(e, me)
        }
      });

      bg.addEventListener('mouseover', function(e){
        if(me.f_mouseover_shift){
          var nx = me.x + 3
          var ny = me.y + 3
          me.set_pos(nx,ny,function(){me.pm.dirty = true; me.onMouseover(me)}, 100)
        }else{
          me.onMouseover(me) 
        }
      });
      bg.addEventListener('mouseout', function(e){
        if(me.f_mouseover_shift){
          var nx = me.x - 3
          var ny = me.y - 3
          me.set_pos(nx,ny,function(){me.pm.dirty = true; me.onMouseover(me)}, 100)
        }else{
          me.onMouseout(me)
        }
      });
      bg.addEventListener('mousedown', function(e){
        me.click_pos.x = e.stageX/me.pm.top.scaleX-me.container.x;
        me.click_pos.y = e.stageY/me.pm.top.scaleY-me.container.y;
      });

      bg.addEventListener('pressup', (e)=>{
        var t = me.pm.hit_test(e.stageX, e.stageY, me.bg)
        if(t!=null && me.f_dropout && me.f_drag){
          t.base_tag.onDrop(me)
        }
        me.f_drag = false
      })
      bg.addEventListener("pressmove", function(e){
        var nx = e.stageX/me.pm.top.scaleX - me.click_pos.x;
        var ny = e.stageY/me.pm.top.scaleY - me.click_pos.y;

        var dx = nx - me.container.x
        var dy = ny - me.container.y
        if(Math.sqrt(dx*dx+dy*dy)>5 || me.f_drag){
          me.z_top()
          me.f_drag = true
          if(me.f_mobility){
            me.z_top()
            me.set_pos(nx,ny,function(){me.pm.dirty = true; me.onDrag(me)}, 0)
            me.pm.clear_menu()
          }  
        }
        me.onPressmove(me)
      });
      
      pm.dirty = true
      me.onInit();
    };
  }
  set_visualblock(vb){
    this.visual_block = vb
    if(this.visual_block){
      this.visual_block.x = this.x
      this.visual_block.y = this.y
      this.visual_block.w = this.w
      this.visual_block.h = this.h  
    }
  }
  set_parent(p){
    var p1 = this.container.localToGlobal(0,0)
    var p2 = p.localToGlobal(0,0)

    var me = this
    var nx = (p1.x - p2.x)/this.pm.top.scaleX
    var ny = (p1.y - p2.y)/this.pm.top.scaleY
    var oc = function(){
      p.addChild(me.container)
      me.parent.removeChild(me.container)    
      me.parent = p
      me.pm.dirty = true
    }
    me.set_pos(nx,ny,oc,0)
  }
  is_visible(){
    return this.container.visible
  }
  visible(f){
    this.container.visible = f
  }
  set_pos(ix,iy, onChange=()=>{this.pm.dirty=true}, ms=0){
    var me = this
    if(this.visual_block){
      this.visual_block.x = ix
      this.visual_block.y = iy  
    }
    this.x = ix
    this.y = iy
    me.pm.cj.Tween.get(me.container, { override: true, onChange:onChange}).to({x:ix, y:iy}, ms);
  }
  resize(iw,ih){
    this.w = iw
    this.h = ih
    this.bg.scaleX = this.w / this.bg.getBounds().width;
    this.bg.scaleY = this.h / this.bg.getBounds().height;
    this.visual_block.w = iw
    this.visual_block.h = ih
  }
  z_top(){
    this.parent.setChildIndex(this.container, this.parent.numChildren-1)
  }
  z_last(){
    this.parent.setChildIndex(this.container, 1)
  }
  vibrate(){
    var c = this.container
    this.tween()
      .to({x:c.x+5}, 50)
      .to({x:c.x-5}, 50)
      .to({x:c.x+5}, 50)
      .to({x:c.x-5}, 50)
      .to({x:c.x+5}, 50)
      .to({x:c.x-5}, 50)
      .to({x:c.x+5}, 50)
      .to({x:c.x}, 100)
  }
  tween(){
    if(this.f_remove) return null
    var me = this
    var c = this.container
    return me.pm.cj.Tween.get(c, { override: true, onChange:function(){me.pm.dirty = true}  })
  }
  remove(){
    var me = this
    this.onRemove()
    me.pm.cj.Tween
    .get(me.container, { override: true, onChange:function(){me.pm.dirty = true} })
    .to({x:me.x+10, y:me.y+3, alpha:0}, 100)
    setTimeout(()=>{
      me.parent.removeChild(me.container)
      me.pm.dirty = true
      me.visual_block = null  
    },100)
  }
}