import React, { Component } from 'react'
import { Form, Row, Col } from '@uyun/components'
import Editor from '../../mention/MentionWithOption'
import UserWrap from './userWrap'

const FormItem = Form.Item

class Submodel extends Component {
    state = {
      value: '',
      nextActivitys: [],
      subModelActivitys: [],
      tache: {},
      defaultStaffObj: {}
    }

    componentWillReceiveProps (nextProps) {
      if (this.props.visible !== nextProps.visible) {
        this.setState({ value: '' })
      }
    }

    handleChange = val => {
      this.setState({ value: val })
      this.props.form.setFieldsValue({ message: val })
    }

    componentDidMount () {
      // 获取下一环节信息 并且对下一环节信息进行处理
      // 判断下一环节是否并行环节 及处理处理人指定策略
      if (this.props.submodelType === 'submodelJumpEnd') {
        this.formatCurrent(this.props.tache)
      }
      // 无关联或者挂起恢复在当前阶段不用选择父流程
      if (!(this.props.needSuspend === 3 || this.props.needSuspend === 0)) {
      // axios.get(API.GET_ACTIVITY_BY_ID(this.props.id, 1)).then(data => {
        this.setState({
          nextActivitys: this.props.nextActivity
        })
      // })
      }

      // 处理子流程信息
      if (!_.isEmpty(this.props.model)) {
        const childModel = this.props.model.item.childModel
        // const tacheVoList = childModel ? childModel.tacheVoList : null
        const tacheVoList = this.props.model.activitys
        const subModelActivitys = []

        _.map(tacheVoList, item => {
          if (!_.isEmpty(item.parallelismTaches)) {
            _.map(item.parallelismTaches, item2 => {
              const temp = {}
              temp.tacheId = item2.tacheId
              temp.tacheName = item2.tacheName
              temp.policy = item2.policy
              temp.users = item2.users
              item.groups = item2.groups
              item.isCountersign = item2.isCountersign
              subModelActivitys.push(temp)
            })
          } else {
            const temp = {}
            temp.tacheId = item.tacheId
            temp.tacheName = item.tacheName
            temp.policy = item.policy
            temp.users = item.users
            temp.groups = item.groups
            temp.isCountersign = item.isCountersign
            temp.subProcess = item.subProcess
            temp.parentTacheName = item.parentTacheName
            subModelActivitys.push(temp)
          }
        })
        this.setState({ subModelActivitys: subModelActivitys }, () => {
          // 获取指定的默认处理人
          this.queryDefaultStaff(this.state.subModelActivitys.map(tache => tache.tacheId))
        })
      }
    }

    componentDidUpdate (prevProps) {
      if (prevProps.model !== this.props.model) {
        if (!_.isEmpty(this.props.model)) {
          // const tacheVoList = this.props.model.item.childModel.tacheVoList
          const tacheVoList = this.props.model.activitys
          const subModelActivitys = []
          _.map(tacheVoList, item => {
            if (item.tacheType === 1) {
              _.map(item.parallelismTaches, item2 => {
                const temp = {}
                temp.tacheId = item2.tacheId
                temp.tacheName = item2.tacheName
                temp.policy = item2.policy
                temp.users = item2.users
                temp.groups = item2.groups
                temp.isCountersign = item2.isCountersign
                subModelActivitys.push(temp)
              })
            } else {
              const temp = {}
              temp.tacheId = item.tacheId
              temp.tacheName = item.tacheName
              temp.policy = item.policy
              temp.users = item.users
              temp.groups = item.groups
              temp.isCountersign = item.isCountersign
              temp.subProcess = item.subProcess
              temp.parentTacheName = item.parentTacheName
              subModelActivitys.push(temp)
            }
          })
          this.setState({ subModelActivitys: subModelActivitys }, () => {
            // 获取指定的默认处理人
            this.queryDefaultStaff(this.state.subModelActivitys.map(tache => tache.tacheId))
          })
        }
      }
    }

    handleCheck = (rule, value, callback) => {
      value = value || []
      if (value.length === 0) {
        callback(i18n('ticket.create.select_handler', '请选择处理人'))
      } else {
        callback()
      }
    }

