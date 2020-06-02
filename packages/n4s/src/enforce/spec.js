import rules from '../rules';
import enforce from '.';

const allRules = Object.keys(rules);
const _proxy = Proxy;

const suite = ({ withProxy, Enforce }) =>
  describe('Test enforce function', () => {
    let enforce = new Enforce({});

    if (withProxy) {
      beforeAll(() => {
        global.Proxy = undefined;
        delete global.Proxy;
        enforce = new Enforce({});
      });

      afterAll(() => {
        global.Proxy = _proxy;
      });
    }

    describe('Rules object', () => {
      it('Should expose rules as functions', () => {
        const en = enforce();
        allRules.forEach(rule => expect(en[rule]).toBeInstanceOf(Function));
      });

      it('Should predictably return rule object with same rules', () => {
        expect(Object.keys(enforce())).toEqual(Object.keys(enforce()));
      });

      it('Should return same rules object after every rule call', () => {
        let en;

        en = enforce(1);
        expect(en.isNumber()).toBe(en.isNumeric());
        expect(en.isNumber()).toBe(en);
        en = enforce('1');
        expect(en.isString()).toBe(en.isNotEmpty());
        expect(en.isString()).toBe(en);
        en = enforce([]);
        expect(en.isArray()).toBe(en.lengthEquals(0));
        expect(en.isArray()).toBe(en);
      });
    });

    describe('Test custom rule extensions', () => {
      let enforce;

      beforeEach(() => {
        enforce = new Enforce({
          isImpossible: v => !!v.match(/impossible/i),
          endsWith: (v, arg) => v.endsWith(arg),
        });
      });

      it('Should throw on failing custom rule in regular test', () => {
        const t = () => enforce('The name is Snowball').endsWith('Snuffles');
        expect(t).toThrow(Error);
      });

      it('Should return silently for custom rule in regular test', () => {
        enforce('Impossible! The name is Snowball')
          .endsWith('Snowball')
          .isImpossible();
      });
    });

    it('Should throw errors on failing enforces', () => {
      const isNumber = () => enforce('a').isNumber(true);
      expect(isNumber).toThrow(Error);
    });
  });

[
  enforce,
  require('../../dist/n4s'),
  require('../../dist/n4s.min.js'),
  require('../../dist/enforce'),
  require('../../dist/enforce.min.js'),
].forEach(enforce => {
  suite({ withProxy: true, Enforce: enforce.Enforce });
  suite({ withProxy: false, Enforce: enforce.Enforce });
});