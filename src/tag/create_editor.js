function create_editor(pm, edit_id){
    // init editor
    var ret = {};
    ret.x = 0;
    ret.y = 0;
    ret.w = 100;
    ret.h = 100;
    ret.fontsize = 0;
    ret.ax = 0;
    ret.ay = 0;
    ret.onChange=()=>{}
  
    ret.pm = pm
    ret.id = edit_id
  
    document.body.insertAdjacentHTML('beforeend', '<div id="'+edit_id+'"></div>')
    ret.aceEditor = this.ace.edit(edit_id)
    ret.aceEditor.setTheme("ace/theme/twilight")
    ret.aceEditor.session.setMode("ace/mode/javascript")
    ret.aceEditor.on('change', function() {
      ret.onChange()
    });
  
    ret.editor_element = document.getElementById(edit_id);
    ret.editor_element.style.visibility = "hidden";
    ret.editor_element.style.position = 'fixed';
    ret.editor_element.style.top = '0px';
    ret.editor_element.style.left = '0px';
    ret.editor_element.style.width = '100px';
    ret.editor_element.style.height= '100px';
  
    ret.visible = (show)=>{
      if(show){
        ret.editor_element.style.width = Math.floor(ret.w*pm.top.scaleX)+'px';
        ret.editor_element.style.height= Math.floor(ret.h*pm.top.scaleY)+'px';
        ret.aceEditor.resize()  
        ret.editor_element.style.visibility = "visible";        
      }else{
        ret.editor_element.style.width = '0px';
        ret.editor_element.style.height= '0px';
        ret.aceEditor.resize()  
        ret.editor_element.style.visibility = "hidden";
      }
    }
    ret.flip_visible = ()=>{
      ret.visible(ret.editor_element.style.visibility == 'hidden')
    }
    ret.is_visible = ()=>{
      return ret.editor_element.style.visibility == "visible"
    }
    ret.setShowGutter = (flag)=>{
      ret.aceEditor.renderer.setShowGutter(flag);
    };
    ret.setTopAnchor = (ix, iy)=>{
      ret.ax = ix
      ret.ay = iy
    }
    ret.setPosition = (ix, iy, force=false)=>{
      ret.x = ix;
      ret.y = iy;
      ret.editor_element.style.position = 'fixed';
      if(force){
        ret.editor_element.style.left = Math.floor(ix) +'px';
        ret.editor_element.style.top  = Math.floor(iy) +'px';  
      }else{
        var t =ret.pm.stage.canvas.getBoundingClientRect();
        ret.editor_element.style.left = Math.floor(ix*pm.top.scaleX + ret.ax +t.top) +'px';
        ret.editor_element.style.top  = Math.floor(iy*pm.top.scaleY + ret.ay +t.left) +'px';  
      }
      ret.aceEditor.resize()
    }
    ret.setSize = (iw, ih, force=false)=>{
      ret.w = iw;
      ret.h = ih;
      if(force){
        ret.editor_element.style.width = Math.floor(iw)+'px';
        ret.editor_element.style.height= Math.floor(ih)+'px';
      }else{
        ret.editor_element.style.width = Math.floor(iw*pm.top.scaleX)+'px';
        ret.editor_element.style.height= Math.floor(ih*pm.top.scaleY)+'px';  
      }
      ret.aceEditor.resize()
    }
    ret.setFontSize = (size_in_px)=>{
      ret.fontsize = size_in_px;
      ret.aceEditor.setFontSize(size_in_px*pm.top.scaleX)
    }
    ret.onEnter = (callback)=>{
      ret.aceEditor.on('change', function(e) {
        if(e.lines.length > 1){
          var text = ret.aceEditor.getValue()
          text = text.replace(/\r?\n/g,"");
          callback(text)
        }
     })
    }
    ret.getValue = ()=>{
      return ret.aceEditor.getValue()
    }
    ret.setValue = (text)=>{
      ret.aceEditor.setValue(text)
    }
    ret.remove=()=>{
      ret.aceEditor.container.remove()
      ret.aceEditor.destroy()   
      ret.editor_element.remove();
    }
    ret.set_alpha=(a)=>{
      ret.editor_element.style.opacity = a;
    }
    ret.focus=()=>{
      ret.aceEditor.focus()    
    }
    return ret
  }
  