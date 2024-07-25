import React, { Component } from 'react'
import limitFields from 'config/limitFields'
import ProcessRule from 'pages/config/model/processRule.jsx'
import Countersign from 'pages/config/model/countersign/index.jsx'
import AddField from 'pages/config/model/addField/index.jsx'
import Preview from 'pages/config/model/preview/index.jsx'
// import Trigger from '@uyun/itsm-web/lib/trigger'

import {
  Form,
  Input,
  Col,
  Row,
  Radio,
  Dropdown,
  Button,
  Tag,
  Tooltip,
  Menu,
  Modal
} from '@uyun/components'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 20 }
}
// 默认规则
class DefaultRule extends Component {
  constructor(props) {
    super(props)
    this.state = {
      err: {
        help: '',
        validateStatus: ''
      }
    }
    this.handleRadioChange = this.handleRadioChange.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleRadioChange(e) {
    this.props.defaultRuleChange(e.target.value, 0, 'radio')
  }

  handleChange(e) {
    const val = _.trim(e.target.value) || ''
    if (val.length === 0) {
      this.props.defaultRuleChange(val, 1, 'input')
      this.setState({
        err: {
          help: $.translate('config', 'model', 'checkRuleSpec'),
          validateStatus: 'error'
        }
      })
    } else if (val.length > limitFields.model.RuleExplain) {
      this.props.defaultRuleChange(val, 1, 'input')
      this.setState({
        err: {
          help: $.translate('config', 'model', 'checkRuleSpecLen'),
          validateStatus: 'error'
        }
      })
    } else {
      this.props.defaultRuleChange(val, 0, 'input')
      this.setState({
        err: {
          help: '',
          validateStatus: ''
        }
      })
    }
  }

  render() {
    const { tacheList } = this.props
    const { item } = this.props.active
    const { err } = this.state

    let defaultButton = true // 默认规则类型
    let submitName = '' // 默认规则内容
    let counterSign = 0 // 判断是不是 默认 会签 依次会签
    let isunrelated = false
    _.forEach(tacheList, (tache) => {
      if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
        defaultButton = tache.defaultButton
        submitName = tache.submitName
        counterSign = tache.counterSign
        isunrelated =
          !_.isEmpty(tache.dealRules) &&
          _.find(tache.dealRules, (deal) => deal.childModel && deal.childModel.needSuspend === 3)
        return false
      }
    })
    return (
      <div className="default-rule u4-form-horizontal">
        <FormItem {...formItemLayout} label={$.translate('config', 'model', 'defaultRules')}>
          <Row>
            <Col span={6}>
              <RadioGroup size="large" value={defaultButton} onChange={this.handleRadioChange}>
                <RadioButton value>{$.translate('config', 'model', 'reveal')}</RadioButton>
                <RadioButton value={false} disabled={counterSign !== 0 || isunrelated}>
                  {$.translate('config', 'model', 'shield')}
                </RadioButton>
              </RadioGroup>
            </Col>
            {defaultButton === true ? (
              <Col span={18}>
                <div className="rule-description">
                  <div className="default-rule-label">
                    <span>{$.translate('config', 'model', 'ruleNotes')}</span>
                  </div>
                  <FormItem help={err.help} validateStatus={err.validateStatus}>
                    <Input value={submitName} onChange={this.handleChange} />
                  </FormItem>
                </div>
              </Col>
            ) : null}
          </Row>
        </FormItem>
      </div>
    )
  }
}
// 人员范围
class Users extends Component {
  constructor(props) {
    super(props)
    this.handleChangeSign = this.handleChangeSign.bind(this)
    this.handleChangePolicy = this.handleChangePolicy.bind(this)
    this.addUserAndGroup = this.addUserAndGroup.bind(this)
    this.handlerCloseTag = this.handlerCloseTag.bind(this)
  }

  // 会签选择
  handleChangeSign(e) {
    this.props.handleChangeUser(e.target.value, 'sign')
  }

  handleChangePolicy(val) {
    this.props.handleChangeUser(val, 'policy')
  }

  // 删除用户
  handlerCloseTag(tag) {
    this.props.handleChangeUser(tag, 'delUser')
  }

  // 添加用户
  addUserAndGroup(data) {
    this.props.handleChangeUser(data, 'addUser')
  }

