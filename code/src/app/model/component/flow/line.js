import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Injectable, Inject } from '@uyun/everest-injectable'
import { CloseCircleOutlined, DownOutlined, PlusOutlined } from '@uyun/icons'
import {
  Form,
  Checkbox,
  Input,
  InputNumber,
  Select,
  Button,
  Dropdown,
  Menu,
  Modal,
  Row,
  Col
} from '@uyun/components'
import FlowStore from '../../store/flowStore'
import NewCountersign from './component/newCountersign'
import TriggerRules from '~/components/triggerRules'
const FormItem = Form.Item
const Option = Select.Option

@Injectable()
class Line extends Component {
  @Inject(FlowStore) flowStore
  static contextTypes = {
    modelId: PropTypes.string
  }

  state = {
    paramData: [],
    visible: false,
    data: this.props.item.showCondition || {
      when: 'all',
      conditionExpressions: [],
      nestingConditions: []
    }
  }

  onChange = (e) => {
    this.setAttr('visibleText', e.target.checked)
  }

  textChange = (e) => {
    this.setAttr('text', e.target.value)
  }

  sortChange = (value) => {
    this.setAttr('sort', value)
  }

  setAttr = (key, value) => {
    const { item } = this.props
    this.flowStore.setAttr(item.id, key, value, 'links')
  }

  handleMenuClick = ({ item, key }) => {
    const data = _.cloneDeep(this.props.item.variableVos) || []
    const selectedParam = _.filter(this.flowStore.allParam, (param) => {
      return param.id === key
    })
    const obj = {
      name: selectedParam[0].name,
      id: key,
      type: selectedParam[0].type,
      selectType:
        selectedParam[0].type === 4 || selectedParam[0].type === 7
          ? 'textbox'
          : selectedParam[0].type === 6
          ? 'fields'
          : 'custom'
    }
    data.push(obj)
    this.setAttr('variableVos', data)
    const { paramData } = this.state
    const Data = _.filter(paramData, (param) => {
      return param.id !== key
    })
    this.setState({
      paramData: Data
    })
  }

