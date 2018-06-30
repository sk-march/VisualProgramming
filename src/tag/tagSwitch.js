class tagSwitch
{
  constructor(pm, ix, iy, iw, ih, data){
    var me = this;
    this.buttons = []
    var shift = 0
    for(var i of data){
      this.buttons.push( 
        new tagButton(pm, ix, 30+iy+shift, iw, ih, i.text, i.img, i.callback)
      )
      shift += ih+5
    }
  }
  get_callback(text, func){
    for(var i of this.buttons){
      if(i.name == text){
        i.callback = func
      }
    }
  }
  remove(){
    for(var i of this.buttons){
      i.remove()
    }
    this.buttons = []
  }
}