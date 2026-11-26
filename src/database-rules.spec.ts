describe('Firebase Realtime Database rules', () => {
    const rules = require('../database.rules.json');
    const firebaseConfig = require('../firebase.json');

    it('are the ruleset deployed by firebase.json', () => {
        expect(firebaseConfig.database.rules).toBe('database.rules.json');
    });

    it('deny all reads and writes', () => {
        expect(rules).toEqual({ rules: { '.read': false, '.write': false } });
    });
});
