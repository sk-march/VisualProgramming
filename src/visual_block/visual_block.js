var _visual_block = {
    tab_size:'    '
  };
  class visual_block
  {
    constructor(vb={type:'visual_block', name:'none', x:0, y:0, z:0}){
      this.type = vb.type
      this.name = vb.name 
      this.x = vb.x || 0
      this.y = vb.y || 0
      this.z = vb.z || 0
      this.id = -1
      this.holder = null
      this.collider = []  
    }
    init_render(pm, afterInit=()=>{}){}
    emit(tab=''){
      return teb+'// empty visual_block\n\n';
    }
    get_collider_recursive(){
      return []
    }
    find_by_name(name, check_holder=true){
      if(this.name==name){
        return this
      }else if(this.holder && check_holder){
        return this.holder.find_by_name(name)
      }else{
        return null
      }
    }
    serialize(){
      return {
        type:this.type,
        name:this.name,
        x:this.x,
        y:this.y,
        z:this.z,
        id:this.id
      }
    }
    static deserialize(pm, json_obj, afterInit=()=>{}){
    }
    static create(pm, name, x, y, afterInit=()=>{}){
    }
  }
  