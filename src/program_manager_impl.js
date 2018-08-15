class program_manager_impl
{
  constructor(canvas_id){
    // init create js
    var canvas = document.getElementById(canvas_id);
    var stage = new createjs.Stage( canvas );

    this.project_name = 'new project'
    this.num_obj = 0;
    this.all_visual_blocks = []
    this.id_obj_map = {}
    this.deserializer = {}
    this.cj = createjs
    this.ace = ace
    this.stage = stage
    this.top = new this.cj.Container();
    this.top.scaleX = 1
    this.top.scaleY = 1
    this.dirty = true
    this.framerate = 60
    this.serialized_idmap = {}
    this.menu = []
    this.mouse_scale = false
    this.collider = []
    var me = this


    // mask
    var mask = new createjs.Shape();
    mask.graphics.drawRect(0,0,this.stage.canvas.width,this.stage.canvas.height)
    mask.x=0;
    mask.y=0;
    this.stage.mask = mask

    // init touch mouse
    createjs.Touch.enable(stage, false, true)
    stage.enableMouseOver();

    // background
    me.f_drag = false
    var bg = new createjs.Shape();
    bg.graphics.beginFill('Gray');
    bg.graphics.drawRect(0, 0, this.stage.canvas.width, this.stage.canvas.height);
    bg.addEventListener('click', function(e){
      if(!me.clear_menu() && !me.f_drag){
        var x = (e.stageX - me.top.x)/me.top.scaleX
        var y = (e.stageY - me.top.y)/me.top.scaleY
        me.pop_menu(x,y)
      }else{
        me.f_drag = false
      }
    })
    this.bg = bg
    this.stage.addChild(bg);
    this.stage.addChild(this.top)

    this.bg1 = new createjs.Bitmap("src/back.png");     
    this.top.addChild(this.bg1);
    this.bg1.image.onload = function() {
      me.bg1.scaleX = 2//me.stage.canvas.width / bg1.getBounds().width;
      me.bg1.scaleY = 2//bg1.scaleX;
      me.dirty = true

      // make minimap
      me.minimap = new me.cj.Container()
      me.minimap.x = me.stage.canvas.width - me.bg1.image.width*2*0.08 - 10
      me.minimap.y = 10
      me.minimap.scaleX = 0.08
      me.minimap.scaleY = 0.08
      me.minimap.alpha = 0.3
      me.minimap.bg = new me.cj.Shape()
      me.minimap.bg.graphics.beginFill('White')
      me.minimap.bg.graphics.beginStroke('#dd0000')
      me.minimap.bg.graphics.setStrokeStyle(20)
      me.minimap.bg.graphics.drawRect(0, 0, me.bg1.image.width*2, me.bg1.image.height*2);
      me.minimap.addChild(me.minimap.bg)
      me.stage.addChild(me.minimap)

      me.minimap.bg.addEventListener('mouseover', (e)=>{
        me.cj.Tween.get(me.minimap, { override: false, onChange:function(){me.dirty = true} }).to({alpha:1.0}, 100);
      })
      me.minimap.bg.addEventListener('mouseout', (e)=>{
        me.cj.Tween.get(me.minimap, { override: false, onChange:function(){me.dirty = true} }).to({alpha:0.3}, 100);
      })  
      me.minimap.bg.addEventListener('pressup', (e)=>{
        var gx = (e.stageX - me.minimap.x)*me.top.scaleX/me.minimap.scaleX - me.stage.canvas.width/2
        var gy = (e.stageY - me.minimap.y)*me.top.scaleY/me.minimap.scaleY - me.stage.canvas.height/2
        me.set_pos(-gx, -gy)
      })
      me.minimap.bg.addEventListener('pressmove', (e)=>{
        var gx = (e.stageX - me.minimap.x)*me.top.scaleX/me.minimap.scaleX - me.stage.canvas.width/2
        var gy = (e.stageY - me.minimap.y)*me.top.scaleY/me.minimap.scaleY - me.stage.canvas.height/2
        me.set_pos(-gx, -gy)
      })  
/*
    this.minimap_id = canvas_id+'_minimap'
    document.body.insertAdjacentHTML('beforeend', '<div id="'+this.minimap_id+'"></div>')  
    this.minimap_element = document.getElementById(this.minimap_id);
    //this.minimap_element.style.visibility = "hidden";
    this.minimap_element.style.position = 'fixed';
    this.minimap_element.style.top = '50px';
    this.minimap_element.style.left = '50px';
*/  
    };

    // project name
    this.cjtext = new createjs.Text('Project: '+this.project_name, "50px serif", "Black");
    this.cjtext.x = 100
    this.cjtext.y = 100
    me.top.addChild(this.cjtext);

    // zoom cancel
    this.stage.canvas.addEventListener("mousewheel", function(e) {
      if (e.ctrlKey) {
          e.preventDefault();
          e.stopImmediatePropagation(); 
          // perform desired zoom action here
          var s = 0
          if(e.wheelDelta>0){
            s = me.get_scale()*1.4
          }else{
            s = me.get_scale()/1.4
          }
          if(s<0.01) s=0.1
          if(s>5) s=5
          me.set_scale(s)
      }else{
        var p = me.get_pos()
        me.set_pos(p.x + e.wheelDeltaX, p.y + e.wheelDeltaY);
      }
    });

    // deserialize file drop
    var cancelEvent = function(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    this.stage.canvas.addEventListener("dragover", cancelEvent, false);
    this.stage.canvas.addEventListener("dragenter", cancelEvent, false);
    this.stage.canvas.addEventListener('drop', function(e) {
      e.stopPropagation();
      e.preventDefault();

      // ファイルの情報を取得
      var fileData = e.dataTransfer.files;

      for (var i = 0; i < fileData.length; i++) {
        var file = fileData[i];

        var reader = new FileReader();
        // ファイル読み取りに失敗したとき
        reader.onerror = function() {
            alert('ファイル読み取りに失敗しました')
        }
        // ファイル読み取りに成功したとき
        reader.onload = function(ev) {
          me.deserialize(ev.target.result)
        }
        // ファイル読み取りを実行
        reader.readAsText(file);
      }
    });

    window.addEventListener("keydown", function(event) {
      var keyCode = event.keyCode;
      if (keyCode == 40) { // 下
        me.set_scale(me.get_scale()*0.9);
      } else if (keyCode == 38) { // 上
        me.set_scale(me.get_scale()*1.1);
      }
    });

    this.collider = [bg]
    this.base_tag = this
    this.base_tag.visual_block = this

    // move pinch
    // 距離を測る関数
    function getDistance ( e ) {
      e.nativeEvent.preventDefault();
      var touches = e.nativeEvent.changedTouches;
      // 2本以上の指の場合だけ処理
      if ( touches !== undefined && touches.length > 1 ) {
        // 座標1 (1本目の指)
        var x1 = touches[0].pageX ;
        var y1 = touches[0].pageY ;

        // 座標2 (2本目の指)
        var x2 = touches[1].pageX ;
        var y2 = touches[1].pageY ;

        // 2点間の距離
        return Math.sqrt( Math.pow( x2-x1, 2 ) + Math.pow( y2-y1, 2 ) ) ;
      }

      return 0 ;
    }

    bg.addEventListener('mousedown', function(e){
      var d = getDistance(e)
      if(d>0){
        me.top.baseDist = d
      }else{
        me.top.click_x = e.stageX
        me.top.click_y = e.stageY
      }
    });
    bg.addEventListener('pressup', function(e){
      me.mouse_scale = false
    })
    bg.addEventListener("pressmove", function(e){
      if(me.mouse_scale){
        var d = e.stageY-me.top.click_y
        d = d/100
        var s = me.get_scale()+d
        if(s>5) s = 3
        if(s<0.1) s = 0.1
        me.f_drag = true
        me.top.click_x = e.stageX
        me.top.click_y = e.stageY
        me.set_scale(s);
      }else{
        var d = getDistance(e)
        if(d>0){
          me.set_scale(d/me.base/Dist)
        }else{
          var nx = e.stageX
          var ny = e.stageY
          var tx = me.top.x + (nx - me.top.click_x)*10
          var ty = me.top.y + (ny - me.top.click_y)*10
          if(Math.abs(me.top.x-tx)>3 || Math.abs(me.top.y-ty)>3){
            me.f_drag = true
            me.top.click_x = e.stageX
            me.top.click_y = e.stageY
            me.set_pos(tx, ty);
          }    
        }  
      }
    });  

    createjs.Ticker.addEventListener("tick", handleTick)
    function handleTick(){
      if(me.dirty){
        me.dirty=false
        me.cj.Ticker.framerate = me.framerate;

        // make minimap
        if(me.minimap){
          me.minimap.removeAllChildren()
          // outline
          me.minimap.addChild(me.minimap.bg)
          // clone
          var cl = me.top.clone(true)
          cl.scaleX = 1
          cl.scaleY = 1
          cl.x = 0
          cl.y = 0
          me.minimap.addChild(cl)
          // viewport
          var range = new me.cj.Shape()
          range.graphics.beginFill('#FF000010');
          var r ={
             x:-me.top.x/me.top.scaleX,
             y:-me.top.y/me.top.scaleY,
             w: me.stage.canvas.width/me.top.scaleX, 
             h:me.stage.canvas.height/me.top.scaleY
            }
          if(r.x<0)r.x=0
          if(r.y<0)r.y=0
          if(r.w>me.bg1.image.width*2) r.w = me.bg1.image.width*2
          if(r.h>me.bg1.image.height*2) r.h = me.bg1.image.height*2
          range.graphics.drawRect(r.x, r.y, r.w, r.h)
          me.minimap.addChild(range)
  
          //var data = me.stage.canvas.toDataURL();
          //me.minimap_element.innerHTML = '<img src="' + data + '"  width="200" height="200"  />';            
        }

        // update!!!
        me.stage.update();
      }
    }
  }

  pop_menu(ix, iy){
    var me = this
    var gx = ix - 70
    var gy = iy - 20
    var make_edit_button = (text, label, img, x, i, func)=>{
      return new tagButton(me, x, 30+gy+60*i, 200, 50, text, img, function(e, b){
        var it = new tagInput(me, label, 'variable_name_'+me.id, gx, gy, 280, 40, function(text){
          if(text!==undefined && text!=''){
            func(text,ix,iy)
          }
        })
        b.remove()
      })            
    }
    var b_variable = make_edit_button('+ variable', 'Enter name', 'src/tag/tag_red.png',    gx, 0, (text,x,y)=>{def_variable.create(me,text,x,y)})
    var b_function = make_edit_button('+ function', 'Enter name', 'src/tag/tag_blue.png',   gx, 1, (text,x,y)=>{def_function.create(me,text,x,y)})
    var b_class    = make_edit_button('+ class', 'Enter name',    'src/tag/tag_yellow.png', gx, 2, (text,x,y)=>{def_class.create(me,text,x,y)})
    var b_operator  = new tagButton(me, gx, 30+gy+60*3, 200, 50, '+ operator', 'src/tag/tag_white.png', function(e, b){
      operator.create(me, 'operator',ix,iy)
    })
    var b_if  = new tagButton(me, gx, 30+gy+60*4, 200, 50, '+ if', 'src/tag/tag_white.png', function(e, b){
      statementIf.create(me, 'if',ix,iy)
    })
    var b_array  = new tagButton(me, gx, 30+gy+60*5, 200, 50, '+ array', 'src/tag/tag_white.png', function(e, b){
      expressionArray.create(me, 'array',ix,iy)
    })
    var b_literal  = make_edit_button('+ literal', 'Enter value',    'src/tag/tag_white.png', gx, 6, (text,x,y)=>{
      var ret = literal.create(me,'literal',x,y)
      ret.value = text
    })
    var b_rawcode  = new tagButton(me, gx, 30+gy+60*7, 200, 50, '+ rawcode', 'src/tag/tag_white.png', function(e, b){
      rawcode.create(me, 'rawcode',ix,iy)
    })

    var b_emit = new tagButton(me, gx+200, 30+gy+60*0, 150, 50, 'Emit project', 'src/tag/tag_white.png', function(e, b){
      var ret = me.emit()
      var raw = rawcode.create(me, 'emited code',gx,gy)
      raw.set_code(ret)
    })
    var b_serialize = new tagButton(me, gx+200, 30+gy+60*1, 200, 50, 'Serialize project', 'src/tag/tag_white.png', function(e, b){
      var ret = me.serialize()
      var raw = rawcode.create(me, 'serialized code',gx,gy)
      raw.set_code(JSON.stringify(ret, null , "\t"))
    })
    var b_pjname = make_edit_button('Set project name', 'Enter name', 'src/tag/tag_white.png', gx+200, 2, (text,x,y)=>{
      me.rename(text)
    })
    var b_scale = new tagButton(me, gx+200, 30+gy+60*3, 150, 50, 'Scale', 'src/tag/tag_white.png', function(e, b){
      me.mouse_scale = true
    })
  }

  clear_menu(){
    var ret = this.menu.length != 0
    for(var b of this.menu){
      b.remove()
    }
    this.menu = []
    this.dirty = true
    return ret
  }

  // program generator
  add_visualblock(c){
    c.set_holder(this)
    this.all_visual_blocks.push(c)
  }
  rid_visualblock(c){
    var a = this.all_visual_blocks
    a.some(function(v, i){
      if (v.id==c.id){
        a.splice(i,1);  
      }
    });
  }

  onDrop(t){
    var e = t.visual_block
    if(e==null || e.type === undefined) return
    // check duplicate
    for(var i=0; i<this.top.numChildren; i++){
      var c = this.top.getChildAt(i)
      if(c == t.container){
        return
      }
    }
    // add to array
    e.holder.rid_visualblock(e)      
    this.add_visualblock(e)
    // exchange parent
    e.set_holder(this)
    t.set_parent(this.top)
  }

  hit_test(stage_x, stage_y, self_collider){
    var t = this.all_visual_blocks.concat()
    var me = this
    t.sort((i1,i2)=>{
      var ind1 = me.top.getChildIndex(i1.base_tag.container)
      var ind2 = me.top.getChildIndex(i2.base_tag.container)
      if( ind1 > ind2 ) return -1;
      if( ind1 < ind2 ) return 1;
      return 0;
    })
    t.push(this)
    for(var ii of t){
      if(ii.collider==null) continue
      var cols = ii.get_collider_recursive()
      for(var i of cols){
        if(i != self_collider){
          if(i.visible){
            var p = i.globalToLocal(stage_x, stage_y)
            if(i.hitTest(p.x, p.y)){
              var ret = ii.get_visual_block_from_collider_recursive(i)
              return ret
            }  
          }
        }
      }
    }
    return null
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

  get_obj_by_id(id){
    if(id in this.id_obj_map){
      return this.id_obj_map[id]
    }
    return null
  }

  rename(text){
    this.project_name = text
    this.cjtext.text = 'Project: '+text
  }
  
  check_pos(tx, ty, e){
    if(this.stage.canvas.width - this.bg1.image.width*this.bg1.scaleX*e < 0){
      if(tx > 0) tx = 0;
      if(tx < (this.stage.canvas.width-this.bg1.image.width*this.bg1.scaleX*e)) tx = (this.stage.canvas.width-this.bg1.image.width*this.bg1.scaleX*e)
    }else{
      if(tx > this.stage.canvas.width - this.bg1.image.width*this.bg1.scaleX*e) tx = this.stage.canvas.width - this.bg1.image.width*this.bg1.scaleX*e
      if(tx < 0) tx = 0;
    }
    if(this.stage.canvas.height - this.bg1.image.height*this.bg1.scaleY*e < 0){
      if(ty > 0) ty = 0;
      if(ty < (this.stage.canvas.height-this.bg1.image.height*this.bg1.scaleY*e)) ty = (this.stage.canvas.height-this.bg1.image.height*this.bg1.scaleY*e)  
    }else{
      if(ty > this.stage.canvas.height-this.bg1.image.height*this.bg1.scaleY*e) ty = this.stage.canvas.height-this.bg1.image.height*this.bg1.scaleY*e
      if(ty < 0) ty = 0;
    }    
    return {x:tx, y:ty};
  }
  set_pos(tx, ty, force=false, ms=100){
    var me = this;
    var t
    if(force) t = {x:tx, y:ty}
    else      t = this.check_pos(tx,ty,this.get_scale());
    this.cj.Tween.get(this.top, { override: true, onChange:function(){me.dirty = true} }).to({x:t.x, y:t.y}, ms);
  }
  get_pos(){
    return {x:this.top.x, y:this.top.y}
  }
  set_size(w, h){
    var elm = document.getElementById('my-canvas')
    elm.width = w
    elm.height = h
    elm.style.position = 'fixed';
    elm.style.top = '0px';
    elm.style.left = '0px';
    elm.style.width = w + 'px';
    elm.style.height= h + 'px';
    
    // mask
    this.stage.mask.graphics.clear()
    this.stage.mask.graphics.drawRect(0,0,this.stage.canvas.width,this.stage.canvas.height)

    // bg
    this.bg.graphics.clear()
    this.bg.graphics.beginFill('Gray');
    this.bg.graphics.drawRect(0, 0, this.stage.canvas.width, this.stage.canvas.height);

    // minimap
    this.minimap.x = this.stage.canvas.width - this.bg1.image.width*2*0.08 - 10

    this.dirty = true
  }
  set_scale(s){
    var cx = (this.top.x - this.stage.canvas.width/2)*s/this.top.scaleX;
    var cy = (this.top.y - this.stage.canvas.height/2)*s/this.top.scaleY;
    var tx = this.stage.canvas.width/2 + cx;
    var ty = this.stage.canvas.height/2 + cy;
    this.set_scale_pos(s, tx, ty);
  }
  set_scale_pos(s, tx, ty){
    var t = this.check_pos(tx,ty,s)
    var me = this
    this.cj.Tween.get(this.top, { override: false, onChange:function(){me.dirty = true} }).to({scaleX:s, scaleY:s, x:t.x, y:t.y}, 100);
  }
  set_mask_scale(s){
    var me = this
    this.cj.Tween.get(this.stage.mask, { override: false, onChange:function(){me.dirty = true} }).to({scaleX:s, scaleY:s}, 100);
  }
  get_scale(){
    return this.top.scaleX;
  }

  download_data(filename, content){
    var base64 = btoa(unescape(encodeURIComponent(content)))
    var a = document.createElement('A')
    a.download = filename
    a.href = 'data:application/octet-stream;base64,' + encodeURIComponent(base64)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  emit(){
    var content = '';
    for(var i of this.all_visual_blocks){
      content += i.emit()
    }
    return content
  }
  serialize(){
    var ret = {
      project_name:this.project_name,
      framerate:this.framerate,
      all_visual_blocks:[]
    }
    for(var i of this.all_visual_blocks){
      ret.all_visual_blocks.push(i.serialize())
    }
    return ret
  }

  set_deserializer(inst){
    var name = inst.name
    this.deserializer[name] = inst.deserialize
  }

  set_serialized_idmap(oldId, newId){
    this.serialized_idmap[oldId] = newId
  }


  find_visual_block_by_id(id, callback=null){
    var me = this
    var timerid = setInterval(()=>{
      if(id in me.serialized_idmap){
        var r = me.get_obj_by_id(me.serialized_idmap[id])
        if(callback!=null){
          callback(r)
        }
        clearInterval(timerid)
      }
    }, 100)
  }
  find_visual_block_by_name(name, vb_from, callback){
    var me = this
    var timerid = setInterval(()=>{
      var r = vb_from.find_by_name(name)
      if(r){
        if(callback!=null){
          callback(r)
        }
        clearInterval(timerid)
      }
    }, 100)    
  }
  find_visual_block_by_index(index, vb_from, callback){
    var me = this
    var timerid = setInterval(()=>{
      if(vb_from.init){
        var r = vb_from.init.args[index]
        if(r){
          if(callback!=null){
            callback(r)
          }
          clearInterval(timerid)
        }  
      }
    }, 100)    
  }  
  find_by_name(name){
    return null
  }

  async async_run(func, ...rest){
    var me = this
    return new Promise(function(resolve, reject) {
      me[func](...rest, (r)=>{
        resolve(r)
      })
    });
  }

  deserialize_any(data, afterInit){
    if(data.type in this.deserializer){
      return this.deserializer[data.type](this, data, afterInit)
    }else{
      console.log("%c"+data.type + " is not support!!!%c",'color:red;','')
      return this.deserializer["error"](this, data, afterInit)
    }
  }
  deserialize(data, afterInit=()=>{}){
    // console.log(data)
    this.serialized_idmap = {}
    var obj = JSON.parse(data)
    this.project_name = obj.project_name
    this.framerate = obj.framerate
    for(var vb of obj.all_visual_blocks){
      this.deserialize_any(vb)
    }
  }

  deserializeAST_ExpressionStatement(pm, ast, afterInit=()=>{}){
    if(ast.type=="ExpressionStatement"){
      if(ast.expression.type in pm.deserializer){
          return pm.deserializer[ast.expression.type](pm, ast.expression, afterInit)
      }else{
        console.log("%c"+ast.expression.type + " ExpressionStatement is not support!!!%c",'color:red;','')
        return pm.deserializer["error"](pm, ast.expression, afterInit)
      }
    }
  }
  deserializeAST(ast, afterInit=()=>{}){
    var me = this
    if(ast.type=="Program"){
      var ret = def_function.create(this, "func_from_AST", 100, 100, ()=>{
        var count = 0
        for(var p of ast.body){
          count++
          ret.push_statement(this.deserialize_any(p, ()=>{
            count--
          }))
        }
        var iId = setInterval(()=>{
          if(count == 0){
            setTimeout(()=>{
              afterInit(ret)
            }, 100)
            clearInterval(iId)
          }
        },100)  
      })
      return ret
    }
  }
}
