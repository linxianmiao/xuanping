import React, { Component } from 'react'
import { Form, Select, Row, Col } from '@uyun/components'
import Editor from '../../mention/MentionWithOption'
import AdvancedUser from './advancedUser'

const FormItem = Form.Item
const Option = Select.Option

class Jump extends Component {
    state = {
      currents: [],
      value: '',
      taches: {},
      departs: [],
      isCheck: null,
      currDepart: null,
      defaultStaffObj: {}
    }

    componentWillReceiveProps (nextProps) {
      if (this.props.visible !== nextProps.visible) {
        this.setState({ value: '' })
      }
    }

    componentDidMount () {
      this.props.modelId && !_.isEmpty(this.props.activitys) && this.props.isCreate &&
      this.setState({ taches: this.props.activitys }, () => {
        // 获取指定的默认处理人
        this.queryDefaultStaff(this.state.taches.map(tache => tache.tacheId))
      })
      //   this.props.tache && this.formatCurrent(this.props.tache)
      // 调 是否 开启 组织机构 的 接口
      axios.get(API.CHECK_ORG).then(data => {
        this.setState({
          departs: data.departs || [],
          isCheck: data.isCheck,
          currDepart: !_.isEmpty(data.departs) ? data.departs[0].id : null
        })
      })
    }

    queryDefaultStaff = async tacheIds => {
      const { modelId, id, caseId, formValue, flowId } = this.props
      const body = {
        modelId,
        tacheIds,
        ticketId: id,
        caseId,
        form: formValue,
        flowId
      }

      const res = await axios.post(API.queryDefaultStaff, body) || {}

      this.setState({
        defaultStaffObj: res
      })
    }

    // 开启 组织机构  选择所属部门
    onChangeCheckOrg = val => {
      this.setState({
        currDepart: val
      })
    }

    handleChange = val => {
      this.setState({
        value: val
      })
      this.props.form.setFieldsValue({ message: val })
    }

    _render = () => {
      const { getFieldDecorator, setFieldsValue } = this.props.form
      const { modelId, formValue, id, caseId, isRequiredHandingSuggestion } = this.props
      const { defaultStaffObj } = this.state
      let i = 0
      const dilver = {
        handleType: 'create',
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
          {_.map(this.state.taches, item => {
            i = i + 1
            const tacheName = item.subProcess && item.parentTacheName ? item.parentTacheName + '：' + item.tacheName : item.tacheName
            return (
              <div className="check-user-wrap" key={item.tacheId}>
                <Row className="line32">
                  <Col span={24} style={{ display: i > 1 ? 'none' : 'block' }}>
                    <label className="ant-form-item-required">{i18n('ticket.operate.Choose_executor', '处理人')}</label>
                  </Col>
                  <Col span={24} className="user-wrap-col">
                    <div className="tache-name">
                      {tacheName}
                    </div>
                    <AdvancedUser
                      defaultStaff={defaultStaffObj[item.tacheId]}
                      getFieldDecorator={getFieldDecorator}
                      setFieldsValue={setFieldsValue}
                      tacheId={item.tacheId}
                      setFlowUser={this.props.setFlowUser}
                      modelId={item.modelId || modelId}
                      ticketId={id}
                      {...dilver}
                      caseId={caseId}
                      formList={formValue}
                      flowId={this.props.flowId}
                      orgId={this.state.currDepart || null} // 开启组织机构时  传 所属部门的id
                      currDepart={this.state.currDepart} // 开启组织机构时 选择部门 改变用户的选择
                      item={{
                        code: item.tacheId,
                        type: 'create',
                        name: i18n('ticket.operate.Choose_executor', '处理人'),
                        isRequired: 1,
                        users: item,
                        showName: false }}
                    />
                  </Col>
                </Row>
              </div>
            )
          })}
          { isRequiredHandingSuggestion && isRequiredHandingSuggestion !== 2 &&
            <FormItem label={i18n('ticket.detail.opinion', '意见')}>
              { getFieldDecorator('message', {
                initialValue: undefined,
                isRequired: true,
                rules: [{
                  min: 0,
                  max: 2000,
                  message: i18n('ticket.create.most_opinion', '处理意见最多2000字')
                }, {
                  required: isRequiredHandingSuggestion === 1,
                  message: i18n('ticket.create.input.opinion', '请输入处理意见')
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