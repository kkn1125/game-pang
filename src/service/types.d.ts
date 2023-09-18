import BlockManager from "./block.manager";
import MapGenerator from "./map.generator";
import ScoreCalculator from "./score.calculator";

export declare type Dependency = {
  ["mapGenerator"]?: MapGenerator;
  ["scoreCalculator"]?: ScoreCalculator;
  ["blockManager"]?: BlockManager;
};