  render() {
    const { tacheList } = this.props
    const { item, data, type } = this.props.active
    let counterSign, policy, userAndGroupList
    if (type === 'flow') {
      _.forEach(tacheList, (tache) => {
        if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
          counterSign = tache.counterSign
          policy = tache.policy
          userAndGroupList = tache.userAndGroupList
          return false
        }
      })
    } else if (type === 'parallel') {
      _.forEach(tacheList, (tache) => {
        if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
          _.forEach(tache.parallelismActivityVos, (parall) => {
            if ((data.id && parall.id === data.id) || (data.key && parall.key === data.key)) {
              counterSign = parall.counterSign
              policy = parall.policy
              userAndGroupList = parall.userAndGroupList
              return false
            }
          })
        }
      })
    }
    const prop = {
      formItemLayout,
      counterSign: counterSign,
      policy: policy,
      userAndGroupList: userAndGroupList || [],
      handleChangeSign: this.handleChangeSign,
      handleChangePolicy: this.handleChangePolicy,
      addUserAndGroup: this.addUserAndGroup,
      handlerCloseTag: this.handlerCloseTag
    }
    return (
      <div className="w-model-form">
        <Countersign {...prop} />
      </div>
    )
  }
}
// 处理规则
class DetailRule extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { tacheList, handleProRule } = this.props
    const { item } = this.props.active
    let current = 0
    let checkTache = {}
    _.forEach(tacheList, (tache, idx) => {
      if ((item.id && item.id === tache.id) || (item.key && item.key === tache.key)) {
        current = idx
        checkTache = tache
      }
    })
    return (
      <Form horizontal>
        <FormItem {...formItemLayout} label={$.translate('config', 'model', 'processRules')}>
          <ProcessRule
            ref="processRule"
            tacheList={tacheList}
            currentTache={current}
            handleChange={(data) => handleProRule(data)}
            tache={checkTache}
            form={this.props.form}
            isGroup={checkTache.type}
            defaultButton={checkTache.defaultButton}
          />
        </FormItem>
      </Form>
    )
  }
}
// 阶段说明
class Description extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { handleDesChange } = this.props
    const { getFieldProps } = this.props.form
    const { item, data, type } = this.props.active
    const desc = type === 'flow' ? item.description : data.description
    const descriptionProps = getFieldProps('desc', {
      initialValue: desc,
      rules: [
        {
          min: 0,
          max: limitFields.config.modelDesc,
          message: $.translate('config', 'model', 'desc')
        }
      ]
    })
    return (
      <Form horizontal>
        <FormItem {...formItemLayout} label={$.translate('config', 'model', 'stageDesc')}>
          <Input
            type="textarea"
            {...descriptionProps}
            onBlur={() => handleDesChange()}
            placeholder={$.translate('config', 'model', 'complete')}
          />
        </FormItem>
      </Form>
    )
  }
}
// 字段选择
class FieldList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      addFieldVisible: false
    }
    this.showAddField = this.showAddField.bind(this)
    this.addFieldCancel = this.addFieldCancel.bind(this)
    this.showPreview = this.showPreview.bind(this)
    this.handleMenuClick = this.handleMenuClick.bind(this)
    this.addFieldOk = this.addFieldOk.bind(this)
  }

  // 展示字段弹框
  showAddField() {
    this.setState({
      addFieldVisible: true
    })
  }

  // 取消字段弹框
  addFieldCancel() {
    this.setState({
      addFieldVisible: false
    })
  }

  // 展示预览
  showPreview() {
    this.refs.preview.onShow()
  }

  // 创建Menu菜单
  createTacheMenu() {
    const { tacheList } = this.props
    const { item, data } = this.props.active
    const tacheMenuItems = []
    _.map(tacheList, (tache) => {
      if (tache.type) {
        _.map(tache.parallelismActivityVos, (parall) => {
          // data 存在undefined的情况
          if (
            data &&
            ((data.id && parall.id === data.id) || (data.key && parall.key === data.key))
          ) {
          } else {
            tacheMenuItems.push(<Menu.Item key={parall.id || parall.key}>{parall.name}</Menu.Item>)
          }
        })
      } else {
        if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
        } else {
          tacheMenuItems.push(<Menu.Item key={tache.id || tache.key}>{tache.name}</Menu.Item>)
        }
      }
    })

    const tacheMenu = <Menu onClick={this.handleMenuClick}>{tacheMenuItems}</Menu>
    return {
      tacheMenu,
      tacheMenuItems
    }
  }

  // 删除某个字段
  closeTag(tag) {
    const { type } = this.props.active
    const fieldList =
      type === 'flow' ? _.without(this.fieldList, tag) : _.without(this.fieldList, tag)
    this.props.handleFieldList(fieldList)
  }

  // 点击切换字段
  handleMenuClick(e) {
    const { tacheList } = this.props
    _.forEach(tacheList, (tache) => {
      if (tache.type) {
        _.map(tache.parallelismActivityVos, (parall) => {
          if (parall.id === e.key || parall.key === e.key) {
            this.props.handleFieldList(_.cloneDeep(parall.fieldList))
          }
        })
      } else {
        if (tache.id === e.key || tache.key === e.key) {
          this.props.handleFieldList(_.cloneDeep(tache.fieldList))
        }
      }
    })
  }

  // 字段弹框的提交
  addFieldOk(data) {
    const fieldList = data.slice(0)
    this.props.handleFieldList(fieldList)
    this.setState({
      addFieldVisible: false
    })
  }

  render() {
    const { tacheList } = this.props
    const { item, data, type } = this.props.active
    const { addFieldVisible } = this.state
    const { tacheMenu, tacheMenuItems } = this.createTacheMenu.call(this)
    this.fieldList = []
    // 当前选中的是第几阶段，默认为1，如果为0的时候，当并行组的时候会出现问题；
    let currentTache = 1
    if (type === 'flow') {
      _.forEach(tacheList, (tache, index) => {
        if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
          this.fieldList = tache.fieldList
          currentTache = index
          return false
        }
      })
    } else if (type === 'parallel') {
      _.forEach(tacheList, (tache) => {
        if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
          _.forEach(tache.parallelismActivityVos, (parall) => {
            if ((data.id && parall.id === data.id) || (data.key && parall.key === data.key)) {
              this.fieldList = parall.fieldList
              return false
            }
          })
        }
      })
    }

    return (
      <div className="ant-form-horizontal">
        <FormItem {...formItemLayout} label={$.translate('config', 'model', 'form')} required>
          {tacheMenuItems.length > 0 ? (
            <Tooltip placement="right" title={$.translate('config', 'model', 'link')}>
              <Dropdown.Button
                className="copy-field"
                onClick={this.showAddField}
                overlay={tacheMenu}
                type="primary"
              >
                <i className="iconfont icon-tianjiaxiao" />
                <span style={{ fontSize: 14 }}>{$.translate('config', 'model', 'addField')}</span>
              </Dropdown.Button>
            </Tooltip>
          ) : (
            <Button onClick={this.showAddField} type="primary" className="add-field">
              <i className="iconfont icon-tianjiaxiao" />{' '}
              {$.translate('config', 'model', 'addField')}
            </Button>
          )}
          <div className="preview-pos" onClick={this.showPreview} data-id="preview">
            <Button type="primary">{$.translate('config', 'model', 'preview')}</Button>
          </div>
          {!_.isEmpty(this.fieldList) ? (
            <div className="tags-list">
              {_.map(this.fieldList, (file) => {
                if (file.code === 'title') {
                  return <Tag key={file.id}>{file.name}</Tag>
                } else {
                  return (
                    <Tag key={file.id} closable onClose={this.closeTag.bind(this, file)}>
                      {file.name}
                    </Tag>
                  )
                }
              })}
            </div>
          ) : null}
        </FormItem>

        <Modal
          visible={addFieldVisible}
          onOk={this.addFieldOk}
          onCancel={this.addFieldCancel}
          footer={''}
          width={920}
          className="mymodelstyle formModalClass"
          title={$.translate('config', 'model', 'form2')}
        >
          <AddField
            title={$.translate('config', 'model', 'form2')}
            visible={addFieldVisible}
            onOk={this.addFieldOk}
            onCancel={this.addFieldCancel}
            data={this.fieldList}
            currentTache={currentTache}
          />
        </Modal>
        {/* 预览 */}
        <Preview ref="preview" fieldList={this.fieldList} />
      </div>
    )
  }
}

