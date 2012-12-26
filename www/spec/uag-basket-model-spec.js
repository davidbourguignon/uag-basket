/** jshint forin:true, noarg:true, noempty:true, eqeqeq:true,
 *  bitwise:true, strict:true, undef:true, unused:true, curly:true,
 *  browser:true, devel:true, jquery:true, es5:true, indent:4, maxerr:50
 */
/**
 * @fileOverview uAg Basket Model specifications (Jasmine test framework)
 * @author <a href="http://www.davidbourguignon.net">David Bourguignon</a>
 * @version 2012-12-24
 */
describe('uAg Basket Model', function() {
    describe('global variables', function() {
        it('should be available', function() {
            expect(window).not.toEqual(null || undefined);
            expect(document).not.toEqual(null || undefined);
        });
    });
    describe('namespaces', function() {
        it('should be declared', function() {
            expect(uag).not.toEqual(null || undefined);
            expect(uag.basket).not.toEqual(null || undefined);
            expect(uag.utils).not.toEqual(null || undefined);
        });
    });
});
