import { Schema, Prop } from "@project-karin/mongoose";

@Schema("Foxes")
export class Foxes {
  @Prop({ required: true, index: true })
  name: string;

  /*
  @Prop()
  age: number;

  @Prop({ default: Date.now })
  createdAt: Date;
  */
}
