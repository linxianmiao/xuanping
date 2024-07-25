import React, { Component } from 'react'
import { SettingOutlined } from '@uyun/icons'
import { Form, Input, Collapse, Dropdown, Menu, Modal, message } from '@uyun/components'
import limitFields from 'config/limitFields'
import uuidv4 from 'uuid/v4'
const FormItem = Form.Item
const Panel = Collapse.Panel
const SubMenu = Menu.SubMenu
// 编辑流程阶段名称
class EditStageName extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: this.props.name
    }
    this.onOk = this.onOk.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }

  // 保存
  onOk(e) {
    e.stopPropagation()
    const { item, renameStage, type, data } = this.props
    const { name } = this.state

    if (_.trim(name).length === 0) {
      message.error($.translate('config', 'model', 'not_null'))
      return false
    } else if (_.trim(name).length > limitFields.config.modelProcessName) {
      message.error($.translate('config', 'model', 'fiveLetter'))
      return false
    }
    renameStage(item, data, name, type)
  }

  // 取消保存
  onCancel(e) {
    e.stopPropagation()
    const { item, renameStage, type, data } = this.props
    renameStage(item, data, undefined, type)
  }

  // 改变
  onChange(e) {
    const val = e.target.value || ''
    this.setState({
      name: val
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      this.setState({
        name: this.props.name
      })
    }
  }

  render() {
    const { name } = this.state
    return (
      <FormItem className="edit-name">
        <Input
          type="text"
          onChange={this.onChange.bind(this)}
          onClick={(e) => e.stopPropagation()}
          value={name}
        />
        <div className="icon-wrap">
          <i className="iconfont icon-dui btn-available" onClick={this.onOk} />
          <i className="iconfont icon-cha btn-available" onClick={this.onCancel} />
        </div>
      </FormItem>
    )
  }
}
// 展示流程阶段名称
class ShowStageName extends Component {
  // 创建menu菜单
  createMenu() {
    const { type, item, tacheList, idx } = this.props
    const parallelismActivityVos = [] // 并行组列表
    _.map(tacheList, (tache) => {
      if (tache.type) {
        parallelismActivityVos.push({
          id: tache.id,
          key: tache.key,
          name: tache.name
        })
      }
    })
    return (
      <Menu onClick={this.handleMenuClick.bind(this)}>
        <Menu.Item key="rename">{/* 重命名 */ $.translate('config', 'model', 'tip24')}</Menu.Item>
        {
          /* 不是并行组且不是第一环节 */
          type === 'flow' && !item.type && idx !== 0 ? (
            <SubMenu title={/* 添加至并行组 */ $.translate('config', 'model', 'tip20')}>
              <Menu.Item key="convert">
                {/* 新建并行组 */ $.translate('config', 'model', 'tip21')}
              </Menu.Item>
              {_.map(parallelismActivityVos, (paralle) => {
                return <Menu.Item key={paralle.id || paralle.key}>{paralle.name}</Menu.Item>
              })}
            </SubMenu>
          ) : (
            []
          )
        }
        {
          /* 是不是并行组 */
          type === 'flow' && item.type ? (
            <Menu.Item key="add">
              {/* 添加并行节点 */ $.translate('config', 'model', 'tip22')}
            </Menu.Item>
          ) : (
            []
          )
        }
        {type === 'parallel' ? (
          <Menu.Item key="normal">
            {/* 转为普通阶段 */ $.translate('config', 'model', 'tip23')}
          </Menu.Item>
        ) : (
          []
        )}
        {
          /* 当本身是第一环节切第二环节是并行组的时候不能删除 */
          idx === 0 && tacheList[1] && tacheList[1].type === 1 ? (
            []
          ) : (
            <Menu.Item key="del">{/* 删除 */ $.translate('globe', 'del')}</Menu.Item>
          )
        }
      </Menu>
    )
  }