const ProRule = Form.create()(DetailRule)
const Desc = Form.create()(Description)
export default class ProcessSetField extends Component {
  constructor(props) {
    super(props)
    this.handleDesChange = this.handleDesChange.bind(this)
    this.handleProRule = this.handleProRule.bind(this)
    this.defaultRuleChange = this.defaultRuleChange.bind(this)
    this.handleChangeUser = this.handleChangeUser.bind(this)
    this.handleFieldList = this.handleFieldList.bind(this)
  }

  // 阶段说明
  handleDesChange() {
    const { tacheList } = this.props
    const { item, data, type } = this.props.active

    this.desc.validateFieldsAndScroll((errors, values) => {
      if (errors) {
        this.props.handleError(1)
        return false
      }
      this.props.handleError(0)
      if (type === 'flow') {
        _.forEach(tacheList, (tache) => {
          if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
            tache.description = values.desc
            return false
          }
        })
      } else if (type === 'parallel') {
        _.forEach(tacheList, (tache) => {
          if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
            _.forEach(tache.parallelismActivityVos, (parall) => {
              if ((data.id && parall.id === data.id) || (data.key && parall.key === data.key)) {
                parall.description = values.desc
                return false
              }
            })
          }
        })
      }
    })
  }

  // 处理规则
  handleProRule(data) {
    const { tacheList } = this.props
    const { item } = this.props.active
    _.forEach(tacheList, (tache) => {
      if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
        tache.dealRules = _.cloneDeep(data.dealRules)
        // 无关联时不能为屏蔽
        const isunrelated =
          !_.isEmpty(data.dealRules) &&
          _.find(data.dealRules, (deal) => deal.childModel.needSuspend === 3)
        if (isunrelated) {
          tache.defaultButton = true
        }
        return false
      }
    })
    this.forceUpdate()
  }

  // 通知策略
  getTriggerData = (value) => {
    const { tacheList } = this.props
    const { item, data, type } = this.props.active
    const arr = []
    value.map((d) => {
      const obj = {
        id: d.id,
        name: d.name,
        incident: d.incident,
        taskEndIncident: d.taskEndIncident,
        triggerConditions: d.triggerConditions
      }
      const paramArr = []
      d.params.map((param) => {
        const paramObj = {
          id: param.id,
          type: param.type,
          name: param.name
        }
        if (param.type === 'configTicket') {
          paramObj.executeParamPos = param.executeParamPos
        } else {
          const exeArr = []
          param.executeParamPos.map((p) => {
            const exeobj = {
              code: p.code,
              value: p.value,
              name: p.name,
              type: p.type
            }
            exeArr.push(exeobj)
            paramObj.executeParamPos = exeArr
          })
        }
        paramArr.push(paramObj)
      })
      obj.params = paramArr
      arr.push(obj)
    })
    if (type === 'flow') {
      _.forEach(tacheList, (tache) => {
        if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
          tache.notificationRules = arr
          return false
        }
      })
    } else {
      _.forEach(tacheList, (tache) => {
        if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
          _.forEach(tache.parallelismActivityVos, (parall) => {
            if ((data.id && parall.id === data.id) || (data.key && parall.key === data.key)) {
              parall.notificationRules = arr
              return false
            }
          })
        }
      })
    }
    // this.forceUpdate();
  }

  // 默认规则 ： val 值      falt 是否通过校验       type 判断是radio 还是input
  defaultRuleChange(val, falt, type) {
    const { tacheList } = this.props
    const { item } = this.props.active
    if (type === 'input') {
      _.forEach(tacheList, (tache) => {
        if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
          tache.submitName = val
          return false
        }
      })
    } else {
      _.forEach(tacheList, (tache) => {
        if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
          tache.defaultButton = val
          return false
        }
      })
    }
    if (falt) {
      this.props.handleError(1)
    } else {
      this.props.handleError(0)
    }
    this.forceUpdate()
  }

  // 添加用户
  handleChangeUser(val, userType) {
    const { tacheList } = this.props
    const { item, data, type } = this.props.active
    if (type === 'flow') {
      _.forEach(tacheList, (tache) => {
        if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
          switch (userType) {
            case 'sign':
              tache.counterSign = +val
              tache.policy = +val !== 0 ? (tache.policy === 3 ? '1' : tache.policy) : tache.policy
              tache.defaultButton = +val !== 0 ? true : tache.defaultButton // 选择会签或依次会签时 默认规则 不能选择 屏蔽（禁用）
              tache.dealRules = tache.dealRules // 切换 默认 和 会签  防止默认状态下的处理规则 有校验时，
              break
            case 'policy':
              tache.policy = +val
              break
            case 'delUser':
              _.pull(tache.userAndGroupList, val)
              break
            case 'addUser':
              tache.userAndGroupList = val
              break
            default:
              null
          }
          return false
        }
      })
    } else if (type === 'parallel') {
      _.forEach(tacheList, (tache) => {
        if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
          _.forEach(tache.parallelismActivityVos, (parall) => {
            if ((data.id && parall.id === data.id) || (data.key && parall.key === data.key)) {
              switch (userType) {
                case 'sign':
                  parall.counterSign = +val
                  parall.policy =
                    +val !== 0 ? (parall.policy === 3 ? '1' : parall.policy) : parall.policy
                  break
                case 'policy':
                  parall.policy = +val
                  break
                case 'delUser':
                  _.pull(parall.userAndGroupList, val)
                  break
                case 'addUser':
                  parall.userAndGroupList = val
                  break
                default:
                  null
              }
              return false
            }
          })
        }
      })
    }
    this.forceUpdate()
  }

  // 字段选择
  handleFieldList(fieldList) {
    const { tacheList } = this.props
    const { item, data, type } = this.props.active
    if (type === 'flow') {
      _.forEach(tacheList, (tache) => {
        if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
          tache.fieldList = fieldList
          return false
        }
      })
    } else if (type === 'parallel') {
      _.forEach(tacheList, (tache) => {
        if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
          _.forEach(tache.parallelismActivityVos, (parall) => {
            if ((data.id && parall.id === data.id) || (data.key && parall.key === data.key)) {
              parall.fieldList = fieldList
              return false
            }
          })
        }
      })
    }
    this.forceUpdate()
  }

  render() {
    const { tacheList, active } = this.props
    const { item, data, type } = this.props.active
    const prop = {
      active,
      tacheList
    }
    let idx = 0
    _.forEach(tacheList, (tache, index) => {
      if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
        idx = index
        return false
      }
    })
    // 是否显示人员范围
    const isShowUsers = (type === 'flow' && idx && !item.type) || type === 'parallel'
    // 是否显示默认规则
    const isShowDefaultRule = type === 'flow' && !item.type
    // 是否显示处理规则
    const isShowProRule = type !== 'parallel'
    // 是否显示字段
    const isShowFieldList = !item.type || type === 'parallel'
    // 是否显示通知策略
    const isShowTrigger = !item.type || type === 'parallel'

    let notificationRules = active.item.notificationRules
    if (type === 'parallel') {
      _.forEach(tacheList, (tache) => {
        if ((item.id && tache.id === item.id) || (item.key && item.key === tache.key)) {
          _.forEach(tache.parallelismActivityVos, (parall) => {
            if ((data.id && parall.id === data.id) || (data.key && parall.key === data.key)) {
              // parall.notificationRules = arr;
              notificationRules = parall.notificationRules
              // return false;
            }
          })
        }
      })
    }

    return (
      <div className="model-process-set-field" id="proSetField">
        {
          /* 人员范围 并行组与第一阶段是没有人员范围 */
          isShowUsers ? (
            <Users
              ref={(node) => (this.users = node)}
              handleChangeUser={this.handleChangeUser}
              {...prop}
            />
          ) : null
        }
        {
          /* 默认规则  并行组,并行环节无默认规则 */
          isShowDefaultRule ? (
            <DefaultRule
              ref={(node) => (this.defaultRule = node)}
              defaultRuleChange={this.defaultRuleChange}
              {...prop}
            />
          ) : null
        }
        {
          /* 处理规则  并行环节没有处理规则 ， 并行组的处理规则只能是跳转 */
          isShowProRule ? (
            <ProRule
              ref={(node) => (this.proRule = node)}
              handleProRule={this.handleProRule}
              {...prop}
            />
          ) : null
        }
        {/* {
          isShowTrigger
            ? <Trigger
              {...prop}
              defaultValue={notificationRules}
              ref={node => this.trigger = node}
              getData={this.getTriggerData}
            /> : null
        } */}

        {
          /* 默认规则  并行组无字段的选择 */
          isShowFieldList ? (
            <FieldList
              ref={(node) => (this.fieldList = node)}
              handleFieldList={this.handleFieldList}
              {...prop}
            />
          ) : null
        }
        {
          /* 阶段描述，任何环节都有 */
          <Desc
            ref={(node) => (this.desc = node)}
            handleDesChange={this.handleDesChange}
            {...prop}
          />
        }
      </div>
    )
  }
}