  componentDidMount() {
    const { item } = this.props
    const paramData = []
    _.map(this.flowStore.allParam, (param, index) => {
      let tmp = true
      _.map(item.variableVos, (param1) => {
        if (param.id === param1.id) {
          tmp = false
        }
      })
      if (tmp) {
        paramData.push(param)
      }
    })
    this.setState({
      paramData
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.item.id !== nextProps.item.id) {
      this.props.form.setFieldsValue({
        name: nextProps.item.text,
        flowCode: nextProps.item.flowCode
      })
      const paramData = []
      _.map(this.flowStore.allParam, (param, index) => {
        let tmp = true
        _.map(nextProps.item.variableVos, (param1) => {
          if (param.id === param1.id) {
            tmp = false
          }
        })
        if (tmp) {
          paramData.push(param)
        }
      })
      this.setState({
        paramData
      })
    }
    if (this.props.item.showCondition !== nextProps.item.showCondition) {
      this.setState({
        data: nextProps.item.showCondition || {
          when: 'all',
          conditionExpressions: [],
          nestingConditions: []
        }
      })
    }
  }

  handleUserList = (values, index) => {
    const newValue = []
    _.map(values, (value) => {
      newValue.push({ id: value.id, name: value.name })
    })
    const { item } = this.props
    const variableVos = item.variableVos
    variableVos[index].values = newValue
    this.setAttr('variableVos', variableVos)
  }

  changeParamList = (value, index, prop) => {
    const { item } = this.props
    const variableVos = item.variableVos
    if (prop === 'values') {
      value = value.map((item) => {
        return {
          key: item.key,
          label: item.label.props.children[0].props.children
        }
      })
    }
    // 切换部门列表、类型字段时，清除values
    if ((value === 'fields' || value === 'custom') && prop === 'selectType') {
      variableVos[index].values = []
    }
    if (value === 'fields' && prop === 'selectType') {
      delete variableVos[index].textValue
    }
    variableVos[index][prop] = value
    if (prop === 'selectType' && value === 'current_user_id') {
      variableVos[index].values = [
        {
          id: 'current_user_id',
          name: ''
        }
      ]
    }
    this.setAttr('variableVos', variableVos)
  }

  delParam = (param, index) => {
    const { item } = this.props
    const { paramData } = this.state
    const variableVos = item.variableVos
    variableVos.splice(index, 1)
    this.setAttr('variableVos', variableVos)
    const data = _.filter(this.flowStore.allParam, (ite) => {
      return ite.id === param.id
    })
    data && paramData.push(...data)
    this.setState({
      paramData
    })
  }

  changeVisible = () => {
    this.setState({ visible: true, ruleId: '' })
  }

  handleRule = (e) => {
    e.stopPropagation()
    this.setState({
      visible: true
    })
  }

  onCancel = () => {
    this.setState({
      visible: false,
      data: this.props.item.showCondition || {
        when: 'all',
        conditionExpressions: [],
        nestingConditions: []
      }
    })
  }

  handleOk = () => {
    this.setAttr('showCondition', this.state.data)
    this.onCancel()
  }

  triggerChange = (value) => {
    this.setState({
      data: value
    })
  }

  delTrigger = (e) => {
    e.stopPropagation()
    this.setAttr('showCondition', null)
  }

  render() {
    const { item } = this.props
    const { getFieldDecorator } = this.props.form
    const { visible, data } = this.state
    const menu = (
      <Menu onClick={this.handleMenuClick} className="line-menu-wrap">
        {_.map(this.state.paramData, (item, index) => {
          if (!item.is_builtin && !item.is_plugin) {
            return <Menu.Item key={item.id}>{item.name}</Menu.Item>
          }
        })}
      </Menu>
    )
    return (
      <div id="line">
        <Row gutter={8}>
          <Col span={4} className="left_label">
            <div className="required-item">
              <span className="required-item-icon">*</span>
              <span className="required-item-name">{i18n('name', '名称')}</span>
            </div>
          </Col>
          <Col span={20}>
            <div>
              <Checkbox
                checked={item.visibleText}
                onChange={this.onChange}
                style={{ lineHeight: '39px' }}
              >
                {i18n('conf.model.proces.block', '显示连线名称')}
              </Checkbox>{' '}
            </div>
            <FormItem>
              {getFieldDecorator('name', {
                initialValue: item.text,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: i18n('ticket.forms.pinputName', '请输入名称')
                  },
                  {
                    max: 20,
                    message: i18n('ticket.forms.NameLength', '连线名称最长20个字符')
                  },
                  {
                    pattern: /^((?!&|;|$|%|>|<|`|"|\\|!|\|).)*$/,
                    message: i18n('ticket.true.name', '名称不能含有特殊字符')
                  }
                ]
              })(<Input onChange={this.textChange} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={4} className="left_label">
            <div className="required-item">
              <span className="required-item-icon">*</span>
              <span className="required-item-name">{i18n('conf.model.field.code', '编码')}</span>
            </div>
          </Col>
          <Col span={20}>
            <FormItem>
              {getFieldDecorator('flowCode', {
                initialValue: item.flowCode,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: i18n('ticket.forms.inputParamCode', '请输入编码')
                  },
                  {
                    min: 2,
                    message: i18n('ticket.forms.NodeCodeMinLength', '编码最少2个字符')
                  },
                  {
                    max: 20,
                    message: i18n('ticket.forms.NodeCodeLength', '编码最长20个字符')
                  },
                  {
                    pattern: /^[a-zA-Z0-9_]+$/,
                    message: i18n('field_create_code_error1', '编码只能为英文数字下划线')
                  }
                ]
              })(
                <Input
                  onChange={(e) => {
                    this.setAttr('flowCode', e.target.value)
                  }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={4} className="left_label">
            <div className="required-item">
              <span className="required-item-icon">*</span>
              <span className="required-item-name">{i18n('conf.model.proces.sort', '排序')}</span>
            </div>
          </Col>
          <Col span={20}>
            <FormItem>
              <InputNumber
                onChange={this.sortChange}
                value={item.sort || 0}
                min={0}
                precision={0}
              />
            </FormItem>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col span={4} className="left_label">
            <div className="required-item" style={{ lineHeight: '28px' }}>
              <span>{i18n('line_hide_rules', '隐藏条件')}</span>
            </div>
          </Col>
          <Col span={20} style={{ marginBottom: '16px' }}>
            {_.isEmpty(item.showCondition) ? (
              <div className="required-content" onClick={this.changeVisible}>
                <PlusOutlined />
                {i18n('edit_hide_rules', '添加隐藏条件')}
              </div>
            ) : (
              <div className="coll-header" onClick={this.handleRule}>
                {i18n('line_hide_rules', '隐藏条件')}
                <div className="fr header-del" onClick={this.delTrigger}>
                  <i className="iconfont icon-shanchu" />
                </div>
              </div>
            )}
          </Col>
        </Row>

        {visible && (
          <Modal
            title={i18n('line_hide_rules', '隐藏条件')}
            visible={visible}
            maskClosable={false}
            width="777px"
            onOk={this.handleOk}
            onCancel={this.onCancel}
            id="notification-wrap"
          >
            <div style={{ width: '700px' }}>
              <TriggerRules
                value={data}
                modelId={this.context.modelId}
                onChange={this.triggerChange}
              />
            </div>
          </Modal>
        )}

        <Row gutter={8}>
          <Col span={4} className="left_label">
            <div className="required-item">
              <span className="required-item-name">
                {i18n('conf.model.process.param', '变量设置')}
              </span>
            </div>
          </Col>
          <Col span={20}>
            <Dropdown overlay={menu}>
              <Button>
                {i18n('conf.model.process.addParam', '添加变量')} <DownOutlined />
              </Button>
            </Dropdown>
            <div className="line_param_wrap">
              {item.variableVos &&
                _.map(item.variableVos, (param, index) => {
                  const { selectType, type, name, textValue } = param
                  // const list = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] }// 人员格式转化
                  // const values = param.values.map(item => ({ ...item, type }))
                  const values = (param.values || []).map((item) => ({ ...item, type }))
                  // _.map(param.values || [], user => {
                  //   list[type] && list[type].push(user)
                  // })
                  // 0:用户组 1:用户 2:部门 3:角色 4:文本 5:数字
                  const typeName =
                    type === 1
                      ? i18n('line.ry', '（人员）')
                      : type === 0
                      ? i18n('line.yhz', '（用户组）')
                      : type === 2
                      ? i18n('line.bm', '（部门）')
                      : type === 3
                      ? i18n('line.js', '（角色）')
                      : type === 4
                      ? i18n('line.wb', '（文本）')
                      : type === 5
                      ? i18n('line.sz', '（数字）')
                      : type === 6
                      ? i18n('line.sj', '（时间）')
                      : type === 7
                      ? i18n('line.hj', '（环节）')
                      : ''
                  return (
                    <div className="line_param_content" key={index}>
                      <div className="line_param_title">
                        <span>{`${name} ${typeName}`}</span>
                        <CloseCircleOutlined
                          onClick={() => {
                            this.delParam(param, index)
                          }}
                        />
                      </div>
                      {/**
                       * 线 - 设置变量
                       *  用户类型的变量: 当前处理人- current_user_id, 用户类型字段-fields, 用户列表-custom
                       *  部门类型的变量 : 部门类型字段-fields, 部门列表-custom
                       *  用户组类型的变量 : 用户组列表-custom
                       *  角色类型的变量 : 角色列表-custom
                       *  文本类型的变量 :  文本框-textbox
                       *  数字类型的变量 :  文本框-textbox
                       */}
                      {type === 4 || type === 7 ? (
                        <Input.TextArea
                          autosize
                          value={textValue}
                          onChange={(e) => {
                            this.changeParamList(e.target.value, index, 'textValue')
                          }}
                        />
                      ) : type === 6 ? (
                        <Select
                          showSearch
                          optionFilterProp="label"
                          style={{ width: '100%' }}
                          value={param.values ? param.values[0] : []}
                          labelInValue
                          onChange={(value) => {
                            this.changeParamList([value], index, 'values')
                          }}
                        >
                          {_.map(this.flowStore.timeFields, (time) => {
                            return (
                              <Option
                                value={time.id}
                                key={time.id}
                                label={`${time.name} | ${time.code}`}
                              >
                                <div
                                  className="trigger-condition-item-content-select-option-div"
                                  title={`${time.name} | ${time.code}`}
                                >
                                  <span className="shenglue">{time.name}</span>
                                  <span className="shenglue">{time.code}</span>
                                </div>
                              </Option>
                            )
                          })}
                        </Select>
                      ) : type === 5 ? (
                        <div>
                          <Select
                            className="line_param_content_fl"
                            value={selectType}
                            onChange={(value) => {
                              this.changeParamList(value, index, 'selectType')
                            }}
                          >
                            <Option value="custom">输入</Option>
                            <Option value="fields">
                              {i18n('conf.model.process.timeArrField', '时间段类型字段')}
                            </Option>
                          </Select>
                          <div className="line_param_content_fr">
                            {selectType === 'custom' ? (
                              <InputNumber
                                value={textValue}
                                max={10000000}
                                min={-10000000}
                                onChange={(value) => {
                                  this.changeParamList(value, index, 'textValue')
                                }}
                              />
                            ) : selectType === 'fields' ? (
                              <Select
                                showSearch
                                optionFilterProp="label"
                                style={{ width: '100%' }}
                                value={param.values || []}
                                labelInValue
                                mode="multiple"
                                onChange={(value) => {
                                  const val = value.pop()
                                  this.changeParamList(val ? [val] : [], index, 'values')
                                }}
                              >
                                {_.map(this.flowStore.timeIntervalFields, (timeInterval) => {
                                  return (
                                    <Option
                                      value={timeInterval.id}
                                      key={timeInterval.id}
                                      label={`${timeInterval.name} | ${timeInterval.code}`}
                                    >
                                      <div
                                        className="trigger-condition-item-content-select-option-div"
                                        title={`${timeInterval.name} | ${timeInterval.code}`}
                                      >
                                        <span className="shenglue">{timeInterval.name}</span>
                                        <span className="shenglue">{timeInterval.code}</span>
                                      </div>
                                    </Option>
                                  )
                                })}
                              </Select>
                            ) : null}
                          </div>
                        </div>
                      ) : type === 0 ? (
                        <div>
                          <Select
                            className="line_param_content_fl"
                            value={selectType}
                            onChange={(value) => {
                              this.changeParamList(value, index, 'selectType')
                            }}
                          >
                            <Option value="custom">
                              {i18n('conf.model.process.userGroupList', '用户组列表')}
                            </Option>
                            <Option value="fields">
                              {i18n('conf.model.process.userGroupField', '用户组类型字段')}
                            </Option>
                          </Select>
                          <div className="line_param_content_fr">
                            {selectType === 'custom' ? (
                              <NewCountersign
                                values={values}
                                handleUserChange={(value) => {
                                  this.handleUserList(value, index)
                                }}
                                tabs={[0]}
                                showTypes={['groups']}
                                modalTitle={'用户组选择'}
                              />
                            ) : selectType === 'fields' ? (
                              <Select
                                showSearch
                                optionFilterProp="label"
                                style={{ width: '100%' }}
                                value={param.values || []}
                                labelInValue
                                mode="multiple"
                                onChange={(value) => {
                                  this.changeParamList(value, index, 'values')
                                }}
                              >
                                {_.map(this.flowStore.userGroupFields, (usergroup) => {
                                  return (
                                    <Option
                                      value={usergroup.id}
                                      key={usergroup.id}
                                      label={`${usergroup.name} | ${usergroup.code}`}
                                    >
                                      <div
                                        className="trigger-condition-item-content-select-option-div"
                                        title={`${usergroup.name} | ${usergroup.code}`}
                                      >
                                        <span className="shenglue">{usergroup.name}</span>
                                        <span className="shenglue">{usergroup.code}</span>
                                      </div>
                                    </Option>
                                  )
                                })}
                              </Select>
                            ) : null}
                          </div>
                        </div>
                      ) : // <NewCountersign
                      //   values={values}
                      //   handleUserChange={(value) => {
                      //     this.handleUserList(value, index)
                      //   }}
                      //   tabs={[0]}
                      // />
                      type === 3 ? (
                        <NewCountersign
                          values={values}
                          handleUserChange={(value) => {
                            this.handleUserList(value, index)
                          }}
                          tabs={[3]}
                          showTypes={['roles_custom']}
                        />
                      ) : type === 1 ? (
                        <div>
                          <Select
                            className="line_param_content_fl"
                            value={selectType}
                            onChange={(value) => {
                              this.changeParamList(value, index, 'selectType')
                            }}
                          >
                            <Option value="custom">
                              {i18n('conf.model.process.userList', '用户列表')}
                            </Option>
                            <Option value="fields">
                              {i18n('conf.model.process.userField', '用户类型字段')}
                            </Option>
                            <Option value="current_user_id">
                              {i18n('conf.model.process.currentUser', '当前处理人')}
                            </Option>
                          </Select>
                          <div className="line_param_content_fr">
                            {selectType === 'current_user_id' ? (
                              <Input value={'current_user_id'} disabled />
                            ) : selectType === 'custom' ? (
                              <NewCountersign
                                values={values}
                                handleUserChange={(value) => {
                                  this.handleUserList(value, index)
                                }}
                                tabs={[1]}
                                showTypes={['users']}
                              />
                            ) : selectType === 'fields' ? (
                              <Select
                                showSearch
                                optionFilterProp="label"
                                style={{ width: '100%' }}
                                value={param.values || []}
                                labelInValue
                                mode="multiple"
                                onChange={(value) => {
                                  this.changeParamList(value, index, 'values')
                                }}
                              >
                                {_.map(this.flowStore.userFields, (user) => {
                                  return (
                                    <Option
                                      value={user.id}
                                      key={user.id}
                                      label={`${user.name} | ${user.code}`}
                                    >
                                      <div
                                        className="trigger-condition-item-content-select-option-div"
                                        title={`${user.name} | ${user.code}`}
                                      >
                                        <span className="shenglue">{user.name}</span>
                                        <span className="shenglue">{user.code}</span>
                                      </div>
                                    </Option>
                                  )
                                })}
                              </Select>
                            ) : null}
                          </div>
                        </div>
                      ) : type === 2 ? (
                        <div>
                          <Select
                            className="line_param_content_fl"
                            value={selectType}
                            onChange={(value) => {
                              this.changeParamList(value, index, 'selectType')
                            }}
                          >
                            <Option value="custom">
                              {i18n('conf.model.process.departList', '部门列表')}
                            </Option>
                            <Option value="fields">
                              {i18n('conf.model.process.departField', '部门类型字段')}
                            </Option>
                          </Select>
                          <div className="line_param_content_fr">
                            {selectType === 'custom' ? (
                              <NewCountersign
                                values={values}
                                handleUserChange={(value) => {
                                  this.handleUserList(value, index)
                                }}
                                tabs={[2]}
                                showTypes={['departs_custom']}
                                modalTitle={'部门选择'}
                              />
                            ) : selectType === 'fields' ? (
                              <Select
                                showSearch
                                optionFilterProp="label"
                                style={{ width: '100%' }}
                                value={param.values || []}
                                labelInValue
                                mode="multiple"
                                onChange={(value) => {
                                  this.changeParamList(value, index, 'values')
                                }}
                              >
                                {_.map(this.flowStore.departFields, (depart) => {
                                  return (
                                    <Option
                                      value={depart.id}
                                      key={depart.id}
                                      label={`${depart.name} | ${depart.code}`}
                                    >
                                      <div
                                        className="trigger-condition-item-content-select-option-div"
                                        title={`${depart.name} | ${depart.code}`}
                                      >
                                        <span className="shenglue">{depart.name}</span>
                                        <span className="shenglue">{depart.code}</span>
                                      </div>
                                    </Option>
                                  )
                                })}
                              </Select>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

const LineWrap = Form.create()(Line)
export default LineWrap
