export { MongoosePlugin, type MongoosePluginOptions } from "./src/mongoose.plugin";
export { MongooseExceptionFilter } from "./src/mongoose-exception.filter";
export {
  Schema,
  Prop,
  InjectModel,
  InjectConnection,
  SCHEMAS_REGISTRY,
  SCHEMA_METADATA,
  PROP_METADATA,
  type PropOptions
} from "./src/utils/decorators";

export {
  default as mongoose,
  model,
  Document,
  Model,
  Types,
  Schema as MongooseSchema,
} from "mongoose";
