//
// check dependency
//
if(!('$' in this)){
  console.log("VisualProgramming require jquery!!!")
}
if(!('jloader' in $)){
  console.log("VisualProgramming require loader!!!")
}
if(!('ace' in this)){
  console.log("VisualProgramming require ACE!!!")
}
if(!('createjs' in this)){
  console.log("VisualProgramming require CreateJS!!!")
}

//
// load internal library
//
$.jloader.from([
  'visual_block/visual_block.js',
  'visual_block/rawcode.js',
  'visual_block/def_class.js',
  'visual_block/def_variable.js',
  'visual_block/def_function.js',
  'visual_block/reference.js',
  'visual_block/operator.js',
  'visual_block/literal.js',
  'visual_block/function_advocation.js',

  'visual_block/expressionArray.js',
  'visual_block/statementReturn.js',
  'visual_block/statementIf.js',

  'tag/tag.js',
  'tag/tagButton.js',
  'tag/tagInput.js',
  'tag/tagSwitch.js',
  'tag/create_editor.js',

  'program_manager_impl.js',
  'visual_programming_test.js'
])

// pure interface
class program_manager{
  constructor(canvas_id){
    this.inst = null;
    $.jloader.after('visual_programming_test.js', ()=>{
      this.inst = new program_manager_impl(...arguments);
      this.set_deserializer(rawcode)
      this.set_deserializer(def_class)
      this.set_deserializer(def_variable)
      this.set_deserializer(def_function)
      this.set_deserializer(reference)
      this.set_deserializer(operator)
      this.set_deserializer(literal)
      this.set_deserializer(function_advocation)
      this.set_deserializer(expressionArray)
      this.set_deserializer(statementReturn)
      this.set_deserializer(statementIf)

      // ast deserializer
      this.inst.deserializer["Program"] = this.inst.deserializeAST
      this.inst.deserializer["VariableDeclaration"] = def_variable.deserializeAST
      this.inst.deserializer["ExpressionStatement"] = this.inst.deserializeAST_ExpressionStatement
      this.inst.deserializer["BinaryExpression"] = operator.deserializeAST_binary_logical
      this.inst.deserializer["LogicalExpression"] = operator.deserializeAST_binary_logical
      this.inst.deserializer["UnaryExpression"] = operator.deserializeAST_unary
      this.inst.deserializer["AssignmentExpression"] = operator.deserializeAST_assignment
      this.inst.deserializer["CallExpression"] = function_advocation.deserializeAST
      this.inst.deserializer["NewExpression"] = function_advocation.deserializeAST_new
      this.inst.deserializer["ThisExpression"] = reference.deserializeAST_this
      this.inst.deserializer["Literal"] = literal.deserializeAST
      this.inst.deserializer["Identifier"] = reference.deserializeAST_identifier
      this.inst.deserializer["MemberExpression"] = reference.deserializeAST_member
      this.inst.deserializer["FunctionDeclaration"] = def_function.deserializeAST_declaration
      this.inst.deserializer["FunctionExpression"] = def_function.deserializeAST_expression
      this.inst.deserializer["ArrowFunctionExpression"] = def_function.deserializeAST_arrowfunction
      this.inst.deserializer["MethodDefinition"] = def_function.deserializeAST_method
      this.inst.deserializer["ClassDeclaration"] = def_class.deserializeAST
            
      this.inst.deserializer["ArrayExpression"] = expressionArray.deserializeAST
      this.inst.deserializer["ReturnStatement"] = statementReturn.deserializeAST
      this.inst.deserializer["IfStatement"] = statementIf.deserializeAST
      
    })
  }
  afterload(func, ...args){
    $.jloader.condition(()=>{return this.inst!=null}, ()=>{
      func(...args);
    })
  }

  set_size(tx, ty){
    if(this.inst===null) console.log('yet load');
    return this.inst.set_size(...arguments);
  }
  set_deserializer(){
    if(this.inst===null) console.log('yet load');
    return this.inst.set_deserializer(...arguments);
  }
  deserialize_any(){
    if(this.inst===null) console.log('yet load');
    return this.inst.deserialize_any(...arguments);
  }
  deserialize(){
    if(this.inst===null) console.log('yet load');
    return this.inst.deserialize(...arguments);
  }
  deserializeAST(){
    if(this.inst===null) console.log('yet load');
    return this.inst.deserializeAST(...arguments);
  }

  get_pos(tx, ty){
    if(this.inst===null) console.log('yet load');
    return this.inst.get_pos(...arguments);
  }
/*  
  clear_menu(){
    if(this.inst===null) console.log('yet load');
    return this.inst.clear_menu(...arguments);
  }
  create_variable(name, x, y){
    if(this.inst===null) console.log('yet load');
    return this.inst.create_variable(...arguments);
  }
  create_function(name, x, y){
    if(this.inst===null) console.log('yet load');
    return this.inst.create_function(...arguments);
  }
  create_reference(x, y){
    if(this.inst===null) console.log('yet load');
    return this.inst.create_reference(...arguments);
  }
  create_operator(x, y){
    if(this.inst===null) console.log('yet load');
    return this.inst.create_operator(...arguments);
  }
  create_function_advocation(x, y){
    if(this.inst===null) console.log('yet load');
    return this.inst.create_function_advocation(...arguments);
  }
  create_class(name, x, y){
    if(this.inst===null) console.log('yet load');
    return this.inst.create_class(...arguments);
  }
  create_rawcode(x, y){
    if(this.inst===null) console.log('yet load');
    return this.inst.create_rawcode(...arguments);
  }
  rid_visualblock(c){
    if(this.inst===null) console.log('yet load');
    return this.inst.rid_visualblock(...arguments);
  }
  set_pos(tx, ty){
    if(this.inst===null) console.log('yet load');
    return this.inst.set_pos(...arguments);
  }
  set_scale(s){
    if(this.inst===null) console.log('yet load');
    return this.inst.set_scale(...arguments);
  }
  set_scale_pos(s, tx, ty){
    if(this.inst===null) console.log('yet load');
    return this.inst.set_scale_pos(...arguments);
  }  
  get_scale(){
    if(this.inst===null) console.log('yet load');
    return this.inst.get_scale(...arguments);
  }
  emit(){
    if(this.inst===null) console.log('yet load');
    return this.inst.emit(...arguments);
  }
  serialize(){
    if(this.inst===null) console.log('yet load');
    return this.inst.serialize(...arguments);
  }
  deserialize(){
    if(this.inst===null) console.log('yet load');
    return this.inst.deserialize(...arguments);
  }
*/  
}

