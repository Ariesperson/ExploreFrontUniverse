//观察者
class Observer{
    constructor(name){
        this.name = name
    }
    update({taskType, taskInfo}) {
        // 假设任务分为日常route和战斗war
        if (taskType === "route") {
            console.log(`${this.name}不需要日常任务`);
            return;
        }
        this.goToTaskHome(taskInfo);
        
    }
    goToTaskHome(info) {
        console.log(`${this.name}去任务大殿抢${info}任务`);
    }
}
//目标对象
class Subject{
    constructor() {
        this.observerList = []
    }
    addObserver(observer){
        this.observerList.push(observer);
    }
    notify(task){
        console.log("发布五星任务")
        this.observerList.forEach(observer => observer.update(task))
    }
}
const subject = new Subject();//目标对象
const stu1 = new Observer("弟子1"); //观察者1
const stu2 = new Observer("弟子2"); //观察者2

// stu1 stu2 购买五星任务通知权限
subject.addObserver(stu1);
subject.addObserver(stu2);
subject.notify({
    taskType: 'war',
    taskInfo: "猎杀时刻"
})