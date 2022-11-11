function Parent (name,gender){
    this.name = name;
    this.gender =gender;
}

Parent.prototype.sayName = function (){
    console.log(this.name);
}


const p1 = new Parent('P1','Man');

function Child (name,gender,job){
    Parent.call(this,name,gender);
    this.job = job;
}

Child.prototype = Object.create(Parent.prototype);

Child.prototype.sayJob = function (){
    console.log(this.job);
}


const c1 = new Child('C1','Man','Doctor');

console.log(c1);
c1.sayJob();
c1.sayName();
p1.sayJob();

Child.staticMethod();