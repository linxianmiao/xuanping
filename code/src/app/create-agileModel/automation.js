import React, { Component } from 'react'
import RuleEditor from '~/components/triggerRules'
import { Tabs, Form, Select, Radio, Collapse, Button, Dropdown, Menu, Input, message } from '@uyun/components'
import uuidv4 from 'uuid/v4'
const TabPane = Tabs.TabPane
const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const Panel = Collapse.Panel

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 20 }
}
const conditionData = {
  when: 'all',
  conditionExpressions: [],
  nestingConditions: []
}
// 执行结果以后的操作组件
class WaitResult extends Component {
  // 切换
  handleJump (val) {
    const { tacheList, type, idx } = this.props
    if (type === 'succeed') {
      tacheList[idx].successJump = val
      if (val === '0') {
        tacheList[idx].successJumpActivity = ''
      }
    } else {
      tacheList[idx].failJump = val
      if (val === '0') {
        tacheList[idx].failJumpActivity = ''
      }
    }
    this.forceUpdate()
  }

  handleJumpActivity (val) {
    const { tacheList, type, idx } = this.props
    if (type === 'succeed') {
      tacheList[idx].successJumpActivity = val
    } else {
      tacheList[idx].failJumpActivity = val
    }
    this.forceUpdate()
  }

  createSelect (jump, jumpActivity) {
    const { tacheList, idx } = this.props
    return (
      <div>
        <Select
          showSearch
          optionFilterProp="children"
          notFoundContent={i18n('globe.notFound', '无法找到')}
          style={{ width: '200px', marginRight: '15px' }}
          value={'' + jump}
          onChange={this.handleJump.bind(this)}
        >
          <Option value={'0'}>默认流转</Option>
          <Option value={'1'}>跳转至</Option>
        </Select>
        {
          +jump === 1
            ? <Select
              showSearch
              optionFilterProp="children"
              notFoundContent={i18n('globe.notFound', '无法找到')}
              style={{ width: '200px' }}
              value={jumpActivity}
              onChange={this.handleJumpActivity.bind(this)}
            >
              {
                _.map(tacheList, (tache, index) => {
                  if (index !== idx && +tache.type !== 3) {
                    return (
                      <Option key={tache.key} value={tache.name}>{tache.name}</Option>
                    )
                  } else {
                    return []
                  }
                })
              }
            </Select>
            : null
        }
      </div>
    )
  }

  onChangeRadio (e) {
    const { tacheList, idx } = this.props
    tacheList[idx].failActionType = e.target.value
    if (+e.target.value === 1) {
      tacheList[idx].failJump = '0'
      tacheList[idx].failJumpActivity = ''
    }
    this.forceUpdate()
  }

  render () {
    const { type, idx, tacheList } = this.props
    return (
      <div className="execute-setting">
        <h4>
          {
            type === 'succeed' ? '执行成功' : '执行失败'
          }
        </h4>
        <div>
          {
            type === 'succeed'
              ? this.createSelect(tacheList[idx].successJump, tacheList[idx].successJumpActivity)
              : <div>
                <RadioGroup onChange={this.onChangeRadio.bind(this)} value={+tacheList[idx].failActionType}>
                  <Radio value={1}>关闭工单</Radio>
                  <Radio value={0}>继续流转</Radio>
                </RadioGroup>
                {
                  +tacheList[idx].failActionType === 0
                    ? this.createSelect(tacheList[idx].failJump, tacheList[idx].failJumpActivity)
                    : null
                }
              </div>
          }
        </div>
      </div>
    )
  }
}
// 关联编排
class ArrangeItem extends Component {
  // 添加更多参数菜单
  createMenu () {
    const { surplusOptional } = this.props
    return (
      <Menu onClick={this.addParameter.bind(this)}>
        {
          _.map(surplusOptional, optionalItem => {
            return (
              <Menu.Item key={optionalItem.name}>{optionalItem.name}</Menu.Item>
            )
          })
        }
      </Menu>
    )
  }

  // 选择编排参数
  selectArrange (val) {
    const { idx, index } = this.props
    this.props.selectArrange(idx, index, val)
  }

  // 选择编排参数value
  changeparItem (parItem, type, e) {
    const { tacheList, index, idx } = this.props
    tacheList[idx].dealRules[index].autoParams[parItem.name].value = type === 'field' ? e : e.target.value
    this.forceUpdate()
  }

