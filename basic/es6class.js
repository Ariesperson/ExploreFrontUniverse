class parent1{
    constructor(){
        this.colors = ["red", "blue", "green"];
    }
}
class child1 extends parent1{
    constructor(){
        super()
    }
}
// console.log(child1.prototype.constructor.name)
// child1.prototype.constructor.name='child'
var obj1 = new child1()
console.log(obj1.colors)
obj1.colors.push("black");
console.log(obj1.colors)
var obj2 = new child1()
console.log(obj2.colors)
console.log("============")
function parent2(){
    this.colors = ["red", "blue", "green"];
}
function child2(){
    this.type='child1'
}
child2.prototype = new parent2()
var b = new child2()
console.log(b.colors)
b.colors.push("black");
console.log(b.colors)
var a = new child2()
console.log(a.colors)