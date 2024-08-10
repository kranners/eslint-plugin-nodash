import { rule as unnecessaryMapping } from "./rules/unnecessary-mapping-function";
import { rule as unnecessaryGet } from "./rules/unnecessary-use-of-get";

const plugin = {
  meta: {
    name: "eslint-plugin-nodash",
  },
  rules: {
    'unnecessary-mapping-function': unnecessaryMapping,
    'unnecessary-use-of-get': unnecessaryGet,
  },
};

export default plugin;