  // 根据当前编排添加更多参数
  addParameter (e) {
    const { surplusOptional, checkeOptional, arrange_parameter, tacheList, index, idx } = this.props
    _.forEach(arrange_parameter.optional, item => {
      if (item.name === e.key) {
        _.pull(surplusOptional, item) // 删除剩余的参数
        checkeOptional.push(item) // 添加当前选中的参数
        // 初始化
        if (_.isEmpty(tacheList[idx].dealRules[index].autoParams)) {
          tacheList[idx].dealRules[index].autoParams = {}
        }
        tacheList[idx].dealRules[index].autoParams[item.name] = {
          value: item.value,
          type: item.value ? 'text' : 'field',
          autoType: item.autoType
        }
        return false
      }
    })
    this.forceUpdate()
  }

  // 删除当前编排参数
  delParameter (parItem) {
    const { tacheList, index, idx, surplusOptional, checkeOptional } = this.props
    // 删除编排的参数
    delete tacheList[idx].dealRules[index].autoParams[parItem.name]
    // 删除以后，添加更多参数那里增加一个，列表中删除一个
    _.pull(checkeOptional, parItem)
    surplusOptional.push(parItem)
    this.forceUpdate()
  }

  // 切换当前参数value的值类型
  onChangeType (parItemType, parItem) {
    const { tacheList, index, idx } = this.props
    const newParItemType = parItemType === 'field' ? 'text' : 'field'
    tacheList[idx].dealRules[index].autoParams[parItem.name].value = ''
    tacheList[idx].dealRules[index].autoParams[parItem.name].type = newParItemType
    this.forceUpdate()
  }

  // 触发条件
  onChangeTriggerCondition (key, val) {
    const { tacheList, idx } = this.props
    delete val.id
    this.deleteId(val)
    _.forEach(tacheList[idx].dealRules, (item, index) => {
      if (index === key) {
        tacheList[idx].dealRules[index].complexCondition = val
        return false
      }
    })
    this.forceUpdate()
  }

  // 删除触发条件的id
  deleteId (val) {
    if (val.nestingConditions && val.nestingConditions.length > 0) {
      for (var i = 0; i < val.nestingConditions.length; i++) {
        delete val.nestingConditions[i].id
        this.deleteId(val.nestingConditions[i])
      }
    }
  }

