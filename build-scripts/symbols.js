var exec = require('child_process').execSync
var path = require('path')

var symbols = exec(`nm -gU "${path.join(require.resolve('sodium-native'), '../prebuilds/darwin-x64/libsodium.dylib')}"`).toString().trim().split('\n')
var native = new Set(Object.keys(require('sodium-native')).sort())
var js = new Set(Object.keys(require('sodium-javascript')).sort())

symbols = symbols.map(l => l.split(' ').pop().replace(/^_/, '').replace(/_[^_]*bytes.*/, (s) => s.toUpperCase()))

var missing = []

console.log(`
<!-- Generated by build-scripts/symbols.js with
     sodium-native@${require('sodium-native/package.json').version}
     sodium-javascript@${require('sodium-javascript/package.json').version} -->\
`)

const max = symbols.filter(s => native.has(s) || js.has(s)).map(s => s.length).reduce((a, b) => Math.max(a, b))
const lines = ':-' + ''.padEnd(max, '--') + '-:'
const center = s => s.padStart(Math.floor((max + s.length) / 2), ' ').padEnd(max, ' ')

console.log(`|  ${center('C Library Symbol')}  |   \`sodium-native\`    | \`sodium-javascript\`  |`)
console.log(`|${lines}|:--------------------:|:--------------------:|`)

for (var i = 0; i < symbols.length; i++) {
  var s = symbols[i]
  if (!(native.has(s) || js.has(s))) missing.push(s)
  else console.log(`| \`${(s + '`').padEnd(max + 1, ' ')} | ${native.has(s) ? ' :white_check_mark: ' : ':small_red_triangle:'} | ${js.has(s) ? ' :white_check_mark: ' : ':small_red_triangle:'} |`)
}

console.log('\n### Missing altogether (Ctrl + F friendly)\n')
console.log(missing.map(s => '`' + s + '`').join(', '))
