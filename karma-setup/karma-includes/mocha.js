console.log('Setup starting');

window.expect = chai.expect;
mocha.setup('bdd');
// eslint-disable-next-line no-undef
chai.use(dirtyChai);

console.log('Setup complete');
