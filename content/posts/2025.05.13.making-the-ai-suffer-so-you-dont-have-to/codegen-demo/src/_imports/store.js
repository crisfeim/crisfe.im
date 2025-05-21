const appStore = () => ({
  isRunning: false,
  specification: initSpecs(),
  generatedCode: '',
  currentIteration: 0,
  status: null,

  run() {
    this.isRunning = true;
    this.generatedCode = '';
    this.currentIteration = 0;
    this.status = null;
      let count = 0;
    const interval = setInterval(() => {
        count++;
        this.generatedCode = `Generated ${count}`;
        this.status = 'failure';
        this.currentIteration = count;

        if (count >= 5) {
        clearInterval(interval);
        this.isRunning = false;
        this.status = 'success';
        }
    }, 600);
  }
});

const initSpecs = () => `
function testAdder() {
  const sut = new Adder(1, 2);
  assert(sut.result === 3);
}

testAdder();`;
