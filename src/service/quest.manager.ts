import Quest from "@src/model/quest";
import { isMobile, questCtx, QUEST_LIST_OBJ } from "@src/util/global";
import Logger from "@src/util/logger";
import { capitalize } from "@src/util/tool";
import BlockManager from "./block.manager";
import MapGenerator from "./map.generator";
import ScoreCalculator from "./score.calculator";
import { Dependency } from "./types";

type Condition = {
  type: string;
  amount: number;
};

export default class QuestManager {
  id: number;
  mode: string;
  quests: Quest[] = [];
  logger: Logger;
  lineGap: number = 16 * 1.3;

  animalsPang: {
    [k in Animals]: number;
  } = {
    cat: 0,
    dog: 0,
    lion: 0,
    duck: 0,
    mouse: 0,
    rabbit: 0,
    panda: 0,
    pig: 0,
    racoon: 0,
  };

  dependency: Dependency = {};

  deleteQueue: Quest[] = [];

  constructor(mode: string) {
    this.mode = mode;
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").log("initialize mode:", mode);
  }

  inject(module: MapGenerator | ScoreCalculator | BlockManager) {
    this.logger
      .dir("inject")
      .debug(`${capitalize(module.constructor.name)} is injected`);
    this.dependency[capitalize(module.constructor.name)] = module;
  }

  resetQuest() {
    this.quests = [];
    this.deleteQueue = [];
    this.autoQuests();
  }

  addQuest(quest: Quest);
  addQuest(
    title: string,
    content: string,
    condition: Condition,
    result: Result
  );
  addQuest(a: string | Quest, b?: string, c?: Condition, d?: Result) {
    if (!(a instanceof Quest) && b && c !== undefined && d) {
      this.logger.dir("addQuest").log("add new quest");
      const newQeust = new Quest(a, b, c, d);
      this.quests.push(newQeust);
    } else {
      if (a instanceof Quest) {
        this.logger.dir("addQuest").log("add new quest");
        this.quests.push(a);
      } else {
        throw new Error("Invalid quest arguments");
      }
    }
  }

  removeQuest(quest: Quest) {
    quest.deletion = true;
    this.deleteQueue.push(quest);
  }

  autoQuests() {
    if (this.dependency.blockManager) {
      while (this.quests.length < 2) {
        const obj =
          QUEST_LIST_OBJ[Math.floor(QUEST_LIST_OBJ.length * Math.random())];
        const randomQuest = new Quest(
          obj.title,
          obj.content,
          {
            type: obj.type,
            amount: obj.amount,
          },
          { score: obj.score, turn: obj.turn }
        );
        if (
          !this.quests.some(
            (q) => q.condition.type === randomQuest.condition.type
          ) &&
          this.dependency.blockManager.containsType(randomQuest.condition.type)
        ) {
          this.quests.push(randomQuest);
        } else {
          this.logger.dir("autoQuests").debug("Quest id minus", Quest.id);
          Quest.id -= 1;
        }
      }
    }
  }

  questAmountUp(type: string) {
    const quests = this.quests.filter((quest) => quest.condition.type === type);
    this.logger.dir("questAmountUp").debug(type);
    quests.forEach((quest) => {
      // console.log(quest);
      quest.currentAmount += 1;
    });
  }

  getLineGroup(quest: Quest, base: number, contentVisible: boolean) {
    questCtx.font = "bold 16px Arial";
    questCtx.fillText(
      `${quest.title} (+${quest.result.score}P)${
        quest.result.turn > 0 ? ` (+${quest.result.turn}T)` : ""
      }`,
      50,
      base
    );
    quest.isDone &&
      questCtx.fillRect(
        50,
        base - 6,
        questCtx.measureText(quest.title + ` (+${quest.result.score}P)`).width,
        1
      );

    questCtx.font = "normal 16px Arial";
    if (contentVisible) {
      questCtx.fillText(quest.content, 50, base + this.lineGap * 1);
      quest.isDone &&
        questCtx.fillRect(
          50,
          base + this.lineGap * 1 - 6,
          questCtx.measureText(quest.content).width,
          1
        );
    }

    questCtx.fillText(
      `${quest.currentAmount}/${quest.condition.amount}`,
      50,
      base + this.lineGap * (contentVisible ? 2 : 1)
    );
    quest.isDone &&
      questCtx.fillRect(
        50,
        base + this.lineGap * (contentVisible ? 2 : 1) - 6,
        questCtx.measureText(`${quest.currentAmount}/${quest.condition.amount}`)
          .width,
        1
      );
  }

  render() {
    //
    const contentVisible = !!isMobile() && innerHeight > 800;
    const topBase = (() => {
      if (innerWidth > 900) {
        return contentVisible ? 120 : 50;
      } else {
        return contentVisible ? 70 : 45;
      }
    })();
    const responseRatio = (() => {
      if (innerWidth > 900) {
        return contentVisible ? 50 : 100;
      } else if (innerWidth <= 900 && innerWidth >= 500) {
        return contentVisible ? 50 : 90;
      } else {
        return contentVisible ? 90 : 95;
      }
    })();
    for (const quest of this.quests) {
      const base = this.quests.indexOf(quest) * topBase + responseRatio;

      this.getLineGroup(quest, base, contentVisible);

      if (quest.currentAmount >= quest.condition.amount) {
        if (!quest.isDone) {
          quest.success();
          this.dependency.scoreCalculator?.scoreUp(quest.result.score);
          this.dependency.scoreCalculator?.turnUp(quest.result.turn);
          this.logger
            .dir("success")
            .log(`clear quest, get score +${quest.result.score}`);
          this.removeQuest(quest);
        }
      }
    }
    questCtx.font = "normal 16px Arial";

    while (this.deleteQueue.length > 0) {
      const quest = this.deleteQueue.shift();
      if (quest) {
        this.logger.dir("while").dir("if").debug(quest);
        setTimeout(() => {
          const index = this.quests.findIndex((q) => q.id === quest.id);
          this.logger.dir("while").dir("index").debug(index);
          if (index > -1) {
            this.quests.splice(index, 1);
          }
          this.logger.dir("while").dir("check").debug(this.quests);
          this.autoQuests();
        }, 3000);
      }
    }
  }
}
