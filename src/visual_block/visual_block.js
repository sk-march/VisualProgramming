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
    }
    init_render(pm, afterInit=()=>{}){}
    emit(tab=''){
      return teb+'// empty visual_block\n\n';
    }
    get_collider_recursive(){
      return []
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
  