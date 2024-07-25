import CodeMirror from 'codemirror/lib/codemirror'

CodeMirror.defineMode('batch', function() {
  var words = {}

  function define(style, string) {
    var split = string.split('|')
    for (var i = 0; i < split.length; i++) {
      words[split[i]] = style
    }
  }

  // Atoms
  define('atom', 'true|false|ALTCLIENT|BACKUPMODEL|BATCHSIZE|BLOCKSIZE|BROWSECLIENT|BUFFERS|CONSISTENCYCHECK|COPYONLY|DATABASE|DBMS|DSN|DUMPOPTION|ENABLESERVICEBROKER|ENDOPER|EXCLUDE|GROUPSIZE|INHIBITALTBUFFER|METHOD|MAXRESTARTSETS|MAXTRANSFERSIZE|NBIMAGE|NBSCHED|NBSERVER|NUMBUFS|NUMRETRIES|NUMRESTARTS|OBJECTNAME|OBJECTTYPE|OPERATION|PAGE|PARTIAL|PASSWORD|RECOVERED|STATE|RESTOREBEFOREMARK|AFTERTIME|RESTOREOPTION|RESTOREPAGES|RESTORETOMARK|RESTORETYPE|RESTARTTYPE|RETRYTYPE|RESTARTWAITSECONDS|RETRYWAITSECONDS|ROLLBACKVOLUME|SQLHOST|SQLINSTANCE|STANDBYPATH|STOPAFTER|STOPAT|STORAGEIMAGE|STRIPES|TO|TRACELEVEL|TRXOPTION|USERID|VDITIMEOUTSECONDS|VERIFYONLY|VERIFYOPTION')

  // Keywords
  define('keyword', 'append|assoc|at|attrib|break|cacls|cd|chcp|chdir|chkdsk|chkntfs|cls|cmd|color|comp|compact|convert|copy|date|del|dir|diskcomp|diskcopy|doskey|echo|endlocal|erase|fc|find|findstr|format|ftype|graftabl|help|keyb|label|md|mkdir|mode|more|move|path|pause|popd|print|prompt|pushd|rd|recover|rem|ren|rename|replace|restore|rmdir|set|setlocal|shift|sort|start|subst|time|title|tree|type|ver|verify|vol|xcopy|if|else|for')

  // Commands
  define('builtin', 'goto|call|exit|exist|defined|errorlevel|cmdextversion|EQU|NEQ|LSS|LEQ|GTR|GEQ|rem')

  function tokenBase(stream, state) {
    if (stream.eatSpace()) return null

    var sol = stream.sol()
    var ch = stream.next()

    if (ch === '\\') {
      stream.next()
      return null
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      state.tokens.unshift(tokenString(ch))
      return tokenize(stream, state)
    }
    if (ch === '#') {
      if (sol && stream.eat('!')) {
        stream.skipToEnd()
        return 'meta' // 'comment'?
      }
      stream.skipToEnd()
      return 'comment'
    }
    if (ch === '$') {
      state.tokens.unshift(tokenDollar)
      return tokenize(stream, state)
    }
    if (ch === '+' || ch === '=') {
      return 'operator'
    }
    if (ch === '-') {
      stream.eat('-')
      stream.eatWhile(/\w/)
      return 'attribute'
    }
    if (/\d/.test(ch)) {
      stream.eatWhile(/\d/)
      if (stream.eol() || !/\w/.test(stream.peek())) {
        return 'number'
      }
    }
    stream.eatWhile(/[\w-]/)
    var cur = stream.current()
    if (stream.peek() === '=' && /\w+/.test(cur)) return 'def'
    return words.hasOwnProperty(cur) ? words[cur] : null
  }

  function tokenString(quote) {
    return function(stream, state) {
      var next
      var end = false
      var escaped = false
      while ((next = stream.next()) != null) {
        if (next === quote && !escaped) {
          end = true
          break
        }
        if (next === '$' && !escaped && quote !== "'") {
          escaped = true
          stream.backUp(1)
          state.tokens.unshift(tokenDollar)
          break
        }
        escaped = !escaped && next === '\\'
      }
      if (end || !escaped) {
        state.tokens.shift()
      }
      return quote === '`' || quote === ')' ? 'quote' : 'string'
    }
  }

  var tokenDollar = function(stream, state) {
    if (state.tokens.length > 1) stream.eat('$')
    var ch = stream.next()
    var hungry = /\w/
    if (ch === '{') hungry = /[^}]/
    if (ch === '(') {
      state.tokens[0] = tokenString(')')
      return tokenize(stream, state)
    }
    if (!/\d/.test(ch)) {
      stream.eatWhile(hungry)
      stream.eat('}')
    }
    state.tokens.shift()
    return 'def'
  }

  function tokenize(stream, state) {
    return (state.tokens[0] || tokenBase)(stream, state)
  }

  return {
    startState: function() {
      return {
        tokens: []
      }
    },
    token: function(stream, state) {
      return tokenize(stream, state)
    },
    lineComment: '#',
    fold: 'brace'
  }
})

CodeMirror.defineMIME('text/bash', 'batch')
