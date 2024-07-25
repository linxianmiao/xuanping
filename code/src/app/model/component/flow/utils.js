// 根据UUID获取对应节点
export const getNode = (id, data) => {
  const dataSource = data
  const { nodes } = dataSource
  return _.filter(nodes, node => node.id === id)[0]
}

export const getLine = (id, data) => {
  const dataSource = data
  const { links } = dataSource
  return _.filter(links, link => link.id === id)[0]
}

export const getActiveNode = (id, data) => {
  return getNode(id, data) || getLine(id, data) || {}
}

export const getLineIndex = (id, data) => {
  const dataSource = data
  const { links } = dataSource
  return _.findIndex(links, link => link.id === id)
}
class NodeStyle {
    background = null

    opacity = null

    borderWidth = null

    borderColor = null

    dasharray = null

    iconColor = null

    iconSize = null

    textColor = null

    fontSize = null

    constructor (object) {
      for (const key in object) {
        if (object.hasOwnProperty(key)) {
          if (key === 'background') {
            this.fill = object[key]
          }
          if (key === 'borderColor') {
            this.stroke = object[key]
          }
        }
      }
    }

    toJS () {
      const json = {}
      for (const key in this) {
        if (this[key]) {
          json[key] = this[key]
        }
      }
      return json
    }
}

class OldToNewFlowNode {
  constructor (object) {
    for (const key in object) {
      if (key === 'style') {
        this.style = (new NodeStyle(object[key])).toJS()
      } else if (key === 'name') {
        this.text = object[key]
      } else if (key === 'chartType') {
        this.shape = object[key]
      } else if (key === 'radius') {
        // this.height = this.width = object[key] * 2
      } else if (key === 'key') {

      } else {
        this[key] = object[key]
      }
    }
  }

  toJS () {
    const json = {}
    for (const key in this) {
      json[key] = this[key]
    }
    return json
  }
}

class Line {
    uuid = null

    position = null

    node = {}

    constructor (object) {
      for (const key in object) {
        if (object.hasOwnProperty(key)) {
          if (key === 'uuid') {
            this.id = object[key]
          }
          if (key === 'position') {
            this.direction = object[key]
          }
        }
      }
    }

    toJS () {
      const json = {}
      for (const key in this) {
        json[key] = this[key]
      }
      return json
    }
}

class OldToNewFlowLine {
  constructor (object, nodes) {
    for (const key in object) {
      if (key === 'style') {
        this.style = (new NodeStyle(object[key])).toJS()
      } else if (key === 'name') {
        this.text = object[key]
      } else if (key === 'uuid') {
        this.id = object[key]
      } else if (key === 'showName') {
        this.visibleText = object[key]
      } else if (key === 'key' || key === 'from' || key === 'to') {

      } else if (key === 'source') {
        this.from = (new Line(object[key])).toJS()
        this.from.node = nodes.filter(node => node.id === this.from.id)[0]
        if (this.from.node) {
          if (this.from.direction === 'bottom') {
            this.from.x = this.from.node.x + this.from.node.width / 2
            this.from.y = this.from.node.y + this.from.node.height
          } else if (this.from.direction === 'top') {
            this.from.x = this.from.node.x + this.from.node.width / 2
            this.from.y = this.from.node.y
          } else if (this.from.direction === 'left') {
            this.from.x = this.from.node.x
            this.from.y = this.from.node.y + this.from.node.height / 2
          } else if (this.from.direction === 'right') {
            this.from.x = this.from.node.x + this.from.node.width
            this.from.y = this.from.node.y + this.from.node.height / 2
          }
          // this.from.x = this.from.node.x
          // this.from.y = this.from.node.y
        }
      } else if (key === 'target') {
        this.to = (new Line(object[key])).toJS()
        this.to.node = nodes.filter(node => node.id === this.to.id)[0]
        if (this.to.node) {
          if (this.to.direction === 'bottom') {
            this.to.x = this.to.node.x + this.to.node.width / 2
            this.to.y = this.to.node.y + this.to.node.height
          } else if (this.to.direction === 'top') {
            this.to.x = this.to.node.x + this.to.node.width / 2
            this.to.y = this.to.node.y
          } else if (this.to.direction === 'left') {
            this.to.x = this.to.node.x
            this.to.y = this.to.node.y + this.to.node.height / 2
          } else if (this.to.direction === 'right') {
            this.to.x = this.to.node.x + this.to.node.width
            this.to.y = this.to.node.y + this.to.node.height / 2
          }
        }
      } else {
        this[key] = object[key]
      }
    }
  }