  render () {
    const { autoList, tacheList, index, idx, arrange_parameter, checkeOptional, surplusOptional } = this.props
    return (
      <div className="arrange-item">
        <div>
          <h4>触发条件</h4>
          <RuleEditor
            fields={this.props.fieldList}
            condition={tacheList[idx].dealRules[index].complexCondition ? tacheList[idx].dealRules[index].complexCondition : conditionData}
            keys={index}
            onChangeTriggerCondition={this.onChangeTriggerCondition.bind(this)}
          />
        </div>
        <div className="mb-20">
          <h4>关联编排</h4>
          <div>
            <Select
              showSearch
              optionFilterProp="children"
              notFoundContent={i18n('globe.notFound', '无法找到')}
              style={{ minWidth: '300px' }}
              value={tacheList[idx].dealRules[index].autoId || undefined}
              onChange={this.selectArrange.bind(this)}
            >
              {
                _.map(autoList, autoItem => {
                  return (
                    <Option key={autoItem.value} value={autoItem.value}>{autoItem.name}</Option>
                  )
                })
              }
            </Select>
          </div>
        </div>
        <div>
          <h4>参数映射</h4>
          {
            arrange_parameter && !_.isEmpty(arrange_parameter.required)
              ? <FormItem>
                {
                  _.map(arrange_parameter.required, (parItem) => {
                    const parItemType = tacheList[idx].dealRules[index].autoParams[parItem.name] && tacheList[idx].dealRules[index].autoParams[parItem.name].type
                    const parItemVal = tacheList[idx].dealRules[index].autoParams[parItem.name] && tacheList[idx].dealRules[index].autoParams[parItem.name].value

                    return (
                      <div key={parItem.name} className="parameter-item clearfix">
                        <div className="parameter-item-name">
                          <i className="parameter-item-name-require" />{parItem.name}
                        </div>
                        <i className="iconfont icon-xiayi parameter-item-jiantou" />
                        <div className="parameter-item-value">
                          {
                            parItemType === 'field'
                              ? <Select
                                showSearch
                                optionFilterProp="children"
                                notFoundContent={i18n('globe.notFound', '无法找到')}
                                onChange={this.changeparItem.bind(this, parItem, 'field')}
                                value={parItemVal}
                                style={{ width: '100%' }}
                                size="large"
                              >
                                {
                                  _.map(parItem.fieldList, field => {
                                    return (
                                      <Option value={'${' + field.code + '}'} key={field.code}>{field.fieldName}</Option>
                                    )
                                  })
                                }
                              </Select>
                              : <Input
                                value={parItemVal}
                                autosize={{ minRows: 2, maxRows: 8 }}
                                type={parItem.type === 'passwd' ? 'password' : 'textarea'}
                                onChange={this.changeparItem.bind(this, parItem, 'text')}
                              />
                          }
                        </div>
                        <Button
                          style={{ width: '80px', height: '26px' }}
                          size="small"
                          type="primary"
                          className="parameter-item-typebtn"
                          onClick={this.onChangeType.bind(this, parItemType, parItem)}
                          disabled={['ci', 'date', 'user'].indexOf(parItem.autoType) !== -1}
                        >
                          {
                            parItemType === 'field' ? '设置参数值' : '插入字段'
                          }
                        </Button>
                      </div>
                    )
                  })
                }
              </FormItem>
              : null
          }
          {
            !_.isEmpty(checkeOptional)
              ? <FormItem>
                {
                  _.map(checkeOptional, (parItem) => {
                    const parItemType = tacheList[idx].dealRules[index].autoParams[parItem.name] && tacheList[idx].dealRules[index].autoParams[parItem.name].type
                    const parItemVal = tacheList[idx].dealRules[index].autoParams[parItem.name] && tacheList[idx].dealRules[index].autoParams[parItem.name].value
                    return (
                      <div key={parItem.name} className="parameter-item clearfix">
                        <div className="parameter-item-name">{parItem.name}</div>
                        <i className="iconfont icon-xiayi parameter-item-jiantou" />
                        <div className="parameter-item-value">
                          {
                            parItemType === 'field'
                              ? <Select
                                showSearch
                                optionFilterProp="children"
                                notFoundContent={i18n('globe.notFound', '无法找到')}
                                onChange={this.changeparItem.bind(this, parItem, 'field')}
                                value={parItemVal}
                                style={{ width: '100%' }}
                                size="large"
                              >
                                {
                                  _.map(parItem.fieldList, field => {
                                    return (
                                      <Option value={'${' + field.code + '}'} key={field.code}>{field.fieldName}</Option>
                                    )
                                  })
                                }
                              </Select>
                              : <Input
                                value={parItemVal}
                                type={parItem.type === 'passwd' ? 'password' : 'textarea'}
                                autosize={{ minRows: 2, maxRows: 8 }}
                                onChange={this.changeparItem.bind(this, parItem, 'text')}
                              />
                          }
                        </div>
                        <Button
                          style={{ width: '80px', height: '26px' }}
                          size="small"
                          type="primary"
                          className="parameter-item-typebtn"
                          onClick={this.onChangeType.bind(this, parItemType, parItem)}
                          disabled={['ci', 'date', 'user'].indexOf(parItem.autoType) !== -1}
                        >
                          {
                            parItemType === 'field' ? '设置参数值' : '插入字段'
                          }
                        </Button>
                        <i onClick={this.delParameter.bind(this, parItem)} className="iconfont icon-shanchu" />
                      </div>
                    )
                  })
                }
              </FormItem>
              : null
          }
          <FormItem>
            <Dropdown overlay={this.createMenu.call(this)} trigger={['click']}>
              <Button
                disabled={!!_.isEmpty(surplusOptional)}
                type="primary"
              >
                <i className="iconfont icon-tianjiaxiao" /> 添加更多参数
              </Button>
            </Dropdown>
          </FormItem>
        </div>
      </div>
    )
  }
}
export default class AutoMation extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeKey: [],
      arrange_parameter: {},
      surplusOptional: [], // 当前剩余下的编排参数
      checkeOptional: [], // 当前选中的编排参数
      fieldList: []
    }
    this.selectArrange = this.selectArrange.bind(this)
  }

  componentDidMount () {
    const { tacheList } = this.props
    const { item } = this.props.active
    const activeKey = []
    // 进行遍历对自动阶段的关联编排的折叠面板加上key
    _.forEach(tacheList, (tache, idx) => {
      if (item.id && tache.id === item.id || item.key && item.key === tache.key) {
        _.map(tache.dealRules, (rule, index) => {
          rule.key = uuidv4()
          // 默认展开第一个
          if (index === 0) {
            activeKey.push(rule.key)
            rule.autoId && this.getAutoParams(idx, rule.autoId).then(data => {
              this.setState({
                arrange_parameter: data.arrange_parameter,
                surplusOptional: data.surplusOptional,
                checkeOptional: data.checkeOptional
              })
            })
          }
        })
        return false
      }
    })

    // 获取全部字段
    MonitAction.getConditionTypesWithoutModel().then(data => {
      const fliterData = data.filter((item) => {
        if (['status', 'activity'].indexOf(item.code) === -1) {
          return item
        }
      })
      this.setState({
        fieldList: fliterData,
        activeKey
      })
    })
  }

  // 选择编排选择编排
  selectArrange (idx, index, val) {
    const { tacheList } = this.props
    tacheList[idx].dealRules[index].autoId = val
    this.getAutoParams(idx, val).then(data => {
      // 选择新的编排的时候以前的参数清空并且进行数据初始化
      tacheList[idx].dealRules[index].autoParams = {}
      _.map(data.data, requireItem => {
        tacheList[idx].dealRules[index].autoParams[requireItem.name] = {
          value: requireItem.value,
          type: requireItem.value ? 'text' : 'field',
          autoType: requireItem.autoType
        }
      })
      this.setState({
        arrange_parameter: data.arrange_parameter,
        surplusOptional: data.surplusOptional,
        checkeOptional: data.checkeOptional
      })
    })
  }

  // 获取当前编排的参数
  getAutoParams (idx, autoId) {
    return new Promise((resolve) => {
      ModelAction.getAutoParams(autoId).done(data => {
        const { tacheList } = this.props
        let surplusOptional = data.optional
        let checkeOptional = []
        _.forEach(tacheList[idx].dealRules, rule => {
          if (rule.autoId === autoId) {
            const keys = _.keys(rule.autoParams)
            // 已经选中的编排参数
            checkeOptional = _.filter(data.optional, (item) => {
              return keys.indexOf(item.name) !== -1
            })
            // 剩余可选的编排参数
            surplusOptional = _.filter(data.optional, (item) => {
              return keys.indexOf(item.name) === -1
            })
            return false
          }
        })
        // 重新切换编排的时候要对必选的编排参数进行初始化
        resolve({
          data: data.required,
          arrange_parameter: data,
          surplusOptional,
          checkeOptional
        })
      })
    })
  }

  // 切换执行设置模式
  handleTabsActive (idx, key) {
    const { tacheList } = this.props
    tacheList[idx].executeType = key
    if (key === '1') {
      tacheList[idx].successJumpActivity = ''
      tacheList[idx].failActionType = '1'
      tacheList[idx].failJumpActivity = ''
      tacheList[idx].successJump = '0'
      tacheList[idx].failJump = '0'
    }
    this.forceUpdate()
  }

  // 添加关联编排
  addArrange (idx) {
    const { tacheList } = this.props
    const key = uuidv4()
    tacheList[idx].dealRules.push({
      autoId: '',
      autoParams: {},
      key: key,
      name: 'w',
      ruleType: 2,
      type: 4
    })
    this.setState({
      activeKey: [key],
      arrange_parameter: {},
      surplusOptional: [],
      checkeOptional: []
    })
  }

  // 切换折叠面板
  handleCollapse (idx, key) {
    const { tacheList } = this.props
    let autoId = ''
    // 打开面板的时候加载当前编排的参数
    _.forEach(tacheList[idx].dealRules, rule => {
      if (rule.key === key) {
        autoId = rule.autoId
        return false
      }
    })

    autoId
      ? this.getAutoParams(idx, autoId).then(data => {
        this.setState({
          arrange_parameter: data.arrange_parameter,
          surplusOptional: data.surplusOptional,
          checkeOptional: data.checkeOptional,
          activeKey: key
        })
      })
      : this.setState({
        activeKey: key
      })
  }

  // 上下移动
  handleMove (moveType, idx, index, e) {
    e.stopPropagation()
    const { tacheList } = this.props
    const temp = tacheList[idx].dealRules[index]
    if (moveType === 'down') {
      tacheList[idx].dealRules.splice(index, 1)
      tacheList[idx].dealRules.splice(index + 1, 0, temp)
    } else if (moveType === 'up') {
      tacheList[idx].dealRules.splice(index, 1)
      tacheList[idx].dealRules.splice(index - 1, 0, temp)
    }
    this.forceUpdate()
  }

  // 删除编排
  handleDel (idx, index, e) {
    e.stopPropagation()
    const { tacheList } = this.props
    if (tacheList[idx].dealRules.length === 1) {
      message.error(/* 最少保留一个编排 */ $.translate('automation', 'tip5'))
      return false
    }
    tacheList[idx].dealRules.splice(index, 1)
    this.forceUpdate()
  }

  // 创建折叠面板的头部
  crateHeader (autoId, idx, index) {
    const { tacheList, autoList } = this.props
    const len = tacheList[idx].dealRules.length - 1
    let name = ''
    _.forEach(autoList, autoItem => {
      if (autoItem.value === autoId) {
        name = autoItem.name
      }
    })
    return (
      <div className="collapse-panel-header clearfix">
        <div className="arrange-item-name">{name || '关联编排' } </div>
        <div className="arrange-item-setting">
          {
            index !== 0
              ? <i onClick={this.handleMove.bind(this, 'up', idx, index)} className="iconfont icon-shangyi" />
              : null
          }
          {
            index !== len
              ? <i onClick={this.handleMove.bind(this, 'down', idx, index)} className="iconfont icon-xiayi" />
              : null
          }
          <i className="iconfont icon-shanchu" onClick={this.handleDel.bind(this, idx, index)} />
        </div>
      </div>
    )
  }

  render () {
    const { tacheList, active, autoList } = this.props
    const { item } = active
    const { activeKey, arrange_parameter, surplusOptional, checkeOptional, fieldList } = this.state
    let idx = 0 // 下标
    _.forEach(tacheList, (tache, index) => {
      if (item.id && tache.id === item.id || item.key && item.key === tache.key) {
        idx = index
        return false
      }
    })

    const waitResult = (
      <div>
        <WaitResult
          type="succeed"
          idx={idx}
          tacheList={tacheList}
        />

        <WaitResult
          type="failure"
          idx={idx}
          tacheList={tacheList}
        />
      </div>
    )
    return (
      <div className="model-process-set-field model-process-automation ant-form-horizontal" id="proSetField">
        <FormItem label={'关联编排'} {...formItemLayout}>
          {
            !_.isEmpty(tacheList[idx].dealRules)
              ? <Collapse activeKey={activeKey} accordion onChange={this.handleCollapse.bind(this, idx)}>
                {
                  _.map(tacheList[idx].dealRules, (arrangeItem, index) => {
                    if (arrangeItem.key) {
                      return (
                        <Panel header={this.crateHeader(arrangeItem.autoId, idx, index)} key={arrangeItem.key}>
                          <ArrangeItem
                            idx={idx}
                            index={index}
                            autoList={autoList}
                            tacheList={tacheList}
                            fieldList={fieldList}
                            checkeOptional={checkeOptional}
                            surplusOptional={surplusOptional}
                            arrange_parameter={arrange_parameter}
                            selectArrange={this.selectArrange}
                          />
                        </Panel>
                      )
                    } else {
                      return null
                    }
                  })
                }
              </Collapse>
              : null
          }
          <Button type="primary" onClick={this.addArrange.bind(this, idx)}
            className={!_.isEmpty(tacheList[idx].dealRules) ? 'mt-15' : ''}>
            <i className="iconfont icon-tianjiaxiao" />{ '关联编排' }
          </Button>
        </FormItem>
        <FormItem style={{ marginTop: '20px' }} label={'执行设置'} {...formItemLayout}>
          <Tabs activeKey={'' + tacheList[idx].executeType} type="card" onChange={this.handleTabsActive.bind(this, idx)}>
            <TabPane tab={'等待执行结果'} key="0">{waitResult}</TabPane>
            <TabPane tab={'开始执行即继续流转'} key="1" />
          </Tabs>
        </FormItem>
      </div>
    )
  }
}
