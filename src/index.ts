import unnecessaryMapping from "./rules/unnecessary-mapping-function";
import unnecessaryGet from "./rules/unnecessary-use-of-get";

export = {
  meta: {
    name: "eslint-plugin-nodash",
  },
  rules: {
    'unnecessary-mapping-function': unnecessaryMapping,
    'unnecessary-use-of-get': unnecessaryGet,
  },
};