  // 点击menu菜单
  handleMenuClick(e) {
    const {
      changeStage,
      delStage,
      renameStage,
      addParallelItem,
      item,
      data,
      type,
      changeParallelNode,
      changeNormalNode
    } = this.props
    switch (e.key) {
      case 'rename':
        renameStage(item, data, undefined, type)
        break // 重名命
      case 'convert':
        changeStage(item)
        break // 转为并行组
      case 'add':
        addParallelItem(item)
        break // 添加并行节点
      case 'del':
        delStage(item, data, type)
        break // 删除阶段
      case 'normal':
        changeNormalNode(item, data)
        break // 转成普通阶段
      default:
        changeParallelNode(item, e.key) // 普通流程阶段变成并行节点
    }
  }

  render() {
    const {
      item,
      idx,
      len,
      moveDown,
      moveUp,
      type,
      data,
      activeStage,
      showParallel,
      activeId,
      tacheList
    } = this.props
    let id = ''
    if (type === 'flow' || type === 'autoM') {
      id = item.id || item.key
    } else {
      id = data.id || data.key
    }
    return (
      <div className={`stage-item-name clearfix ${activeId === id ? 'active' : ''}`} id={id}>
        {type === 'flow' && item.type ? (
          <span className="parallel-icon" onClick={(e) => showParallel(item, 'togger', e)}>
            <i className="iconfont icon-uer-sanjiao" />
            <i className="iconfont icon-binghangzu" />
          </span>
        ) : null}
        {type === 'autoM' ? (
          <span onClick={(e) => activeStage(item, data, type, e)} className="left">
            <i className="iconfont icon-zidongchulijieduan" /> {item.name}
          </span>
        ) : (
          <span onClick={(e) => activeStage(item, data, type, e)} className="left">
            {type !== 'parallel' ? item.name : data.name}
          </span>
        )}
        <div className="right">
          {
            /* 并行组不能当第一个 */
            (type === 'flow' &&
              ((!item.type && idx !== 0) || (item.type && idx !== 0 && idx !== 1))) ||
            (type === 'autoM' && idx !== 1) ? (
              <i
                onClick={(e) => moveUp(item, idx, e)}
                className="iconfont icon-shangyi pointer mgr-3"
              />
            ) : null
          }
          {(type === 'flow' &&
            ((idx === 0 && tacheList[1] && !tacheList[1].type) ||
              (idx !== 0 && idx !== len - 1))) ||
          (type === 'autoM' && idx !== len - 1) ? (
            <i
              onClick={(e) => moveDown(item, idx, e)}
              className="iconfont icon-xiayi pointer mgr-3"
            />
          ) : null}
          <Dropdown
            getPopupContainer={() => document.getElementById(`${id}`)}
            overlay={this.createMenu()}
          >
            <SettingOutlined className="pointer" />
          </Dropdown>
        </div>
      </div>
    )
  }
}

