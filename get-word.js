var lineChomper = require('line-chomper');
var jsonfile = require('jsonfile');

var linesInWordsFile = 109583;

var lineOffsets = jsonfile.readFileSync(
    __dirname + '/data/wordslineoffsets.json'
  );

function getWord(index, done) {
  lineChomper.chomp(
    __dirname + '/data/words.txt',
    {
      lineOffsets: lineOffsets,
      fromLine: index,
      lineCount: 1
    },
    readDone
  );

  function readDone(error, lines) {
    if (error) {
      done(error);
    }
    else if (!lines || !Array.isArray(lines) || lines.length < 1) {
      done(new Error('Could not get valid line for offset ' + index));
    }
    else {
      done(error, lines[0]);
    }
  }
}

module.exports = getWord;
