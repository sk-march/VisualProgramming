class tagButton extends tag
{
  constructor(pm, x, y, w, h, text, img, callback=()=>{}){
    super(pm, x, y, w, h, img, onInit);
    var me = this
    me.name = text
    
    me.callback = callback
    this.onClick = function(e){
      if(me.auto_clear) me.pm.clear_menu()
      me.callback(e, me);
    }
    this.callback = callback
    this.auto_clear = true
    pm.menu.push(this)

    function onInit(){
      var tt = text
      if(text.length==0) tt = ''
      var t = new createjs.Text(tt, "20px serif", "Black");
      var w = t.getMeasuredWidth();
      if(w > 180){
        t.text = tt.slice(0,20)+'...'
      }
      t.x = 15
      t.y = (h - 20)/2
      if(t.x + w > me.w){
        t.x = 10 + w/2-me.w/2;
      }
      me.container.addChild(t);
    }
  }
}