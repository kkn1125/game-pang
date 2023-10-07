import { TEST_AMOUNT } from "@src/util/global";
import Logger from "@src/util/logger";

export default class Quest {
  static id: number = 0;
  static autoGenerate = () => (Quest.id += 1);
  id: number;
  title: string;
  content: string;

  currentAmount: number = 0;

  condition: Condition;

  result: Result = {
    score: 0,
    turn: 0,
  };

  isDone: boolean = false;
  isFail: boolean = false;
  isDaily: boolean = false;

  deletion: boolean = false;
  logger: Logger;

  constructor(
    title: string,
    content: string,
    condition: Condition,
    result: Result
  ) {
    this.logger = new Logger("Quest");
    this.id = Quest.autoGenerate();
    this.title = title;
    this.content = content;
    this.result.score = result.score || 0;
    this.result.turn = result.turn || 0;
    this.condition = Object.assign(condition, {
      amount: TEST_AMOUNT || condition.amount,
    });
    this.logger.dir("constructor").log("current id", Quest.id);
  }

  static createQuest({
    title,
    content,
    score,
    turn,
    type,
    amount,
  }: {
    title: string;
    content: string;
    score: number;
    turn: number;
    type: string;
    amount: number;
  }) {
    return new Quest(
      title,
      content,
      {
        type,
        amount: TEST_AMOUNT || amount,
      },
      { score, turn }
    );
  }

  success() {
    this.isDone = true;
  }

  fail() {
    this.isFail = true;
  }

  // render() {}
}