// 设置流程阶段
class ProcessSetStage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showKey: [], // 展开的并行组
      activeId: '' // 当前激活的流程
    }
    this.paralleIndex = 1
    this.changeStage = this.changeStage.bind(this)
    this.delStage = this.delStage.bind(this)
    this.renameStage = this.renameStage.bind(this)
    this.moveDown = this.moveDown.bind(this)
    this.moveUp = this.moveUp.bind(this)
    this.activeStage = this.activeStage.bind(this)
    this.showParallel = this.showParallel.bind(this)
    this.addParallelItem = this.addParallelItem.bind(this)
    this.changeParallelNode = this.changeParallelNode.bind(this)
    this.changeNormalNode = this.changeNormalNode.bind(this)
  }

  // 创建流程
  createStage(item, idx, len) {
    const { tacheList } = this.props
    const { showKey, activeId } = this.state
    const prop = {
      idx,
      len,
      item,
      activeId,
      tacheList,
      name: item.name,
      changeStage: this.changeStage,
      delStage: this.delStage,
      renameStage: this.renameStage,
      moveUp: this.moveUp,
      moveDown: this.moveDown,
      activeStage: this.activeStage,
      showParallel: this.showParallel,
      addParallelItem: this.addParallelItem,
      changeParallelNode: this.changeParallelNode,
      changeNormalNode: this.changeNormalNode
    }
    // item.type  1 === 并行组 ； 0 === 普通阶段 ； 3 === 自动阶段
    if (item.type === 1) {
      return (
        <div className="stage-item">
          <Collapse activeKey={showKey}>
            <Panel key={item.id || item.key} header={this.createPanel.call(this, prop)}>
              {_.map(item.parallelismActivityVos, (data) => {
                const parallelProp = Object.assign({}, prop, {
                  type: 'parallel',
                  name: data.name,
                  data
                })
                return (
                  <div className="parallel-item" key={data.id || data.key}>
                    {data.isEditing ? (
                      <EditStageName {...parallelProp} />
                    ) : (
                      <ShowStageName {...parallelProp} />
                    )}
                  </div>
                )
              })}
            </Panel>
          </Collapse>
        </div>
      )
    } else if (item.type === 3) {
      const flowProp = Object.assign({}, prop, { type: 'autoM' })
      return (
        <div className="stage-item">
          {item.isEditing ? <EditStageName {...flowProp} /> : <ShowStageName {...flowProp} />}
        </div>
      )
    } else if (item.type === 0) {
      const flowProp = Object.assign({}, prop, { type: 'flow' })
      return (
        <div className="stage-item">
          {item.isEditing ? <EditStageName {...flowProp} /> : <ShowStageName {...flowProp} />}
        </div>
      )
    }
  }

  // 创建折叠面板的头部
  createPanel(props) {
    const panelProp = Object.assign({}, props, { type: 'flow' })
    return (
      <div className="panel-header">
        {!panelProp.item.isEditing ? (
          <ShowStageName {...panelProp} />
        ) : (
          <EditStageName {...panelProp} />
        )}
      </div>
    )
  }

  // 创建新建dom
  createAdd(len) {
    const { access } = this.props
    const menu = (
      <Menu onClick={(e) => this.addStage(e.key, len)}>
        <Menu.Item key="parallel">
          {/* 新建并行组 */ $.translate('config', 'model', 'tip21')}
        </Menu.Item>
        <Menu.Item key="autoM">
          {/* 新建自动阶段 */ $.translate('config', 'model', 'tip33')}
        </Menu.Item>
      </Menu>
    )
    return (
      <div className="add-flow clearfix">
        <div className="add-normal" onClick={this.addStage.bind(this, 'flow', len)}>
          + {/* 添加阶段 */ $.translate('config', 'model', 'tip25')}
        </div>
        {access === '1' ? (
          <Dropdown
            overlay={menu}
            trigger={['click']}
            getPopupContainer={() => document.getElementById('icon-gengduocaozuo')}
          >
            <div id="icon-gengduocaozuo" className="add-parallel-group">
              <i className="iconfont icon-gengduocaozuo" />
            </div>
          </Dropdown>
        ) : (
          <div className="add-parallel-group" onClick={this.addStage.bind(this, 'parallel', len)}>
            <i className="iconfont icon-binghangzu" />
          </div>
        )}
      </div>
    )
  }

  // 当前激活的流程,用于显示流程中的选中状态，也就是颜色与icon的显示隐藏
  // item --> 并行组活普通环节 ； data --> 并行环节 ； type === ‘flow’ 并行组y与普通环节 type=== 'parallel' 并行环节 ； type === 'autoM’ 自动环节
  activeStage(item, data, type, e) {
    const { falt } = this.props
    if (falt) {
      return false
    }
    e && e.stopPropagation()
    let activeId = ''
    if (type === 'flow' || type === 'autoM') {
      activeId = item.id || item.key
    } else if (type === 'parallel') {
      activeId = data.id || data.key
    }
    this.props.activeStage(item, data, type)
    this.setState({
      activeId
    })
  }

  // 并行组的展示
  showParallel(item, status, e) {
    e && e.stopPropagation()
    const { showKey } = this.state
    const id = item.id || item.key
    if (status === 'togger') {
      if (showKey.indexOf(id) !== -1) {
        _.pull(showKey, id)
      } else {
        showKey.push(id)
      }
    } else {
      if (showKey.indexOf(id) === -1) {
        showKey.push(id)
      }
    }
    this.setState({
      showKey
    })
  }

  // 添加流程或者并行组
  addStage(type, len) {
    const { tacheList, defaultStage, defaultParallel, automation } = this.props
    const newStage = type === 'autoM' ? _.cloneDeep(automation) : _.cloneDeep(defaultStage)
    newStage.name = $.translate('config', 'model', 'liucheng') + ++len
    newStage.key = uuidv4()
    if (type === 'flow') {
      tacheList.push(newStage)
    } else if (type === 'parallel') {
      const parallel1 = _.cloneDeep(defaultParallel)
      const parallel2 = _.cloneDeep(defaultParallel)
      parallel1.key = uuidv4()
      parallel2.key = uuidv4()
      // 新建并行环节 + this.paralleIndex++;
      parallel1.name = $.translate('config', 'model', 'tip26') + this.paralleIndex++
      parallel2.name = $.translate('config', 'model', 'tip26') + this.paralleIndex++
      newStage.type = 1
      newStage.parallelismActivityVos = [parallel1, parallel2]
      tacheList.push(newStage)
    } else if (type === 'autoM') {
      tacheList.push(newStage)
    }
    // 激活当前新添加的环节
    this.activeStage(newStage, undefined, type === 'autoM' ? 'autoM' : 'flow')
    // this.forceUpdate();
    this.showParallel(newStage)
  }

  // 添加并行节点
  addParallelItem(item) {
    const { tacheList } = this.props
    const { parallelismActivityVos = [] } = item

    const newParallel = _.cloneDeep(this.props.defaultParallel)
    newParallel.key = uuidv4()
    // 新建并行环节 + this.paralleIndex++;
    newParallel.name = $.translate('config', 'model', 'tip26') + this.paralleIndex++

    parallelismActivityVos.push(newParallel)

    _.forEach(tacheList, (tache) => {
      if ((item.id && tache.id === item.id) || (tache.key && tache.key === item.key)) {
        tache.parallelismActivityVos = item.parallelismActivityVos
        return false
      }
    })
    // 激活当前新添加的环节
    this.activeStage(item, newParallel, 'parallel')
    this.showParallel(item) // 展开当前并行组
    this.forceUpdate()
  }

  /// /普通流程阶段转为并行组
  // 现在改为普通阶段转成并行组的一个环节，让后加一个并行环节，套一个组
  changeStage(item) {
    const { tacheList } = this.props
    const _this = this
    Modal.confirm({
      // 转为并行节点后，已添加的处理规则将被删除
      title: $.translate('config', 'model', 'tip27'),
      iconType: 'exclamation',
      onOk() {
        // 并行组创建
        const newGroup = _.cloneDeep(_this.props.parallelGroup)
        newGroup.key = uuidv4()
        newGroup.name = $.translate('config', 'model', 'tip28') // 新建并行组
        _.forEach(tacheList, (data, index) => {
          if ((item.id && data.id === item.id) || (data.key && data.key === item.key)) {
            const dataCopy = _.cloneDeep(data)

            // 并行环节1为普通环节转化而来，
            const newParallel1 = _.cloneDeep(_this.props.defaultParallel)
            newParallel1.key = uuidv4()
            newParallel1.name = dataCopy.name
            newParallel1.fieldList = _.cloneDeep(dataCopy.fieldList)
            newParallel1.userAndGroupList = _.cloneDeep(dataCopy.userAndGroupList)
            newParallel1.description = dataCopy.description
            newParallel1.isEditing = 0

            // 并行环节2为新建的并行的环节
            const newParallel2 = _.cloneDeep(_this.props.defaultParallel)
            newParallel2.key = uuidv4()
            newParallel2.name = $.translate('config', 'model', 'tip26') + _this.paralleIndex++ // 并行环节

            newGroup.parallelismActivityVos = [newParallel1, newParallel2]

            tacheList.splice(index, 1, newGroup)

            // _this.props.activeStage(newGroup , newParallel1 , 'parallel') //改变右边的部分状态
            _this.activeStage(newGroup, newParallel1, 'parallel') // 改变左边的显示状态

            return false
          }
        })
        _this.forceUpdate()
        _this.showParallel(newGroup) // 展示并行组
      },
      onCancel() {}
    })
  }

  // 并行阶段转成普通流程阶段
  // Group --> 并行组  tache --> 并行环节
  changeNormalNode(group, tache) {
    const { tacheList } = this.props
    const _this = this
    // 注释掉的是弹框提示，说目前不加
    // Modal.confirm({
    //   title: '确定将并行环节转成普通阶段',
    //   onOk() {
    const newStage = _.cloneDeep(_this.props.defaultStage)
    newStage.key = uuidv4()
    _.forEach(tacheList, (item) => {
      if ((group.id && group.id === item.id) || (group.key && group.key === item.key)) {
        _.forEach(item.parallelismActivityVos, (data, idx) => {
          if ((tache.id && tache.id === data.id) || (tache.key && tache.key === data.key)) {
            item.parallelismActivityVos.splice(idx, 1) // 删除并行环节
            // 将并行环节的一些值带过去---> 名称,编辑状态,字段,人员,描述, 是否会签,分配方式
            const dataCopy = _.pick(data, [
              'name',
              'isEditing',
              'fieldList',
              'userAndGroupList',
              'description',
              'counterSign',
              'policy'
            ])
            Object.assign(newStage, dataCopy)
            return false
          }
        })
      }
    })
    tacheList.push(newStage)
    _this.props.activeStage(newStage, undefined, 'flow') // 改变右边的部分状态
    _this.activeStage(newStage, undefined, 'flow') // 改变左边的显示状态
    _this.forceUpdate()
    //   },
    //   onCancel() {},
    // });
  }

  // 普通流程阶段变成并行节点
  changeParallelNode(item, id) {
    const { tacheList } = this.props
    const { showKey } = this.state
    const _this = this
    Modal.confirm({
      title: $.translate('config', 'model', 'tip27'), // 转为并行节点后，已添加的处理规则将被删除。
      iconType: 'exclamation',
      onOk() {
        // 流程阶段删除将要转化的普通阶段
        _.forEach(tacheList, (tache) => {
          if ((item.id && tache.id === item.id) || (item.key && tache.key === item.key)) {
            _.pull(tacheList, tache)
            return false
          }
        })
        // 流程阶段删除处理规则以后转成并行节点
        const newItem = _.omit(item, [
          'dealRules',
          'defaultButton',
          'submitName',
          'type',
          'builtin',
          'parallelismActivityVos'
        ])
        _.forEach(tacheList, (tache) => {
          if ((tache.id && tache.id === id) || (tache.key && tache.key === id)) {
            tache.parallelismActivityVos.push(newItem)
            _this.props.activeStage(tache, newItem, 'parallel') // 改变右边的部分状态
            _this.activeStage(tache, newItem, 'parallel') // 改变左边的显示状态
            return false
          }
        })
        // 如何并行组处于关闭状态，就让他展开
        if (showKey.indexOf(id) === -1) {
          showKey.push(id)
        }
        // 更新
        _this.forceUpdate()
      },
      onCancel() {}
    })
  }

  // 删除当前阶段
  delStage(item, data, type) {
    const { tacheList, stageNameList } = this.props
    const _this = this

    if (tacheList.length === 1) {
      message.error($.translate('config', 'model', 'tip32'))
      return
    }
    Modal.confirm({
      title: $.translate('config', 'model', 'tip29'), // 您是否确认要删除这项内容
      iconType: 'exclamation',
      onOk() {
        if (type === 'flow' || type === 'autoM') {
          _.forEach(tacheList, (tache) => {
            if ((item.id && tache.id === item.id) || (tache.key && tache.key === item.key)) {
              _.pull(tacheList, tache)
              // 如果他是并行组的时候，将并行环节里的name也删除掉
              if (tache.type === 1) {
                _.map(tache.parallelismActivityVos, (parallel) => {
                  _.pull(stageNameList, parallel.name)
                })
              }
              _.pull(stageNameList, tache.name)
              return false
            }
          })
        } else if (type === 'parallel') {
          _.forEach(tacheList, (tache, idx) => {
            if ((item.id && tache.id === item.id) || (tache.key && tache.key === item.key)) {
              if (tache.parallelismActivityVos.length <= 2) {
                message.error($.translate('config', 'model', 'tip19'))
                return false
              } else {
                _.forEach(tache.parallelismActivityVos, (parallel) => {
                  if (
                    (data.id && parallel.id === data.id) ||
                    (data.key && data.key === parallel.key)
                  ) {
                    _.pull(tacheList[idx].parallelismActivityVos, parallel)
                    _.pull(stageNameList, parallel.name)
                    return false
                  }
                })
              }
            }
          })
        }
        // 删除成功以后跳转到第一个阶段
        _this.props.activeStage(tacheList[0], undefined, 'flow') // 改变右边的部分状态
        _this.activeStage(tacheList[0], undefined, 'flow') // 改变左边的显示状态
        _this.forceUpdate()
      },
      onCancel() {}
    })
  }

  // 重命名当前阶段
  renameStage(item, data, name, type) {
    const { tacheList, stageNameList } = this.props
    if (type === 'parallel') {
      // 并行环节
      if (!data.isEditing) {
        _.forEach(tacheList, (tache) => {
          if ((item.id && item.id === tache.id) || (item.key && item.key === tache.key)) {
            _.forEach(tache.parallelismActivityVos, (paralle) => {
              if ((data.id && paralle.id === data.id) || (data.key && data.key === paralle.key)) {
                paralle.isEditing = true
                _.pull(stageNameList, paralle.name) // 重命名的时候也要删除
                return false
              }
            })
          }
        })
      } else {
        _.forEach(tacheList, (tache) => {
          if ((item.id && item.id === tache.id) || (item.key && item.key === tache.key)) {
            _.forEach(tache.parallelismActivityVos, (paralle) => {
              if ((data.id && paralle.id === data.id) || (data.key && data.key === paralle.key)) {
                if (name === undefined) {
                  paralle.isEditing = false
                  stageNameList.push(paralle.name)
                } else if (stageNameList.indexOf(name) === -1) {
                  data.isEditing = false
                  name ? (data.name = name) : null
                  stageNameList.push(name)
                } else {
                  message.error($.translate('server', 'w2206'))
                }
                return false
              }
            })
          }
        })
      }
    } else {
      if (!item.isEditing) {
        // 普通环节
        _.forEach(tacheList, (tache) => {
          if ((item.id && item.id === tache.id) || (item.key && item.key === tache.key)) {
            tache.isEditing = true
            _.pull(stageNameList, tache.name) // 重命名的时候也要删除
            return false
          }
        })
      } else {
        _.forEach(tacheList, (tache) => {
          if ((item.id && item.id === tache.id) || (item.key && item.key === tache.key)) {
            if (name === undefined) {
              tache.isEditing = false
              stageNameList.push(tache.name)
            } else if (stageNameList.indexOf(name) === -1) {
              tache.isEditing = false
              name ? (tache.name = name) : null
              stageNameList.push(name)
            } else {
              message.error($.translate('server', 'w2206'))
            }
            return false
          }
        })
      }
    }
    this.forceUpdate()
  }

  // 上移
  moveUp(item, idx, e) {
    e.stopPropagation()
    const { tacheList } = this.props

    this.moveUpJudge(item, idx).then((itemCopy) => {
      tacheList.splice(idx, 1)
      tacheList.splice(idx - 1, 0, itemCopy)
      this.props.activeStage(itemCopy, undefined, item.type === 3 ? 'autoM' : 'flow') // 改变右边的部分状态
      this.activeStage(itemCopy, undefined, item.type === 3 ? 'autoM' : 'flow') // 改变左边的显示状态
      this.forceUpdate()
    })
  }

  // 上移判断,promise使用主要是因为Modal.confirm的异步的
  moveUpJudge(item, idx) {
    return new Promise(function (resolve) {
      const itemCopy = _.cloneDeep(item)
      // 当上移以后变成第一环节的时候，人员范围的会签和人员的状态重置,
      // 第一环节不能有子流程和完成，当变成第一阶段以后，删除
      if (idx === 1) {
        itemCopy.counterSign = 0
        itemCopy.policy = 1
        itemCopy.userAndGroupList = []

        const dirtyData = _.find(itemCopy.dealRules, (dealRule) => {
          return dealRule.type === 2 || dealRule.type === 3
        })

        if (dirtyData) {
          Modal.confirm({
            title: '该阶段含有的子流程和完成规则上移之后将会被移除，确定要上移吗？',
            iconType: 'exclamation',
            onOk() {
              const dealRulesCopy = []
              _.map(itemCopy.dealRules, (dealRule) => {
                if (dealRule.type === 1) {
                  dealRulesCopy.push(dealRule)
                }
              })
              itemCopy.dealRules = dealRulesCopy
              resolve(itemCopy)
            },
            onCancel() {}
          })
        } else {
          resolve(itemCopy)
        }
      } else {
        resolve(itemCopy)
      }
    })
  }

  // 下移
  moveDown(item, idx, e) {
    e.stopPropagation()
    const { tacheList } = this.props
    tacheList.splice(idx, 1)
    tacheList.splice(idx + 1, 0, item)
    this.props.activeStage(item, undefined, item.type === 3 ? 'autoM' : 'flow') // 改变右边的部分状态
    this.activeStage(item, undefined, item.type === 3 ? 'autoM' : 'flow') // 改变左边的显示状态
    this.forceUpdate()
  }

  render() {
    const { tacheList } = this.props
    const len = tacheList.length
    return (
      <div className="form-set-stage" id="form-set-stage" style={{ position: 'relative' }}>
        {_.map(tacheList, (item, idx) => {
          return (
            <div className="stage-item-wrap clearfix" key={item.id || item.key}>
              <span
                className={
                  idx === len - 1 ? 'stage-item-grade' : 'stage-item-grade stage-item-line'
                }
              >
                {idx + 1}
              </span>
              {this.createStage(item, idx, len)}
            </div>
          )
        })}
        {this.createAdd(len)}
      </div>
    )
  }
}

