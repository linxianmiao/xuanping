import React, { Component } from 'react'
import { Form, Select, Row, Col } from '@uyun/components'
import Editor from '../../mention/MentionWithOption'
import UserWrap from './userWrap'

const FormItem = Form.Item
const Option = Select.Option

class Jump extends Component {
    state = {
      currents: [],
      value: '',
      taches: {},
      departs: [],
      isCheck: null,
      currDepart: null
    }

    componentWillReceiveProps (nextProps) {
      if (this.props.visible !== nextProps.visible) {
        this.setState({ value: '' })
      }
    }

    handleChange = val => {
      this.setState({
        value: val
      })
      this.props.form.setFieldsValue({ message: val })
    }

    componentDidMount () {
      this.props.modelId && !_.isEmpty(this.props.activitys) && this.props.isCreate &&
      this.setState({ taches: this.props.activitys })
      this.props.tache && this.formatCurrent(this.props.tache)
      // 调 是否 开启 组织机构 的 接口
      axios.get(API.CHECK_ORG).then(data => {
        this.setState({
          departs: data.departs || [],
          isCheck: data.isCheck,
          currDepart: !_.isEmpty(data.departs) ? data.departs[0].id : null
        })
      })
    }

    componentDidUpdate (prevProps) {
      if (!_.isEmpty(this.props.tache) && this.props.tache !== prevProps.tache) {
        this.formatCurrent(this.props.tache)
      }
    }

    formatCurrent = tache => {
      const current = []
      // 0：普通环节; 1:并行组; 2：并行环节
      if (tache.tacheType === 0 || tache.tacheType === 2) {
        const tacheTemp = {}
        tacheTemp.policy = tache.policy
        tacheTemp.users = tache.users
        tacheTemp.groups = tache.groups
        tacheTemp.isCountersign = tache.isCountersign
        tacheTemp.id = tache.id
        tacheTemp.name = tache.name
        tacheTemp.tacheType = tache.tacheType
        tacheTemp.jumpActivityId = tache.jumpActivityId // 判断节点的跳转时跳转到的环节id，用于选人
        tacheTemp.exclusiveGateway = tache.exclusiveGateway
        current.push(tacheTemp)
      // 1 是并行组
      } else if (tache.tacheType === 1) {
        _.map(tache.parallelismTaches, item => {
          const tacheTemp = {}
          tacheTemp.policy = item.policy
          tacheTemp.users = item.users
          tacheTemp.groups = item.groups
          tacheTemp.isCountersign = item.isCountersign
          tacheTemp.id = item.tacheId
          tacheTemp.name = item.tacheName
          tacheTemp.tacheType = item.tacheType
          tacheTemp.jumpActivityId = item.jumpActivityId
          tacheTemp.exclusiveGateway = item.exclusiveGateway
          current.push(tacheTemp)
        })
      }
      this.setState({ currents: current })
    }

    validate = () => {
      return new Promise((resolve, reject) => {
        this.props.form.validateFields((errors, values) => {
          if (errors) {
            reject(errors)
          } else {
            resolve(values)
          }
        })
      })
    }

    // 开启 组织机构  选择所属部门
    onChangeCheckOrg = val => {
      this.setState({
        currDepart: val
      })
    }

