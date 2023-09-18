import Quest from "@src/model/quest";
import { isMobile, questCtx, QUEST_LIST } from "@src/util/global";
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

  addQuest(quest: Quest);
  addQuest(title: string, content: string, score: number, condition: Condition);
  addQuest(a: string | Quest, b?: string, c?: number, d?: Condition) {
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
    setTimeout(() => {
      this.quests = this.quests.filter((q) => !q.deletion);
      this.autoQuests();
    }, 3000);
  }

  autoQuests() {
    if (this.dependency.blockManager) {
      while (this.quests.length < 2) {
        const randomQuest =
          QUEST_LIST[Math.floor(QUEST_LIST.length * Math.random())];
        if (
          !this.quests.includes(randomQuest) &&
          this.dependency.blockManager.containsType(randomQuest.condition.type)
        ) {
          this.quests.push(randomQuest);
        }
      }
    }
  }

  questAmountUp(type: string) {
    const quests = this.quests.filter((quest) => quest.condition.type === type);
    this.logger.dir("questAmountUp").debug(type);
    quests.forEach((quest) => {
      console.log(quest);
      quest.currentAmount += 1;
    });
  }

  getLineGroup(quest: Quest, base: number, contentVisible: boolean) {
    questCtx.font = "bold 16px Arial";
    questCtx.fillText(`${quest.title} (+${quest.score}P)`, 50, base);
    quest.isDone &&
      questCtx.fillRect(
        50,
        base - 6,
        questCtx.measureText(quest.title + ` (+${quest.score}P)`).width,
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
      } else {
        return contentVisible ? 80 : 80;
      }
    })();
    for (const quest of this.quests) {
      const base = this.quests.indexOf(quest) * topBase + responseRatio;

      this.getLineGroup(quest, base, contentVisible);

      if (quest.currentAmount >= quest.condition.amount) {
        if (!quest.isDone) {
          quest.success();
          this.dependency.scoreCalculator?.scoreUp(quest.score);
          this.logger
            .dir("success")
            .log(`clear quest, get score +${quest.score}`);
          this.removeQuest(quest);
        }
      }
    }
    questCtx.font = "normal 16px Arial";
  }
}
