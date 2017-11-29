import { CLIEngine } from 'eslint';
import baseConfig from '../eslintrc';

jest.mock('../../utils', () => ({
  ...require.requireActual('../../utils'),
  ifAnyDep: jest.fn((key, t) => t),
}));

const cli = new CLIEngine({
  useEslintrc: false,
  baseConfig,
});

const lint = code => {
  const linter = cli.executeOnText(code);
  return linter.results[0];
};

afterEach(() => {
  jest.resetModules();
});

test('Understands class properties', () => {
  const result = lint(`
    export class Bar {
      constructor() {
        this.bar = 'foo';
      }

      setFoo = f => {
        this.foo = f;
      }

      getFoo(){
        return this.bar;
      }
    }
  `);

  const filtered = result.messages.filter(m => m.fatal);
  expect(filtered.length).toBeLessThan(1);
});

test('Understands jsx', () => {
  const result = lint(`
    /* eslint-disable react/prop-types, react/react-in-jsx-scope */
    export const Comp = ({ children, ...rest }) => (
      <button {...rest}>{children}</button>
    );
  `);

  expect(result.errorCount).toBeLessThan(1);
});
