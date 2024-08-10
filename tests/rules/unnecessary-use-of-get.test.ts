import { TSESLint } from "@typescript-eslint/utils";
import { rule } from "../../src/rules/unnecessary-use-of-get";

const ruleTester = new TSESLint.RuleTester();

ruleTester.run('unnecessary-use-of-get', rule, {
  valid: [
    {
      code: `
        import { get } from 'lodash';
      `,
    },
    {
      code: `
        import _ from 'lodash';
      `,
    }
  ],
  invalid: [
    {
      code: `
        import { get } from 'lodash';
        const appliedOffer = get(store, "offer", null);
      `,
      errors: [ { messageId: 'avoidGet' } ],
      output: `
        import { get } from 'lodash';
        const appliedOffer = store.offer ?? null;
      `
    },
    {
      code: `
        import { get } from 'lodash';
        const message = get(error, "errors[0].message", error.message);
      `,
      errors: [ { messageId: 'avoidGet' } ],
      output: `
        import { get } from 'lodash';
        const message = error?.errors?.[0].message ?? error.message;
      `
    },
    {
      code: `
        import { get } from 'lodash';
        const scrollTopBefore = get(document, "body.scrollTop");
      `,
      errors: [ { messageId: 'avoidGet' } ],
      output: `
        import { get } from 'lodash';
        const scrollTopBefore = document.body.scrollTop;
      `
    },
    {
      code: `
        import _ from 'lodash';
        const appliedOffer = _.get(store, "offer", null);
      `,
      errors: [ { messageId: 'avoidGet' } ],
      output: `
        import _ from 'lodash';
        const appliedOffer = store.offer ?? null;
      `
    },
    {
      code: `
        import _ from 'lodash';
        const message = _.get(error, "errors[0].message", error.message);
      `,
      errors: [ { messageId: 'avoidGet' } ],
      output: `
        import _ from 'lodash';
        const message = error?.errors?.[0].message ?? error.message;
      `
    },
    {
      code: `
        import _ from 'lodash';
        const scrollTopBefore = _.get(document, "body.scrollTop");
      `,
      errors: [ { messageId: 'avoidGet' } ],
      output: `
        import _ from 'lodash';
        const scrollTopBefore = document.body.scrollTop;
      `
    },
  ]
})