  toJS () {
    const json = {}
    for (const key in this) {
      json[key] = this[key]
    }
    return json
  }
}

export function linksToLegal (object, nodes) {
  return (new OldToNewFlowLine(object, nodes)).toJS()
}
export function nodesToLegal (object) {
  return (new OldToNewFlowNode(object)).toJS()
}
export function getByteLen (val) {
  var len = 0
  for (var i = 0; i < val.length; i++) {
    var a = val.charAt(i)
    if (a.match(/[^\x00-\xff]/ig) != null) {
      len += 2
    } else {
      len += 1
    }
  }
  var width = len > 19 ? 160 : len < 3 ? 60 : 48 + len * 6
  return width
}
export function getUserLength (values) {
  const data = values instanceof Array ? values : []
  return data.length
}

// 对处理人进行校验
export function checkHandlersRangeVo (handlersRangeVo) {
  handlersRangeVo = handlersRangeVo || {}
  const { scope = 0, directSelectionVo, handlersRulesVos } = handlersRangeVo
  if (scope === 0) {
    const { userAndGroupList } = directSelectionVo || {}
    return _.isEmpty(userAndGroupList)
  } else {
    return _.isEmpty(handlersRulesVos)
  }
}
export function randomWord(randomFlag = false, min = 6, max = 6) {
  var str = ''
  var range = min
  var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

  // 随机产生
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min
  }
  for (var i = 0; i < range; i++) {
    const pos = Math.round(Math.random() * (arr.length - 1))
    str += arr[pos]
  }
  return str
}
export const defaultTacheButton = (rollbackWay = 0, rollbackProcess = 0, activitiType) => {
  let buttons = [
    {
      type: 'reassignment',
      isUseable: 1,
      buttonName: ''
    }, {
      type: 'cross_unit_reassignment',
      isUseable: 1,
      buttonName: ''
    }, {
      type: 'addSign',
      isUseable: 1,
      buttonName: ''
    }, {
      type: 'suspend',
      isUseable: 1,
      buttonName: ''
    }, {
      type: 'add_multi_performer',
      isUseable: 1,
      buttonName: ''
    }, {
      type: 'rollback',
      isUseable: 1,
      buttonName: '',
      rollbackWay,
      rollbackProcess
    }, {
      type: 'abolish',
      isUseable: 1,
      buttonName: ''
    }, {
      type: 'close',
      isUseable: 1,
      buttonName: ''
    }, {
      type: 'remote_ticket',
      isUseable: 0,
      buttonName: '',
      remoteNodeMode: 0
    }, {
      type: 'CoOrganizer',
      isUseable: 0,
      buttonName: '',
    }
  ]
  if (activitiType === 'ApprovalTask') {
    buttons = [
      {
        type: 'reassignment',
        isUseable: 1,
        buttonName: ''
      }, {
        type: 'addSign',
        isUseable: 1,
        buttonName: ''
      }, {
        type: 'suspend',
        isUseable: 1,
        buttonName: ''
      }, {
        type: 'add_multi_performer',
        isUseable: 1,
        buttonName: ''
      }, {
        type: 'rollback',
        isUseable: 1,
        buttonName: '',
        rollbackWay,
        rollbackProcess
      }, {
        type: 'abolish',
        isUseable: 1,
        buttonName: ''
      }, {
        type: 'close',
        isUseable: 1,
        buttonName: ''
      }, {
        type: 'auto_approval',
        isUseable: 1,
        buttonName: ''
      }, {
        type: 'remote_ticket',
        isUseable: 0,
        buttonName: '',
        remoteNodeMode: 0
      }, {
        type: 'CoOrganizer',
        isUseable: 0,
        buttonName: '',
      }
    ]
  }
  return buttons
}