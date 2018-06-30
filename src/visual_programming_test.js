function visual_programming_test(){
    // rawcode
    console.log('start rawcode test --------------')
    var r = new rawcode({name:'raw1 print raw1'})
    r.type = 'function_advocation'
    r.set_code('console.log("raw1");')
    console.log(r.emit())
    console.log('')
  
    // def_function
    console.log('start def_function test--------------')
    var fd = new def_function({name:'test_func'})
    fd.push_body(r)
    console.log(fd.emit())
    console.log('')
    var log = new def_function({name:'log'})
    log.set_args('text')
    console.log(log.emit())
    console.log('')
  
    // function_advocation
    console.log('start function_advocation test--------------')
    var fa = new function_advocation({name:'call test_func'})
    fa.set_func(fd)
    console.log(fa.emit())
    console.log('')
  
    // def_variable
    console.log('start def_variable test--------------')
    var t0 = new def_variable({name:'t0'})
    console.log(t0.emit())
    console.log('')
  
    // def_class
    console.log('start def_class test2--------------')
    var obj = new def_class({name:'TEST'})
    obj.add_visualblock(t0);
    obj.add_visualblock(fd);
    console.log(obj.emit())
    console.log('')
  
    // def_variable
    console.log('start class def_variable test2--------------')
    var o0 = new def_variable({name:'o0'})
    o0.set_type(obj);
    console.log(o0.emit())
    console.log('')
  
    // function_advocation2
    console.log('start function_advocation2 test--------------')
    var foa = new function_advocation({name:'call TEST function'})
    foa.set_inst(o0)
    foa.set_func(o0.definition.methods[0])
    console.log(foa.emit())
    console.log('')
  
    // serial_processing
    console.log('start serial_processing test--------------')
    var p = new serial_processing({name:'proc0'})
    p.push(fa)
    p.push(foa)
    console.log(p.emit())
    console.log('')
  }
  