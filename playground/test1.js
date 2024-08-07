class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  getName() {
    return this.name
  }

  getAge() {
    return this.age
  }
}

const p1 = new Person("agni", 21)
console.log(p1)
console.log(p1.getName())
console.log(p1.getAge())
console.log('Agnibha Chatterjee')