    formatCurrent = tache => {
      const current = []
      if (tache.tacheType === 0) {
        const tacheTemp = {}
        tacheTemp.policy = tache.policy
        tacheTemp.users = tache.users
        tacheTemp.groups = tache.groups
        tacheTemp.isCountersign = tache.isCountersign
        tacheTemp.id = tache.tacheId
        tacheTemp.name = tache.name
        current.push(tacheTemp)
      } else if (tache.tacheType === 1) {
        _.map(tache.parallelismTaches, item => {
          const tacheTemp = {}
          tacheTemp.policy = item.policy
          tacheTemp.users = item.users
          tacheTemp.groups = tache.groups
          tacheTemp.isCountersign = tache.isCountersign
          tacheTemp.id = item.tacheId
          tacheTemp.name = item.tacheName
          current.push(tacheTemp)
        })
      }
      this.setState({ currents: current }, () => {
        // 获取指定的默认处理人
        this.queryDefaultStaff(this.state.currents.map(c => c.id))
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
        flowId,
        chartId: this.props.model.item.subChartId
      }

      const res = await axios.post(API.queryDefaultStaff, body) || {}

      this.setState({
        defaultStaffObj: res
      })
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

    _render = () => {
      const { getFieldDecorator, setFieldsValue } = this.props.form
      const { nextActivitys, subModelActivitys, currents, defaultStaffObj } = this.state
      const { btnInfo } = this.props
      const { messageName, messageStatus } = btnInfo || {}
      const formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 18 }
      }
      // 子流程设计id
      const chartId = this.props.model.item.subChartId
      let i = 0
      return (
        <Form className="double-line" layout="vertical">
          { // 不需要选择各环节处理人
            // (() => {
            //   if (this.props.modelType === 0 && this.props.needSuspend !== 0 && !_.isEmpty(nextActivitys)) {
            //     return (
            //       nextActivitys.length > 1 || nextActivitys[0].tacheType === 2
            //         ? _.map(nextActivitys, activy => {
            //           // 不挂起状态下，下一环节并行环节
            //           return (
            //             <User item={{
            //               code: activy.id,
            //               type: 'parallel',
            //               name: activy.name,
            //               isRequired: 1,
            //               users: activy,
            //               showName: true }}
            //               tacheId={this.props.tacheId}
            //               modelId={this.props.modelId}
            //               ticketId={this.props.id}
            //               handleType="subprocess"
            //               modelType={this.props.modelType}
            //               flow={this.props.flowId}
            //               setFlowUser={this.props.setFlowUser}
            //               formItemLayout={formItemLayout}
            //               getFieldDecorator={getFieldDecorator}
            //               setFieldsValue={setFieldsValue}
            //               formList={this.props.formValue}
            //               filterRule={!_.isEmpty(this.props.model) ? this.props.model.item.childModel.filterRule : null} // 子流程 时 给个 组织结构的 过滤规则
            //               orgId={this.props.orgId || null} // 开启组织机构时  传 所属部门的id
            //             />
            //           )
            //         })
            //         : <User item={{
            //           type: 'normal',
            //           code: 'submodel',
            //           name: i18n('ticket.detail.specify', '下一阶段处理人'),
            //           isRequired: 1,
            //           users: nextActivitys[0],
            //           showName: true }}
            //           setFlowUser={this.props.setFlowUser}
            //           formItemLayout={formItemLayout}
            //           tacheId={this.props.tacheId}
            //           modelId={this.props.modelId}
            //           ticketId={this.props.id}
            //           handleType="subprocess"
            //           modelType={this.props.modelType}
            //           flow={this.props.flowId}
            //           getFieldDecorator={getFieldDecorator}
            //         formList={this.props.formValue}
            //         setFieldsValue={setFieldsValue}
            //         filterRule={!_.isEmpty(this.props.model) ? this.props.model.item.childModel.filterRule : null} // 子流程 时 给个 组织结构的 过滤规则
            //           orgId={this.props.orgId || null} // 开启组织机构时  传 所属部门的id
            //         />
            //     )
            //   }
            // })()
          }
          {_.map(subModelActivitys, (item, index) => {
            // if ((_.isEmpty(currents) && index === 1 && item.policy === 1) || item.policy === 2) {
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
                      {<UserWrap
                        defaultStaffObj={defaultStaffObj[item.tacheId]}
                        item={{
                          code: item.tacheId,
                          type: 'submodal',
                          name: i18n('ticket.detail.sub_executor', '子流程处理人'),
                          isRequired: 1,
                          users: item,
                          showName: false }}
                        tacheId={item.tacheId}
                        modelId={this.props.model.item.childModel.id}
                        flowId={this.props.model.submodelData.jumpActivity ? this.props.model.submodelData.jumpActivity.activityFlowId : ''}
                        formList={this.props.formValue}
                        handleType="subprocess"
                        modelType={this.props.modelType}
                        orgId={this.props.orgId || null} // 开启组织机构时  传 所属部门的id
                        filterRule={!_.isEmpty(this.props.model) ? this.props.model.item.childModel.filterRule : null} // 子流程 时 给个 组织结构的 过滤规则
                        getFieldDecorator={getFieldDecorator}
                        setFieldsValue={setFieldsValue}
                        setFlowUser={this.props.setFlowUser}
                        chartId={chartId} />
                      }
                    </Col>
                  </Row>
                </div>
              )
            // }
            // if ((index === 1 && item.policy === 1) || item.policy === 2) {
            //   i++
            // }
          })}
          {
            // (() => {
            //   if (!_.isEmpty(currents) && currents.length === 1 && currents[0].policy === 1) {
            //     i = i + 1
            //     return (
            //       <div className="check-user-wrap" key={currents[0].id}>
            //         <Row className="line32">
            //           <Col span={24} style={{ display: i > 1 ? 'none' : 'block' }}>
            //             <label className="ant-form-item-required">{i18n('ticket.operate.Choose_executor', '处理人')}</label>
            //           </Col>
            //           <Col span={24} className="user-wrap-col">
            //             <div className="tache-name">
            //               {currents[0].name}
            //             </div>
            //             <UserWrap
            //               defaultStaffObj={currents[0].id}
            //               item={{
            //                 type: 'submodal',
            //                 code: currents[0].id,
            //                 name: currents[0].name,
            //                 isRequired: 1,
            //                 users: currents[0],
            //                 showName: false }
            //               }
            //               tacheId={currents[0].id}
            //               modelId={this.props.model.item.childModel.id}
            //               flowId={this.props.model.submodelData.jumpActivity ? this.props.model.submodelData.jumpActivity.activityFlowId : ''}
            //               handleType="subprocess"
            //               modelType={this.props.modelType}
            //               orgId={this.state.currDepart || null} // 开启组织机构时  传 所属部门的id
            //               currDepart={this.state.currDepart} // 开启组织机构时 选择部门 改变用户的选择
            //               formList={this.props.formValue}
            //               formItemLayout={{
            //                 labelCol: { span: 0 },
            //                 wrapperCol: { span: 24 }
            //               }}
            //               getFieldDecorator={getFieldDecorator}
            //               setFieldsValue={setFieldsValue}
            //               setFlowUser={this.props.setFlowUser}
            //               chartId={chartId} />
            //           </Col>
            //         </Row>
            //       </div>

            //     )
            //   } else if (!_.isEmpty(currents) && currents.length > 1) {
            //     return (
            //       _.map(currents, item => {
            //         i = i + 1
            //         return (
            //           item.policy === 1
            //             ? <div className="check-user-wrap" key={item.id}>
            //               <Row className="line32">
            //                 <Col span={24} style={{ display: i > 1 ? 'none' : 'block' }}>
            //                   <label className="ant-form-item-required">{i18n('ticket.operate.Choose_executor', '处理人') }</label>
            //                 </Col>
            //                 <Col span={24} className="user-wrap-col">
            //                   <div className="tache-name">
            //                     {item.name}
            //                   </div>
            //                   <UserWrap
            //                     defaultStaffObj={item.id}
            //                     item={{
            //                       code: item.id,
            //                       type: 'submodal',
            //                       name: item.name,
            //                       isRequired: 1,
            //                       users: item,
            //                       showName: false }}
            //                     tacheId={item.id}
            //                     modelId={this.props.model.item.childModel.id}
            //                     flowId={this.props.model.submodelData.jumpActivity ? this.props.model.submodelData.jumpActivity.activityFlowId : ''}
            //                     handleType="subprocess"
            //                     modelType={this.props.modelType}
            //                     orgId={this.state.currDepart || null} // 开启组织机构时  传 所属部门的id
            //                     currDepart={this.state.currDepart} // 开启组织机构时 选择部门 改变用户的选择
            //                     getFieldDecorator={getFieldDecorator}
            //                     setFieldsValue={setFieldsValue}
            //                     formList={this.props.formValue}
            //                     caseId={this.props.caseId}
            //                     setFlowUser={this.props.setFlowUser}
            //                     chartId={chartId} />
            //                 </Col>
            //               </Row>
            //             </div>
            //             : null
            //         )
            //       }))
            //   }
            // })()
          }
          {
            messageStatus === 2 ? null
              : <FormItem label={messageName || i18n('ticket.detail.opinion', '意见')} style={{ marginTop: '24px' }}>
                {getFieldDecorator('message', {
                  initialValue: undefined,
                  rules: [{
                    min: 0,
                    max: 2000,
                    message: i18n('ticket.most_200', '最多2000字')
                  }, {
                    required: +messageStatus === 1,
                    message: i18n('please-input', '请输入')
                  }],
                  getValueFromEvent: data => {
                    return data
                  }
                })(
                  <Editor
                    setFieldsValue={setFieldsValue}
                    val={this.state.value}
                    handleChange={this.handleChange} />
                )
                }
              </FormItem>
          }

        </Form>
      )
    }

    render () {
      return this.props.visible && this._render()
    }
}

export default Form.create()(Submodel)
