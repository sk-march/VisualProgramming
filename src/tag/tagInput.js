class tagInput
{
  constructor(pm, mes, text_id, ix, iy, iw, txtSize, callback){
    var me = this

    var t
    setTimeout(()=>{
      t = new createjs.Text(mes, "20px serif", "Black");
      t.x = ix+40
      t.y = iy+30
      pm.top.addChild(t);
      pm.dirty = true  
    },100)

    this.callback = callback
    this.b_new_name = new tagButton(pm, ix, iy, iw, 160+txtSize, '', "src/tag/tag_red.png")
    this.b_new_name.onRemove = ()=>{
      pm.top.removeChild(t)
      setTimeout(()=>{me.edit.remove()},10)
    }
    this.b_new_name.auto_clear = false;
    this.b_new_name.f_mouseover_shift = false
  
    this.edit = create_editor(pm, text_id)
    this.edit.visible(true)
    this.edit.setTopAnchor(pm.top.x, pm.top.y);
    this.edit.setPosition(ix+40, iy+60);
    this.edit.setSize(iw-80, 60)    
    this.edit.setShowGutter(false)
    this.edit.setFontSize(txtSize)
    this.edit.onEnter(function(value){
      callback(value)
      me.b_ok.remove()
      me.b_ng.remove()
      me.b_new_name.remove()
      pm.clear_menu()
    })
    me.edit.focus()

    this.b_ok = new tagButton(pm, ix+30, iy+130, 100, 50, 'OK', "src/tag/tag_blue.png", function(e, b){
      var value = me.edit.getValue()
      me.edit.remove()
      me.b_new_name.remove()
      me.b_ok.remove()
      me.b_ng.remove()
      callback(value)
    })
    this.b_ng = new tagButton(pm, ix+130, iy+130, 100, 50, 'Cancel', "src/tag/tag_blue.png", function(e, b){
      me.edit.remove()
      me.b_new_name.remove()
      me.b_ok.remove()
      me.b_ng.remove()
      callback()
    })
  }
  remove(){
    this.onRemove()
    this.edit.remove()
    this.b_new_name.remove()
    this.b_ok.remove()
    this.b_ng.remove()
    this.callback()
    this.pm.dirty = true
  }
}