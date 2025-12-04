import "reflect-metadata";
import { singleton } from "tsyringe";


export function Service(): ClassDecorator {
  return (target: any) => {
    singleton()(target);
  };
}
