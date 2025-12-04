import { Schema, Prop } from "@project-karin/mongoose";

@Schema("Dogs")
export class Dogs {
  @Prop({ required: true, index: true })
  name: string;

  /*
  @Prop()
  age: number;

  @Prop({ default: Date.now })
  createdAt: Date;
  */
}
