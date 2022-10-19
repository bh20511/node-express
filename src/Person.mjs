export default class Person{
    constructor(name='noname', age =0){
        this.name = name;
        this.age = age;
    }

    
    toJSON(){
        const { name , age } = this;
        return {name,age ,gender:'male'};
    }
    toString(){
        return JSON.stringify(this);
    }
}

export const a =  10;

// const p1 = new Person('David' , 25)
// console.log(p1+'');