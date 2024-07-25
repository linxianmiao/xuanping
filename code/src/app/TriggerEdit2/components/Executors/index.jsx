import React, { Component } from 'react'
import { Form, Row, Col } from '@uyun/components'
import UserPicker from '~/components/userPicker'

const FormItem = Form.Item
const formShortItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 10 }
}

export default class Executors extends Component {
  static defaultProps = {
    getFieldDecorator: () => {},
    value: {},
    modelId: ''
  }

  state = {
    taches: [] // 流程环节
  }

  componentDidMount() {
    const { modelId, flowId } = this.props

    if (modelId && flowId) {
      this.queryTaches(modelId, flowId)
    }
  }

  componentDidUpdate(prevProps) {
    const { modelId, flowId } = this.props

    if (modelId && flowId && (prevProps.modelId !== modelId || prevProps.flowId !== flowId)) {
      this.queryTaches(modelId, flowId)
    }
  }

  queryTaches = async (modelId, flowId) => {
    // const res = (await axios.get(API.TACHE(modelId))) || []
    const res = (await axios.post(API.getRealNodes(modelId, flowId), {})) || []
    this.setState({ taches: res })
  }

  // 过滤出上一处理人指定或创建人指定的节点
  filterTaches = (taches) => {
    const result = []

    taches.forEach((item, index) => {
      if (item.tacheType === 1) {
        _.map(item.parallelismTaches, (parall) => {
          if ((index === 1 && parall.policy === 1) || parall.policy === 2) {
            result.push(parall)
          }
        })
      } else {
        if ((index === 1 && item.policy === 1) || item.policy === 2) {
          result.push(item)
        }
      }
    })

    return result
  }

  render() {
    const { getFieldDecorator, value, modelId, flowId } = this.props
    const { taches } = this.state
    const validTaches = taches

    if (validTaches.length === 0) {
      return null
    }

    return (
      <Row>
        <Col span={24}>指定环节处理人</Col>
        {validTaches.map((item) => {
          const initialValue = value && value[item.tacheId] ? value[item.tacheId] : undefined
          const tacheName =
            item.subProcess && item.parentTacheName
              ? item.parentTacheName + '：' + item.tacheName
              : item.tacheName
          return (
            <FormItem {...formShortItemLayout} label={tacheName} required>
              {getFieldDecorator(`executor.${item.tacheId}`, {
                initialValue,
                rules: [
                  {
                    required: true,
                    message: '请选择处理人'
                  }
                ]
              })(
                <UserPicker
                  tabs={[0, 1]}
                  showTypes={['groups', 'users']}
                  method="post"
                  selectionType="checkbox"
                  extendQuery={{
                    modelId,
                    flowId,
                    tacheId: item.tacheId,
                    handleType: 'create'
                  }}
                />
              )}
            </FormItem>
          )
        })}
      </Row>
    )
  }
}