ProcessSetStage.defaultProps = {
  // 普通环节
  defaultStage: {
    name: $.translate('config', 'model', 'new'),
    description: '',
    policy: 1,
    counterSign: 0,
    userAndGroupList: [],
    fieldList: [],
    builtin: 0,
    isEditing: 1,
    defaultButton: true,
    submitName: $.translate('config', 'model', 'submitLast'),
    dealRules: [],
    type: 0,
    parallelismActivityVos: undefined,
    key: '1'
  },
  // 并行环节
  defaultParallel: {
    name: $.translate('config', 'model', 'new'),
    description: '',
    policy: 1,
    counterSign: 0,
    userAndGroupList: [],
    fieldList: [],
    isEditing: 1,
    key: '1'
  },
  // 并行组
  parallelGroup: {
    name: $.translate('config', 'model', 'new'),
    description: '',
    builtin: 0,
    isEditing: 1,
    dealRules: [],
    type: 1,
    parallelismActivityVos: [],
    key: '1'
  },
  // 自动环节
  automation: {
    name: $.translate('config', 'model', 'new'),
    type: 3,
    key: '1',
    executeType: 0,
    successJumpActivity: '',
    failActionType: '1',
    failJumpActivity: '',
    successJump: '0',
    failJump: '0',
    dealRules: [
      {
        autoId: '',
        autoCode: '',
        autoParams: {},
        key: uuidv4(),
        name: 'w',
        ruleType: 2,
        type: 4
      }
    ]
  }
}

export default ProcessSetStage
