import { rule as unnecessaryMapping } from "./rules/unnecessary-mapping-function";

const plugin = {
  meta: {
    name: "eslint-plugin-nodash",
  },
  rules: {
    'unnecessary-mapping-function': unnecessaryMapping,
  },
};

export default plugin;

