type Condition = {
  type: string;
  amount: number;
};

export default class Quest {
  id: number;
  title: string;
  content: string;

  currentAmount: number = 0;

  condition: Condition;

  score: number;

  isDone: boolean = false;
  isFail: boolean = false;
  isDaily: boolean = false;

  deletion: boolean = false;

  constructor(
    title: string,
    content: string,
    score: number,
    condition: Condition
  ) {
    this.title = title;
    this.content = content;
    this.score = score;
    this.condition = condition;
  }

  success() {
    this.isDone = true;
  }

  fail() {
    this.isFail = true;
  }

  // render() {}
}