    _render = () => {
      const { getFieldDecorator, setFieldsValue } = this.props.form
      const { currents } = this.state
      const { modelId, modelType, id, caseId, isRequiredHandingSuggestion } = this.props
      let i = 0
      const dilver = {
        handleType: 'jump',
        formList: this.props.formList
      }
      return (
        <Form layout="vertical">
          {
          // showDepart（新建需要显示）
            this.props.showDepart && this.state.isCheck && !_.isEmpty(this.state.departs) // 要开启 组织机构 且 要有部门， 如果开启了 没有部门 也不显示了
              ? <FormItem label={i18n('config.user.domains', '所属机构')}>
                <div className="checkOrg">
                  {
                    getFieldDecorator('departId', {
                      initialValue: this.state.currDepart ? this.state.currDepart : undefined,
                      onChange: this.onChangeCheckOrg
                    })(
                      <Select>
                        {!_.isEmpty(this.state.departs) && this.state.departs.map(item => {
                          return (
                            <Option key={item.id}>{item.name}</Option>
                          )
                        })}
                      </Select>
                    )
                  }
                </div>
              </FormItem>
              : null
          }
          {
            !_.isEmpty(currents) && _.map(currents, item => {
              if (item.policy === 1) {
                let type = 'normal'
                if (this.props.ticketType === 'create') {
                  type = 'paralleljump'
                }
                if (+item.tacheType === 2) {
                  type = 'parallel'
                }
                i = i + 1
                return (
                  <div className="check-user-wrap" key={item.id}>
                    <Row className="line32">
                      <Col span={24} style={{ display: i > 1 ? 'none' : 'block', textAlign: 'left' }}>
                        <label className="ant-form-item-required">{i18n('ticket.operate.Choose_executor', '处理人')}</label>
                      </Col>
                      <Col span={24} className="user-wrap-col">
                        <div className="tache-name">
                          {item.name}
                        </div>
                        <UserWrap
                          modelType={modelType}
                          tacheId={item.exclusiveGateway ? item.jumpActivityId : item.id}
                          getFieldDecorator={getFieldDecorator}
                          setFieldsValue={setFieldsValue}
                          setFlowUser={this.props.setFlowUser}
                          modelId={modelId}
                          ticketId={id}
                          {...dilver}
                          caseId={caseId}
                          formList={this.props.formValue}
                          flowId={this.props.tache.activityFlowId}
                          orgId={this.state.currDepart || null} // 开启组织机构时  传 所属部门的id
                          currDepart={this.state.currDepart} // 开启组织机构时 选择部门 改变用户的选择
                          item={{
                            code: item.id,
                            type: type,
                            name: i18n('ticket.operate.Choose_executor', '处理人'),
                            isRequired: 1,
                            users: item,
                            showName: false
                          }}
                        />
                      </Col>

                    </Row>
                  </div>
                )
              }
            })
          }
          {_.map(this.state.taches, item => {
            if (item.policy === 2) {
              i = i + 1
              return (
                <div className="check-user-wrap" key={item.tacheId}>
                  <Row className="line32">
                    <Col span={24} style={{ display: i > 1 ? 'none' : 'block' }}>
                      <label className="ant-form-item-required">{i18n('ticket.operate.Choose_executor', '处理人')}</label>
                    </Col>
                    <Col span={24} className="user-wrap-col">
                      <div className="tache-name">
                        {item.tacheName}
                      </div>
                      <UserWrap
                        modelType={modelType}
                        getFieldDecorator={getFieldDecorator}
                        setFieldsValue={setFieldsValue}
                        tacheId={item.tacheId}
                        setFlowUser={this.props.setFlowUser}
                        modelId={item.subModelId || modelId}
                        ticketId={id}
                        {...dilver}
                        caseId={caseId}
                        formList={this.props.formValue}
                        flowId={this.props.tache.activityFlowId}
                        orgId={this.state.currDepart || null} // 开启组织机构时  传 所属部门的id
                        currDepart={this.state.currDepart} // 开启组织机构时 选择部门 改变用户的选择
                        item={{
                          code: item.tacheId,
                          type: 'create',
                          name: i18n('ticket.operate.Choose_executor', '处理人'),
                          isRequired: 1,
                          users: item,
                          showName: false
                        }}
                      />
                    </Col>
                  </Row>
                </div>
              )
            }
          })}
          { isRequiredHandingSuggestion !== 2 &&
            <FormItem label={i18n('ticket.detail.opinion', '意见')}>
              { getFieldDecorator('message', {
                initialValue: undefined,
                isRequired: true,
                rules: [{
                  min: 0,
                  max: 2000,
                  message: i18n('ticket.most_200', '最多2000字')
                }, {
                  required: isRequiredHandingSuggestion === 1,
                  message: i18n('please-input', '请输入')
                }],
                getValueFromEvent: function (data) {
                  return data
                }
              })(<Editor setFieldsValue={setFieldsValue} val={this.state.value} handleChange={this.handleChange} />)}
            </FormItem>}
        </Form>
      )
    }

    render () {
      return this.props.visible && this._render()
    }
}

export default Form.create()(Jump)
